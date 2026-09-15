import { db } from "@/lib/db";
import { ProjectState } from "@/lib/types";
import { logEvent } from "@/lib/analytics/events";
import { transitionProject } from "@/lib/workflows/stateMachine";
import { buildInitialBible, createBible } from "@/lib/agents/bible";
import { runAgent } from "@/lib/agents/contract";
import {
  researchAgent,
  strategyAgent,
  creativeDirectorAgent,
  visualDirectorAgent,
  uxAgent,
  uiAgent,
  copyAgent,
  developmentAgent,
  imageAgent,
  videoAgent,
  characterAgent,
  marketingAgent,
  seoAgent,
  analyticsAgentDef,
} from "@/lib/agents/definitions";
import { qaAgent } from "@/lib/agents/qa";
import { perceptionAgent } from "@/lib/agents/perception";
import { masterEditorAgent } from "@/lib/agents/masterEditor";
import { sendEmail } from "@/lib/email/provider";
import { notifyAdmin } from "@/lib/security/notify";
import { generateStatusToken, statusUrlFor } from "@/lib/projects/statusToken";

export const MAX_RETRIES = 5;

// Task plan mirrors the spec's example progress table exactly.
const TASK_PLAN: { phase: ProjectState; label: string; weight: number }[] = [
  { phase: "PAID", label: "Order Received", weight: 5 },
  { phase: "INTAKE_REQUIRED", label: "Brief Analyzed", weight: 7 },
  { phase: "RESEARCH", label: "Research Complete", weight: 10 },
  { phase: "STRATEGY", label: "Strategy Set", weight: 5 },
  { phase: "CONCEPT", label: "Concept Approved", weight: 9 },
  { phase: "GENERATION", label: "Assets Generated", weight: 17 },
  { phase: "BUILD", label: "Build In Progress", weight: 14 },
  { phase: "AUTOMATION", label: "Automation Configured", weight: 14 },
  { phase: "QA", label: "QA", weight: 12 },
  { phase: "PERCEPTION", label: "Final Review", weight: 5 },
  { phase: "DELIVERY_READY", label: "Delivery Ready", weight: 2 },
];

/**
 * Creates the Project + Project Bible for a newly paid order and kicks off
 * the orchestrator. Called only from the verified payment webhook path —
 * never from the client.
 */
export async function createProjectForOrder(orderId: string) {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: { include: { user: true } }, items: { include: { product: true } } },
  });

  const primaryItem = order.items[0];

  const project = await db.project.create({
    data: {
      orderId: order.id,
      customerId: order.customerId,
      name: `${primaryItem?.product.name ?? "Project"} — ${order.customer.user.name ?? order.customer.user.email}`,
      state: "DRAFT",
      statusToken: generateStatusToken(),
    },
  });

  const bibleData = buildInitialBible({
    customerName: order.customer.user.name ?? order.customer.user.email,
    customerEmail: order.customer.user.email,
    productName: primaryItem?.product.name ?? "Unknown",
    productCategory: primaryItem?.product.category ?? "general",
  });
  await createBible(project.id, bibleData);

  await db.projectTask.createMany({
    data: TASK_PLAN.map((t) => ({
      projectId: project.id,
      phase: t.phase,
      label: t.label,
      weight: t.weight,
      status: "PENDING",
    })),
  });

  await logEvent("project.created", "Project", project.id, { orderId });

  await transitionProject(project.id, "PAID");
  await markTask(project.id, "PAID", "PASSED");
  await sendEmail(order.customer.user.email, "purchase_confirmation", {
    projectName: project.name,
    statusUrl: statusUrlFor(project.statusToken!),
  });

  // Fire-and-continue: run the pipeline in-process. A slow first task
  // should not block the payment webhook response, so callers await this
  // only when they explicitly want synchronous completion (e.g. tests/demo).
  return project;
}

async function markTask(projectId: string, phase: ProjectState, status: "IN_PROGRESS" | "PASSED" | "FAILED") {
  const task = await db.projectTask.findFirst({ where: { projectId, phase } });
  if (!task) return;
  await db.projectTask.update({
    where: { id: task.id },
    data: {
      status,
      startedAt: status === "IN_PROGRESS" ? new Date() : task.startedAt,
      completedAt: status === "PASSED" ? new Date() : task.completedAt,
      attempt: { increment: status === "IN_PROGRESS" ? 1 : 0 },
    },
  });
  if (status === "PASSED") await logEvent("task.completed", "ProjectTask", task.id, { phase });
  if (status === "FAILED") await logEvent("task.failed", "ProjectTask", task.id, { phase });
  return task;
}

