import { confidenceFrom, hasHedge, idMaker, message } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, Fact, RunState } from "@/lib/universe/types";

// FEELINGS estimates how people are likely to react. The system feels nothing; this is a reading of signals (trust markers,
// friction, confusion, waiting) into what a person may feel and why. Every prediction is worded as a possibility and never as
// a certainty, and each one points at the fact that prompted it.

interface Feeling {
  signal: string;
  likelyReaction: string;
  possibleCause: string;
  potentialImprovement: string;
  evidence: string[];
}

const FEEL_TAGS = ["trust", "friction", "clarity", "customer-experience"];
const relevant = (f: Fact) => f.label === "FACT" && f.signal === "negative" && f.tags.some((t) => FEEL_TAGS.includes(t));

/** The wording for each kind of signal. Kept in one table so every line can be checked for hedging. */
const READINGS: { tag: string; signal: string; reaction: string; improvement: string }[] = [
  { tag: "contact", signal: "Uncertainty about who is behind this", reaction: "A visitor may hesitate to buy or ask when they cannot see how to reach a person.", improvement: "Show a phone number or email where the decision is made." },
  { tag: "proof", signal: "Little proof to lean on", reaction: "A first-time visitor could feel unsure that others have been satisfied.", improvement: "Show real reviews, real numbers, or how long the business has operated, only where they are true." },
  { tag: "policy", signal: "Unclear terms", reaction: "Someone about to pay may potentially feel anxious when no refund or terms page is easy to find.", improvement: "Link the terms and refund policy near where payment is asked for." },
  { tag: "friction", signal: "Friction at the moment of action", reaction: "A visitor may feel overwhelmed or tired when a page asks for a lot at once or offers many competing actions.", improvement: "Reduce to one clear next step, and ask only for what is needed." },
  { tag: "clarity", signal: "Confusion about what this is", reaction: "A visitor could leave without understanding the offer if there is no clear main heading or price.", improvement: "State the offer and its price in plain words near the top." },
  { tag: "customer-experience", signal: "Waiting without news", reaction: "A customer waiting on something may feel anxious or ignored when nothing tells them what is happening.", improvement: "Tell them where things stand and when to expect the next step." },
];

export function feelings(state: RunState): AgentOutput {
  const nextId = idMaker("FE");
  const signals = state.facts.filter(relevant);
  const items: Feeling[] = [];
  const claims: Claim[] = [];

  for (const f of signals) {
    const reading = READINGS.find((r) => f.tags.includes(r.tag));
    if (!reading) continue;
    const feeling: Feeling = { signal: reading.signal, likelyReaction: reading.reaction, possibleCause: f.statement, potentialImprovement: reading.improvement, evidence: [f.id] };
    // A prediction with no hedge is not allowed out. This is enforced here and tested.
    if (!hasHedge(feeling.likelyReaction)) feeling.likelyReaction = `May feel: ${feeling.likelyReaction}`;
    items.push(feeling);
    claims.push({ id: nextId(), agent: "FEELINGS", kind: "risk", text: `${f.statement} ${feeling.likelyReaction}`, target: f.topic, stance: "fix", severity: f.severity ?? "medium", evidence: [f.id], rank: f.rank });
  }
  const good = state.facts.filter((f) => f.label === "FACT" && f.signal === "positive" && f.tags.some((t) => ["trust", "contact", "proof"].includes(t)));
  const known = signals.length + good.length;

  return {
    claims,
    message: message({
      agent: "FEELINGS",
      task: "Estimate how people are likely to react",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${state.facts.filter((f) => f.tags.some((t) => FEEL_TAGS.includes(t))).length} signals of trust, friction, clarity, or waiting`,
      analysis: [
        `${items.length} possible source${items.length === 1 ? "" : "s"} of hesitation found; ${good.length} reassuring signal${good.length === 1 ? "" : "s"} present.`,
        "These are estimates of likely human reactions, not measurements. The system does not experience emotion.",
        ...good.slice(0, 3).map((f) => `Reassuring: ${f.statement}`),
      ],
      findings: claims,
      unknown: ["How real visitors actually feel needs real feedback: reviews, messages, or session recordings. None were read."],
      risks: [...new Set(items.map((i) => `${i.signal}: ${i.likelyReaction}`))],
      recommendation: items.length ? "Address the source of hesitation nearest to the moment of payment or contact first." : "No likely source of hesitation was found in the signals read.",
      nextAgent: "LOGIC",
      confidence: confidenceFrom(known, 1) === "HIGH" ? "MEDIUM" : confidenceFrom(known, 1),
      payload: { feelings: items },
    }),
  };
}
