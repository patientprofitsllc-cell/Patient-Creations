import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { escalateToException, markTask } from "@/lib/agents/orchestrator";
import { postAgentUpdate } from "@/lib/agents/relay";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { industryFor } from "@/lib/site/build/config";
import { generateWebsite } from "@/lib/site/build/generate";
import { previewUrlFor, saveBuild } from "@/lib/site/build/store";
import { transitionProject } from "@/lib/workflows/stateMachine";
import type { ProjectState } from "@/lib/types";

/**
 * Production for a one-page website. It walks the same stages the customer sees
 * on their progress bar, and each stage does real work:
 *
 *   Research    match the business to an industry layout
 *   Strategy    decide what the main button does (from the goal they chose)
 *   Concept     pick the colors and type
 *   Generation  write the copy from their facts (AI when configured, their own words otherwise)
 *   Build       render the finished page
 *   Automation  page title, description, and search markup (part of the page)
 *   QA          automated checks of the page
 *   Perception  confirm nothing they typed was dropped
 *   Delivery    save the preview and send it to them for approval
 *
 * It stops at a preview. Nothing is "delivered" until the customer approves it
 * and it is launched. The whole run takes seconds, so it is safe to await
 * inside the request that triggers it.
 */
export async function runWebsitePipeline(projectId: string): Promise<void> {
  try {
    await run(projectId);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await escalateToException(projectId, `Website build failed: ${reason}`);
  }
}

async function step(projectId: string, state: ProjectState, done: ProjectState | null = state) {
  await transitionProject(projectId, state);
  if (done) await markTask(projectId, done, "PASSED");
}

async function run(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { customer: { include: { user: true } }, order: { include: { websiteIntake: true } } },
  });
  const intake = project.order.websiteIntake;
  if (!intake) throw new Error("No website intake for this project");

  // Enter the pipeline from PAID or from the INTAKE_REQUIRED hold.
  if (project.state === "PAID") await transitionProject(projectId, "INTAKE_REQUIRED");
  await markTask(projectId, "INTAKE_REQUIRED", "PASSED");
  await transitionProject(projectId, "QUEUED");

  const industry = industryFor(intake.businessType);
  await step(projectId, "RESEARCH");
  await postAgentUpdate(projectId, "Research Agent", `I've read your intake and matched ${intake.businessName} to a ${industry.singular} layout.`);

  await step(projectId, "STRATEGY");
  await step(projectId, "CONCEPT");

  await transitionProject(projectId, "GENERATION");
  const facts = {
    businessName: intake.businessName,
    businessType: intake.businessType,
    phone: intake.phone,
    description: intake.description,
    address: intake.address,
    hours: intake.hours,
    services: intake.services,
    pricing: intake.pricing,
    bookingUrl: intake.bookingUrl,
    socialUrls: intake.socialUrls,
    colors: intake.colors,
    fontStyle: intake.fontStyle,
    goal: intake.goal,
  };
  const built = await generateWebsite(facts);
  await markTask(projectId, "GENERATION", "PASSED");
  await postAgentUpdate(
    projectId,
    "Content Agent",
    built.copyMode === "model"
      ? "I've written your headline and intro from the facts you gave me. I didn't add anything you didn't tell me."
      : "I've put your headline and intro together from your own wording.",
  );

  await step(projectId, "BUILD");
  await postAgentUpdate(projectId, "Build Agent", "Your one-page site is assembled: header, services, hours, location, and contact.");
  await step(projectId, "AUTOMATION");

  await transitionProject(projectId, "QA");
  await postAgentUpdate(projectId, "QA Agent", "Checking your links, contact details, mobile layout, readability, and that nothing you told me was left out.");
  if (built.problems.length > 0) {
    await markTask(projectId, "QA", "FAILED");
    await logEvent("qa.failed", "Project", projectId, { problems: built.problems });
    return escalateToException(projectId, `Website failed automated checks: ${built.problems.join("; ")}`);
  }
  await logEvent("qa.passed", "Project", projectId, { warnings: built.qa.warnings });
  await markTask(projectId, "QA", "PASSED");

  await step(projectId, "PERCEPTION");

  const build = await saveBuild(projectId, { site: built.site, html: built.html, qa: built.qa, copyMode: built.copyMode });
  const fresh = await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { previewToken: true, statusToken: true } });
  await step(projectId, "DELIVERY_READY");
  await logEvent("project.delivery_ready", "Project", projectId, { buildId: build.id });
  await trackFunnel("preview_created", { projectId, orderId: project.orderId });
  await postAgentUpdate(
    projectId,
    "Coordinator Agent",
    "Your preview is ready. Open it from the button at the top of this page, then approve it or ask for your one revision.",
  );
  await sendEmail(project.customer.user.email, "preview_ready", {
    projectName: project.name,
    previewUrl: previewUrlFor(fresh.previewToken!),
    statusUrl: statusUrlFor(fresh.statusToken!),
  });
}
