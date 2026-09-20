import { db } from "@/lib/db";
import { AD_PLANS, getAdPlan, periodLabel, planQuota, type AdPlan } from "@/lib/ads/plans";

export const LIVE_AD_STATUSES = ["ACTIVE", "PAST_DUE"] as const;

/** The plans with the price the customer will actually be charged, read from the product rows. */
export async function loadAdPlans(): Promise<(AdPlan & { priceCents: number; purchasable: boolean })[]> {
  const rows = await db.product.findMany({ where: { slug: { in: AD_PLANS.map((p) => p.slug) }, active: true } });
  return AD_PLANS.map((p) => {
    const row = rows.find((r) => r.slug === p.slug);
    return { ...p, priceCents: row?.priceCents ?? p.fallbackPriceCents, purchasable: Boolean(row) };
  });
}

export async function loadAdPlan(slug: string) {
  const plan = getAdPlan(slug);
  if (!plan) return null;
  const row = await db.product.findFirst({ where: { slug, active: true } });
  return row ? { ...plan, priceCents: row.priceCents, name: row.name || plan.name } : null;
}

/** What has been delivered in a period against what the plan includes. */
export async function deliveryProgress(subscriptionId: string, planSlug: string, at = new Date()) {
  const plan = getAdPlan(planSlug);
  const period = periodLabel(at);
  const rows = await db.adDelivery.findMany({ where: { subscriptionId, period }, orderBy: { createdAt: "desc" } });
  const delivered = rows.reduce((s, r) => s + r.itemsCount, 0);
  return { period, delivered, included: plan ? planQuota(plan).items : 0, rows };
}

/** Monthly recurring revenue from ad plans that are paying now. */
export async function adPlanMrrCents(): Promise<{ cents: number; active: number; pastDue: number }> {
  const rows = await db.adSubscription.findMany({ where: { status: { in: [...LIVE_AD_STATUSES] } }, select: { priceCents: true, status: true } });
  return {
    cents: rows.filter((r) => r.status === "ACTIVE").reduce((s, r) => s + r.priceCents, 0),
    active: rows.filter((r) => r.status === "ACTIVE").length,
    pastDue: rows.filter((r) => r.status === "PAST_DUE").length,
  };
}
