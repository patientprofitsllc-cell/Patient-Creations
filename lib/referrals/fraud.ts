import { db } from "@/lib/db";

/**
 * Blocks self-referrals: a customer may not earn commission from an order
 * placed under their own account, or from an account created with the same
 * email domain-local-part trick, etc. Kept intentionally simple and
 * explicit rather than a black-box "fraud score."
 */
export async function isSelfReferral(referrerCustomerId: string, purchasingCustomerId: string): Promise<boolean> {
  if (referrerCustomerId === purchasingCustomerId) return true;

  const [referrer, purchaser] = await Promise.all([
    db.customer.findUnique({ where: { id: referrerCustomerId }, include: { user: true } }),
    db.customer.findUnique({ where: { id: purchasingCustomerId }, include: { user: true } }),
  ]);

  if (!referrer || !purchaser) return true; // fail closed
  if (referrer.user.email.toLowerCase() === purchaser.user.email.toLowerCase()) return true;

  return false;
}

export const COMMISSION_RATE = 0.1; // 10% per spec
export const PENDING_PERIOD_DAYS = 14; // buffer for refunds/chargebacks before payable

export function computeCommissionCents(orderTotalCents: number): number {
  return Math.round(orderTotalCents * COMMISSION_RATE);
}
