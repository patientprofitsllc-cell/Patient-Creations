import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { postAgentUpdate } from "@/lib/agents/relay";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { patchSite, type BuiltSite } from "@/lib/site/build/config";
import { generateRevisionPatch } from "@/lib/site/build/copy";
import { NO_STORE, guardPreview } from "@/lib/site/build/preview";
import { runSiteQa } from "@/lib/site/build/qa";
import { renderHtml } from "@/lib/site/build/renderHtml";
import { previewUrlFor, saveBuild } from "@/lib/site/build/store";

const schema = z.object({ note: z.string().trim().min(5, "Please tell us what to change.").max(1000) });

// The customer asks for their included revision. Simple changes (wording, hours,
// phone, a color) are applied automatically and re-checked; anything else goes
// to a person. Either way the request is recorded and counted.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardPreview(req, params.token, 6, "revise");
  if ("response" in guarded) return guarded.response;
  const { project, build, openRevision, revisionsUsed, revisionLimit } = guarded.preview;

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Please tell us what to change." }, { status: 400, headers: NO_STORE });
  const { note } = body.data;

  if (build.status !== "PREVIEW") {
    return NextResponse.json({ error: "This website is already approved. Message us on your project page if something needs to change." }, { status: 409, headers: NO_STORE });
  }
  if (openRevision) return NextResponse.json({ error: "Your change request is already in progress." }, { status: 409, headers: NO_STORE });
  if (revisionsUsed >= revisionLimit) {
    return NextResponse.json(
      { error: "You've used your included revision. Tell us what else you'd like on your project page and we'll quote it." },
      { status: 409, headers: NO_STORE },
    );
  }

  const revision = await db.revision.create({ data: { projectId: project.id, notes: note } });
  // Two requests could both pass the check above; only the first stays.
  const total = await db.revision.count({ where: { projectId: project.id } });
  if (total > revisionLimit) {
    await db.revision.delete({ where: { id: revision.id } });
    return NextResponse.json({ error: "Your change request is already in progress." }, { status: 409, headers: NO_STORE });
  }
  await logEvent("website.revision_requested", "Project", project.id, { version: build.version });
  await trackFunnel("revision_requested", { projectId: project.id, orderId: project.orderId });

  const intake = project.order.websiteIntake;
  const site = JSON.parse(build.siteJson) as BuiltSite;
  const patch = intake
    ? await generateRevisionPatch(
        { tagline: site.tagline, about: site.about, hours: site.hours, address: site.address, phone: site.phone, services: site.services, accent: site.tokens.accent, heading: site.tokens.heading },
        note,
        { businessName: intake.businessName, businessType: intake.businessType, phone: intake.phone, description: intake.description, address: intake.address, hours: intake.hours, services: intake.services, pricing: intake.pricing },
      )
    : null;

  if (patch) {
    const next = patchSite(site, patch);
    const html = renderHtml(next);
    const qa = runSiteQa(next, html);
    if (qa.passed) {
      await saveBuild(project.id, { site: next, html, qa, copyMode: build.copyMode === "model" ? "model" : "template" });
      await db.revision.update({ where: { id: revision.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      await postAgentUpdate(project.id, "Build Agent", "Your change is done and re-checked. Open your preview to take another look.");
      await sendEmail(project.customer.user.email, "preview_ready", {
        projectName: project.name,
        updated: true,
        previewUrl: previewUrlFor(params.token),
        statusUrl: statusUrlFor(project.statusToken!),
      });
      return NextResponse.json({ ok: true, mode: "auto" }, { headers: NO_STORE });
    }
  }

  await db.notification.create({
    data: {
      audience: "admin",
      title: "Website revision requested",
      body: `${project.name} (version ${build.version}): ${note.slice(0, 400)}`,
    },
  });
  await postAgentUpdate(project.id, "Coordinator Agent", "Got your change request. Our team will apply it and post your new preview here.");
  return NextResponse.json({ ok: true, mode: "queued" }, { headers: NO_STORE });
}
