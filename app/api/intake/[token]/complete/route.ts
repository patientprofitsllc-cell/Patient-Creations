import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackFunnel } from "@/lib/analytics/funnel";
import { NO_STORE, guardIntake } from "@/lib/intake/access";
import { missingRequired } from "@/lib/intake/schema";
import { startProductionIfReady } from "@/lib/projects/production";

// Submitting the intake. The status flip is an atomic claim, so a double click,
// a retry, or two tabs can never record it (or start production) twice.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardIntake(req, params.token, 10);
  if ("response" in guarded) return guarded.response;
  const { intake } = guarded;

  if (intake.status === "COMPLETE") return NextResponse.json({ ok: true, alreadySubmitted: true }, { headers: NO_STORE });

  const missing = missingRequired(intake);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Please fill in: ${missing.join(", ")}.`, missing }, { status: 400, headers: NO_STORE });
  }

  const claim = await db.websiteIntake.updateMany({
    where: { token: params.token, status: "STARTED" },
    data: { status: "COMPLETE", completedAt: new Date(), startedAt: intake.startedAt ?? new Date() },
  });
  if (claim.count === 0) return NextResponse.json({ ok: true, alreadySubmitted: true }, { headers: NO_STORE });

  await trackFunnel("intake_completed", { orderId: intake.orderId });

  // Starts the build now if the order is already paid; otherwise the payment
  // path starts it later. Either way the atomic claim keeps it to one run.
  const project = await db.project.findUnique({ where: { orderId: intake.orderId }, select: { id: true } });
  const result = project ? await startProductionIfReady(project.id) : "no_project";

  return NextResponse.json(
    { ok: true, production: result === "started" ? "started" : result === "already_started" ? "started" : "waiting_for_payment" },
    { headers: NO_STORE },
  );
}
