import { db } from "@/lib/db";

// What the monthly care plan is, in one place. The price is NOT here: it comes
// from the product row (slug below), so it can change without a deploy. Only
// list things that are actually delivered.
export const CARE_PLAN_SLUG = "care-plan";
export const FALLBACK_CARE_PRICE_CENTS = 7900;

export const CARE_PLAN_INCLUDES = [
  "Up to 3 small updates a month: text, hours, prices, phone number, or links",
  "Your website kept online and your domain connection looked after",
  "Requests handled on your private project page",
  "Cancel any time",
];

export const CARE_PLAN_NOT_INCLUDED = [
  "New pages, redesigns, or an online store",
  "Ads, video, or logo design",
  "Any promise about search rankings",
];

export const CARE_PLAN_TIMING_NOTE = "We aim to finish each update within 2 business days. That's a target, not a guarantee.";

export async function getCarePlanProduct() {
  return db.product.findFirst({ where: { slug: CARE_PLAN_SLUG, active: true } });
}

/** Subscription states that mean the customer currently has a plan (paid or in a retry window). */
export const LIVE_CARE_STATUSES = ["ACTIVE", "PAST_DUE"] as const;
