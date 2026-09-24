import { confidenceFrom, idMaker, message } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, Fact, RunState, Stakeholder } from "@/lib/universe/types";

// PERSPECTIVE looks at the same facts through the eyes of each person or group involved, decides for itself which viewpoints
// are relevant (a viewpoint with nothing in the facts to say is left out), and shows where those viewpoints pull against each
// other. What it reports is what each viewpoint sees in the facts, not what the viewpoint is guessed to feel.

const touches = (s: Stakeholder, f: Fact) => f.tags.some((t) => s.wants.includes(t) || s.wary.includes(t));

export function perspectives(state: RunState): AgentOutput {
  const { domain } = state;
  const known = state.facts.filter((f) => f.label === "FACT");
  const nextId = idMaker("PE");

  const views = domain.stakeholders
    .map((s) => ({ s, relevant: known.filter((f) => touches(s, f)) }))
    .filter((v) => v.relevant.length > 0);
  const notRelevant = domain.stakeholders.filter((s) => !views.some((v) => v.s.id === s.id)).map((s) => s.name);

  const report = views.map(({ s, relevant }) => {
    const concerns = relevant.filter((f) => f.signal === "negative" && f.tags.some((t) => s.wants.includes(t)));
    const others = views.filter((o) => o.s.id !== s.id);
    const missedByOthers = others.flatMap((o) => o.relevant).filter((f) => !relevant.includes(f)).slice(0, 3).map((f) => f.statement);
    const conflicts = others.flatMap((o) => {
      const clash = [...s.wants.filter((w) => o.s.wary.includes(w)), ...s.wary.filter((w) => o.s.wants.includes(w))].filter((tag) => known.some((f) => f.tags.includes(tag)));
      return clash.map((tag) => ({ a: s.name, b: o.s.name, tag }));
    });
    return {
      perspective: s.name,
      whyItMatters: `${s.name} cares about ${s.wants.join(", ") || "nothing recorded"}, and is wary of ${s.wary.join(", ") || "nothing recorded"}.`,
      sees: relevant.slice(0, 6).map((f) => f.statement),
      missedByOthers,
      conflicts: conflicts.map((c) => `${c.a} and ${c.b} pull in different directions on "${c.tag}".`),
      conflictPairs: conflicts,
      opportunities: concerns.map((f) => `Addressing "${f.statement}" is likely to matter to ${s.name}.`),
      concernIds: concerns.map((f) => f.id),
    };
  });

  // One claim per problem fact, naming every viewpoint it touches. A fact several viewpoints share is a bigger problem.
  const claims: Claim[] = [];
  const byFact = new Map<string, string[]>();
  for (const r of report) for (const id of r.concernIds) byFact.set(id, [...(byFact.get(id) ?? []), r.perspective]);
  for (const [factId, who] of byFact) {
    const f = known.find((x) => x.id === factId)!;
    claims.push({ id: nextId(), agent: "PERSPECTIVE", kind: "risk", text: `${f.statement} (A problem from the point of view of: ${who.join(", ")}.)`, target: f.topic, stance: "fix", severity: f.severity ?? (who.length >= 2 ? "high" : "medium"), evidence: [f.id], rank: f.rank });
  }
  // Each pair of viewpoints is reported once per subject, whichever of the two noticed it first.
  const seen = new Set<string>();
  const tensions: string[] = [];
  for (const c of report.flatMap((r) => r.conflictPairs)) {
    const key = [c.a, c.b].sort().join("|") + "|" + c.tag;
    if (seen.has(key)) continue;
    seen.add(key);
    tensions.push(`${c.a} and ${c.b} pull in different directions on "${c.tag}".`);
  }

  return {
    claims,
    message: message({
      agent: "PERSPECTIVE",
      task: "Examine the facts from each relevant viewpoint",
      context: `${domain.name}: ${state.mission.goal}`,
      input: `${known.length} facts, ${domain.stakeholders.length} possible viewpoints`,
      analysis: [
        `${views.length} viewpoint${views.length === 1 ? " is" : "s are"} relevant to these facts: ${views.map((v) => v.s.name).join(", ") || "none"}.`,
        ...(notRelevant.length ? [`Left out because the facts say nothing about them: ${notRelevant.join(", ")}.`] : []),
        ...tensions.map((t) => `Tension: ${t}`),
      ],
      findings: claims,
      unknown: state.facts.filter((f) => f.label === "UNKNOWN").slice(0, 5).map((f) => f.need ?? f.statement),
      risks: claims.filter((c) => c.severity === "high").map((c) => c.text),
      recommendation: claims.length ? "Weigh the problems that more than one viewpoint shares first; treat the tensions as trade-offs to decide, not errors to remove." : "No viewpoint has a problem that the facts support.",
      nextAgent: "LOGIC",
      confidence: confidenceFrom(known.length, state.facts.filter((f) => f.label === "UNKNOWN").length),
      payload: { perspectives: report },
    }),
  };
}
