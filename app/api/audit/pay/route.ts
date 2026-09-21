import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { startAuditCheckout } from "@/lib/audit/paid";

const schema = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) });

// Opens (or re-opens) checkout for an audit that was requested but not yet paid for. The token in the link is what
// proves it is theirs; the price comes from the saved audit, never from the browser.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`audit-pay:${ip}`, 12, 3_600_000).allowed) return NextResponse.json({ error: "Too many tries. Please wait a little and try again." }, { status: 429 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "That link is not valid." }, { status: 400 });
  const audit = await db.growthAudit.findUnique({ where: { token: body.data.token }, select: { id: true } });
  if (!audit) return NextResponse.json({ error: "That link is not valid." }, { status: 404 });

  const r = await startAuditCheckout(audit.id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ url: r.url, paid: Boolean(r.paid) });
}
