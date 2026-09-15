import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";

export function generateReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function ensureReferralForCustomer(customerId: string) {
  const existing = await db.referral.findUnique({ where: { customerId } });
  if (existing) return existing;

  let code = generateReferralCode();
  // Extremely unlikely collision loop, bounded for safety.
  for (let i = 0; i < 5; i++) {
    const taken = await db.referral.findUnique({ where: { code } });
    if (!taken) break;
    code = generateReferralCode();
  }

  const referral = await db.referral.create({ data: { customerId, code } });
  await logEvent("referral.created", "Referral", referral.id, { customerId });
  return referral;
}

export async function recordReferralClick(code: string, ipHash: string | null, userAgent: string | null) {
  const referral = await db.referral.findUnique({ where: { code } });
  if (!referral) return null;

  const click = await db.referralClick.create({
    data: { referralId: referral.id, ipHash, userAgent },
  });
  await logEvent("referral.click", "ReferralClick", click.id, { code });
  return click;
}
