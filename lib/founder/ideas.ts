// The Business Idea Parking Lot. New ideas are saved, questioned, and parked. Nothing is built because an idea was saved. An
// idea moves to "Doing" only when the owner says so, only if all seven questions are answered, and only while there is room:
// at most two ideas can be in progress at once, so a new idea has to wait for something to be finished or dropped.
// Pure (no database), so the questions, the score, and the limits are tested.

export const QUESTIONS = [
  { id: "revenue", text: "Does this increase revenue?", positive: true, reason: "It increases revenue" },
  { id: "recurring", text: "Does this increase recurring revenue?", positive: true, reason: "It increases recurring revenue" },
  { id: "acquisition", text: "Does this improve customer acquisition?", positive: true, reason: "It improves customer acquisition" },
  { id: "fulfillment", text: "Does this improve fulfillment?", positive: true, reason: "It improves fulfillment" },
  { id: "strengthens", text: "Does this strengthen Patient Creations?", positive: true, reason: "It strengthens Patient Creations" },
  { id: "delegate", text: "Can it be delegated?", positive: true, reason: "It can be delegated" },
  { id: "distracts", text: "Does it distract from the current bottleneck?", positive: false, reason: "It pulls you away from the current bottleneck" },
] as const;

export type QuestionId = (typeof QUESTIONS)[number]["id"];
export type Answer = "yes" | "no" | "unsure";
export type Answers = Partial<Record<QuestionId, Answer>>;

export const isAnswer = (v: unknown): v is Answer => v === "yes" || v === "no" || v === "unsure";

/** Two ideas at a time, at most. */
export const MAX_ACTIVE_IDEAS = 2;

export type IdeaStatus = "PARKED" | "DOING" | "DONE" | "DROPPED";
export const IDEA_STATUSES: IdeaStatus[] = ["PARKED", "DOING", "DONE", "DROPPED"];
export const isIdeaStatus = (v: unknown): v is IdeaStatus => IDEA_STATUSES.includes(v as IdeaStatus);

export type Verdict = "unanswered" | "not-now" | "worth-a-look" | "park" | "skip-for-now";

export interface IdeaAssessment {
  score: number;
  verdict: Verdict;
  /** Plain-language reasons, from the answers. */
  reasons: string[];
  answered: number;
  complete: boolean;
}

/** Parses stored answers, dropping anything that is not a known question with a known answer. */
export function cleanAnswers(raw: unknown): Answers {
  const out: Answers = {};
  if (!raw || typeof raw !== "object") return out;
  for (const q of QUESTIONS) {
    const v = (raw as Record<string, unknown>)[q.id];
    if (isAnswer(v)) out[q.id] = v;
  }
  return out;
}

/**
 * A yes to any of the six good questions is a point. A yes to "does it distract from the current bottleneck" is minus two and
 * decides the verdict on its own: the idea is not for now. Anything unsure counts for nothing.
 */
export function assessIdea(answers: Answers): IdeaAssessment {
  const a = cleanAnswers(answers);
  const answered = QUESTIONS.filter((q) => a[q.id] !== undefined).length;
  const complete = answered === QUESTIONS.length;
  const goods = QUESTIONS.filter((q) => q.positive);
  const points = goods.filter((q) => a[q.id] === "yes").length;
  const distracts = a.distracts === "yes";
  const score = points - (distracts ? 2 : 0);

  const reasons: string[] = [];
  for (const q of goods) if (a[q.id] === "yes") reasons.push(q.reason);
  if (distracts) reasons.push(QUESTIONS[6].reason);

  let verdict: Verdict;
  if (answered === 0) verdict = "unanswered";
  else if (distracts) verdict = "not-now";
  else if (!complete) verdict = "park";
  else if (points >= 4) verdict = "worth-a-look";
  else if (points <= 1) verdict = "skip-for-now";
  else verdict = "park";
  return { score, verdict, reasons, answered, complete };
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  unanswered: "Answer the seven questions before deciding anything.",
  "not-now": "Not now. It pulls you off the current bottleneck. Leave it parked.",
  "worth-a-look": "Worth a closer look. It helps on several counts and does not compete with the bottleneck. Do it when there is room.",
  park: "Park it. It does not clearly earn its place yet.",
  "skip-for-now": "Skip for now. It does little for revenue, customers, or delivery.",
};

export type MoveResult = { ok: true } | { ok: false; error: string; needsOverride?: boolean };

/**
 * Whether an idea may be moved to a new status. Only the owner moves ideas, and starting one is deliberately hard: every
 * question answered, room under the limit, and an explicit override for an idea that distracts from the bottleneck.
 */
export function canMove(input: { to: IdeaStatus; from: IdeaStatus; answers: Answers; doingCount: number; override?: boolean }): MoveResult {
  if (input.to === input.from) return { ok: true };
  if (input.to !== "DOING") return { ok: true };
  const a = assessIdea(input.answers);
  if (!a.complete) return { ok: false, error: "Answer all seven questions before you start this one." };
  if (input.doingCount >= MAX_ACTIVE_IDEAS) return { ok: false, error: `You already have ${MAX_ACTIVE_IDEAS} ideas in progress. Finish or drop one first.` };
  if (a.verdict === "not-now" && !input.override) return { ok: false, needsOverride: true, error: "This idea distracts from the current bottleneck. Start it anyway?" };
  return { ok: true };
}
