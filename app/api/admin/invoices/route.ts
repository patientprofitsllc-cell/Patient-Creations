import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { issueExtraInvoice, invoiceNumber, invoiceUrl } from "@/lib/payments/invoiceCore";
import { sendEmail } from "@/lib/email/provider";
import { logEvent } from "@/lib/analytics/events";
import { usd } from "@/lib/pricing/catalog";

const schema = z.object({ orderId: z.string().min(1), amountCents: z.number().int(), description: z.string().min(1).max(200) });

// The owner bills for extra work. The customer is emailed a private pay link; nothing is charged until they pay it.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Pick an order, enter an amount, and say what it is for." }, { status: 400 });

    const r = await issueExtraInvoice(body.data);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    const order = await db.order.findUnique({ where: { id: r.invoice.orderId }, include: { customer: { include: { user: true } } } });
    await logEvent("invoice.issued", "Invoice", r.invoice.id, { amountCents: r.invoice.amountCents });
    let emailed = false;
    if (order) {
      try {
        await sendEmail(order.customer.user.email, "invoice_issued", {
          name: order.customer.user.name ?? undefined,
          number: invoiceNumber(r.invoice.seq),
          amount: usd(r.invoice.amountCents),
          description: r.invoice.description,
          invoiceUrl: invoiceUrl(r.invoice.token),
        });
        emailed = true;
      } catch (err) {
        console.error("invoice email failed", err);
      }
    }
    return NextResponse.json({ ok: true, message: emailed ? `Invoice ${invoiceNumber(r.invoice.seq)} sent.` : `Invoice ${invoiceNumber(r.invoice.seq)} created, but the email could not be sent. Copy its pay link below and send it yourself.` });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
