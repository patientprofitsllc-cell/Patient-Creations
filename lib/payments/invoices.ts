import type Stripe from "stripe";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { sendEmail } from "@/lib/email/provider";
import { usd } from "@/lib/pricing/catalog";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { finalizeDelivery } from "@/lib/agents/orchestrator";
import { baseUrl, invoiceNumber, invoiceUrl, issueBalanceInvoice } from "@/lib/payments/invoiceCore";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { createWithBnplFallback } from "@/lib/payments/bnpl";

// Paying an invoice: a private link, Stripe Checkout, and a payment that is recorded exactly once no matter how many
// times Stripe or the customer's browser reports it. Nothing is trusted from the browser: Stripe is asked directly.

type Via = "STRIPE" | "MANUAL" | "MOCK";

export type InvoiceCheckout = { ok: true; url: string; paid?: boolean } | { ok: false; status: number; error: string };

export async function startInvoiceCheckout(token: string): Promise<InvoiceCheckout> {
  const invoice = await db.invoice.findUnique({ where: { token } });
  if (!invoice) return { ok: false, status: 400, error: "That link is not valid." };
  const page = invoiceUrl(invoice.token);
  if (invoice.status === "PAID") return { ok: true, url: page, paid: true };
  if (invoice.status !== "OPEN") return { ok: false, status: 409, error: "This invoice is no longer open." };

  if (!isStripeConfigured()) {
    if (process.env.NODE_ENV === "production") return { ok: false, status: 503, error: "Card payment is not available right now. Please email us and we will help." };
    await markInvoicePaid(invoice.id, "MOCK", `mock_${invoice.id}`);
    return { ok: true, url: page, paid: true };
  }
  try {
    const meta = { kind: "invoice", invoiceId: invoice.id };
    const order = await db.order.findUnique({ where: { id: invoice.orderId }, include: { customer: { include: { user: true } } } });
    const session = await createWithBnplFallback(invoice.amountCents, (types) => getStripe().checkout.sessions.create({
      mode: "payment",
      ...(types ? { payment_method_types: types as never } : {}),
      customer_email: order?.customer.user.email,
      line_items: [
        {
          price_data: { currency: "usd", product_data: { name: `Invoice ${invoiceNumber(invoice.seq)}`, description: invoice.description.slice(0, 250) }, unit_amount: invoice.amountCents },
          quantity: 1,
        },
      ],
      // No orderId here on purpose: the order webhook treats an orderId as "this order is now paid in full".
      metadata: meta,
      payment_intent_data: { metadata: meta },
      success_url: `${page}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: page,
    }));
    if (!session.url) return { ok: false, status: 502, error: "We could not start checkout. Please try again." };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("invoice checkout failed", err instanceof Error ? err.message : err);
    return { ok: false, status: 502, error: "We could not start checkout. Please try again, or email us." };
  }
}

/**
 * Records a payment against an invoice, once. A balance payment clears what the order owed and releases a held
 * delivery; an extra-work payment raises the order's total. Safe if the webhook and the customer's return trip both land.
 */
export async function markInvoicePaid(invoiceId: string, via: Via, ref?: string, now = new Date()): Promise<{ firstTime: boolean }> {
  const claim = await db.invoice.updateMany({
    where: { id: invoiceId, status: "OPEN" },
    data: { status: "PAID", paidAt: now, paidVia: via, ...(ref ? { stripeSessionId: ref } : {}) },
  });
  if (claim.count === 0) return { firstTime: false };

  const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { order: { include: { customer: { include: { user: true } } } } } });
  const number = invoiceNumber(inv.seq);
  await db.payment.create({ data: { orderId: inv.orderId, provider: via, providerRef: ref ?? number, amountCents: inv.amountCents, status: "PAID" } });

  if (inv.kind === "BALANCE") {
    const cur = await db.order.findUniqueOrThrow({ where: { id: inv.orderId }, select: { balanceDueCents: true } });
    await db.order.update({ where: { id: inv.orderId }, data: { balanceDueCents: Math.max(0, cur.balanceDueCents - inv.amountCents) } });
  } else {
    await db.order.update({ where: { id: inv.orderId }, data: { totalCents: { increment: inv.amountCents } } });
  }
  await logEvent("invoice.paid", "Invoice", inv.id, { via, kind: inv.kind, amountCents: inv.amountCents });

  const after = await db.order.findUniqueOrThrow({ where: { id: inv.orderId }, select: { balanceDueCents: true } });
  const settled = inv.kind === "BALANCE" && after.balanceDueCents === 0;

  let released: ReleaseResult = "not_held";
  if (settled) {
    try {
      released = await releaseHeldDelivery(inv.orderId);
    } catch (err) {
      console.error("releasing delivery after balance payment failed", err);
    }
  }

  try {
    await sendEmail(inv.order.customer.user.email, "invoice_paid", {
      number,
      amount: usd(inv.amountCents),
      description: inv.description,
      released: released === "released",
      settled,
    });
  } catch (err) {
    console.error("invoice receipt failed", err);
  }
  try {
    const project = await db.project.findUnique({ where: { orderId: inv.orderId }, select: { id: true, name: true, state: true } });
    const launchNote =
      settled && released !== "released" && project?.state === "DELIVERY_READY" ? "\n\nThis build is ready and fully paid: you can launch it now." : "";
    await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_new_order", {
      subject: `PAID invoice ${number}: ${usd(inv.amountCents)}`,
      body: `Invoice ${number} was paid (${via.toLowerCase()}).\n\n${inv.description}\nAmount: ${usd(inv.amountCents)}\nCustomer: ${inv.order.customer.user.email}${settled ? `\n\nThe order is now paid in full.${released === "released" ? " Held delivery was released automatically." : ""}` : ""}${launchNote}\n\n${baseUrl()}/admin/invoices`,
    });
  } catch (err) {
    console.error("invoice owner alert failed", err);
  }
  return { firstTime: true };
}

export type ReleaseResult = "released" | "not_held";

/**
 * After the balance is paid: if delivery was held for it, finish the delivery now. A website build is different. The
 * owner launches it, so it was never held; the owner is told it is fully paid instead.
 */
export async function releaseHeldDelivery(orderId: string): Promise<ReleaseResult> {
  const project = await db.project.findUnique({ where: { orderId } });
  if (!project || project.state !== "DELIVERY_READY") return "not_held";
  const held = await db.auditLog.findFirst({ where: { event: "project.delivery_held", entityId: project.id } });
  if (!held) return "not_held";
  await finalizeDelivery(project.id);
  return "released";
}

/** The customer came back from Stripe. Ask Stripe whether this invoice was paid, and record it. */
export async function confirmInvoicePayment(invoiceId: string, sessionId: string): Promise<boolean> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !isStripeConfigured()) return false;
  try {
    const s: Stripe.Checkout.Session = await getStripe().checkout.sessions.retrieve(sessionId);
    const inv = await db.invoice.findUnique({ where: { id: invoiceId }, select: { amountCents: true } });
    if (!inv || s.payment_status !== "paid" || s.metadata?.kind !== "invoice" || s.metadata?.invoiceId !== invoiceId || s.amount_total !== inv.amountCents) return false;
    await markInvoicePaid(invoiceId, "STRIPE", s.id);
    return true;
  } catch (err) {
    console.error("invoice payment confirmation failed", err instanceof Error ? err.message : err);
    return false;
  }
}

/** The webhook side: a paid checkout session for an invoice. */
export async function handleInvoiceEvent(event: Stripe.Event): Promise<void> {
  if (event.type !== "checkout.session.completed") return;
  const s = event.data.object as Stripe.Checkout.Session;
  if (s.metadata?.kind !== "invoice" || s.payment_status !== "paid") return;
  const invoiceId = s.metadata.invoiceId;
  if (!invoiceId) return;
  const inv = await db.invoice.findUnique({ where: { id: invoiceId }, select: { amountCents: true } });
  if (!inv || s.amount_total !== inv.amountCents) return;
  await markInvoicePaid(invoiceId, "STRIPE", s.id);
}

/** The owner cancels an extra-work invoice that was sent by mistake. A balance is real money owed and cannot be voided. */
export async function voidInvoice(invoiceId: string): Promise<{ ok: boolean; error?: string }> {
  const inv = await db.invoice.findUnique({ where: { id: invoiceId }, select: { kind: true, status: true } });
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (inv.kind === "BALANCE") return { ok: false, error: "A final payment invoice cannot be voided. Mark it paid once the money arrives." };
  const r = await db.invoice.updateMany({ where: { id: invoiceId, status: "OPEN" }, data: { status: "VOID" } });
  return r.count === 1 ? { ok: true } : { ok: false, error: "Only an open invoice can be voided." };
}

/** A deposit order just started production: open the balance invoice and tell the customer what is due and when. */
export async function announceDeposit(orderId: string, projectName: string): Promise<void> {
  try {
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { customer: { include: { user: true } } } });
    const invoice = await issueBalanceInvoice(orderId);
    if (!invoice) return;
    const project = await db.project.findUnique({ where: { orderId }, select: { statusToken: true } });
    await sendEmail(order.customer.user.email, "deposit_received", {
      projectName,
      deposit: usd(order.totalCents - order.balanceDueCents),
      balance: usd(invoice.amountCents),
      invoiceUrl: invoiceUrl(invoice.token),
      statusUrl: project?.statusToken ? statusUrlFor(project.statusToken) : undefined,
    });
  } catch (err) {
    console.error("deposit announcement failed", err);
  }
}
