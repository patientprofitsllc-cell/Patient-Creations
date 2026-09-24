import { byImportance, honestSeverity, idMaker, message, SEVERITY_TO_PRIORITY } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, Fact, Organized, RunState } from "@/lib/universe/types";

// ORGANIZER turns a pile of findings into something MASTER can read: facts grouped by topic, duplicate claims merged, every claim
// given an honest severity and a priority, and problems that nobody claimed turned into claims of their own so nothing that was
// observed is lost. It sorts and structures. It does not decide what is true or what to do.

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function organize(state: RunState): AgentOutput {
  const nextId = idMaker("OR");
  const factById = new Map(state.facts.map((f) => [f.id, f]));
  const verdicts = new Map(state.challenges.map((c) => [c.claimId, c.verdict]));

  // Problems that were observed but that no claim cites become observation claims, so the daily audit and plain lookups
  // still surface what needs attention even when no analysis agent was woken.
  const cited = new Set(state.claims.flatMap((c) => c.evidence));
  const promoted: Claim[] = state.facts
    .filter((f: Fact) => f.label === "FACT" && f.signal === "negative" && !cited.has(f.id))
    .map((f) => ({ id: nextId(), agent: "ORGANIZER" as const, kind: "observation" as const, text: f.statement, target: f.topic, stance: "fix" as const, severity: f.severity ?? "medium", evidence: [f.id], rank: f.rank }));

  const all = [...state.claims, ...promoted];
  const seen = new Map<string, Claim>();
  const dropped: Organized["dropped"] = [];
  for (const c of all) {
    const key = `${c.target}|${c.stance}|${norm(c.text)}`;
    const first = seen.get(key);
    if (first) {
      // The same finding twice is kept once, with the evidence of both.
      first.evidence = [...new Set([...first.evidence, ...c.evidence])];
      dropped.push({ claim: c, why: `Duplicate of ${first.id}.` });
    } else seen.set(key, { ...c });
  }
  const claims = [...seen.values()].map((c) => ({ ...c, severity: honestSeverity(c, factById) }));
  claims.sort(byImportance);

  const factsByTopic: Record<string, Fact[]> = {};
  for (const f of state.facts) (factsByTopic[f.topic] ??= []).push(f);

  const organized: Organized = {
    factsByTopic,
    claims,
    dropped,
    table: claims.map((c) => ({ claimId: c.id, priority: SEVERITY_TO_PRIORITY[c.severity], severity: c.severity, agent: c.agent, text: c.text, evidence: c.evidence, verdict: verdicts.get(c.id) ?? "unchallenged" })),
  };
  const downgraded = all.filter((c) => c.severity === "critical" && honestSeverity(c, factById) !== "critical").length;

  return {
    organized,
    claims: promoted,
    message: message({
      agent: "ORGANIZER",
      task: "Structure the findings for MASTER",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${state.claims.length} claims, ${state.facts.length} facts`,
      analysis: [
        `${Object.keys(factsByTopic).length} topics; ${claims.length} distinct claim${claims.length === 1 ? "" : "s"} after merging ${dropped.length} duplicate${dropped.length === 1 ? "" : "s"}.`,
        ...(promoted.length ? [`${promoted.length} observed problem${promoted.length === 1 ? " was" : "s were"} not claimed by any agent and was added so it is not lost.`] : []),
        ...(downgraded ? [`${downgraded} claim${downgraded === 1 ? " was" : "s were"} marked critical without observed evidence and shown as high instead.`] : []),
      ],
      unknown: state.facts.filter((f) => f.label === "UNKNOWN").map((f) => f.need ?? f.statement),
      recommendation: claims.length ? `Start with the ${claims.filter((c) => c.severity === "critical" || c.severity === "high").length} critical or high items.` : "Nothing needs attention on the evidence read.",
      nextAgent: "SPEAKER",
      confidence: state.facts.some((f) => f.label === "FACT") ? "MEDIUM" : "LOW",
      payload: { table: organized.table },
    }),
  };
}
