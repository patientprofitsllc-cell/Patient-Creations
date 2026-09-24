import { confidenceFrom, hasHedge, idMaker, message } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, Fact, Lever, RunState } from "@/lib/universe/types";

// THINKING explores possibilities before narrowing: several options, why each might work, what it depends on, what could go
// wrong, and what it may set off next. It is the creative and strategic mind. It proposes; it does not verify (LOGIC does) and
// it does not decide (MASTER does). An idea with no evidence behind it is always labeled an experiment.

interface Option {
  option: string;
  rationale: string;
  expectedEffect: string;
  dependencies: string[];
  risks: string[];
  secondOrderEffects: string[];
  evidence: string[];
  experiment: boolean;
}

const words = (text: string) => new Set((text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) as string[]);

/** Facts whose topic or tags are named in the request. */
export function factsNamedIn(text: string, facts: Fact[]): Fact[] {
  const w = words(text);
  return facts.filter((f) => f.label === "FACT" && (w.has(f.topic.toLowerCase()) || f.tags.some((t) => w.has(t.toLowerCase())) || [...words(f.statement)].some((x) => x.length > 5 && w.has(x))));
}

const SEV = ["critical", "high", "medium", "low", "experiment"] as const;
const hedged = (s: string) => (hasHedge(s) ? s : `May ${s.charAt(0).toLowerCase()}${s.slice(1)}`);

function fromLever(l: Lever, evidence: Fact[]): Option {
  return {
    option: l.title,
    rationale: l.rationale,
    expectedEffect: hedged(l.expectedEffect),
    dependencies: l.dependencies,
    risks: l.risks,
    secondOrderEffects: l.secondOrder,
    evidence: evidence.map((f) => f.id),
    experiment: Boolean(l.experiment) || evidence.length === 0,
  };
}

