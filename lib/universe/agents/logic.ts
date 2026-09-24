import { confidenceFrom, message } from "@/lib/universe/protocol";
import type { AgentOutput, Challenge, Claim, Fact, RunState, Verdict } from "@/lib/universe/types";

// LOGIC guards the integrity of the reasoning. It tests each claim against the facts: is there evidence, is the evidence real
// (not an assumption or an unknown), do the numbers match, does it contradict another claim, does it break a rule of the
// business. It is expected to disagree with the other agents, and MASTER sees every disagreement. It never softens a verdict to
// keep the peace.

const RECOMMEND: Record<Verdict, string> = {
  valid: "Accept this claim.",
  unsupported: "Reject this claim, or gather evidence before acting on it.",
  insufficient: "Do not act on this yet. Gather what is missing first.",
  invalid: "Reject this claim. Its evidence does not say what it claims.",
  conflict: "Do not act on this until the disagreement is settled.",
  "needs-approval": "Keep this as a draft. A person must approve it before anything is done.",
};

const num = (s: string) => Number(s.replace(/[$,%\s,]/g, ""));

/** Every number written in a piece of text, normalised so "$1,500" and "1500" compare equal. */
export function numbersIn(text: string): number[] {
  return (text.match(/\$?\s?\d[\d,]*(?:\.\d+)?%?/g) ?? []).map(num).filter((n) => Number.isFinite(n));
}

/** Copy is checked against the facts it was written from: a number that is in neither the facts nor the source text is invented. */
export function checkCopyText(copy: string, source: string, facts: Fact[], banned: string[]): { ok: boolean; invented: number[]; bannedHits: string[] } {
  const allowed = new Set<number>([...numbersIn(source), ...facts.filter((f) => f.label === "FACT").flatMap((f) => [...(typeof f.value === "number" ? [f.value, f.value / 100] : []), ...numbersIn(f.statement)])]);
  const invented = [...new Set(numbersIn(copy).filter((n) => !allowed.has(n)))];
  // Report the words that offend, not the pattern that caught them, so the writer knows what to change.
  const bannedHits = banned.map((b) => new RegExp(b, "i").exec(copy)?.[0]).filter((m): m is string => Boolean(m));
  return { ok: invented.length === 0 && bannedHits.length === 0, invented, bannedHits };
}

