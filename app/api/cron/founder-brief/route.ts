import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { loadFounder } from "@/lib/founder/service";
import { briefText } from "@/lib/founder/brief";
import { sendEmail } from "@/lib/email/provider";
import { CONTACT_EMAIL } from "@/lib/config/site";

// The optional morning email of the Founder Operating Brief. OFF unless CRON_SECRET is set on the server. Point a scheduler at
// this address once each morning with the header
//   Authorization: Bearer <CRON_SECRET>
// and the brief is emailed to the owner. Anything else gets a 404, so the address does not reveal that it exists.
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
  const f = await loadFounder();
  const date = f.now.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", year: "numeric" });
  await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_new_order", { subject: `Founder Operating Brief: ${f.brief.task.title}`, body: briefText(f.brief, date) });
  return NextResponse.json({ ok: true });
}

export const GET = run;
export const POST = run;
