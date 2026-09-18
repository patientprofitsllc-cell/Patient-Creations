import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackFunnel } from "@/lib/analytics/funnel";
import { NO_STORE, guardIntake } from "@/lib/intake/access";

// Records the first time the wizard is opened, once, for the funnel.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardIntake(req, params.token, 20);
  if ("response" in guarded) return guarded.response;

  const claim = await db.websiteIntake.updateMany({ where: { token: params.token, startedAt: null }, data: { startedAt: new Date() } });
  if (claim.count === 1) await trackFunnel("intake_started", { orderId: guarded.intake.orderId });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