export function logic(state: RunState): AgentOutput {
  const factById = new Map(state.facts.map((f) => [f.id, f]));
  const claimIds = new Set(state.claims.map((c) => c.id));
  const challenges: Challenge[] = [];
  const contradictions = new Map<string, string>();

  // Claims on the same subject that pull opposite ways cannot both be acted on.
  const byTarget = new Map<string, Claim[]>();
  for (const c of state.claims) byTarget.set(c.target, [...(byTarget.get(c.target) ?? []), c]);
  for (const group of byTarget.values()) {
    const pro = group.filter((c) => c.stance === "pursue");
    const con = group.filter((c) => c.stance === "avoid");
    if (pro.length && con.length) {
      for (const c of pro) contradictions.set(c.id, con[0].id);
      for (const c of con) contradictions.set(c.id, pro[0].id);
    }
  }

  for (const c of state.claims) {
    const cited = c.evidence.map((id) => factById.get(id));
    const unknownTopics = state.facts.filter((f) => f.label === "UNKNOWN" && (f.topic === c.target || cited.some((x) => x?.topic === f.topic)));
    const missing = [...new Set(unknownTopics.map((f) => f.need ?? f.statement))];
    const done = (verdict: Verdict, reason: string, extraMissing: string[] = []) => challenges.push({ claimId: c.id, verdict, reason, missing: [...missing, ...extraMissing], recommendationToMaster: RECOMMEND[verdict] });

    // An experiment says it has no evidence, which is honest, so it is not penalised for that.
    if (c.severity === "experiment") {
      done("valid", "Labeled an experiment: it claims no evidence and is kept at the lowest priority.");
      continue;
    }
    if (c.evidence.length === 0) {
      done("unsupported", "The claim cites no evidence.");
      continue;
    }
    if (c.evidence.some((id) => claimIds.has(id))) {
      done("invalid", "The claim cites another claim as evidence, which is circular reasoning.");
      continue;
    }
    if (cited.some((f) => !f)) {
      done("invalid", "The claim cites a fact that does not exist.");
      continue;
    }
    const facts = cited as Fact[];
    const wrongNumber = (c.numbers ?? []).find((n) => {
      const f = factById.get(n.factId);
      return f && typeof f.value === "number" && Math.abs(f.value - n.value) > 1e-9;
    });
    if (wrongNumber) {
      done("invalid", `The claim states ${wrongNumber.value} but the fact it cites says ${factById.get(wrongNumber.factId)?.value}.`);
      continue;
    }
    if (facts.some((f) => f.label === "CONFLICTING")) {
      done("conflict", "The evidence includes facts from sources that disagree, so it cannot be relied on yet.");
      continue;
    }
    if (facts.every((f) => f.label !== "FACT")) {
      done("insufficient", "The only evidence is an assumption or something not known, which is not evidence.", facts.map((f) => f.need ?? f.statement));
      continue;
    }
    const rule = state.domain.constraints.find((k) => (c.actions ?? []).some((a) => k.forbidsActions.includes(a)));
    if (rule) {
      done("needs-approval", `It would take an action the business reserves for a person: ${rule.text}`);
      continue;
    }
    const other = contradictions.get(c.id);
    if (other) {
      done("conflict", `It contradicts claim ${other}, which takes the opposite position on "${c.target}".`);
      continue;
    }
    done("valid", `Supported by ${facts.filter((f) => f.label === "FACT").length} observed fact${facts.length === 1 ? "" : "s"}.`);
  }

  const counts = challenges.reduce<Record<string, number>>((m, c) => ({ ...m, [c.verdict]: (m[c.verdict] ?? 0) + 1 }), {});
  const conflicts = state.facts.filter((f) => f.label === "CONFLICTING");
  const missingAll = [...new Set(challenges.flatMap((c) => c.missing))];
  const known = state.facts.filter((f) => f.label === "FACT").length;

  // Copy is the other thing LOGIC guards: the words must not change or invent the facts they were written from.
  const copy = state.messages.find((m) => m.agent === "SPEAKER")?.payload?.copy as { text: string; source: string; mocked: boolean } | undefined;
  const copyCheck = copy ? checkCopyText(copy.text, copy.source, state.facts, state.domain.constraints.flatMap((k) => k.bannedPhrases ?? [])) : null;
  if (copyCheck) {
    challenges.push({
      claimId: "COPY",
      verdict: copyCheck.ok ? "valid" : "invalid",
      reason: copyCheck.ok ? "Every number in the copy is in the facts or the original text, and no forbidden promise is made." : `${copyCheck.invented.length ? `The copy contains numbers not found in the facts or the original: ${copyCheck.invented.join(", ")}. ` : ""}${copyCheck.bannedHits.length ? `It uses wording the business does not allow: ${copyCheck.bannedHits.join(", ")}.` : ""}`.trim(),
      missing: [],
      recommendationToMaster: copyCheck.ok ? "Accept this copy." : "Reject this copy and send it back to be corrected.",
    });
  }

  return {
    challenges,
    message: message({
      agent: "LOGIC",
      task: "Test the reasoning against the evidence",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${state.claims.length} claim${state.claims.length === 1 ? "" : "s"}, ${state.facts.length} facts, ${state.domain.constraints.length} rules`,
      analysis: [
        state.claims.length ? `Verdicts: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}.` : "There were no claims to test.",
        ...(conflicts.length ? [`${conflicts.length} facts conflict with each other.`] : []),
        ...(copyCheck ? [copyCheck.ok ? "The copy stays within the facts." : "The copy goes beyond the facts."] : []),
      ],
      unknown: missingAll,
      risks: challenges.filter((c) => c.verdict === "invalid" || c.verdict === "conflict").map((c) => `${c.claimId}: ${c.reason}`),
      recommendation: `Accept ${counts.valid ?? 0}; hold back ${state.claims.length - (counts.valid ?? 0)}. ${missingAll.length ? `Missing information: ${missingAll.slice(0, 3).join("; ")}.` : ""}`.trim(),
      nextAgent: "ORGANIZER",
      confidence: confidenceFrom(known, missingAll.length + conflicts.length),
      payload: { challenges, counts },
    }),
  };
}
