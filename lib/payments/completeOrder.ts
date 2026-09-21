import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { notifyOwnerOfOrder } from "@/lib/alerts/ownerAlerts";
import { createProjectForOrder } from "@/lib/agents/orchestrator";
import { holdForIntake, startProductionIfReady } from "@/lib/projects/production";
import { recordReferralPurchase } from "@/lib/referrals/commissions";
import { decrementInventoryForOrder } from "@/lib/inventory/decrement";
import { consumeAuditCredit } from "@/lib/audit/paid";
import type { PaymentProvider } from "@/lib/types";

/**
 * The single path that marks an order paid and starts production. Called
 * ONLY from the Stripe webhook (real payments), the mock-payment route (dev/
 * test mode), or an admin confirming a manually-collected payment (PayPal,
 * Zelle, etc.) — never from a client-trusted "I paid" flag.
 */
export async function completeOrderPayment(orderId: string, provider: PaymentProvider, providerRef?: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { customer: true } });

  if (order.status === "PAID") {
    return db.project.findUnique({ where: { orderId } });
  }

  await db.order.update({ where: { id: orderId }, data: { status: "PAID", paidAt: new Date() } });
  await db.payment.create({
    data: { orderId, provider, providerRef: providerRef ?? null, amountCents: order.totalCents, status: "PAID" },
  });

  await logEvent("payment.succeeded", "Order", orderId, { provider });
  // A Growth Audit credit is used up once the order it was applied to is paid.
  await consumeAuditCredit(order.couponCode);
  await trackFunnel("checkout_completed", {
    orderId,
    source: order.campaignSource ?? undefined,
    totalCents: order.totalCents,
  });

  // Tell the owner right away, before anything slower runs. Never throws.
  await notifyOwnerOfOrder(orderId, "paid");

  if (order.customer.referredByCode) {
    await recordReferralPurchase(order.customer.referredByCode, order.customerId, orderId, order.totalCents);
  }

  await decrementInventoryForOrder(orderId);

  const project = await createProjectForOrder(orderId);

  // Production starts only when the order is paid AND (for website orders) the
  // customer has completed their intake; otherwise the project waits in
  // INTAKE_REQUIRED and the intake submission starts it. The gate is
  // idempotent, and it kicks off the pipeline without blocking this response
  // (a webhook on a serverless host must return quickly). runOrchestrator has
  // its own top-level catch that escalates any failure to EXCEPTION.
  const result = await startProductionIfReady(project.id);
  if (result === "waiting_for_intake") await holdForIntake(project.id);

  return project;
}
