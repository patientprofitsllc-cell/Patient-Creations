import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, PRICE_CENTS, bundleSeparatelyCents, usd } from "@/lib/pricing/catalog";
import type { LivePrices } from "@/lib/site/faq";

// Fills the homepage's {{slot}} placeholders (lib/site/home/home.html). Every price comes from the live rows, falling
// back to the price list, so the homepage never disagrees with the price list or checkout.

export function homeValues(live: LivePrices): Record<string, string> {
  const cents = (slug: keyof typeof PRICE_CENTS) => live[slug] ?? PRICE_CENTS[slug];
  const separately = bundleSeparatelyCents({
    website: cents("website-special"),
    cinematicAd: cents("cinematic-ad-special"),
    ugcAd: cents("ugc-ad-special"),
    card: cents("nfc-cards"),
  });
  return {
    "nfc-cards": usd(cents("nfc-cards")),
    "website-special": usd(cents("website-special")),
    "ugc-ad-special": usd(cents("ugc-ad-special")),
    "all-in-one-bundle": usd(cents("all-in-one-bundle")),
    "bundle-separately": usd(separately),
    "bundle-savings": usd(Math.max(0, separately - cents("all-in-one-bundle"))),
    "growth-audit": usd(AUDIT_FEE_CENTS),
    "audit-days": String(AUDIT_CREDIT_DAYS),
  };
}

/** Replaces each {{slot}}. A slot with no value throws, so a page with a blank price is never served. */
export function renderHome(html: string, values: Record<string, string>): string {
  return html.replace(/\{\{([a-z-]+)\}\}/g, (_, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) throw new Error(`homepage: no value for {{${key}}}`);
    return values[key];
  });
}
