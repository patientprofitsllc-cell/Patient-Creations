// The Website Care months that come with a purchase. The Website Special (and the All-in-One bundle, which contains one)
// includes SPECIAL_CARE_MONTHS of Website Care, so the care plan starts with that many months at no charge: the first
// payment is due when they are up. One place decides this, so checkout, the project page, the launch email, and the
// upsell offers all say the same thing. Pure: safe in the browser and tests.
import { SPECIAL_CARE_MONTHS } from "@/lib/pricing/catalog";

/** Products whose price includes months of Website Care. */
export const INCLUDED_CARE_SLUGS: readonly string[] = ["website-special", "all-in-one-bundle"];

/**
 * How many free months of Website Care an order comes with. Only the first care plan on a project gets them, so
 * cancelling and restarting doesn't start a new free period.
 */
export function includedCareMonths(orderSlugs: readonly string[], hadCarePlanBefore = false): number {
  if (hadCarePlanBefore) return 0;
  return orderSlugs.some((s) => INCLUDED_CARE_SLUGS.includes(s)) ? SPECIAL_CARE_MONTHS : 0;
}

/** The day the included months end and the first payment is due, counted from `start`. */
export function includedCareEnds(start: Date, months: number): Date {
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return end;
}

/** "Jan 5, 2027". */
export const careDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
