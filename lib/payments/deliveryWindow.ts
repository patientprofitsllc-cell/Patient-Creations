/**
 * Display-only: turns "3-5 days" into "3-5 business days" (and "1 day" into
 * "1 business day"). Windows already saying "business days", plus weeks and
 * minutes, pass through unchanged. The stored strings stay as-is because
 * parseTurnaroundMaxDays reads them to decide which rush tiers apply.
 */
export function businessDays(window: string): string {
  if (/business/i.test(window)) return window;
  return window.replace(/\b(days?)\b/i, "business $1");
}

/**
 * The one delivery line every product card shows, so the wording is identical
 * on the homepage, the specials, and /services. Time-boxed sessions ("60
 * minutes") and scoped-on-a-call items read as a timeline, not a delivery.
 */
export function deliveryLine(turnaround?: string | null): string | null {
  if (!turnaround) return null;
  return /minute|call/i.test(turnaround) ? `Timeline: ${turnaround}` : `Delivery: ${businessDays(turnaround)}`;
}
