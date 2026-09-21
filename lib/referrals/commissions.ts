import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { isSelfReferral, computeCommissionCents, PENDING_PERIOD_DAYS } from "@/lib/referrals/fraud";
import { approvalDecision } from "@/lib/partners/rules";

/**
 * Called after a referred order is paid. Walks CLICKED/LEAD -> CUSTOMER ->
 * PURCHASED -> PENDING per the spec's commission state machine. Self-
 * referrals are rejected outright rather than silently earning $0, so the
 * fraud attempt is visible in the data.
 */
export async function recordReferralPurchase(referralCode: string, purchasingCustomerId: string, orderId: string, orderTotalCents: number) {
  const referral = await db.referral.findUnique({ where: { code: referralCode } });
  if (!referral) return null;

  const selfReferral = await isSelfReferral(referral.customerId, purchasingCustomerId);

  const commission = await db.commission.create({
    data: {
      referralId: referral.id,
      earnerCustomerId: referral.customerId,
      orderId,
      state: selfReferral ? "REJECTED" : "PENDING",
      grossRevenueCents: selfReferral ? 0 : orderTotalCents,
      commissionCents: selfReferral ? 0 : computeCommissionCents(orderTotalCents),
      pendingUntil: selfReferral ? null : new Date(Date.now() + PENDING_PERIOD_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await logEvent("referral.purchase", "Commission", commission.id, { selfReferral, orderId });
  if (!selfReferral) {
    await logEvent("commission.created", "Commission", commission.id, { amountCents: commission.commissionCents });
  }

  return commission;
}

/**
 * Moves a commission whose pending period has elapsed to APPROVED, but only once the customer's whole order is paid (a deposit
 * order waits for its final payment), and voids it if the order was refunded or cancelled. Safe to run as often as you like.
 */
export async function approveMaturedCommissions(now = new Date()) {
  const matured = await db.commission.findMany({
    where: { state: "PENDING", pendingUntil: { lte: now } },
  });

  let approved = 0;
  for (const c of matured) {
    const order = c.orderId ? await db.order.findUnique({ where: { id: c.orderId }, select: { status: true, balanceDueCents: true } }) : null;
    if (!order) continue;
    const decision = approvalDecision({ pendingUntil: c.pendingUntil, orderStatus: order.status, balanceDueCents: order.balanceDueCents, now });
    if (decision === "wait") continue;
    const r = await db.commission.updateMany({ where: { id: c.id, state: "PENDING" }, data: { state: decision === "approve" ? "APPROVED" : "REFUNDED" } });
    if (r.count === 1 && decision === "approve") {
      approved++;
      await logEvent("commission.approved", "Commission", c.id, {});
    }
  }

  return approved;
}
