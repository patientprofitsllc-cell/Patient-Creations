// THE price list. Every price the business charges is written here, once, in cents. Nothing else may type a price:
//   - the database rows are seeded from this file (prisma/seed.ts), and every page, card, checkout screen, and
//     email reads the price from those rows;
//   - the few places that need a price before the database answers (a fallback) import it from here;
//   - copy that mentions a price builds it with usd(), never by typing a dollar amount;
//   - tests/unit/pricingCatalog.test.ts fails if a dollar amount is typed anywhere else, if a database row
//     drifts from this file, or if the ladder stops making sense.
// To change a price: change it here, run the seed, and every screen follows.

/** The price of everything on sale, in cents, by product slug. */
export const PRICE_CENTS = {
  // Get online
  "nfc-cards": 2_000,
  "nfc-wifi": 2_000,
  "nfc-custom-menu": 2_000,
  "nfc-youtube": 2_000,
  "nfc-whatsapp": 2_000,
  "nfc-instagram": 2_000,
  "nfc-tiktok": 2_000,
  "nfc-google-review": 2_000,
  "website-special": 200_000, // includes 3 months of Website Care
  "site": 300_000,
  // Get attention
  "ugc-ad-special": 14_900,
  "cinematic-ad-special": 39_900,
  "ad": 75_000,
  "rental-listing-film": 39_900,
  "basic-package": 64_900,
  "all-in-one-bundle": 319_900,
  // Agent bundles: the bundle price is set here by hand; what it saves is worked out from BUNDLES below.
  "agent-website-bundle": 720_000,
  "agent-cinematic-bundle": 810_000,
  "agent-lead-bundle": 690_000,
  "everything-bundle": 1_280_000,
  // Get customers
  "lead-engine": 170_000,
  "payments-setup": 90_000,
  // Automate
  "agents": 600_000,
  "saas": 1_500_000,
  // Conversations
  "strategy-session": 15_000,
  "custom-build": 10_000,
  // Extras added to an order
  "nfc-card-addon": 2_000,
  "brand-kit": 25_000,
  "extra-revision-package": 15_000,
  "social-asset-pack": 12_000,
  "automation-add-on": 60_000,
  // Monthly plans (per month)
  "care-plan": 9_900,
  "ads-monthly-300": 30_000,
  "ads-monthly-500": 50_000,
  "ads-monthly-1000": 100_000,
} as const;

/** Months of Website Care included in the Website Special's price. */
export const SPECIAL_CARE_MONTHS = 3;

/** What the All-in-One Launch Bundle contains, besides one Website Special. The wording, card picker and savings read this. */
export const BUNDLE_PARTS = { cinematicAds: 4, ugcAds: 4, cards: 5 } as const;

/** What the bundle's contents cost bought one by one, from whichever prices are passed (the live rows or the price list). */
export function bundleSeparatelyCents(p: { website: number; cinematicAd: number; ugcAd: number; card: number }): number {
  return p.website + BUNDLE_PARTS.cinematicAds * p.cinematicAd + BUNDLE_PARTS.ugcAds * p.ugcAd + BUNDLE_PARTS.cards * p.card;
}

/** The bundle's "bought separately" total at list prices. */
export const BUNDLE_SEPARATELY_CENTS: number = bundleSeparatelyCents({
  website: PRICE_CENTS["website-special"],
  cinematicAd: PRICE_CENTS["cinematic-ad-special"],
  ugcAd: PRICE_CENTS["ugc-ad-special"],
  card: PRICE_CENTS["nfc-cards"],
});

/**
 * What each AI Agent bundle contains, as [product slug, quantity] pairs. "Bought separately" is the sum of these at the
 * current prices, so what a bundle saves is always worked out, never typed. Care months are counted at the monthly plan's price.
 */
export const BUNDLES = {
  "agent-website-bundle": [["agents", 1], ["website-special", 1]],
  "agent-cinematic-bundle": [["agents", 1], ["site", 1]],
  "agent-lead-bundle": [["agents", 1], ["lead-engine", 1]],
  "everything-bundle": [
    ["site", 1],
    ["agents", 1],
    ["lead-engine", 1],
    ["payments-setup", 1],
    ["care-plan", 12],
    ["cinematic-ad-special", 4],
    ["ugc-ad-special", 4],
    ["nfc-cards", 5],
  ],
} as const satisfies Record<string, readonly (readonly [keyof typeof PRICE_CENTS, number])[]>;

export type AgentBundleSlug = keyof typeof BUNDLES;
export const AGENT_BUNDLE_SLUGS = Object.keys(BUNDLES) as AgentBundleSlug[];