async function escalateToException(projectId: string, reason: string) {
  await db.project.update({ where: { id: projectId }, data: { exceptionNote: reason } });
  await transitionProject(projectId, "EXCEPTION", reason);
  await notifyAdmin(`Project ${projectId} escalated to EXCEPTION: ${reason}`);
}

/**
 * Runs the full production pipeline for a project: RESEARCH -> STRATEGY ->
 * CONCEPT -> GENERATION -> BUILD -> AUTOMATION -> QA <-> PERCEPTION/REVISION
 * loop (max MAX_RETRIES) -> DELIVERY_READY. Never loops forever; on
 * exhaustion the project moves to EXCEPTION with logs preserved.
 *
 * The entire pipeline is wrapped in a top-level safety net: ANY uncaught
 * error (a bug, an unexpected state-machine edge, a DB hiccup) escalates
 * the project to EXCEPTION rather than leaving it stuck mid-pipeline with
 * no record of what happened — this is the backstop for the "never
 * silently invent completion, never loop/hang forever" rule even when a
 * specific phase doesn't have its own explicit failure handling.
 */
export async function runOrchestrator(projectId: string) {
  try {
    await runPipeline(projectId);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await escalateToException(projectId, `Unhandled orchestrator error: ${reason}`);
  }
}

async function runPipeline(projectId: string) {
  await transitionProject(projectId, "INTAKE_REQUIRED");
  await markTask(projectId, "INTAKE_REQUIRED", "PASSED");

  await transitionProject(projectId, "QUEUED");

  // RESEARCH
  await transitionProject(projectId, "RESEARCH");
  await markTask(projectId, "RESEARCH", "IN_PROGRESS");
  const research = await runAgent(researchAgent, { projectId, focusPrompt: "Research this project." }, { projectId });
  if (research.status !== "succeeded") return escalateToException(projectId, `Research failed: ${research.status === "failed" ? research.reason : "escalated"}`);
  await markTask(projectId, "RESEARCH", "PASSED");

  // STRATEGY
  await transitionProject(projectId, "STRATEGY");
  await markTask(projectId, "STRATEGY", "IN_PROGRESS");
  const strategy = await runAgent(strategyAgent, { projectId, focusPrompt: "Define strategy and offer." }, { projectId });
  if (strategy.status !== "succeeded") return escalateToException(projectId, "Strategy phase failed");
  await markTask(projectId, "STRATEGY", "PASSED");

  // CONCEPT
  await transitionProject(projectId, "CONCEPT");
  await markTask(projectId, "CONCEPT", "IN_PROGRESS");
  const creative = await runAgent(creativeDirectorAgent, { projectId, focusPrompt: "Define the creative concept." }, { projectId });
  const visual = await runAgent(visualDirectorAgent, { projectId, focusPrompt: "Define the visual system." }, { projectId });
  const ux = await runAgent(uxAgent, { projectId, focusPrompt: "Design the user journey." }, { projectId });
  const ui = await runAgent(uiAgent, { projectId, focusPrompt: "Define the UI system." }, { projectId });
  if ([creative, visual, ux, ui].some((r) => r.status !== "succeeded")) {
    return escalateToException(projectId, "Concept phase failed");
  }
  await markTask(projectId, "CONCEPT", "PASSED");

  // GENERATION
  await transitionProject(projectId, "GENERATION");
  await markTask(projectId, "GENERATION", "IN_PROGRESS");
  const copy = await runAgent(copyAgent, { projectId, focusPrompt: "Write core site copy." }, { projectId });
  const image = await runAgent(imageAgent, { projectId, focusPrompt: "Brief the required image assets." }, { projectId });
  const video = await runAgent(videoAgent, { projectId, focusPrompt: "Brief the required video assets." }, { projectId });
  const character = await runAgent(characterAgent, { projectId, focusPrompt: "Define character continuity if applicable." }, { projectId });
  if ([copy, image, video, character].some((r) => r.status !== "succeeded")) {
    return escalateToException(projectId, "Generation phase failed");
  }
  await markTask(projectId, "GENERATION", "PASSED");

  // BUILD
  await transitionProject(projectId, "BUILD");
  await markTask(projectId, "BUILD", "IN_PROGRESS");
  const build = await runAgent(developmentAgent, { projectId, focusPrompt: "Plan and execute the build tasks." }, { projectId });
  if (build.status !== "succeeded") return escalateToException(projectId, "Build phase failed");
  await markTask(projectId, "BUILD", "PASSED");

  // AUTOMATION
  await transitionProject(projectId, "AUTOMATION");
  await markTask(projectId, "AUTOMATION", "IN_PROGRESS");
  const marketing = await runAgent(marketingAgent, { projectId, focusPrompt: "Set up marketing automation." }, { projectId });
  const seo = await runAgent(seoAgent, { projectId, focusPrompt: "Set up SEO." }, { projectId });
  const analytics = await runAgent(analyticsAgentDef, { projectId, focusPrompt: "Set up analytics tracking." }, { projectId });
  if ([marketing, seo, analytics].some((r) => r.status !== "succeeded")) {
    return escalateToException(projectId, "Automation phase failed");
  }
  await markTask(projectId, "AUTOMATION", "PASSED");

  // QA <-> PERCEPTION/REVISION loop
  await transitionProject(projectId, "QA");
  await markTask(projectId, "QA", "IN_PROGRESS");
  await logEvent("qa.started", "Project", projectId);

  const projectForEmail = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { customer: { include: { user: true } } },
  });
  await sendEmail(projectForEmail.customer.user.email, "qa_entering", {
    projectName: projectForEmail.name,
    statusUrl: statusUrlFor(projectForEmail.statusToken!),
  });

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const qaResult = await runAgent(qaAgent, { projectId }, { projectId });
    if (qaResult.status !== "succeeded") return escalateToException(projectId, "QA agent failed to run");

    if (!qaResult.output.passed) {
      await logEvent("qa.failed", "Project", projectId, { attempt });
      await db.project.update({ where: { id: projectId }, data: { retryCount: { increment: 1 } } });
      await transitionProject(projectId, "REVISION");
      await transitionProject(projectId, "QA");
      continue;
    }

    await logEvent("qa.passed", "Project", projectId, { attempt });

    await transitionProject(projectId, "PERCEPTION");
    const perceptionResult = await runAgent(perceptionAgent, { projectId }, { projectId });
    if (perceptionResult.status !== "succeeded") return escalateToException(projectId, "Perception agent failed to run");

    const decision = await runAgent(masterEditorAgent, { projectId }, { projectId });
    if (decision.status === "escalated") return escalateToException(projectId, decision.reason);
    if (decision.status === "failed") return escalateToException(projectId, decision.reason);

    if (decision.output.decision === "approve") {
      await markTask(projectId, "QA", "PASSED");
      await markTask(projectId, "PERCEPTION", "PASSED");
      await transitionProject(projectId, "DELIVERY_READY");
      await markTask(projectId, "DELIVERY_READY", "PASSED");
      await logEvent("project.delivery_ready", "Project", projectId);
      return finalizeDelivery(projectId);
    }

    await db.project.update({ where: { id: projectId }, data: { retryCount: { increment: 1 } } });
    await transitionProject(projectId, "REVISION");
    await transitionProject(projectId, "QA");
  }

  return escalateToException(projectId, `Exceeded MAX_RETRIES (${MAX_RETRIES}) resolving QA/Perception`);
}

async function finalizeDelivery(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { customer: { include: { user: true } } },
  });

  const deliverable = await db.deliverable.create({
    data: { projectId, version: 1, path: `/deliverables/${projectId}/v1`, notes: "Auto-generated on QA/Perception approval." },
  });
  await logEvent("deliverable.created", "Deliverable", deliverable.id, { projectId });

  const statusUrl = statusUrlFor(project.statusToken!);

  await transitionProject(projectId, "DELIVERED");
  await sendEmail(project.customer.user.email, "delivery", { projectName: project.name, statusUrl });

  await transitionProject(projectId, "REVIEW_REQUESTED");
  await logEvent("review.requested", "Project", projectId);
  await sendEmail(project.customer.user.email, "review_request", { projectName: project.name, statusUrl });

  await transitionProject(projectId, "COMPLETED");
}
