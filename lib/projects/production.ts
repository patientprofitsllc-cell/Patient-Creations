import type { WebsiteIntake } from "@prisma/client";
import { db } from "@/lib/db";
import { trackFunnel } from "@/lib/analytics/funnel";
import { loadBible, mergeBibleSection } from "@/lib/agents/bible";
import { runOrchestrator } from "@/lib/agents/orchestrator";
import { postAgentUpdate } from "@/lib/agents/relay";
import { transitionProject } from "@/lib/workflows/stateMachine";
import { lines } from "@/lib/intake/schema";
import { WEBSITE_GOALS } from "@/lib/site/offer";

export type StartResult = "started" | "already_started" | "waiting_for_intake" | "not_paid" | "no_project";

/**
 * The one place production is allowed to begin. It requires BOTH:
 *   1. the order is paid, and
 *   2. for website orders, the customer has completed the intake.
 * Payment and intake can finish in either order (a Zelle order may be marked
 * paid long after the customer filled in the intake), so both paths call this
 * and whichever finishes last starts the build. The atomic claim on
 * `productionStartedAt` guarantees the pipeline runs exactly once no matter
 * how many times it is called or how the two events race.
 */
export async function startProductionIfReady(projectId: string): Promise<StartResult> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { order: { include: { websiteIntake: true } } },
  });
  if (!project) return "no_project";
  if (project.order.status !== "PAID") return "not_paid";

  const intake = project.order.websiteIntake;
  if (intake && intake.status !== "COMPLETE") return "waiting_for_intake";

  const claim = await db.project.updateMany({
    where: { id: projectId, productionStartedAt: null },
    data: { productionStartedAt: new Date() },
  });
  if (claim.count === 0) return "already_started";

  if (intake) {
    await applyIntakeToBible(projectId, intake);
    await postAgentUpdate(projectId, "Coordinator Agent", "Thanks, I have your business info and I've handed it to the team. The build starts now.");
  }
  await trackFunnel("production_started", { projectId, orderId: project.orderId });

  // Not awaited on purpose (same reasoning as completeOrderPayment): the
  // caller responds right away, and runOrchestrator has its own top-level
  // catch that escalates any failure to EXCEPTION.
  runOrchestrator(projectId).catch((err) => {
    console.error(`Orchestrator failed to start for project ${projectId}:`, err);
  });
  return "started";
}

/** Parks a paid website order in INTAKE_REQUIRED and tells the customer what's needed. */
export async function holdForIntake(projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.state !== "PAID") return;
  await transitionProject(projectId, "INTAKE_REQUIRED", "Waiting for the customer's intake");
  await postAgentUpdate(
    projectId,
    "Coordinator Agent",
    "Your order is confirmed. To start building, I need a few details about your business. Use the \"Finish your intake\" button at the top of this page. It takes about 3 to 5 minutes, and you can skip anything you don't have.",
  );
}

/** Writes the customer's answers into the Project Bible every agent reads. */
export async function applyIntakeToBible(projectId: string, intake: WebsiteIntake) {
  const bible = await loadBible(projectId);
  if (!bible) return;
  const goal = WEBSITE_GOALS.find((g) => g.value === intake.goal)?.label ?? intake.goal ?? null;

  await mergeBibleSection(projectId, "business", {
    ...bible.business,
    name: intake.businessName,
    type: intake.businessType,
    description: intake.description,
    phone: intake.phone,
    address: intake.address,
    hours: intake.hours,
  });
  await mergeBibleSection(projectId, "objective", {
    ...bible.objective,
    statement: goal ? `Get visitors to: ${goal}` : bible.objective.statement,
    primaryAction: intake.goal,
    notes: intake.goalNotes,
  });
  await mergeBibleSection(projectId, "offer", {
    ...bible.offer,
    services: lines(intake.services),
    pricing: intake.pricing,
  });
  await mergeBibleSection(projectId, "brand", {
    ...bible.brand,
    name: intake.businessName,
    logoUrl: intake.logoUrl,
    colors: intake.colors,
    fontStyle: intake.fontStyle,
  });
  await mergeBibleSection(projectId, "design", {
    ...bible.design,
    styleNotes: intake.styleNotes,
    fontStyle: intake.fontStyle,
    colors: intake.colors,
  });
  await mergeBibleSection(projectId, "assets", { ...bible.assets, mediaLinks: lines(intake.mediaLinks), logoUrl: intake.logoUrl });
  await mergeBibleSection(projectId, "references", {
    ...bible.references,
    existingWebsite: intake.existingWebsite,
    socialUrls: lines(intake.socialUrls),
    bookingUrl: intake.bookingUrl,
  });
  await mergeBibleSection(projectId, "constraints", {
    ...bible.constraints,
    // Honesty guardrail for every agent that writes customer-facing copy.
    noInvention:
      "Use only facts the customer supplied. Do not invent reviews, testimonials, awards, years in business, statistics, or guarantees.",
    timelineTarget: "72-hour target delivery once intake is complete (a target, not a guarantee).",
  });
}
