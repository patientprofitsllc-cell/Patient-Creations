import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { postAgentUpdate } from "@/lib/agents/relay";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { patchSite, safeUrl, type BuiltSite, type SitePatch } from "@/lib/site/build/config";
import { runSiteQa } from "@/lib/site/build/qa";
import { renderHtml } from "@/lib/site/build/renderHtml";
import { latestBuild, previewUrlFor, saveBuild } from "@/lib/site/build/store";
import { transitionProject } from "@/lib/workflows/stateMachine";
import { buildChecklist, isManualItem, missingSummary, type Checklist } from "@/lib/site/build/checklist";
import type { QaResult } from "@/lib/site/build/qa";

export type ActionResult = { ok: true; detail?: string } | { ok: false; status: number; error: string };

const fail = (status: number, error: string): ActionResult => ({ ok: false, status, error });

async function loadForAction(projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId }, include: { customer: { include: { user: true } } } });
  if (!project) return null;
  return { project, build: await latestBuild(projectId), email: project.customer.user.email, statusUrl: statusUrlFor(project.statusToken ?? "") };
}

/**
 * Applies a person's change to the version still waiting for approval, re-checks
 * it, saves it as the next version, closes any open revision request, and sends
 * the customer the new preview. A change that fails the checks is refused.
 */
export async function applyAdminPatch(projectId: string, patch: SitePatch): Promise<ActionResult> {
  const ctx = await loadForAction(projectId);
  if (!ctx) return fail(404, "Project not found");
  const { project, build } = ctx;
  if (!build) return fail(409, "This project has no website build yet.");
  if (build.status !== "PREVIEW") return fail(409, "Only a version still waiting for approval can be changed.");

  const next = patchSite(JSON.parse(build.siteJson) as BuiltSite, patch);
  const html = renderHtml(next);
  const qa = runSiteQa(next, html);
  if (!qa.passed) return fail(422, `That change fails the checks: ${qa.errors.join("; ")}`);

  await saveBuild(projectId, { site: next, html, qa, copyMode: build.copyMode === "model" ? "model" : "template" });
  await db.revision.updateMany({ where: { projectId, status: "REQUESTED" }, data: { status: "COMPLETED", completedAt: new Date() } });
  await logEvent("website.patched", "Project", projectId, { fromVersion: build.version });
  await postAgentUpdate(projectId, "Build Agent", "Your change is done and re-checked. Open your preview to take another look.");
  const token = (await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { previewToken: true } })).previewToken;
  if (token) {
    await sendEmail(ctx.email, "preview_ready", { projectName: project.name, updated: true, previewUrl: previewUrlFor(token), statusUrl: ctx.statusUrl });
  }
  return { ok: true, detail: `version ${build.version + 1}` };
}

/**
 * Records that an approved site is live and completes the project. Requires the
 * customer's approval first, and is safe to call twice.
 */
export async function launchWebsite(projectId: string, liveUrlInput: string, opts: { skipChecklist?: boolean } = {}): Promise<ActionResult> {
  const ctx = await loadForAction(projectId);
  if (!ctx) return fail(404, "Project not found");
  const { project, build } = ctx;
  if (!build) return fail(409, "This project has no website build yet.");

  const liveUrl = safeUrl(liveUrlInput);
  if (!liveUrl) return fail(400, "Enter the live website address, like https://example.com");
  if (build.status === "LIVE") return { ok: true, detail: "already live" };
  if (build.status !== "APPROVED") return fail(409, "The customer hasn't approved this version yet.");
  if (project.state !== "DELIVERY_READY") return fail(409, `The project is in ${project.state}, not ready to launch.`);
  const owed = await db.order.findUnique({ where: { id: project.orderId }, select: { balanceDueCents: true } });
  if (owed && owed.balanceDueCents > 0) return fail(402, `The final payment of ${usd(owed.balanceDueCents)} has not been received yet. Launch after it is paid.`);

  // The launch checklist: every required line must be true for this exact version, unless the owner says to skip it on purpose.
  const checklist = await loadLaunchChecklist(projectId);
  if (checklist && !checklist.ready) {
    if (!opts.skipChecklist) return fail(409, `The launch checklist is not finished: ${missingSummary(checklist)}.`);
    await logEvent("website.launched_without_checklist", "Project", projectId, { version: build.version, missing: checklist.missing.map((l) => l.id) });
  }

  const claim = await db.websiteBuild.updateMany({ where: { id: build.id, status: "APPROVED" }, data: { status: "LIVE", liveUrl } });
  if (claim.count === 0) return { ok: true, detail: "already live" };

  await transitionProject(projectId, "DELIVERED");
  await logEvent("website.launched", "Project", projectId, { liveUrl });
  await trackFunnel("deployed", { projectId, orderId: project.orderId });
  await postAgentUpdate(projectId, "Coordinator Agent", `Your website is live: ${liveUrl}`);
  await sendEmail(ctx.email, "website_live", { projectName: project.name, liveUrl, statusUrl: ctx.statusUrl });
  await transitionProject(projectId, "REVIEW_REQUESTED");
  await logEvent("review.requested", "Project", projectId);
  await sendEmail(ctx.email, "review_request", { projectName: project.name, statusUrl: ctx.statusUrl });
  await transitionProject(projectId, "COMPLETED");
  return { ok: true };
}

/** The launch checklist for a project's newest website version, with what has been ticked for that version. null if there is no build. */
export async function loadLaunchChecklist(projectId: string): Promise<Checklist | null> {
  const build = await latestBuild(projectId);
  if (!build) return null;
  const project = await db.project.findUnique({ where: { id: projectId }, include: { order: { include: { websiteIntake: true } } } });
  if (!project) return null;
  const [open, ticks] = await Promise.all([
    db.revision.count({ where: { projectId, status: "REQUESTED" } }),
    db.projectChecklistItem.findMany({ where: { projectId, version: build.version }, select: { itemId: true } }),
  ]);
  let qa: Partial<QaResult> = {};
  try {
    qa = JSON.parse(build.qaJson) as QaResult;
  } catch {
    qa = {};
  }
  return buildChecklist({
    buildStatus: build.status,
    qaPassed: qa.passed === true,
    qaErrors: qa.errors ?? [],
    missingFromPage: (qa.warnings ?? []).filter((w) => w.startsWith("Missing from the page")).map((w) => w.replace("Missing from the page: ", "")),
    orderStatus: project.order.status,
    balanceDueCents: project.order.balanceDueCents,
    intakeComplete: project.order.websiteIntake?.status === "COMPLETE",
    openRevision: open > 0,
    ticked: ticks.map((t) => t.itemId),
  });
}

/** Ticks or unticks a manual checklist item for the newest version. Only manual items can be ticked by hand. */
export async function setChecklistItem(projectId: string, itemId: string, checked: boolean): Promise<ActionResult> {
  if (!isManualItem(itemId)) return fail(400, "That item is checked by the system, not by hand.");
  const build = await latestBuild(projectId);
  if (!build) return fail(409, "This project has no website build yet.");
  if (build.status === "LIVE") return fail(409, "This site is already live.");
  if (checked) await db.projectChecklistItem.upsert({ where: { projectId_version_itemId: { projectId, version: build.version, itemId } }, create: { projectId, version: build.version, itemId }, update: {} });
  else await db.projectChecklistItem.deleteMany({ where: { projectId, version: build.version, itemId } });
  await logEvent("website.checklist", "Project", projectId, { version: build.version, itemId, checked });
  return { ok: true };
}
