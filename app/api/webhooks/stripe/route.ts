import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/stripe";
import { completeOrderPayment } from "@/lib/payments/completeOrder";
import { db } from "@/lib/db";
import { handleCareEvent } from "@/lib/care/events";
import { handleAdsEvent } from "@/lib/ads/events";
import { handleAuditEvent } from "@/lib/audit/paid";
import { handleInvoiceEvent } from "@/lib/payments/invoices";

// Stripe webhook is the ONLY server-side path (besides the mock-payment
// route used only when Stripe isn't configured) allowed to mark an order
// paid. The browser is never trusted for this.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await db.order.findUnique({ where: { id: orderId } });
      // Idempotent: repeated webhook deliveries for an already-paid order
      // are acknowledged without re-running the pipeline.
      if (order && order.status !== "PAID") {
        await completeOrderPayment(orderId, "STRIPE", session.id);
      }
    }
  }

  // Monthly care plan events keep subscription status current. The handler is
  // idempotent, so a failure here returns 500 and Stripe safely retries.
  try {
    await handleCareEvent(event);
    await handleAdsEvent(event);
    await handleAuditEvent(event);
    await handleInvoiceEvent(event);
  } catch (err) {
    console.error("care plan webhook handling failed", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
