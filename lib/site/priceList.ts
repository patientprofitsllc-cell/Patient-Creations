// Everything on sale, in a few plain groups, each with one line on what you get. The homepage and /pricing both show
// this list, so a visitor finds any product and its price in one place. Prices are never written here: they come from
// the product rows (or the price list as a fallback). Pure data: safe in the browser, the server, and tests.
import { AD_PLANS } from "@/lib/ads/plans";
import { BUNDLE_PARTS, SPECIAL_CARE_MONTHS, type PricedSlug } from "@/lib/pricing/catalog";

export interface PriceListItem {
  slug: PricedSlug;
  /** Shown instead of the product row's name, when a shorter one reads better. */
  name?: string;
  /** What you get, in one line. */
  line: string;
  /** Where the button goes. Defaults to the product's checkout. */
  href?: string;
  /** Shown after the price, for example "each" or "a month". */
  unit?: string;
  /** The button's words. Defaults to "Get it". */
  cta?: string;
  /** Show "from" before the price (set automatically for products with tiers). */
  from?: boolean;
}

export interface PriceListGroup {
  /** Also the anchor on the page, so /#websites and /pricing#ads work. */
  id: "websites" | "ads" | "business-cards" | "automation" | "monthly";
  title: string;
  blurb: string;
  items: PriceListItem[];
  /** A short tip shown under the group. */
  tip?: string;
}

export const PRICE_LIST: readonly PriceListGroup[] = [
  {
    id: "websites",
    title: "Websites",
    blurb: "Get online with a site built around your business.",
    items: [
      {
        slug: "website-special",
        line: `A one-page website, live in about 72 hours, with ${SPECIAL_CARE_MONTHS} months of maintenance included.`,
      },
      { slug: "site", line: "Up to 5 pages with a cinematic motion hero. Bigger tiers add more pages." },
      {
        slug: "all-in-one-bundle",
        name: "All-in-One Launch Bundle",
        line: `A Website Special, ${BUNDLE_PARTS.cinematicAds} Cinematic Ads, ${BUNDLE_PARTS.ugcAds} UGC Ads, and ${BUNDLE_PARTS.cards} Business Cards.`,
      },
    ],
  },
  {
    id: "ads",
    title: "Ads and video",
    blurb: "Video ads made with AI, priced per ad, or a fresh batch every month.",
    items: [
      { slug: "ugc-ad-special", name: "UGC Ad", line: "A creator-style ad with an AI presenter, up to 30 seconds, with 3 opening hooks to test.", unit: "per ad" },
      { slug: "cinematic-ad-special", name: "Cinematic Ad", line: "A polished, film-style ad, up to 30 seconds, wide and vertical.", unit: "per ad" },
      { slug: "rental-listing-film", line: "A cinematic video tour of your rental, made from your listing photos." },
      { slug: "basic-package", line: "Three drone-style videos of your building and storefront, plus 5 Business Cards." },
      { slug: "ad", name: "Cinematic Ad, custom", line: "A longer, made-to-brief cinematic ad with 2 revision rounds, for when a single ad needs more." },
    ],
    tip: "Want more than a couple of ads? Monthly Ads works out much cheaper per ad.",
  },
  {
    id: "business-cards",
    title: "Business Cards",
    blurb: "Tap-to-share smart cards. One tap opens your reviews, menu, socials, or booking link.",
    items: [{ slug: "nfc-cards", name: "Business Cards", line: "Pick your designs and mix and match. Setup included. Shipping is extra.", unit: "each" }],
  },
  {
    id: "automation",
    title: "Get customers and automate",
    blurb: "Lead capture, payments, software, and AI agents. Bigger builds start with a scoping call.",
    items: [
      { slug: "lead-engine", line: "A landing page, a lead form, and automatic follow-up emails." },
      { slug: "payments-setup", line: "Take card payments on your website or app through Stripe." },
      { slug: "agents", line: "Up to 3 AI agents working together on one business process." },
      { slug: "saas", line: "A working web app for one core workflow, with the code handed to you." },
      { slug: "strategy-session", line: "Not sure what you need? A one-hour call, and the fee is credited toward your build." },
    ],
  },
  {
    id: "monthly",
    title: "Monthly plans",
    blurb: "Optional, and you can cancel any time.",
    items: [
      { slug: "ads-monthly-300", name: "Monthly Ads", line: `${AD_PLANS[0].counts.shortAds} to ${AD_PLANS[AD_PLANS.length - 1].counts.shortAds} new ads every month, depending on the plan.`, href: "/monthly-ads", unit: "a month", from: true, cta: "See plans" },
      { slug: "care-plan", name: "Website Care", line: "Up to 3 small updates a month, and your site kept online. Start it once your site is live.", href: "/faq#after-launch", unit: "a month", cta: "How it works" },
    ],
  },
];

/** Every slug the list shows, for one database query. */
export const PRICE_LIST_SLUGS: PricedSlug[] = PRICE_LIST.flatMap((g) => g.items.map((i) => i.slug));
