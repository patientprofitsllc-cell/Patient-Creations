import { randomBytes } from "crypto";
import { STYLES, type Style } from "@/lib/universe/agents/speaker";
import { agentTable } from "@/lib/universe/agents";
import { AuditManager } from "@/lib/universe/core/auditManager";
import { EventManager, type EventOutcome, type UniverseEvent } from "@/lib/universe/core/eventManager";
import { MemoryManager } from "@/lib/universe/core/memoryManager";
import { runMission, type UniverseCtx } from "@/lib/universe/core/orchestrator";
import { PermissionManager, levelAtLeast } from "@/lib/universe/core/permissionManager";
import { TaskManager } from "@/lib/universe/core/taskManager";
import { AGENT_IDS, MEMORY_LEVELS, type Attachment, type CommandName, type Intent, type MissionKind, type MissionResult, type PermissionLevel, type Priority, type UniverseTask, type Mission } from "@/lib/universe/types";

// The commands MASTER understands. A command is either a mission (it wakes agents and produces a decision) or a view (it reads
// what is stored and says what it finds). Each is checked against the permission level before it does anything.

export const COMMANDS: CommandName[] = [
  "ASK_MASTER", "AUDIT_WEBSITE", "AUDIT_PRODUCTS", "AUDIT_CUSTOMER_JOURNEY", "AUDIT_BUSINESS", "ANALYZE_GROWTH", "ANALYZE_CUSTOMERS", "ANALYZE_CONVERSION",
  "GENERATE_STRATEGY", "CREATE_TASKS", "RUN_RESEARCH", "RUN_DAILY_AUDIT", "RUN_WEEKLY_REVIEW", "SHOW_AGENT_ACTIVITY", "SHOW_ACTIVE_TASKS", "SHOW_DECISIONS",
  "SHOW_MEMORY", "RUN_SYSTEM_CHECK", "PAUSE_AUTONOMOUS_ACTIONS", "RESUME_AUTONOMOUS_ACTIONS",
];

export interface CommandInput {
  text?: string;
  attachments?: Attachment[];
  style?: Style;
  priority?: Priority;
  assumptions?: string[];
  triggeredBy?: "user" | "schedule" | "event";
}

export type CommandResult =
  | { kind: "mission"; command: CommandName; result: MissionResult }
  | { kind: "view"; command: CommandName; title: string; text: string; data?: unknown }
  | { kind: "refused"; command: CommandName; reason: string };

interface Template {
  kind: MissionKind;
  intent?: Intent;
  objective: string;
  outcome: string;
}

const TEMPLATES: Partial<Record<CommandName, Template>> = {
  AUDIT_WEBSITE: { kind: "website", intent: "audit-website", objective: "Audit the website: how it looks, how it may feel to a visitor, and what to improve.", outcome: "A prioritized list of website problems, each tied to what was observed." },
  AUDIT_PRODUCTS: { kind: "products", intent: "analysis", objective: "Audit the products: clarity, value, pricing, presentation, fit, and opportunities.", outcome: "Evidence-based findings on the products, with alternatives. No price is changed." },
  AUDIT_CUSTOMER_JOURNEY: { kind: "journey", intent: "analysis", objective: "Audit the customer journey from awareness to repeat purchase and find the friction at each stage.", outcome: "Friction identified stage by stage." },
  AUDIT_BUSINESS: { kind: "business", intent: "analysis", objective: "Audit the whole business and identify the most important areas to investigate.", outcome: "The few areas most worth investigating, ranked, with the evidence for each." },
  ANALYZE_GROWTH: { kind: "growth", intent: "analysis", objective: "Analyze how the business can grow: acquisition, conversion, order value, retention, referral, partnerships, operations, automation, and product expansion.", outcome: "Growth opportunities and constraints, ranked by evidence." },
  ANALYZE_CUSTOMERS: { kind: "customers", intent: "analysis", objective: "Analyze the customers: who buys, who returns, who leaves, and how they may feel.", outcome: "What the customer data shows and what is not known." },
  ANALYZE_CONVERSION: { kind: "conversion", intent: "analysis", objective: "Analyze conversion: where visitors and leads stop, and why that may be.", outcome: "The points where people drop off, and what may cause it." },
  GENERATE_STRATEGY: { kind: "strategy", intent: "analysis", objective: "Generate strategy options grounded in the evidence available.", outcome: "Options with rationale, dependencies, risks, and second-order effects." },
  RUN_RESEARCH: { kind: "research", intent: "research", objective: "Research: work out what is known from connected data and what still needs outside research.", outcome: "A brief of what is known, what is not, and what to find out." },
  RUN_DAILY_AUDIT: { kind: "daily", intent: "analysis", objective: "Daily business audit: what needs attention today?", outcome: "Technical, customer, product, and operational issues that need attention, from data that is available." },
  RUN_WEEKLY_REVIEW: { kind: "weekly", intent: "analysis", objective: "Weekly strategic review: what changed, what is working, and what to focus on.", outcome: "A short strategic review with priorities." },
};

