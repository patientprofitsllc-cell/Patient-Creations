// The Monthly Ads plans, defined once. The public page, the checkout, the product
// rows in the database, the customer's manage page, and the admin quota all read
// from here, so what is promised in one place can never differ from another.
//
// Pure data and text: no database, no server code. Prices shown to customers are
// read from the product rows (so a price change needs no deploy); the numbers
// below are only the fallback for an unseeded database.

export const AD_PLAN_SLUGS = ["ads-monthly-300", "ads-monthly-500", "ads-monthly-1000"] as const;
export type AdPlanSlug = (typeof AD_PLAN_SLUGS)[number];

export interface AdPlanCounts {
  /** Short video ads a month (up to 15 seconds each). */
  shortAds: number;
  /** How many of the short ads may be made in a creator style (a presenter talking to camera). */
  creatorStyleUpTo: number;
  /** Cinematic showcase videos a month (up to 30 seconds). */
  cinematic: number;
  /** Quick 3D product visuals a month. */
  visual3d: number;
  /** One-page landing pages built or refreshed a month. */
  landingPages: number;
  /** Revision rounds on each month's batch. */
  revisionRounds: number;
  /** Planning calls a month (30 minutes). */
  planningCalls: number;
  /** A written plan of the month's ads, sent for approval before we make them. */
  writtenPlan: boolean;
}

export interface AdPlan {
  slug: AdPlanSlug;
  name: string;
  fallbackPriceCents: number;
  tagline: string;
  bestFor: string;
  counts: AdPlanCounts;
  sortOrder: number;
}

export const AD_PLANS: readonly AdPlan[] = [
  {
    slug: "ads-monthly-300",
    name: "Monthly Ads Starter",
    fallbackPriceCents: 30000,
    tagline: "A steady stream of fresh ads for one product or service.",
    bestFor: "Best if you want new ads every month without a big commitment.",
    counts: { shortAds: 4, creatorStyleUpTo: 0, cinematic: 0, visual3d: 0, landingPages: 0, revisionRounds: 1, planningCalls: 0, writtenPlan: false },
    sortOrder: 40,
  },
  {
    slug: "ads-monthly-500",
    name: "Monthly Ads Growth",
    fallbackPriceCents: 50000,
    tagline: "More ads to test, plus a cinematic showcase video.",
    bestFor: "Best if you are testing different angles, or promote more than one offer.",
    counts: { shortAds: 8, creatorStyleUpTo: 3, cinematic: 1, visual3d: 0, landingPages: 0, revisionRounds: 2, planningCalls: 0, writtenPlan: true },
    sortOrder: 41,
  },
  {
    slug: "ads-monthly-1000",
    name: "Monthly Ads Scale",
    fallbackPriceCents: 100000,
    tagline: "The full set: ads, cinematic video, a 3D visual, and a landing page.",
    bestFor: "Best if ads are a main way you find customers and you want everything made for you each month.",
    counts: { shortAds: 16, creatorStyleUpTo: 6, cinematic: 2, visual3d: 1, landingPages: 1, revisionRounds: 2, planningCalls: 1, writtenPlan: true },
    sortOrder: 42,
  },
];

export function isAdPlanSlug(v: unknown): v is AdPlanSlug {
  return typeof v === "string" && (AD_PLAN_SLUGS as readonly string[]).includes(v);
}

