import { db } from "@/lib/db";

// The customer-acquisition funnel, in order. Only these names are accepted
// from the browser, and every one is stored in the existing AnalyticsEvent
// table so conversion by stage can be computed from real counts.
export const FUNNEL_EVENTS = [
  "landing_page_view",
  "offer_view",
  "checkout_started",
  "checkout_completed",
  "intake_started",
  "intake_completed",
  "production_started",
  "preview_created",
  "revision_requested",
  "approved",
  "deployed",
  "upsell_view",
  "upsell_purchase",
  "subscription_started",
  "referral_clicked",
  "referral_purchase",
  "upsell_click",
  "audit_started",
  "audit_completed",
  "lead_submitted",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export function isFunnelEvent(name: string): name is FunnelEvent {
  return (FUNNEL_EVENTS as readonly string[]).includes(name);
}

/** Records one funnel event. Never throws: analytics must not break a request. */
export async function trackFunnel(name: FunnelEvent, payload: Record<string, unknown> = {}) {
  try {
    await db.analyticsEvent.create({ data: { name, payloadJson: JSON.stringify(payload) } });
  } catch (err) {
    console.error(`funnel: could not record ${name}`, err);
  }
}