/** Months of Website Care the Everything bundle includes. */
export const EVERYTHING_CARE_MONTHS = 12;

/** What an agent bundle saves against buying its parts one by one, from the prices passed (default: the price list). */
export function agentBundleSavingCents(slug: AgentBundleSlug, price: (s: keyof typeof PRICE_CENTS) => number = (s) => PRICE_CENTS[s]): number {
  return agentBundleSeparatelyCents(slug, price) - price(slug);
}

/** What a bundle's contents cost bought one by one, from the prices passed (the live rows) or the price list. */
export function agentBundleSeparatelyCents(slug: AgentBundleSlug, price: (s: keyof typeof PRICE_CENTS) => number = (s) => PRICE_CENTS[s]): number {
  return BUNDLES[slug].reduce((sum, [part, qty]) => sum + price(part) * qty, 0);
}

/**
 * Fees that are not products on the shelf. The Growth Audit is $19 on purpose: enough that only people who mean it pay
 * (paying is the cheapest proof of intent there is), little enough that nobody has to think twice, and below the
 * smallest thing we sell, so it never reads as a substitute for buying. The whole fee comes back as a credit toward the
 * first order, so anyone who was going to buy anyway pays nothing extra.
 */
export const FEES = {
  "growth-audit": 1_900,
} as const;

export const AUDIT_FEE_CENTS: number = FEES["growth-audit"];
/** How long the audit credit code works. */
export const AUDIT_CREDIT_DAYS = 30;

/**
 * Big builds can be started with a deposit instead of paying everything up front. The deposit starts production; the
 * rest is invoiced and is due before the final files are released or the site is launched. Only orders OVER `overCents`
 * (strictly more, so an order of exactly that amount pays in full) can use it, and never orders that ship physical goods.
 */
export const DEPOSIT = { percent: 50, overCents: 150_000 } as const;

/**
 * Buy now, pay later at card checkout (see lib/payments/bnpl.ts). Klarna and Afterpay set their own limits, and they
 * change; these follow Stripe's documentation for United States merchants: Afterpay up to $4,000, Klarna up to $10,000
 * (its longer financing plans). Below the floor, the provider's fee (roughly 6% plus 30 cents) is too much of the sale.
 */
export const BNPL = { minCents: 40_000, afterpayMaxCents: 400_000, klarnaMaxCents: 1_000_000 } as const;

/**
 * The partner program (agencies, designers, consultants, and others who send us customers). A partner earns a percent of
 * what a customer they referred pays, on one-time orders, for a year after that customer's first paid order. A commission is
 * held for `pendingDays` after payment (time for a refund or dispute to show up) and is approved only once the whole order
 * is paid. Payouts are made by hand, and no smaller than `minPayoutCents`.
 */
export const PARTNER = { defaultPercent: 10, pendingDays: 14, windowDays: 365, minPayoutCents: 5_000 } as const;

/**
 * The monthly revenue the founder is aiming for. A target to plan and measure against, never a promise or a forecast. The
 * revenue dashboard shows real progress toward it and a Planning Scenario for what it would take.
 */
export const TARGET = { monthlyRevenueCents: 10_000_000 } as const;

export type PricedSlug = keyof typeof PRICE_CENTS;

export const priceOf = (slug: PricedSlug): number => PRICE_CENTS[slug];

/** A tiered product's Signature and Flagship prices are the base price times these, rounded to the nearest $50. */
export const TIER_MULTIPLIERS = { Signature: 1.6, Flagship: 2.5 } as const;
export type TierName = keyof typeof TIER_MULTIPLIERS;

/** Tiers whose price is set by hand because a round number is what the business wants to sell. */
export const TIER_PRICE_OVERRIDES: Partial<Record<string, Partial<Record<TierName, number>>>> = {
  // AI Software: $15,000 to start, $22,500 for the advanced build, $37,500 for the full system.
  saas: { Signature: 2_250_000 },
  // Lead Engine: $1,700 starter, $2,500 growth, $4,250 scale.
  "lead-engine": { Signature: 250_000 },
};

const round50 = (cents: number) => Math.round(cents / 5000) * 5000;

export function tierPriceCents(slug: string, tier: TierName, baseCents: number): number {
  return TIER_PRICE_OVERRIDES[slug]?.[tier] ?? round50(baseCents * TIER_MULTIPLIERS[tier]);
}

/** A video tier at or above this price ships with its first NFC card free. */
export const FREE_FIRST_CARD_VIDEO_MIN_CENTS = 100_000;

/** "$300", "$1,700", "$24.90". No decimals when the amount is whole dollars. */
export function usd(cents: number): string {
  const whole = cents % 100 === 0;
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
}