export function think(state: RunState): AgentOutput {
  const nextId = idMaker("TH");
  const known = state.facts.filter((f) => f.label === "FACT");
  const unknowns = state.facts.filter((f) => f.label === "UNKNOWN");
  const options: Option[] = [];

  // 1. Options the evidence points to: a lever wakes when a fact it watches shows a problem.
  const triggered = state.domain.levers
    .filter((l) => !l.experiment)
    .map((l) => ({ l, ev: known.filter((f) => f.tags.some((t) => l.triggerTags.includes(t)) && (l.when === "any" || f.signal === "negative")) }))
    .filter((x) => x.ev.length > 0)
    .sort((a, b) => b.ev.length - a.ev.length);
  for (const { l, ev } of triggered.slice(0, 6)) options.push(fromLever(l, ev));

  // 2. A decision is explored as three universal options, so "yes" is never the only thing on the table.
  if (state.route.intent === "decision") {
    const named = factsNamedIn(state.mission.objective, state.facts);
    const evidence = (named.length ? named : known).slice(0, 4);
    const open = unknowns.map((u) => u.need ?? u.statement).slice(0, 4);
    options.push(
      { option: "Pilot it small first", rationale: "A limited trial answers the open questions with real results before the whole business commits.", expectedEffect: "A small trial could show whether people want it, at low cost and low risk.", dependencies: ["A clear measure of success", "A defined end date for the trial"], risks: ["A small sample may mislead", "Running two versions may confuse people"], secondOrderEffects: ["Customers in the trial may talk about it publicly", ...open.map((o) => `Still to answer: ${o}`)], evidence: evidence.map((f) => f.id), experiment: false },
      { option: "Commit fully", rationale: "Moving all at once captures the benefit sooner if the evidence is already strong.", expectedEffect: "It could produce the full effect sooner, if the evidence holds.", dependencies: ["Every open question answered", ...open], risks: ["Hard to reverse", "Any hidden problem lands on every customer at once"], secondOrderEffects: ["Existing customers may expect the same terms"], evidence: evidence.map((f) => f.id), experiment: false },
      { option: "Defer and answer the open questions first", rationale: "Some things are not known yet, and waiting costs little if nothing is on fire.", expectedEffect: "It may avoid a mistake that is expensive to undo.", dependencies: open.length ? open : ["Nothing specific is blocking"], risks: ["Momentum and timing may be lost"], secondOrderEffects: ["A competitor could move first"], evidence: evidence.map((f) => f.id), experiment: false },
    );
  }

  // 3. Explore beyond the obvious: experiments are added (and labeled) until at least three options exist to compare.
  for (const l of state.domain.levers.filter((x) => x.experiment)) {
    if (options.length >= 3) break;
    options.push(fromLever(l, []));
  }

  const claims: Claim[] = [];
  const decisionOptions = new Set(["Pilot it small first", "Commit fully", "Defer and answer the open questions first"]);
  for (const o of options) {
    // The three decision options are alternatives, not a to-do list. Only the one the evidence favors becomes a claim.
    if (decisionOptions.has(o.option)) continue;
    const lever = state.domain.levers.find((l) => l.title === o.option);
    // Seriousness is the business's own judgment of this kind of problem, or the worst severity any supporting fact declares.
    const declared = o.evidence.map((id) => known.find((f) => f.id === id)?.severity).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const ranks = o.evidence.map((id) => known.find((f) => f.id === id)?.rank).filter((r): r is number => typeof r === "number");
    const severity = o.experiment ? "experiment" : ([lever?.severity ?? "medium", ...declared] as const).reduce((a, b) => (SEV.indexOf(b) < SEV.indexOf(a) ? b : a));
    claims.push({ id: nextId(), agent: "THINKING", kind: "recommendation", text: `${o.option}: ${o.rationale}`, target: lever?.component ?? "strategy", stance: "pursue", severity, evidence: o.evidence, actions: lever?.actions, rank: lever?.rank ?? (ranks.length ? Math.min(...ranks) : undefined) });
  }
  if (state.route.intent === "decision") {
    // The favored option follows a simple stated rule: unknowns present means pilot; otherwise commit only if there is evidence.
    const favored = unknowns.length > 0 || known.length < 4 ? "Pilot it small first" : "Commit fully";
    const o = options.find((x) => x.option === favored)!;
    claims.push({ id: nextId(), agent: "THINKING", kind: "recommendation", text: `${favored}. ${o.rationale} ${unknowns.length ? `${unknowns.length} thing${unknowns.length === 1 ? " is" : "s are"} not yet known.` : ""}`.trim(), target: "decision", stance: favored === "Commit fully" ? "pursue" : "investigate", severity: o.evidence.length ? "medium" : "low", evidence: o.evidence, actions: [] });
  }

  return {
    claims,
    message: message({
      agent: "THINKING",
      task: "Explore possibilities and strategies before narrowing",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${known.length} facts, ${state.domain.levers.length} known levers`,
      analysis: [
        `${options.length} option${options.length === 1 ? "" : "s"} explored: ${options.filter((o) => !o.experiment).length} backed by evidence, ${options.filter((o) => o.experiment).length} labeled as experiments.`,
        ...options.slice(0, 5).map((o) => `${o.option}${o.experiment ? " (experiment: no evidence yet)" : ` (${o.evidence.length} supporting fact${o.evidence.length === 1 ? "" : "s"})`}`),
      ],
      findings: claims,
      assumptions: options.filter((o) => o.experiment).map((o) => `${o.option} is an idea, not something the evidence shows.`),
      unknown: unknowns.slice(0, 6).map((u) => u.need ?? u.statement),
      risks: [...new Set(options.flatMap((o) => o.risks))].slice(0, 5),
      recommendation: claims.length ? "Send these options to LOGIC to be challenged before any of them is chosen." : "No option is supported by the evidence read. Gather more before proposing anything.",
      nextAgent: "LOGIC",
      confidence: confidenceFrom(known.length, unknowns.length),
      payload: { options },
    }),
  };
}