export function getAdPlan(slug: string): AdPlan | undefined {
  return AD_PLANS.find((p) => p.slug === slug);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Exactly what the customer gets each month, in plain words, built from the counts. */
export function planIncludes(plan: AdPlan): string[] {
  const c = plan.counts;
  const items: string[] = [];
  items.push(`${plural(c.shortAds, "short video ad")} (up to 15 seconds each), delivered in vertical and square`);
  if (c.creatorStyleUpTo > 0) items.push(`Up to ${c.creatorStyleUpTo} of them made in a creator style, with an AI presenter talking to camera`);
  items.push("A caption, three headline options, and a call to action written for every ad");
  if (c.cinematic > 0) items.push(`${plural(c.cinematic, "cinematic showcase video")} (up to 30 seconds, wide and vertical)`);
  if (c.visual3d > 0) items.push(`${plural(c.visual3d, "quick 3D product visual")}, made from the photos and details you send`);
  if (c.landingPages > 0) items.push(`${plural(c.landingPages, "one-page landing page")}, built or refreshed to match the month's ads, delivered ready to publish`);
  if (c.writtenPlan) items.push("A written plan of the month's ads for your approval before we make them");
  if (c.planningCalls > 0) items.push(`${c.planningCalls === 1 ? "One" : c.planningCalls} 30-minute planning ${c.planningCalls === 1 ? "call" : "calls"}`);
  items.push(`${plural(c.revisionRounds, "revision round")} on each month's batch`);
  items.push("Ready-to-post files delivered by download link, and shown on your private plan page");
  return items;
}

/** What the plan does not include. Same list of hard limits for every plan, plus what the higher plans add. */
export function planNotIncluded(plan: AdPlan): string[] {
  const c = plan.counts;
  const out = [
    "Ad spend, which you pay directly to the ad platform",
    "Running or managing your ad accounts, and posting for you",
    "Any promise of sales, leads, or results",
    "Real actors or voice recordings: presenters and voices in the ads are AI-generated",
    "Music rights or licensed music",
    "Carrying unused ads or revisions over to the next month",
  ];
  if (c.cinematic === 0) out.push("Cinematic showcase videos (on the Growth and Scale plans)");
  if (c.visual3d === 0) out.push("3D product visuals (on the Scale plan)");
  if (c.landingPages === 0) out.push("A landing page each month (on the Scale plan)");
  return out;
}

/** Things that are not part of any plan but can be quoted after a call. Never presented as included. */
export const QUOTED_SEPARATELY = [
  "An AI receptionist that answers your calls",
  "Automated text and email follow-up",
  "A booking page, funnel, and customer list (CRM)",
  "A custom AI assistant for your business",
  "Workflow automation between the tools you already use",
  "An AI helper for your team in Slack or Microsoft Teams",
] as const;

export const AD_TIMING_NOTE =
  "Our target is to deliver each month's batch within about 7 business days of getting your monthly brief. That is a target, not a guarantee: it can take longer if we are waiting on you.";

export const AD_AI_NOTE =
  "Ads are made with AI tools. Some ad platforms ask that ads with AI-generated people or voices be labeled; we tell you which files include them, and labeling on your ad account is up to you.";

/** The product row's description: a one-line summary plus the deliverables, in plain text. */
export function planDescription(plan: AdPlan): string {
  return `${plan.tagline} Each month: ${planIncludes(plan).slice(0, -1).join("; ")}. Renews monthly until canceled.`;
}

/** What one month of the plan is worth, for the admin quota view. */
export function planQuota(plan: AdPlan) {
  const c = plan.counts;
  return { items: c.shortAds + c.cinematic + c.visual3d + c.landingPages, shortAds: c.shortAds, cinematic: c.cinematic, visual3d: c.visual3d, landingPages: c.landingPages };
}

/** The customer's monthly brief: the questions we need answered to make good ads. Stored as JSON on the subscription. */
export const BRIEF_FIELDS = [
  { key: "offer", label: "What should this month's ads promote?", hint: "A product, service, or offer, with prices if it helps.", max: 600, required: true },
  { key: "audience", label: "Who are they for?", hint: "The kind of customer you want, and where they are.", max: 400, required: false },
  { key: "goal", label: "What should people do after they see an ad?", hint: "For example call, book, visit, or buy.", max: 200, required: false },
  { key: "style", label: "Style and tone", hint: "Words or examples of ads you like. Skip if you are not sure.", max: 400, required: false },
  { key: "avoid", label: "Anything we should avoid", hint: "Words, claims, or topics to stay away from.", max: 300, required: false },
  { key: "links", label: "Links to your website, social pages, or photos", hint: "You can also email photos and logos to us.", max: 600, required: false },
] as const;
export type BriefKey = (typeof BRIEF_FIELDS)[number]["key"];

/** Cleans a submitted brief: known fields only, trimmed, length-limited. Returns null if the required answer is missing. */
export function cleanBrief(input: unknown): Record<BriefKey, string> | null {
  if (!input || typeof input !== "object") return null;
  const src = input as Record<string, unknown>;
  const out = {} as Record<BriefKey, string>;
  for (const f of BRIEF_FIELDS) {
    const raw = typeof src[f.key] === "string" ? (src[f.key] as string) : "";
    out[f.key] = raw.replace(/\r\n/g, "\n").trim().slice(0, f.max);
  }
  return out.offer.length >= 5 ? out : null;
}

/** "2026-10" for a date, in Eastern time, the way delivery periods are labeled. */
export function periodLabel(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit" }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  return `${y}-${m}`;
}
