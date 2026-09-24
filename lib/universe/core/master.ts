import { byImportance, confidenceFrom, honestSeverity, SEVERITY_TO_PRIORITY } from "@/lib/universe/protocol";
import { CRITICAL_ACTIONS } from "@/lib/universe/core/permissionManager";
import type { Challenge, Claim, Confidence, Decision, DecisionTask, Disagreement, RunState } from "@/lib/universe/types";

// MASTER's decision. It never trusts one agent: every claim goes through LOGIC's verdict, and when agents disagree the
// disagreement is shown, not smoothed over. The rules are fixed and written here so a decision can always be explained:
//
//   1. A claim LOGIC finds unsupported, insufficient, or invalid is set aside, with the reason.
//   2. A claim that would take a reserved action is kept as a draft that needs a person's approval.
//   3. Two claims that take opposite positions on the same thing: the side with at least two more observed facts behind it wins.
//      Otherwise nobody wins, and the decision goes to the person as a task.
//   4. Priority follows severity, and "critical" is only kept when a real observed fact stands behind it.

export const MAX_TASKS = 12;
const EVIDENCE_LEAD = 2;

// A task's title is the first sentence of the claim, or the option's own name when the claim reads "Name: reason". A note in
// brackets about whose viewpoint it is belongs in the detail, not the title.
const shortOf = (text: string, agent: string) => {
  const plain = text.replace(/\s*\(A problem from the point of view of:[^)]*\)\.?/g, "").trim();
  const head = plain.split(": ")[0];
  // Only an option (THINKING) reads "Name: reason". For anything else a colon is part of the sentence, as in "Checkout page: no form".
  const base = agent === "THINKING" && head.length >= 12 && head.length <= 110 && plain.includes(": ") && !/[.!?]$/.test(head) ? head : plain.split(/(?<=[.!?])\s/)[0];
  const cut = base.replace(/[.]$/, "");
  return cut.length > 110 ? `${cut.slice(0, 107)}...` : cut;
};

const VERB: Record<Claim["stance"], string> = { fix: "Fix", pursue: "Consider", investigate: "Investigate", avoid: "Avoid", keep: "Keep" };

