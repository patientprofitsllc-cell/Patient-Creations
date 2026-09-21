import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { postAgentUpdate } from "@/lib/agents/relay";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { runSiteQa } from "@/lib/site/build/qa";
import type { BuiltSite } from "@/lib/site/build/config";
import { previewUrlFor } from "@/lib/site/build/store";
import type { ActionResult } from "@/lib/site/build/actions";

// Rolling a website back. History is never deleted: restoring an earlier version makes a NEW version that is a copy of it,
// waiting for the customer's approval again, and the one it replaces is kept and marked superseded. So a mistake can be undone,
// and what was undone can still be seen. A site that has already been launched is not rolled back here, because what is live
// is whatever the owner put on the customer's hosting; that is replaced by hand.

const fail = (status: number, error: string): ActionResult => ({ ok: false, status, error });

export async function rollbackWebsite(projectId: string, toVersion: number, reason: string, opts: { notify?: boolean } = {}): Promise<ActionResult> {
  const why = reason.trim();
  if (why.length < 3) return fail(400, "Say why you are going back to an earlier version (a few words).");
  if (!Number.isInteger(toVersion) || toVersion < 1) return fail(400, "Pick a version to go back to.");

  const project = await db.project.findUnique({ where: { id: projectId }, include: { customer: { include: { user: true } } } });
  if (!project) return fail(404, "Project not found");
  const builds = await db.websiteBuild.findMany({ where: { projectId }, orderBy: { version: "desc" } });
  const latest = builds[0];
  if (!latest) return fail(409, "This project has no website build yet.");
  if (builds.some((b) => b.status === "LIVE")) return fail(409, "This site has already been launched. Replace the live copy by hand, or start a new build.");
  const target = builds.find((b) => b.version === toVersion);
  if (!target) return fail(404, `There is no version ${toVersion}.`);
  if (target.version === latest.version) return fail(409, "That is already the current version.");

  // The old version must still pass today's checks, or restoring it would put a broken page back in front of the customer.
  const site = JSON.parse(target.siteJson) as BuiltSite;
  const qa = runSiteQa(site, target.html);
  // Keep the earlier warning about anything the customer wrote that did not reach the page; the checks above cannot see it.
  try {
    const old = (JSON.parse(target.qaJson) as { warnings?: string[] }).warnings ?? [];
    for (const w of old) if (w.startsWith("Missing from the page") && !qa.warnings.includes(w)) qa.warnings.push(w);
  } catch {
    /* an unreadable old record just means no carried-over warnings */
  }
  if (!qa.passed) return fail(422, `Version ${toVersion} no longer passes the checks: ${qa.errors.join("; ")}`);

  // Retire what is waiting (or was approved) and add the restored copy as the next version, both or neither.
  const next = latest.version + 1;
  const hadApproval = latest.status === "APPROVED";
  await db.$transaction([
    db.websiteBuild.updateMany({ where: { projectId, id: latest.id, status: { in: ["PREVIEW", "APPROVED"] } }, data: { status: "SUPERSEDED" } }),
    db.websiteBuild.create({
      data: { projectId, version: next, status: "PREVIEW", siteJson: target.siteJson, html: target.html, qaJson: JSON.stringify(qa), copyMode: target.copyMode, note: `Restored from version ${toVersion}: ${why}`.slice(0, 400) },
    }),
  ]);

  await logEvent("website.rolled_back", "Project", projectId, { fromVersion: latest.version, toVersion, newVersion: next, reason: why, hadApproval });

  if (opts.notify !== false) {
    await postAgentUpdate(projectId, "Build Agent", "We went back to an earlier version of your preview. Please open it and take another look.");
    if (project.previewToken) {
      try {
        await sendEmail(project.customer.user.email, "preview_ready", { projectName: project.name, updated: true, previewUrl: previewUrlFor(project.previewToken), statusUrl: statusUrlFor(project.statusToken ?? "") });
      } catch (err) {
        console.error("rollback email failed", err);
      }
    }
  }
  return { ok: true, detail: `version ${next} (a copy of version ${toVersion})` };
}
