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
  "nfc-cards": 3_000,
  "nfc-wifi": 3_000,
  "nfc-custom-menu": 3_000,
  "nfc-youtube": 3_000,
  "nfc-whatsapp": 3_000,
  "nfc-instagram": 3_000,
  "nfc-tiktok": 3_000,
  "nfc-google-review": 3_000,
  "starter-website": 30_000,
  "site": 200_000,
  // Get attention
  "ugc-ad-special": 9_900,
  "cinematic-ad-special": 24_900,
  "ad": 50_000,
  "rental-listing-film": 50_000,
  "basic-package": 100_000,
  "all-in-one-bundle": 89_900,
  // Get customers
  "lead-engine": 170_000,
  "payments-setup": 90_000,
  // Automate
  "agents": 600_000,
  "saas": 1_000_000,
  // Conversations
  "strategy-session": 15_000,
  "custom-build": 10_000,
  // Extras added to an order
  "nfc-card-addon": 3_000,
  "brand-kit": 25_000,
  "extra-revision-package": 15_000,
  "social-asset-pack": 12_000,
  "automation-add-on": 60_000,
  // Monthly plans (per month)
  "care-plan": 7_900,
  "ads-monthly-300": 30_000,
  "ads-monthly-500": 50_000,
  "ads-monthly-1000": 100_000,
} as const;

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
export const BNPL = { minCents: 30_000, afterpayMaxCents: 400_000, klarnaMaxCents: 1_000_000 } as const;

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
  // AI Software: $10,000 to start, $15,000 for the advanced build, $25,000 for the full system.
  saas: { Signature: 1_500_000 },
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
