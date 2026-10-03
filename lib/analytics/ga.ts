// Google Analytics 4: which of our funnel events become which GA4 events, and a safe way to send them. Pure and
// client-safe. GA only loads on the live site (see components/analytics/GoogleAnalytics.tsx), so
// everywhere else every call here is a no-op. Nothing personal is ever sent: no names, emails, phone numbers, addresses,
// or card details, only product slugs, prices and which button was pressed.
import type { FunnelEvent } from "@/lib/analytics/funnel";

/** The site's GA4 measurement ID, from the Google tag for patientcreations.com. An env var can override it. */
export const GA_DEFAULT_ID = "G-07567QKJL2";
export const GA_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || GA_DEFAULT_ID).trim();
/** GA only runs on the live site, so previews, local runs, and tests never add to the numbers. */
export const GA_HOSTS = ["patientcreations.com", "www.patientcreations.com"];

/**
 * Our funnel event → the GA4 recommended event that GA's reports understand. null means GA already measures it on its own
 * (page views), or it happens on the server and isn't a page action. Every funnel event is listed, so a new one has to be
 * decided here (a test checks this).
 */
export const GA_EVENT_FOR: Record<FunnelEvent, string | null> = {
  landing_page_view: null, // GA sends page_view itself
  offer_view: "view_item",
  checkout_started: "begin_checkout",
  checkout_completed: null, // sent as "purchase" from the thank-you page, with the order's value
  intake_started: "intake_started",
  intake_completed: "intake_completed",
  production_started: null,
  preview_created: null,
  revision_requested: null,
  approved: null,
  deployed: null,
  upsell_view: "view_promotion",
  upsell_purchase: null,
  subscription_started: null,
  referral_clicked: "referral_clicked",
  referral_purchase: null,
  upsell_click: "select_promotion",
  audit_started: "generate_lead",
  audit_completed: null,
  audit_paid: null,
  lead_submitted: "generate_lead",
};

/** Keys that could identify a person. Dropped from anything sent to GA, whatever the caller passes. */
const PERSONAL = /(name|email|phone|address|card|token|zip|postal|city)|(^|_)ip(_|$)/i;

export function safeParams(params: Record<string, unknown> = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([k]) => !PERSONAL.test(k)));
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends one GA4 event, if GA is on. Never throws. */
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, safeParams(params));
  } catch {
    /* analytics must never affect the page */
  }
}

/** Sends the GA4 version of one of our funnel events, if it has one. */
export function gaFunnel(event: FunnelEvent, data: Record<string, string> = {}) {
  const name = GA_EVENT_FOR[event];
  if (name) gaEvent(name, data);
}

/** A purchase, in GA4's ecommerce shape, so revenue shows in GA. */
export function gaPurchase(order: { id: string; valueCents: number; items: { slug: string; name: string; priceCents: number; quantity: number }[] }) {
  gaEvent("purchase", {
    transaction_id: order.id,
    currency: "USD",
    value: order.valueCents / 100,
    items: order.items.map((i) => ({ item_id: i.slug, item_name: i.name, price: i.priceCents / 100, quantity: i.quantity })),
  });
}
