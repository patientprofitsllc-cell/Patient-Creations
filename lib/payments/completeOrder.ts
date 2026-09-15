import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { createProjectForOrder, runOrchestrator } from "@/lib/agents/orchestrator";
import { recordReferralPurchase } from "@/lib/referrals/commissions";
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

  const project = await createProjectForOrder(orderId);
  await runOrchestrator(project.id);

  return db.project.findUnique({ where: { orderId } });
}
