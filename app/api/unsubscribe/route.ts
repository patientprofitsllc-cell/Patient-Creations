import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rateLimit";
import { decodeEmailParam, recordOptOut, verifyUnsubscribeToken } from "@/lib/followups/optout";

const schema = z.object({ e: z.string().min(6).max(200), t: z.string().length(40) });

// Turns off follow-up emails for one address. The link is signed for that address, so it only works for the person
// who received it, it works without signing in, and asking twice is harmless.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`unsub:${ip}`, 20, 3_600_000).allowed) return NextResponse.json({ error: "Too many requests. Please try again later, or reply to any of our emails and we will stop them." }, { status: 429 });

  const body = schema.safeParse(await req.json().catch(() => null));
  const email = body.success ? decodeEmailParam(body.data.e) : null;
  if (!body.success || !email || !verifyUnsubscribeToken(email, body.data.t)) {
    return NextResponse.json({ error: "That link is not valid. Reply to any of our emails and we will stop them." }, { status: 400 });
  }
  await recordOptOut(email);
  return NextResponse.json({ ok: true });
}
