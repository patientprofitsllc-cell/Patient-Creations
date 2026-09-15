import { AgentDefinition } from "@/lib/agents/contract";
import { db } from "@/lib/db";

export interface MasterEditorInput {
  projectId: string;
}

export type MasterEditorDecision = "approve" | "revise" | "escalate";

export interface MasterEditorOutput {
  decision: MasterEditorDecision;
  reason: string;
}

export const masterEditorAgent: AgentDefinition<MasterEditorInput, MasterEditorOutput> = {
  key: "master_editor",
  name: "Master Editor",
  mission: "Review all agent outputs (QA + Perception) and coordinate corrections; approve only when both pass.",
  inputsDescription: "Latest QaReport and PerceptionReport for the project, and the project's current retry count.",
  tools: ["db.read"],
  constraints: ["Must not approve unless the latest QA report passed AND the latest Perception report passed."],
  qualityStandard: "Decision is fully explained by the referenced QA/Perception findings, not asserted without evidence.",
  maxBudgetCents: 0,
  maxTimeMs: 10_000,
  escalateOn: ["missing required input", "max retries exceeded"],
  execute: async (input) => {
    const project = await db.project.findUniqueOrThrow({ where: { id: input.projectId } });

    const [latestQa, latestPerception] = await Promise.all([
      db.qaReport.findFirst({ where: { projectId: input.projectId }, orderBy: { createdAt: "desc" } }),
      db.perceptionReport.findFirst({ where: { projectId: input.projectId }, orderBy: { createdAt: "desc" } }),
    ]);

    if (!latestQa) throw new Error("missing required input: no QA report to review");

    if (!latestQa.passed) {
      return { decision: "revise", reason: "Latest QA report failed one or more checks." };
    }

    if (!latestPerception) {
      return { decision: "revise", reason: "No Perception report yet; cannot approve without perception review." };
    }

    const MAX_RETRIES = 5;
    if (!latestPerception.passed) {
      if (project.retryCount >= MAX_RETRIES) {
        throw new Error("max retries exceeded: perception review still failing after maximum attempts");
      }
      return { decision: "revise", reason: "Latest Perception report scored below the premium-perception threshold." };
    }

    return { decision: "approve", reason: "QA and Perception both passed." };
  },
};
