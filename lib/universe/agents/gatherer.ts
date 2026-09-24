import { confidenceFrom, idMaker, message, UNKNOWN_TEXT } from "@/lib/universe/protocol";
import { selectComponents, topicsOf } from "@/lib/universe/agents/scope";
import type { AgentOutput, Fact, Probe, ProbeResult, RunState } from "@/lib/universe/types";

// GATHERER collects only what is really available, and labels every piece: FACT (it was read, and where from), ASSUMPTION
// (someone said so), UNKNOWN (it could not be read), CONFLICTING (two sources disagree). It never fills a gap with a guess.

const PROBE_TIMEOUT_MS = 8_000;

async function runProbe(p: Probe, timeoutMs: number): Promise<{ results: ProbeResult[] | null; ms: number; error?: string }> {
  const started = Date.now();
  try {
    const r = await Promise.race([p.read(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timed out")), timeoutMs))]);
    return { results: r === null ? null : Array.isArray(r) ? r : [r], ms: Date.now() - started };
  } catch (err) {
    return { results: null, ms: Date.now() - started, error: err instanceof Error ? err.message : "failed" };
  }
}

export async function gather(state: RunState, timeoutMs = PROBE_TIMEOUT_MS): Promise<AgentOutput> {
  const { mission, domain } = state;
  const topics = state.plan ? topicsOf(state.plan.components) : topicsOf(selectComponents(domain, mission));
  const wanted = domain.probes.filter((p) => topics.includes(p.topic));
  const nextId = idMaker("F");
  const facts: Fact[] = [];
  const timings: { probe: string; ms: number; ok: boolean }[] = [];

  const ran = await Promise.all(wanted.map(async (p) => ({ p, out: await runProbe(p, timeoutMs) })));
  for (const { p, out } of ran) {
    timings.push({ probe: p.id, ms: out.ms, ok: out.results !== null });
    if (out.results === null) {
      facts.push({ id: nextId(), label: "UNKNOWN", topic: p.topic, key: `probe.${p.id}`, statement: `${UNKNOWN_TEXT}. ${p.need}`, source: p.id, tags: [p.topic], signal: "neutral", need: p.need });
      continue;
    }
    for (const r of out.results) facts.push({ id: nextId(), label: "FACT", topic: p.topic, key: r.key, statement: r.statement, value: r.value ?? null, source: r.source, tags: [p.topic, ...r.tags], signal: r.signal ?? "neutral", severity: r.severity, rank: r.rank });
  }
  // A topic already covered by something observed directly (a page that was examined) is not "missing" just because no probe reads it.
  const covered = new Set(state.facts.filter((f) => f.label === "FACT").map((f) => f.topic));
  for (const t of topics.filter((t) => !domain.probes.some((p) => p.topic === t) && !covered.has(t))) {
    facts.push({ id: nextId(), label: "UNKNOWN", topic: t, statement: `${UNKNOWN_TEXT}. No data source is connected for "${t}".`, source: "none", tags: [t], signal: "neutral", need: `A data source for ${t}.` });
  }
  for (const a of mission.assumptions) facts.push({ id: nextId(), label: "ASSUMPTION", topic: "assumption", statement: a, source: "stated in the request, not verified", tags: ["assumption"], signal: "neutral" });

  // Two readings of the same thing that disagree are both marked CONFLICTING. Neither is trusted over the other here.
  const byKey = new Map<string, Fact[]>();
  for (const f of facts.filter((f) => f.label === "FACT" && f.key)) byKey.set(f.key!, [...(byKey.get(f.key!) ?? []), f]);
  for (const group of byKey.values()) if (group.length > 1 && new Set(group.map((g) => String(g.value))).size > 1) group.forEach((g) => (g.label = "CONFLICTING"));

  const known = facts.filter((f) => f.label === "FACT").length;
  const unknown = facts.filter((f) => f.label === "UNKNOWN");
  const conflicts = facts.filter((f) => f.label === "CONFLICTING");
  return {
    facts,
    message: message({
      agent: "GATHERER",
      task: "Collect the information that is actually available",
      context: `${domain.name}: ${mission.goal}`,
      input: `${wanted.length} data source${wanted.length === 1 ? "" : "s"} for ${topics.length} topic${topics.length === 1 ? "" : "s"}`,
      analysis: [`${known} fact${known === 1 ? "" : "s"} read, ${unknown.length} unknown, ${conflicts.length} conflicting, ${mission.assumptions.length} assumption${mission.assumptions.length === 1 ? "" : "s"} stated.`, ...timings.filter((t) => !t.ok).map((t) => `Source "${t.probe}" could not be read.`)],
      assumptions: mission.assumptions,
      unknown: unknown.map((f) => f.statement),
      risks: conflicts.length ? [`${conflicts.length} facts conflict and should not be relied on until resolved.`] : [],
      recommendation: known ? "Use the FACT-labeled items as evidence. Do not treat UNKNOWN or ASSUMPTION items as evidence." : "Nothing could be read. Do not proceed as though the picture were known.",
      nextAgent: "ORGANIZER",
      confidence: confidenceFrom(known, unknown.length + conflicts.length),
      payload: { timings },
    }),
  };
}
