import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rateLimit";
import { PARTNER_TOKEN_RE } from "@/lib/partners/rules";
import { submitPartnerLead } from "@/lib/partners/service";

const schema = z.object({
  token: z.string().regex(PARTNER_TOKEN_RE),
  businessName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().max(80).optional(),
  email: z.string().trim().max(120),
  phone: z.string().trim().max(40).optional(),
  note: z.string().trim().max(300).optional(),
  permission: z.boolean(),
});

// A partner introduces a lead from their private dashboard. The token in the link is their credential.
export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Please fill in the business name and the person's email, and confirm you have their permission." }, { status: 400 });
  if (!rateLimit(`partner-lead:${body.data.token}`, 30, 3_600_000).allowed) return NextResponse.json({ error: "That is a lot of leads at once. Please wait a little." }, { status: 429 });

  const r = await submitPartnerLead(body.data.token, body.data);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  // Whether or not we already knew them, the partner is told the same thing.
  return NextResponse.json({ ok: true });
}
