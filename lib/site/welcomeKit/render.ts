// The welcome kit's facts, filled in from the same places the rest of the site reads them: the product rows (the prices
// and terms checkout charges, kept in step with lib/pricing/catalog.ts by the deploy-time catalog sync), the price list's
// constants, the legal policy windows, and the contact details. kit.html holds the design with {{placeholders}}; nothing
// in it is typed by hand, so a price change reaches the kit the moment it reaches the price list and checkout.
import {
  BNPL,
  BUNDLE_PARTS,
  DEPOSIT,
  PARTNER,
  PRICE_CENTS,
  SPECIAL_CARE_MONTHS,
  bundleSeparatelyCents,
  usd,
  type PricedSlug,
} from "@/lib/pricing/catalog";
import { POLICY } from "@/lib/legal/config";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { businessDays } from "@/lib/payments/deliveryWindow";

/** The product rows the kit quotes. */
export const KIT_SLUGS = [
  "website-special",
  "site",
  "all-in-one-bundle",
  "cinematic-ad-special",
  "ugc-ad-special",
  "nfc-cards",
  "care-plan",
  "strategy-session",
] as const satisfies readonly PricedSlug[];

export interface KitRow {
  slug: string;
  priceCents: number;
  revisionLimit: number;
  turnaround: string | null;
}

// What the seed sets, used only when a row is missing (an unseeded database), so the kit still renders.
const FALLBACK: Record<(typeof KIT_SLUGS)[number], { revisionLimit: number; turnaround: string | null }> = {
  "website-special": { revisionLimit: 1, turnaround: "72 hours" },
  site: { revisionLimit: 2, turnaround: "2-3 weeks" },
  "all-in-one-bundle": { revisionLimit: 2, turnaround: "2-3 weeks" },
  "cinematic-ad-special": { revisionLimit: 1, turnaround: "5-7 days" },
  "ugc-ad-special": { revisionLimit: 1, turnaround: "5-7 days" },
  "nfc-cards": { revisionLimit: 0, turnaround: "5-7 business days" },
  "care-plan": { revisionLimit: 0, turnaround: null },
  "strategy-session": { revisionLimit: 0, turnaround: "60 minutes" },
};

/** "2-3 weeks" as "2 to 3 weeks", and "5-7 days" as "5 to 7 business days", the way the product cards say it. */
const target = (turnaround: string | null) => (turnaround ? businessDays(turnaround).replace(/(\d+)\s*-\s*(\d+)/, (_, from: string, to: string) => `${from} to ${to}`) : "");

/** Every value the kit shows, by placeholder name. */
export function kitValues(rows: readonly KitRow[]): Record<string, string> {
  const live = new Map(rows.map((r) => [r.slug, r]));
  const row = (slug: (typeof KIT_SLUGS)[number]) => live.get(slug) ?? { slug, priceCents: PRICE_CENTS[slug], ...FALLBACK[slug] };
  const cents = (slug: (typeof KIT_SLUGS)[number]) => row(slug).priceCents;

  const separately = bundleSeparatelyCents({
    website: cents("website-special"),
    cinematicAd: cents("cinematic-ad-special"),
    ugcAd: cents("ugc-ad-special"),
    card: cents("nfc-cards"),
  });

  return {
    websiteSpecial: usd(cents("website-special")),
    bundle: usd(cents("all-in-one-bundle")),
    bundleSeparately: usd(separately),
    bundleSaving: usd(Math.max(0, separately - cents("all-in-one-bundle"))),
    carePlan: usd(cents("care-plan")),
    strategySession: usd(cents("strategy-session")),
    depositMin: usd(DEPOSIT.overCents),
    depositPercent: String(DEPOSIT.percent),
    bnplMin: usd(BNPL.minCents),
    partnerPercent: String(PARTNER.defaultPercent),
    careMonths: String(SPECIAL_CARE_MONTHS),
    careFirstChargeMonth: String(SPECIAL_CARE_MONTHS + 1),
    bundleCinematic: String(BUNDLE_PARTS.cinematicAds),
    bundleUgc: String(BUNDLE_PARTS.ugcAds),
    bundleCards: String(BUNDLE_PARTS.cards),
    revisionsWebsiteSpecial: String(row("website-special").revisionLimit),
    revisionsSite: String(row("site").revisionLimit),
    revisionsBundle: String(row("all-in-one-bundle").revisionLimit),
    targetWebsiteSpecial: target(row("website-special").turnaround),
    targetSite: target(row("site").turnaround),
    targetAds: target(row("ugc-ad-special").turnaround),
    defectDays: String(POLICY.defectClaimDays),
    acceptanceDays: String(POLICY.deemedAcceptanceDays),
    optOutDays: String(POLICY.arbitrationOptOutDays),
    informalDays: String(POLICY.informalResolutionDays),
    phone: CONTACT_PHONE_DISPLAY,
    email: CONTACT_EMAIL,
  };
}

const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Fills every {{placeholder}} in the kit. Throws if the template names a value we don't have, or if one is empty, so a
 * typo or a missing fact fails the tests and the build instead of reaching a customer as "{{bundle}}".
 */
export function renderKit(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = values[key];
    if (v === undefined || v === "") throw new Error(`Welcome kit: no value for {{${key}}}`);
    return escapeHtml(v);
  });
}
