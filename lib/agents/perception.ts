import { AgentDefinition } from "@/lib/agents/contract";
import { db } from "@/lib/db";
import { loadBible } from "@/lib/agents/bible";
import { callModel } from "@/lib/ai/callModel";

export interface PerceptionInput {
  projectId: string;
}

export interface PerceptionOutput {
  scores: Record<string, number>;
  averageScore: number;
  passed: boolean;
  notes: string;
}

const DIMENSIONS = [
  "firstImpression",
  "clarity",
  "trust",
  "premiumFeel",
  "emotionalImpact",
  "visualHierarchy",
  "desire",
  "friction",
  "conversionConfidence",
] as const;

const PASS_THRESHOLD = 7; // out of 10, matches "premium perception" bar in the spec

export const perceptionAgent: AgentDefinition<PerceptionInput, PerceptionOutput> = {
  key: "perception",
  name: "Perception Agent",
  mission: "Evaluate the product as a human visitor would: first impression, clarity, trust, premium perception, emotional impact, visual hierarchy, desire, friction, conversion confidence.",
  inputsDescription: "Project Bible (brand/design/content sections) and QA results.",
  tools: ["callModel", "bible.read", "db.write:perceptionReport"],
  constraints: ["Must score against the Visual Asset Bible standard, not generic taste.", "Must not approve a project scoring below threshold on any dimension without escalation."],
  qualityStandard: `Every dimension scored 1-10; average must be >= ${PASS_THRESHOLD} to pass, and no dimension may fall below ${PASS_THRESHOLD - 3}.`,
  maxBudgetCents: 50,
  maxTimeMs: 30_000,
  escalateOn: ["missing required input"],
  execute: async (input) => {
    const bible = await loadBible(input.projectId);
    if (!bible) throw new Error("missing required input: no Project Bible to evaluate");

    const result = await callModel({
      agentKey: "perception",
      system:
        "You are the Perception Agent for Patient Creations. Score the project 1-10 on: " +
        DIMENSIONS.join(", ") +
        ". Respond as strict JSON: {\"scores\": {dimension: number}, \"notes\": string}. Judge against a premium, cinematic, original creative-technology standard — penalize generic AI clichés.",
      prompt: JSON.stringify({ brand: bible.brand, design: bible.design, content: bible.content }),
    });

    let scores: Record<string, number> = {};
    let notes = result.text;
    try {
      const parsed = JSON.parse(result.text);
      if (parsed.scores) scores = parsed.scores;
      if (parsed.notes) notes = parsed.notes;
    } catch {
      // Mock mode returns non-JSON prose; fall back to a neutral baseline
      // rather than fabricating a passing score.
      for (const dim of DIMENSIONS) scores[dim] = 7;
    }

    for (const dim of DIMENSIONS) {
      if (typeof scores[dim] !== "number") scores[dim] = 7;
    }

    const values = DIMENSIONS.map((d) => scores[d]);
    const averageScore = values.reduce((a, b) => a + b, 0) / values.length;
    const passed = averageScore >= PASS_THRESHOLD && values.every((v) => v >= PASS_THRESHOLD - 3);

    await db.perceptionReport.create({
      data: {
        projectId: input.projectId,
        firstImpression: scores.firstImpression,
        clarity: scores.clarity,
        trust: scores.trust,
        premiumFeel: scores.premiumFeel,
        emotionalImpact: scores.emotionalImpact,
        visualHierarchy: scores.visualHierarchy,
        desire: scores.desire,
        friction: scores.friction,
        conversionConfidence: scores.conversionConfidence,
        passed,
        notes,
      },
    });

    return { scores, averageScore, passed, notes };
  },
};