const newId = () => `m_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;

export function buildMission(ctx: UniverseCtx, command: CommandName, input: CommandInput = {}): Mission {
  const t = TEMPLATES[command];
  const objective = (input.text?.trim() || t?.objective || "").slice(0, 600);
  return {
    id: newId(),
    command,
    kind: t?.kind ?? "ask",
    objective,
    goal: objective,
    context: `${ctx.domain.name}: ${ctx.domain.description}`,
    constraints: ctx.domain.constraints.map((c) => c.text),
    available: ctx.domain.probes.map((p) => p.id),
    requiredOutcome: t?.outcome ?? "A clear answer with its evidence and what is not known.",
    deadline: null,
    priority: input.priority ?? "P2",
    assumptions: (input.assumptions ?? []).map((a) => a.trim()).filter(Boolean).slice(0, 10),
    attachments: (input.attachments ?? []).slice(0, 5),
    triggeredBy: input.triggeredBy ?? "user",
    intent: t?.intent,
  };
}

const fmtTask = (t: UniverseTask) => `[${t.priority}] ${t.title} (${t.status}${t.approvalRequired ? ", needs approval" : ""})`;
const when = (d: Date) => d.toISOString().replace("T", " ").slice(0, 16);

export function createUniverse(ctx: UniverseCtx) {
  const { store, domain } = ctx;
  const perm = new PermissionManager(store, domain.id);
  const memory = new MemoryManager(store, domain.id);
  const tasks = new TaskManager(store, domain.id);
  const events = new EventManager(store, domain.id, perm);

  async function run(command: CommandName, input: CommandInput = {}): Promise<CommandResult> {
    if (!COMMANDS.includes(command)) return { kind: "refused", command, reason: `"${command}" is not a command.` };
    if (input.style && !STYLES.includes(input.style)) return { kind: "refused", command, reason: `"${input.style}" is not a known style.` };
    if (TEMPLATES[command] || command === "ASK_MASTER") {
      if (command === "ASK_MASTER" && (input.text?.trim().length ?? 0) < 3) return { kind: "refused", command, reason: "Ask MASTER something: the request is empty." };
      const mission = buildMission(ctx, command, input);
      const result = await runMission({ ...ctx, style: input.style ?? ctx.style }, mission);
      return { kind: "mission", command, result };
    }
    const permit = await perm.canRun(command, input.triggeredBy ?? "user");
    if (!permit.allowed) return { kind: "refused", command, reason: permit.reason };

    switch (command) {
      case "CREATE_TASKS": {
        const lines = (input.text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 30);
        if (!lines.length) return { kind: "refused", command, reason: "Give at least one task, one per line. Start a line with P0 to P4 to set its priority." };
        const made: UniverseTask[] = [];
        for (const l of lines) {
          const m = /^(P[0-4])\s*[:\-]\s*(.+)$/i.exec(l);
          made.push(await tasks.createManual(m ? m[2] : l, (m ? m[1].toUpperCase() : "P2") as Priority));
        }
        const back = await Promise.all(made.map((t) => tasks.get(t.id)));
        const verified = back.filter(Boolean).length;
        return { kind: "view", command, title: "Tasks created", text: `${verified} of ${made.length} task${made.length === 1 ? "" : "s"} created and confirmed.\n${made.map(fmtTask).join("\n")}`, data: made };
      }
      case "SHOW_ACTIVE_TASKS": {
        const b = await tasks.board();
        const sec = (name: string, list: UniverseTask[]) => `${name} (${list.length})${list.length ? "\n" + list.slice(0, 25).map((t) => `  ${fmtTask(t)}`).join("\n") : ""}`;
        return { kind: "view", command, title: "Task board", text: [sec("Active", b.active), sec("Waiting", b.waiting), sec("Needs your approval", b.needsApproval), sec("Failed", b.failed), sec("Done", b.done.slice(0, 10))].join("\n\n"), data: b };
      }
      case "SHOW_AGENT_ACTIVITY": {
        const rows = await store.listActivity({ domain: domain.id, limit: 60 });
        return { kind: "view", command, title: "Agent activity", text: rows.length ? rows.map((a) => `${when(a.at)}  ${a.agent}  ${a.status}  ${a.durationMs}ms  ${a.task}${a.error ? `  ERROR: ${a.error}` : ""}`).join("\n") : "No agent activity has been recorded yet.", data: rows };
      }
      case "SHOW_DECISIONS": {
        const d = await memory.recall({ level: "DECISION", limit: 20 });
        const missions = await store.listMissions({ domain: domain.id, limit: 10 });
        return { kind: "view", command, title: "Decisions", text: d.length ? d.map((m) => `${when(m.createdAt)}  ${m.content}`).join("\n") : `No decisions are recorded yet. ${missions.length} mission${missions.length === 1 ? "" : "s"} have run.`, data: { decisions: d, missions } };
      }
      case "SHOW_MEMORY": {
        const all = await memory.recall({ limit: 200 });
        const counts = MEMORY_LEVELS.map((l) => `${l}: ${all.filter((m) => m.level === l).length}`).join("   ");
        return { kind: "view", command, title: "Memory", text: `${counts}\n\n${all.slice(0, 40).map((m) => `${m.kind}/${m.level}  ${m.topic}: ${m.content.slice(0, 140)}${m.source ? `  [source: ${m.source}]` : ""}`).join("\n") || "Nothing is remembered yet."}`, data: all };
      }
      case "PAUSE_AUTONOMOUS_ACTIONS":
        await perm.setPaused(true);
        return { kind: "view", command, title: "Autonomy paused", text: (await perm.paused()) ? "Autonomous actions are paused. Nothing will start on its own until you resume." : "Could not confirm the pause." };
      case "RESUME_AUTONOMOUS_ACTIONS":
        await perm.setPaused(false);
        return { kind: "view", command, title: "Autonomy resumed", text: (await perm.paused()) ? "Could not confirm the resume." : `Autonomous actions are allowed again, if the level is AUTONOMOUS. The level is ${await perm.level()}.` };
      case "RUN_SYSTEM_CHECK": {
        const checks = await systemCheck();
        const bad = checks.filter((c) => c.status === "FAIL").length;
        return { kind: "view", command, title: "System check", text: `${bad === 0 ? "All required checks passed." : `${bad} check${bad === 1 ? "" : "s"} failed.`}\n${checks.map((c) => `${c.status.padEnd(4)}  ${c.name}: ${c.detail}`).join("\n")}`, data: checks };
      }
      default:
        return { kind: "refused", command, reason: "Not handled." };
    }
  }

  async function systemCheck() {
    const out: { name: string; status: "OK" | "WARN" | "FAIL"; detail: string }[] = [];
    const add = (name: string, status: "OK" | "WARN" | "FAIL", detail: string) => out.push({ name, status, detail });

    const table = agentTable();
    const missing = AGENT_IDS.filter((a) => a !== "MASTER" && !(a in table));
    add("Agents", missing.length ? "FAIL" : "OK", missing.length ? `Missing: ${missing.join(", ")}` : `${AGENT_IDS.length} agents registered (MASTER plus ${AGENT_IDS.length - 1} working agents).`);

    try {
      const probeKey = `universe.${domain.id}.selfcheck`;
      await store.setSetting(probeKey, "ok");
      const readBack = await store.getSetting(probeKey);
      await store.deleteSetting(probeKey);
      const entry = await memory.remember({ level: "WORKING", kind: "EXPERIMENT", topic: "system-check", content: "system check probe", agent: "MASTER" });
      const found = (await memory.recall({ topic: "system-check", limit: 5 })).some((m) => m.id === entry.id);
      await store.deleteMemory(entry.id);
      add("Storage", readBack === "ok" && found ? "OK" : "FAIL", readBack === "ok" && found ? "Wrote, read back, and removed a test record." : "A test record could not be read back.");
    } catch (err) {
      add("Storage", "FAIL", err instanceof Error ? err.message : "failed");
    }

    const level = await perm.level();
    add("Permissions", "OK", `Level ${level}${(await perm.paused()) ? ", autonomy paused" : ""}. ${levelAtLeast(level, "AUTONOMOUS") ? "Scheduled and event-driven missions are allowed." : "Scheduled and event-driven missions are NOT allowed until the level is AUTONOMOUS."}`);

    const probeResults = await Promise.all(domain.probes.map(async (p) => {
      const started = Date.now();
      try {
        const r = await Promise.race([p.read(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timed out")), 10_000))]);
        return { id: p.id, ok: r !== null, ms: Date.now() - started };
      } catch {
        return { id: p.id, ok: false, ms: Date.now() - started };
      }
    }));
    const failed = probeResults.filter((p) => !p.ok);
    add("Data sources", failed.length === 0 ? "OK" : failed.length === probeResults.length ? "FAIL" : "WARN", `${probeResults.length - failed.length} of ${probeResults.length} can be read${failed.length ? `. Cannot read: ${failed.map((f) => f.id).join(", ")}.` : "."}`);

    const recent = await store.listActivity({ domain: domain.id, limit: 200 });
    const errs = recent.filter((a) => a.status === "FAILED" || a.status === "ESCALATED").length;
    add("Recent runs", errs === 0 ? "OK" : "WARN", `${recent.length} recent agent steps, ${errs} failed or escalated.`);
    return out;
  }

  /** Task actions a person takes from the dashboard. Finishing or failing a task writes a RESULT to memory, so outcomes are learned from. */
  const taskApi = {
    approve: (id: string) => tasks.approve(id),
    reject: (id: string) => tasks.reject(id),
    start: (id: string) => tasks.start(id),
    async complete(id: string, result: string) {
      const t = await tasks.complete(id, result.slice(0, 500));
      await memory.remember({ level: "RESULT", kind: "RESULT", topic: "task", content: `${t.title} -> ${result.slice(0, 300)}`, source: `task ${t.id}`, agent: "MASTER" });
      return t;
    },
    async fail(id: string, reason: string) {
      const t = await tasks.fail(id, reason.slice(0, 500));
      await memory.remember({ level: "RESULT", kind: "RESULT", topic: "task", content: `${t.title} FAILED: ${reason.slice(0, 300)}`, source: `task ${t.id}`, agent: "MASTER" });
      return t;
    },
    get: (id: string) => tasks.get(id),
    board: () => tasks.board(),
  };

  async function handleEvent(event: UniverseEvent): Promise<EventOutcome> {
    const audit = new AuditManager(store, domain.id, null);
    const outcome = await events.handle(event, async (command, priority, triggeredBy) => {
      const r = await run(command, { priority, triggeredBy });
      if (r.kind !== "mission") throw new Error(r.kind === "refused" ? r.reason : "The event did not produce a mission.");
      return r.result;
    });
    if (!outcome.handled) await audit.record({ agent: "MASTER", task: `Event: ${event.type}`, input: JSON.stringify(event.payload ?? {}).slice(0, 300), output: outcome.reason, status: "SKIPPED", durationMs: 0 });
    return outcome;
  }

  return { run, handleEvent, tasks: taskApi, memory, permissions: perm, store, domain };
}

export type Universe = ReturnType<typeof createUniverse>;
export type { PermissionLevel };
