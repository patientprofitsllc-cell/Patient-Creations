import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rateLimit";
import { startInvoiceCheckout } from "@/lib/payments/invoices";
import { INVOICE_TOKEN_RE } from "@/lib/payments/invoiceCore";

const schema = z.object({ token: z.string().regex(INVOICE_TOKEN_RE) });

// Opens checkout for an open invoice. The token in the link proves it is theirs; the amount comes from the saved
// invoice, never from the browser.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`invoice-pay:${ip}`, 20, 3_600_000).allowed) return NextResponse.json({ error: "Too many tries. Please wait a little and try again." }, { status: 429 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "That link is not valid." }, { status: 400 });

  const r = await startInvoiceCheckout(body.data.token);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ url: r.url, paid: Boolean(r.paid) });
}
