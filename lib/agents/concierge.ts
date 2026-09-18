import { db } from "@/lib/db";
import { aiEnabled, callModel } from "@/lib/ai/callModel";
import { getProjectProgress } from "@/lib/workflows/progress";
import {
  CONCIERGE_SYSTEM,
  ConciergeReply,
  ProjectFacts,
  buildConciergePrompt,
  looksLikeUnauthorizedPromise,
  parseModelReply,
  ruleBasedReply,
} from "@/lib/agents/conciergeLogic";

export const CONCIERGE_NAME = "Concierge Agent";

async function loadProjectFacts(projectId: string): Promise<ProjectFacts> {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      customer: { include: { user: true } },
      order: { include: { items: { include: { product: true }, orderBy: { id: "asc" } } } },
      updates: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  const progress = await getProjectProgress(projectId);
  const fullName = project.customer.user.name ?? "";

  return {
    customerName: fullName.split(" ")[0] ?? "",
    projectName: project.name,
    phaseLabel: progress.currentPhaseLabel,
    percent: progress.percent,
    isException: progress.isException,
    isDelivered: ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED"].includes(project.state),
    turnaround: project.order.items[0]?.product.turnaround ?? null,
    latestUpdate: project.updates[0]?.message ?? null,
  };
}

/**
 * Answers a customer's message on their private project page. Uses the model
 * when one is configured, but only ever with this project's own facts, and
 * falls back to the rule-based reply if the model is unavailable, returns
 * something unparseable, or tries to make a money/legal promise. Never throws.
 */
export async function replyToCustomer(projectId: string, question: string): Promise<ConciergeReply> {
  const facts = await loadProjectFacts(projectId);
  const fallback = ruleBasedReply(question, facts);
  if (!process.env.ANTHROPIC_API_KEY || !aiEnabled()) return fallback;

  try {
    const result = await callModel({
      agentKey: "concierge",
      system: CONCIERGE_SYSTEM,
      prompt: buildConciergePrompt(facts, question),
      maxTokens: 400,
    });
    const parsed = parseModelReply(result.text);
    if (parsed && !looksLikeUnauthorizedPromise(parsed.reply)) return parsed;
  } catch (err) {
    console.error("concierge: model call failed, using rule-based reply", err);
  }
  return fallback;
}