export function decide(state: RunState): Decision {
  const factById = new Map(state.facts.map((f) => [f.id, f]));
  const known = state.facts.filter((f) => f.label === "FACT").length;
  const unknownFacts = state.facts.filter((f) => f.label === "UNKNOWN");
  const conflictingFacts = state.facts.filter((f) => f.label === "CONFLICTING");
  const claims = state.organized?.claims ?? state.claims;
  const byClaim = new Map<string, Challenge>(state.challenges.map((c) => [c.claimId, c]));
  const reasoning: string[] = [state.route.reason];
  const rejected: Decision["rejected"] = [];
  const disagreements: Disagreement[] = [];

  // Without LOGIC in the route, a claim still has to pass a plain gate: real evidence, or it is labeled an experiment.
  const verdictOf = (c: Claim): Challenge => {
    const ch = byClaim.get(c.id);
    if (ch) return ch;
    const grounded = c.evidence.some((id) => factById.get(id)?.label === "FACT");
    if (c.severity === "experiment" || grounded) return { claimId: c.id, verdict: "valid", reason: "Not challenged by LOGIC (it was not part of this route); it cites real evidence.", missing: [], recommendationToMaster: "Accept." };
    return { claimId: c.id, verdict: "unsupported", reason: "Not challenged by LOGIC, and it cites no observed evidence.", missing: [], recommendationToMaster: "Set aside." };
  };
  const unchallenged = claims.filter((c) => !byClaim.has(c.id)).length;
  if (unchallenged) reasoning.push(`${unchallenged} claim${unchallenged === 1 ? " was" : "s were"} not challenged by LOGIC because it was not part of this route. Each still had to cite observed evidence.`);

  const accepted: { claim: Claim; approval: boolean }[] = [];
  const conflicted: Claim[] = [];
  for (const c of claims) {
    const ch = verdictOf(c);
    if (ch.verdict === "valid") accepted.push({ claim: c, approval: (c.actions ?? []).some((a) => CRITICAL_ACTIONS.includes(a)) });
    else if (ch.verdict === "needs-approval") accepted.push({ claim: c, approval: true });
    else if (ch.verdict === "conflict") conflicted.push(c);
    else rejected.push({ text: c.text, agent: c.agent, why: `LOGIC: ${ch.verdict}. ${ch.reason}` });
  }

  // Agents that proposed something LOGIC would not accept: the disagreement is kept in view.
  const lo = claims.filter((c) => c.agent !== "ORGANIZER" && ["invalid", "unsupported", "insufficient", "needs-approval"].includes(verdictOf(c).verdict));
  for (const c of lo.slice(0, 6)) {
    const ch = verdictOf(c);
    const draft = ch.verdict === "needs-approval";
    disagreements.push({
      topic: c.target,
      positions: [
        { agent: c.agent, text: c.text, stance: c.stance, evidence: c.evidence },
        { agent: "LOGIC", text: ch.reason, stance: "avoid", evidence: [] },
      ],
      resolution: draft ? "unresolved" : "resolved",
      rule: draft ? "A claim that would take a reserved action stays a draft until a person approves it." : "A claim LOGIC finds unsupported, insufficient, or invalid is not acted on.",
      decidedFor: draft ? null : "LOGIC",
    });
  }
  if (lo.length > 6) reasoning.push(`${lo.length - 6} more claims were set aside by LOGIC and are listed under "Set aside".`);

  // Opposing claims on the same subject, and evidence that disagrees with itself.
  const decisionTasks: DecisionTask[] = [];
  const groups = new Map<string, Claim[]>();
  for (const c of conflicted) groups.set(c.target, [...(groups.get(c.target) ?? []), c]);
  for (const [target, group] of groups) {
    const pro = group.filter((c) => c.stance === "pursue");
    const con = group.filter((c) => c.stance === "avoid");
    const strength = (list: Claim[]) => new Set(list.flatMap((c) => c.evidence).filter((id) => factById.get(id)?.label === "FACT")).size;
    const positions = group.map((c) => ({ agent: c.agent, text: c.text, stance: c.stance, evidence: c.evidence }));
    if (pro.length && con.length && Math.abs(strength(pro) - strength(con)) >= EVIDENCE_LEAD) {
      const winner = strength(pro) > strength(con) ? pro : con;
      const loser = winner === pro ? con : pro;
      disagreements.push({ topic: target, positions, resolution: "resolved", rule: `The side with at least ${EVIDENCE_LEAD} more observed facts behind it wins.`, decidedFor: winner[0].text });
      accepted.push(...winner.map((c) => ({ claim: c, approval: false })));
      rejected.push(...loser.map((c) => ({ text: c.text, agent: c.agent, why: `Outweighed on "${target}": fewer observed facts behind it than the opposing position.` })));
    } else {
      disagreements.push({ topic: target, positions, resolution: "unresolved", rule: "The evidence does not favor one side by enough, or the evidence itself conflicts. A person decides.", decidedFor: null });
      decisionTasks.push({ title: `Decide: ${target}`, detail: `The agents disagree, or the evidence conflicts, and it could not be settled from the facts. ${positions.map((p) => `${p.agent}: ${p.text}`).join(" | ")}`, priority: "P2", owner: "OWNER", dependsOn: [], approvalRequired: true, actionKinds: [], evidence: [...new Set(positions.flatMap((p) => p.evidence))], severity: "medium" });
    }
  }
  if (conflictingFacts.length) reasoning.push(`${conflictingFacts.length} facts come from sources that disagree, and were not relied on.`);

  // Tasks, in order of importance.
  const withSeverity = accepted.map((a) => ({ ...a, severity: honestSeverity(a.claim, factById) })).sort((a, b) => byImportance({ ...a.claim, severity: a.severity }, { ...b.claim, severity: b.severity }));
  for (const { claim, approval, severity } of withSeverity) {
    decisionTasks.push({
      title: `${VERB[claim.stance]}: ${shortOf(claim.text, claim.agent)}`,
      detail: `${claim.text} Evidence: ${claim.evidence.join(", ") || "none (an experiment)"}.`,
      priority: SEVERITY_TO_PRIORITY[severity],
      owner: "OWNER",
      dependsOn: [],
      approvalRequired: approval,
      actionKinds: claim.actions ?? [],
      evidence: claim.evidence,
      severity,
    });
  }
  if (state.route.intent === "research") {
    for (const u of unknownFacts.slice(0, 8)) decisionTasks.push({ title: `Find out: ${(u.need ?? u.statement).slice(0, 100)}`, detail: `This could not be read from what is connected (${u.statement}). External research needs a person or a research tool.`, priority: "P3", owner: "OWNER", dependsOn: [], approvalRequired: false, actionKinds: [], evidence: [], severity: "low" });
  }
  // With nothing read, an idea is not a finding and a task built on nothing is noise. Only "find out" tasks survive.
  const usable = known === 0 ? decisionTasks.filter((t) => t.title.startsWith("Find out")) : decisionTasks;
  const tasks = usable.slice(0, MAX_TASKS);
  const overflow = usable.length - tasks.length;

  // What is not known.
  const unknowns = [...new Set([...unknownFacts.map((f) => f.need ?? f.statement), ...(state.plan?.unknowns ?? [])])];
  const unresolved = disagreements.filter((d) => d.resolution === "unresolved").length;
  const approvals = tasks.filter((t) => t.approvalRequired).length;

  // What was known before.
  for (const m of state.recalled.filter((r) => r.kind === "DECISION").slice(0, 2)) reasoning.push(`Earlier decision (${m.createdAt.toISOString().slice(0, 10)}): ${m.content.slice(0, 160)}`);
  reasoning.push(`Evidence: ${known} observed, ${unknownFacts.length} unknown, ${conflictingFacts.length} conflicting.`);

  const messageRisks = [...new Set(state.messages.flatMap((m) => m.risks))].slice(0, 8);
  let confidence: Confidence = confidenceFrom(known, unknownFacts.length + conflictingFacts.length);
  if (unresolved > 0 && confidence === "HIGH") confidence = "MEDIUM";
  if (rejected.length > accepted.length && confidence !== "LOW") confidence = "LOW";

  const summary = known === 0
    ? "Nothing could be established: no data could be read, so no conclusion is offered. See what is not known below."
    : `${accepted.length} finding${accepted.length === 1 ? " is" : "s are"} supported by the evidence${tasks.length ? ` and became ${tasks.length} task${tasks.length === 1 ? "" : "s"}` : ""}. ${rejected.length} ${rejected.length === 1 ? "was" : "were"} set aside. ${unresolved} need${unresolved === 1 ? "s" : ""} your decision.`;

  const nextActions = [
    ...(known === 0 ? ["Restore the connection to the data, then run this again. Nothing can be concluded until something can be read."] : []),
    ...tasks.slice(0, 3).map((t) => `${t.priority} ${t.title}`),
    ...(approvals ? [`Approve or reject ${approvals} draft task${approvals === 1 ? "" : "s"} that ${approvals === 1 ? "needs" : "need"} your decision.`] : []),
    ...(unknowns.length ? [`Answer what is not known first: ${unknowns.slice(0, 2).join("; ")}`] : []),
    ...(overflow > 0 ? [`${overflow} lower-priority finding${overflow === 1 ? " was" : "s were"} not turned into tasks. Ask again to see them.`] : []),
  ];

  return { summary, reasoning, tasks, risks: [...messageRisks, ...disagreements.filter((d) => d.resolution === "unresolved").map((d) => `Unresolved: ${d.topic}`)].slice(0, 10), nextActions, disagreements, rejected, unknowns, confidence };
}
