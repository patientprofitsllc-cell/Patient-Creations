import { agentTable } from "@/lib/universe/agents";
import { observedFacts, takeSnapshots } from "@/lib/universe/agents/observe";
import { renderReport, type Style } from "@/lib/universe/agents/speaker";
import { AuditManager } from "@/lib/universe/core/auditManager";
import { executeDecision } from "@/lib/universe/core/executor";
import { decide } from "@/lib/universe/core/master";
import { MemoryManager } from "@/lib/universe/core/memoryManager";
import { PermissionManager } from "@/lib/universe/core/permissionManager";
import { TaskManager } from "@/lib/universe/core/taskManager";
import { isWellFormed } from "@/lib/universe/protocol";
import { agentsIn, routeFor } from "@/lib/universe/route";
import type { UniverseStore } from "@/lib/universe/store/types";
import type { AgentId, AgentOutput, Decision, Deps, Domain, Mission, MissionResult, RunState } from "@/lib/universe/types";

// MASTER, the orchestrator. One loop for every request:
//
//   OBSERVE  read the request and what is already remembered
//   ROUTE    decide which agents this request needs (and which it does not)
//   GATHER / DIVIDE / THINK / ANALYZE / CHALLENGE / ORGANIZE   run only those agents, in dependency order
//   DECIDE   MASTER weighs the claims and the challenges and resolves disagreements
//   SPEAK    the report is written
//   EXECUTE  internal actions only, and only within permission
//   VERIFY   every action is read back before it is called done
//   LEARN    the decision is remembered
//
// A failing agent is retried once (agents only read, so a retry is always safe), then MASTER hands the work to a fallback agent
// if there is one, and if it still fails the owner is told. Nothing loops without a limit.

export interface UniverseCtx {
  store: UniverseStore;
  domain: Domain;
  deps: Deps;
  style?: Style;
  agentTimeoutMs?: number;
  probeTimeoutMs?: number;
  snapshotTimeoutMs?: number;
}

const MAX_ATTEMPTS = 2;
/** When an agent fails twice, another agent that can partly cover for it may be asked. */
const FALLBACK: Partial<Record<AgentId, AgentId>> = { THINKING: "PERSPECTIVE", PERSPECTIVE: "THINKING", FEELINGS: "PERSPECTIVE", LOOK: "IMAGE", IMAGE: "LOOK" };

const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms))]);

const titleOf = (m: Mission) => `${m.command.replace(/_/g, " ")}: ${m.objective}`;

function emptyDecision(summary: string): Decision {
  return { summary, reasoning: [], tasks: [], risks: [], nextActions: [], disagreements: [], rejected: [], unknowns: [], confidence: "LOW" };
}

