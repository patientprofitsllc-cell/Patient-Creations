// The public "your price next to the market" table, built only from published 2026 price
// ranges for the same kind of work, and only claiming what the numbers show. Whether a price
// is below, at the low end of, or inside the range is worked out here, never typed in.
//
// Ranges are what other businesses publish, not quotes, and price guides come from companies
// that sell related services, so they are directional. Re-check them before relying on them.

export interface MarketRow {
  slug: string;
  fallbackName: string;
  /** Used only if the product row is missing. */
  fallbackYouCents: number;
  loCents: number;
  hiCents: number;
  /** What the range is a range of. */
  label: string;
  source: { name: string; url: string };
}

export const MARKET_ROWS: readonly MarketRow[] = [
  {
    slug: "site",
    fallbackName: "Cinematic AI Website",
    fallbackYouCents: 200000,
    loCents: 200000,
    hiCents: 800000,
    label: "typical small business website",
    source: { name: "Jim, small business website cost", url: "https://www.jim.com/blog/small-business-website-cost" },
  },
  {
    slug: "saas",
    fallbackName: "AI Software / App",
    fallbackYouCents: 1000000,
    loCents: 1500000,
    hiCents: 10000000,
    label: "SaaS or app MVP, most between $30k and $100k",
    source: { name: "Purrweb, SaaS development costs", url: "https://www.purrweb.com/blog/saas-development-cost/" },
  },
  {
    slug: "agents",
    fallbackName: "Multi-Agent System",
    fallbackYouCents: 600000,
    loCents: 200000,
    hiCents: 1200000,
    label: "AI automation setup fee",
    source: { name: "Taskip, AI automation agency cost", url: "https://taskip.net/ai-automation-agency-cost/" },
  },
  {
    slug: "ad",
    fallbackName: "Cinematic Ad",
    fallbackYouCents: 50000,
    loCents: 100000,
    hiCents: 500000,
    label: "freelance social video ad, 15 to 30 seconds",
    source: { name: "Vidico, promo video cost", url: "https://vidico.com/news/promo-video-pricing/" },
  },
  {
    slug: "rental-listing-film",
    fallbackName: "Rental Listing Film",
    fallbackYouCents: 50000,
    loCents: 50000,
    hiCents: 150000,
    label: "premium or cinematic listing video",
    source: { name: "RoomLift, real estate videography pricing", url: "https://www.roomlift.ai/blog/real-estate-videography-pricing" },
  },
];

export type MarketPosition = "below" | "low-end" | "within" | "above";

export interface Standing {
  position: MarketPosition;
  /** Whole percent under the low end of the range, only meaningful when position is "below". */
  percentBelowFloor: number;
}

/** Where a price sits against a range. "Low end" means within 10 percent above the floor. */
export function standing(youCents: number, loCents: number, hiCents: number): Standing {
  if (youCents < loCents * 0.95) return { position: "below", percentBelowFloor: Math.round((1 - youCents / loCents) * 100) };
  if (youCents <= loCents * 1.1) return { position: "low-end", percentBelowFloor: 0 };
  if (youCents <= hiCents) return { position: "within", percentBelowFloor: 0 };
  return { position: "above", percentBelowFloor: 0 };
}

export function standingText(s: Standing): string {
  switch (s.position) {
    case "below":
      return `${s.percentBelowFloor}% below the low end of the range`;
    case "low-end":
      return "At the low end of the range";
    case "within":
      return "Within the range";
    default:
      return "Above the range";
  }
}

export interface ComparedRow extends MarketRow {
  name: string;
  youCents: number;
  standing: Standing;
}

/** Attaches the live product name and price to each market row. Rows without a live product fall back to their stored values. */
export function compareRows(live: { slug: string; name: string; priceCents: number }[], rows: readonly MarketRow[] = MARKET_ROWS): ComparedRow[] {
  return rows
    .map((r) => {
      const p = live.find((x) => x.slug === r.slug);
      const youCents = p?.priceCents ?? r.fallbackYouCents;
      return { ...r, name: p?.name ?? r.fallbackName, youCents, standing: standing(youCents, r.loCents, r.hiCents) };
    })
    .sort((a, b) => a.youCents - b.youCents);
}

export function totalsOf(rows: readonly { youCents: number; loCents: number; hiCents: number }[]) {
  return {
    youCents: rows.reduce((s, r) => s + r.youCents, 0),
    floorCents: rows.reduce((s, r) => s + r.loCents, 0),
    ceilingCents: rows.reduce((s, r) => s + r.hiCents, 0),
  };
}
