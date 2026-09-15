import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { isSelfReferral, computeCommissionCents, PENDING_PERIOD_DAYS } from "@/lib/referrals/fraud";

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

/** Moves any commission whose pending period has elapsed to APPROVED. Intended to run on a schedule. */
export async function approveMaturedCommissions() {
  const matured = await db.commission.findMany({
    where: { state: "PENDING", pendingUntil: { lte: new Date() } },
  });

  for (const c of matured) {
    await db.commission.update({ where: { id: c.id }, data: { state: "APPROVED" } });
    await logEvent("commission.approved", "Commission", c.id, {});
  }

  return matured.length;
}