export async function runMission(ctx: UniverseCtx, mission: Mission): Promise<MissionResult> {
  const { store, domain, deps } = ctx;
  const perm = new PermissionManager(store, domain.id);
  const audit = new AuditManager(store, domain.id, mission.id);
  const memory = new MemoryManager(store, domain.id);
  const tasks = new TaskManager(store, domain.id);
  const now = deps.now?.() ?? new Date();
  const base = { id: mission.id, domain: domain.id, command: mission.command, objective: mission.objective, intent: mission.intent ?? null, triggeredBy: mission.triggeredBy, priority: mission.priority, createdAt: now };

  // Permission comes first. A refused mission is recorded as refused, and nothing else happens.
  const permit = await perm.canRun(mission.command, mission.triggeredBy);
  if (!permit.allowed) {
    const route = routeFor(mission);
    await store.saveMission({ ...base, status: "REFUSED", route, result: null, report: `Not started. ${permit.reason}`, finishedAt: new Date() });
    await audit.record({ agent: "MASTER", task: "Check permission", input: `${mission.command} (${mission.triggeredBy})`, output: permit.reason, status: "SKIPPED", durationMs: 0 });
    return { mission, route, messages: [], facts: [], claims: [], challenges: [], decision: emptyDecision(`Not started. ${permit.reason}`), report: `Not started. ${permit.reason}`, executed: [], copy: null, status: "FAILED", errors: [permit.reason] };
  }

  await store.saveMission({ ...base, status: "RUNNING", route: null, result: null, report: null, finishedAt: null });

  // OBSERVE and ROUTE
  const route = routeFor(mission);
  const recalled = await memory.relevantTo(`${mission.objective} ${mission.kind}`);
  const state: RunState = { mission, domain, route, plan: null, facts: [], snapshots: [], claims: [], challenges: [], messages: [], organized: null, recalled, deps };
  for (const a of mission.assumptions) await memory.remember({ level: "SHORT_TERM", kind: "ASSUMPTION", topic: mission.kind, content: a, agent: "MASTER" });

  await audit.record({
    agent: "MASTER",
    task: "Route the request",
    input: mission.objective,
    output: `${route.intent}: ${route.steps.map((s) => s.join("+")).join(" -> ")}. Skipped: ${route.skipped.map((s) => s.agent).join(", ") || "none"}.`,
    status: "OK",
    durationMs: 0,
    handoff: route.steps[0]?.[0] ?? null,
  });

  const fns = agentTable({ probeTimeoutMs: ctx.probeTimeoutMs, style: ctx.style });
  const errors: string[] = [];
  const ran = new Set<AgentId>();
  const timeout = ctx.agentTimeoutMs ?? 30_000;

  // Looking is done once, up front, and shared by the agents that need it.
  const wants = (a: AgentId) => route.steps.flat().includes(a);
  const observe = wants("LOOK") || wants("FEELINGS") || (wants("IMAGE") && (route.intent !== "assets" || mission.attachments.length > 0));
  if (observe) {
    const snaps = await audit.timed("LOOK", "Take snapshots of the pages to examine", `${mission.attachments.length || domain.surfaces.length} page(s)`, () => takeSnapshots(domain, mission, ctx.snapshotTimeoutMs), (s) => ({ output: `${s.filter((x) => x.ok).length} of ${s.length} pages opened.`, handoff: "GATHERER" }));
    if (snaps.ok) {
      state.snapshots = snaps.value;
      state.facts.push(...observedFacts(snaps.value, domain));
    } else errors.push(`Pages could not be examined: ${snaps.error}`);
  }

  const merge = (o: AgentOutput) => {
    for (const f of o.facts ?? []) if (!state.facts.some((x) => x.id === f.id)) state.facts.push(f);
    if (o.plan) state.plan = o.plan;
    if (o.claims) state.claims.push(...o.claims);
    if (o.challenges) {
      const replaced = new Set(o.challenges.map((c) => c.claimId));
      state.challenges = [...state.challenges.filter((c) => !replaced.has(c.claimId)), ...o.challenges];
    }
    if (o.snapshots) state.snapshots = o.snapshots;
    if (o.organized) state.organized = o.organized;
    state.messages.push(o.message);
  };

  async function runAgent(agent: Exclude<AgentId, "MASTER">, allowFallback = true): Promise<boolean> {
    ran.add(agent);
    let lastError = "no answer";
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const res = await audit.timed(
        agent,
        `Run ${agent}${attempt > 1 ? " (retry)" : ""}`,
        `${state.facts.length} facts, ${state.claims.length} claims in view`,
        async () => {
          const out = await withTimeout(Promise.resolve(fns[agent](state)), timeout, agent);
          if (!isWellFormed(out?.message)) throw new Error("The agent's message did not follow the protocol.");
          return out;
        },
        (o) => ({ output: `${o.message.findings.length} finding(s). ${o.message.recommendation}`.slice(0, 400), handoff: o.message.nextAgent, result: `confidence ${o.message.confidence}` }),
        attempt > 1 ? "RETRIED" : "OK",
      );
      if (res.ok) {
        merge(res.value);
        return true;
      }
      lastError = res.error;
    }
    errors.push(`${agent} failed after ${MAX_ATTEMPTS} attempts: ${lastError}`);
    await audit.record({ agent, task: "Escalate to MASTER", input: lastError, output: "The agent could not finish.", status: "ESCALATED", durationMs: 0, handoff: "MASTER" });
    const other = FALLBACK[agent];
    if (allowFallback && other && !ran.has(other) && other !== "LOOK" && other !== "IMAGE") {
      await audit.record({ agent: "MASTER", task: `Reassign ${agent}'s work`, input: `${agent} failed`, output: `Asked ${other} to cover what it can.`, status: "OK", durationMs: 0, handoff: other });
      await runAgent(other as Exclude<AgentId, "MASTER">, false);
    }
    return false;
  }

  // The route, step by step. An inner list runs at the same time.
  let escalated = false;
  for (const step of route.steps) {
    const agents = step.filter((a): a is Exclude<AgentId, "MASTER"> => a !== "MASTER");
    if (!agents.length) continue;
    await Promise.all(agents.map((a) => runAgent(a)));

    // MASTER may wake one more mind, once: if LOGIC finds evidence missing and nobody gathered any, gather, then check again.
    if (agents.includes("LOGIC") && !escalated && !ran.has("GATHERER") && state.challenges.some((c) => c.verdict === "insufficient" || c.verdict === "unsupported")) {
      escalated = true;
      await audit.record({ agent: "MASTER", task: "Wake another mind", input: "LOGIC found claims without enough evidence, and no one had gathered any.", output: "Added GATHERER, then LOGIC will check again. This happens at most once.", status: "OK", durationMs: 0, handoff: "GATHERER" });
      await runAgent("GATHERER");
      await runAgent("LOGIC");
    }
  }

  // DECIDE
  const decided = await audit.timed("MASTER", "Decide", `${state.claims.length} claims, ${state.challenges.length} challenges`, async () => decide(state), (d) => ({ output: d.summary, result: `${d.tasks.length} tasks, ${d.disagreements.length} disagreements, confidence ${d.confidence}` }));
  const decision: Decision = decided.ok ? decided.value : emptyDecision(`MASTER could not reach a decision: ${decided.error}`);
  if (!decided.ok) errors.push(`MASTER could not decide: ${decided.error}`);
  for (const e of errors) if (!decision.risks.includes(e)) decision.risks.push(e);

  // A copy request is answered with the copy, if LOGIC accepted it, and with the reason if not.
  let copy: MissionResult["copy"] = null;
  if (route.intent === "copy") {
    const made = state.messages.find((m) => m.agent === "SPEAKER")?.payload?.copy as { text: string; mocked: boolean } | null | undefined;
    const check = state.challenges.find((c) => c.claimId === "COPY");
    if (made && check) {
      copy = { text: made.text, mocked: made.mocked, accepted: check.verdict === "valid", reason: check.reason };
      decision.summary = check.verdict === "valid" ? (made.mocked ? "The text was cleaned and checked. It stays within the facts. It was not rewritten, because no writing model is configured." : "The copy was written from the facts and LOGIC accepted it. A person should still read it before it is used.") : `The copy was rejected by LOGIC and is not shown. ${check.reason}`;
    } else decision.summary = state.messages.find((m) => m.agent === "SPEAKER")?.analysis[0] ?? "No copy was produced.";
    decision.tasks = [];
    decision.nextActions = copy?.accepted ? ["Read the copy, then use it."] : ["Supply the text to rewrite, or connect a writing model."];
  }

  // SPEAK: the final report.
  const style = ctx.style ?? "professional";
  const report = await (async () => {
    const r = await audit.timed("SPEAKER", "Write the final report", `${decision.tasks.length} tasks`, async () => {
      let text = renderReport(decision, { style, title: titleOf(mission), facts: state.facts, route: `${route.intent}: ${agentsIn(route).join(", ")}` });
      if (copy?.accepted) text += `\n\nCopy\n${copy.text}`;
      return text;
    }, (t) => ({ output: `${t.length} characters` }));
    return r.ok ? r.value : `${titleOf(mission)}\n\n${decision.summary}`;
  })();

  // EXECUTE and VERIFY
  const executed = await executeDecision({ missionId: mission.id, mission, deps, perm, tasks, memory, audit }, decision);
  if (executed.some((e) => e.ok && !e.verified)) errors.push("An action ran but could not be confirmed by reading it back.");

  // LEARN: what was proposed as an experiment is remembered as one, so it is never mistaken for a finding later.
  for (const t of decision.tasks.filter((x) => x.severity === "experiment").slice(0, 5)) {
    await memory.remember({ level: "WORKING", kind: "EXPERIMENT", topic: mission.kind, content: t.title, agent: "MASTER" }).catch(() => undefined);
  }
  memory.clearShortTerm();

  // Someone should hear about a failure, not only find it in a log.
  if (errors.length && deps.notifyOwner && (await perm.canDo("notify_owner")).allowed) {
    await deps.notifyOwner("Agent Universe: part of a run failed", errors.slice(0, 5).join("\n")).catch(() => null);
  }

  const status: MissionResult["status"] = errors.length === 0 ? "COMPLETED" : state.messages.length === 0 ? "FAILED" : "PARTIAL";
  const result: MissionResult = { mission, route, messages: state.messages, facts: state.facts, claims: state.organized?.claims ?? state.claims, challenges: state.challenges, decision, report, executed, copy, status, errors };
  await store.saveMission({ ...base, status, route, result, report, finishedAt: new Date() });
  return result;
}
