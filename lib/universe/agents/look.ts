import { confidenceFrom, idMaker, message } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, Fact, RunState } from "@/lib/universe/types";

// LOOK reports what is visible in the page's markup: what is there, what looks confusing, what looks missing, and what could be
// better, each with the reason. It reads HTML. It cannot see colors, spacing, or how a page really renders, and it says so
// rather than pretending to know invisible implementation details.

const LOOK_TAGS = ["look", "navigation"];
const isLook = (f: Fact) => f.tags.includes("observed") && f.tags.some((t) => LOOK_TAGS.includes(t));

export function look(state: RunState): AgentOutput {
  const nextId = idMaker("LK");
  const seen = state.facts.filter((f) => isLook(f));
  const fine = seen.filter((f) => f.label === "FACT" && f.signal === "positive");
  const problems = seen.filter((f) => f.label === "FACT" && f.signal === "negative");
  const couldNotOpen = state.facts.filter((f) => f.label === "UNKNOWN" && f.tags.includes("observed"));

  const claims: Claim[] = problems.map((f) => {
    const isStructure = f.tags.includes("structure") || f.tags.includes("mobile");
    return {
      id: nextId(),
      agent: "LOOK" as const,
      kind: "observation" as const,
      text: f.statement,
      target: f.topic,
      stance: "fix" as const,
      // A missing mobile layout or a page with no heading is a plain, checkable problem; the rest are worth doing but not urgent.
      severity: isStructure ? ("high" as const) : ("medium" as const),
      evidence: [f.id],
    };
  });

  const report = {
    visible: fine.map((f) => f.statement),
    confusing: problems.filter((f) => f.tags.some((t) => ["clarity", "friction", "readability"].includes(t))).map((f) => f.statement),
    missing: problems.filter((f) => !f.tags.some((t) => ["clarity", "friction", "readability"].includes(t))).map((f) => f.statement),
    improve: problems.map((f) => f.statement),
    why: "Each item is a difference between what a page usually needs to be usable and what its markup shows. It is not a judgement of taste.",
  };

  return {
    claims,
    message: message({
      agent: "LOOK",
      task: "Examine the visible structure of the pages",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${new Set(seen.map((f) => f.key?.split(".")[1])).size} page${seen.length === 1 ? "" : "s"} examined`,
      analysis: [
        `${fine.length} thing${fine.length === 1 ? "" : "s"} in the markup look fine; ${problems.length} look worth fixing.`,
        "LOOK reads the page's HTML only. It cannot judge colors, spacing, imagery, or how the page actually renders, so none of that is claimed here.",
        ...couldNotOpen.map((f) => f.statement),
      ],
      findings: claims,
      unknown: [...couldNotOpen.map((f) => f.need ?? f.statement), "How the pages actually render (colors, spacing, imagery) needs a person or a screenshot review."],
      risks: claims.filter((c) => c.severity === "high").map((c) => c.text),
      recommendation: problems.length ? "Fix the structural items first (mobile layout, headings, title); they are the cheapest to check and to correct." : "Nothing in the markup needs fixing. Ask for a screenshot review if the visual look is the question.",
      nextAgent: "FEELINGS",
      // Reading markup is a partial view of a visual thing, so this is never HIGH.
      confidence: confidenceFrom(seen.length, couldNotOpen.length) === "HIGH" ? "MEDIUM" : confidenceFrom(seen.length, couldNotOpen.length),
      payload: { report },
    }),
  };
}
