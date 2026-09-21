import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { sendAllDue } from "@/lib/followups/service";

// The optional automatic trigger. It is OFF unless CRON_SECRET is set on the server. Point any scheduler (a
// Netlify scheduled function, cron-job.org, GitHub Actions) at this address once a day with the header
//   Authorization: Bearer <CRON_SECRET>
// and it sends what the follow-up queue says is due: at most one email per person, at most 25 a run, and never to
// anyone who opted out. Anything else gets a 404, so the address does not even reveal that it exists.
export const dynamic = "force-dynamic";

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
  return NextResponse.json({ ok: true, ...(await sendAllDue()) });
}

export const GET = run;
export const POST = run;
