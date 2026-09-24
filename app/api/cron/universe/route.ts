import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";

// The optional daily run of the Agent Universe. OFF unless CRON_SECRET is set on the server, and even then it does nothing unless
// the owner has raised the agents to the AUTONOMOUS level and has not paused them. Point a scheduler at this address once a day
// with the header
//   Authorization: Bearer <CRON_SECRET>
// It runs the daily audit (and on Mondays the weekly review). Anything else gets a 404, so the address does not reveal that it exists.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 24) return false;
  const given = /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1] ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function run(req: NextRequest) {
  if (!authorized(req)) return new NextResponse(null, { status: 404 });
  const u = patientCreationsUniverse();
  const daily = await u.handleEvent({ type: "daily_audit" });
  const weekly = new Date().getUTCDay() === 1 ? await u.handleEvent({ type: "weekly_review" }) : null;
  const say = (o: typeof daily | null) => (o === null ? "not due" : o.handled ? `ran (${o.result.status})` : o.reason);
  return NextResponse.json({ ok: true, daily: say(daily), weekly: say(weekly) });
}

export const GET = run;
export const POST = run;
