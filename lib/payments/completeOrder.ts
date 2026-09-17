import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { createProjectForOrder, runOrchestrator } from "@/lib/agents/orchestrator";
import { recordReferralPurchase } from "@/lib/referrals/commissions";
import { decrementInventoryForOrder } from "@/lib/inventory/decrement";
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

  if (order.customer.referredByCode) {
    await recordReferralPurchase(order.customer.referredByCode, order.customerId, orderId, order.totalCents);
  }

  await decrementInventoryForOrder(orderId);

  const project = await createProjectForOrder(orderId);

  // Deliberately NOT awaited: the caller (Stripe webhook, mock-checkout
  // route, or the admin mark-paid route) responds as soon as the order is
  // marked paid and the project exists, instead of blocking on the full
  // multi-agent pipeline. This matters on serverless hosts with a request
  // execution timeout (Netlify Functions, etc.) — awaiting the whole
  // pipeline here risked the platform killing the function mid-run and
  // leaving a paid order stuck with no project progress. runOrchestrator
  // already wraps its own work in a top-level try/catch that escalates to
  // EXCEPTION on any failure, so the `.catch()` below is only a last-resort
  // net for a failure before that try block is even entered.
  runOrchestrator(project.id).catch((err) => {
    console.error(`Orchestrator failed to start for project ${project.id}:`, err);
  });

  return project;
}
