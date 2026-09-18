import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { postAgentUpdate } from "@/lib/agents/relay";
import { NO_STORE, guardPreview } from "@/lib/site/build/preview";

// The customer approves their website. The status flip is an atomic claim, so a
// double click or a second tab can't approve (or notify the team) twice.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardPreview(req, params.token, 10, "approve");
  if ("response" in guarded) return guarded.response;
  const { project, build, openRevision } = guarded.preview;

  if (build.status === "APPROVED" || build.status === "LIVE") {
    return NextResponse.json({ ok: true, alreadyApproved: true }, { headers: NO_STORE });
  }
  if (openRevision) {
    return NextResponse.json({ error: "Your change request is still being worked on. You can approve the new version once it's ready." }, { status: 409, headers: NO_STORE });
  }

  const claim = await db.websiteBuild.updateMany({ where: { id: build.id, status: "PREVIEW" }, data: { status: "APPROVED", approvedAt: new Date() } });
  if (claim.count === 0) return NextResponse.json({ ok: true, alreadyApproved: true }, { headers: NO_STORE });

  await logEvent("website.approved", "Project", project.id, { version: build.version });
  await trackFunnel("approved", { projectId: project.id, orderId: project.orderId });
  await postAgentUpdate(
    project.id,
    "Coordinator Agent",
    "You approved your website. It goes live next, and I'll post here as soon as it's launched.",
  );
  // Launching is a manual step for now, so the team is told the moment it's needed.
  await db.notification.create({
    data: {
      audience: "admin",
      title: "Website approved: ready to launch",
      body: `${project.name} approved version ${build.version}. Open the session page to launch it.`,
    },
  });

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
