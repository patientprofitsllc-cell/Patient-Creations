import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

// The customer ladder, as rules. Given what someone has just bought and what they already own, it names the one to
// three things that make sense next, in order, and never anything that is irrelevant or already theirs.
//
//   website  ->  NFC cards, a launch ad, website care, monthly ads
//   launch bundle  ->  monthly ads, website care
//   an ad or video  ->  lead engine, monthly ads
//   monthly ads  ->  lead engine
//   lead engine  ->  AI follow-up
//   AI software or agents  ->  more agents and automations
//   NFC cards only  ->  a website
//
// Prices are read from the price list; the wording promises no results.

export type OfferId = "nfc-cards" | "launch-ad" | "care-plan" | "monthly-ads" | "lead-engine" | "ai-followup" | "more-agents" | "website";

export interface Offer {
  id: OfferId;
  title: string;
  /** Why it fits, in one sentence. */
  why: string;
  /** "$30 each", "$79 a month", "from $1,700". */
  priceLabel: string;
  href: string;
  cta: string;
}

export interface LadderContext {
  /** Product slugs in the order that was just paid for. Empty when looking back later. */
  justBought: readonly string[];
  /** Every product slug this customer has ever bought. */
  owned: readonly string[];
  hasCarePlan?: boolean;
  hasAdsPlan?: boolean;
  /** The customer's private project page, where the Care Plan is started once the website is live. */
  statusPath?: string | null;
}

const WEBSITE = ["starter-website", "site"];
const BUNDLE = ["all-in-one-bundle"];
const ADS = ["ad", "cinematic-ad-special", "ugc-ad-special", "rental-listing-film", "basic-package"];
const LEAD = ["lead-engine"];
const AI = ["saas", "agents", "automation-add-on"];
const isNfc = (s: string) => s.startsWith("nfc-");
const any = (slugs: readonly string[], set: readonly string[] | ((s: string) => boolean)) => slugs.some((s) => (typeof set === "function" ? set(s) : set.includes(s)));

const checkout = (slug: string) => `/checkout?product=${slug}`;

export function nextOffers(ctx: LadderContext): Offer[] {
  const bought = ctx.justBought.length > 0 ? ctx.justBought : ctx.owned;
  const owns = (set: readonly string[] | ((s: string) => boolean)) => any(ctx.owned, set) || any(ctx.justBought, set);
  const out: Offer[] = [];
  const add = (o: Offer | null) => {
    if (o && !out.some((x) => x.id === o.id)) out.push(o);
  };

  const nfc = (): Offer | null =>
    owns(isNfc) || owns(["nfc-card-addon"])
      ? null
      : {
          id: "nfc-cards",
          title: "NFC cards",
          why: "A tap on the card opens your review page, menu, or booking link, so it is easy for customers to find you.",
          priceLabel: `${usd(PRICE_CENTS["nfc-card-addon"])} each`,
          href: checkout("nfc-cards"),
          cta: "Add NFC cards",
        };
  const launchAd = (): Offer | null =>
    owns(ADS)
      ? null
      : {
          id: "launch-ad",
          title: "A launch ad",
          why: "A creator style video ad to point people at what you just launched.",
          priceLabel: usd(PRICE_CENTS["ugc-ad-special"]),
          href: checkout("ugc-ad-special"),
          cta: "Add a launch ad",
        };
  const care = (): Offer | null =>
    ctx.hasCarePlan || !ctx.statusPath
      ? null
      : {
          id: "care-plan",
          title: "Keep your site running",
          why: "Small updates handled for you every month, so you never have to manage the site yourself. You start it from your project page once your website is live.",
          priceLabel: `${usd(PRICE_CENTS["care-plan"])} a month`,
          href: ctx.statusPath,
          cta: "See website care",
        };
  const monthlyAds = (): Offer | null =>
    ctx.hasAdsPlan
      ? null
      : {
          id: "monthly-ads",
          title: "Monthly Ads",
          why: "A fresh batch of ads every month, and you can cancel any time.",
          priceLabel: `from ${usd(PRICE_CENTS["ads-monthly-300"])} a month`,
          href: "/monthly-ads",
          cta: "See the plans",
        };
  const leadEngine = (): Offer | null =>
    owns(LEAD)
      ? null
      : {
          id: "lead-engine",
          title: "Lead Engine",
          why: "A landing page, lead capture, and automatic follow-up, built to catch the attention your ads bring in.",
          priceLabel: `from ${usd(PRICE_CENTS["lead-engine"])}`,
          href: checkout("lead-engine"),
          cta: "See the Lead Engine",
        };
  const aiFollowup = (): Offer | null =>
    owns(["automation-add-on"])
      ? null
      : {
          id: "ai-followup",
          title: "AI follow-up",
          why: "An automation that follows up with new leads for you, so none of them waits on you.",
          priceLabel: usd(PRICE_CENTS["automation-add-on"]),
          href: checkout("automation-add-on"),
          cta: "Add AI follow-up",
        };
  const moreAgents = (): Offer | null => {
    const slug = owns(["agents"]) ? "automation-add-on" : "agents";
    if (owns([slug])) return null;
    return {
      id: "more-agents",
      title: slug === "agents" ? "A team of AI agents" : "More automation",
      why: slug === "agents" ? "Agents that work together on the repeat tasks in your business." : "Connect more of your business to the system you already have.",
      priceLabel: slug === "agents" ? `from ${usd(PRICE_CENTS.agents)}` : usd(PRICE_CENTS["automation-add-on"]),
      href: checkout(slug),
      cta: "See what it adds",
    };
  };
  const website = (): Offer | null =>
    owns(WEBSITE) || owns(BUNDLE)
      ? null
      : {
          id: "website",
          title: "A Quick Business Website",
          why: "Give your cards and ads a home: a one page site with your services, contact details, and a call button.",
          priceLabel: usd(PRICE_CENTS["starter-website"]),
          href: checkout("starter-website"),
          cta: "Get the website",
        };

  // The most advanced thing they bought decides where they are on the ladder.
  if (any(bought, AI)) {
    add(moreAgents());
  } else if (any(bought, LEAD)) {
    add(aiFollowup());
    add(monthlyAds());
  } else if (any(bought, BUNDLE)) {
    add(monthlyAds());
    add(care());
    add(leadEngine());
  } else if (any(bought, WEBSITE)) {
    add(nfc());
    add(launchAd());
    add(care());
    add(monthlyAds());
  } else if (ctx.hasAdsPlan || any(bought, ADS)) {
    add(leadEngine());
    add(monthlyAds());
    if (!owns(WEBSITE) && !owns(BUNDLE)) add(website());
  } else if (any(bought, isNfc) || any(bought, ["nfc-card-addon"])) {
    add(website());
    add(launchAd());
  }
  // Consultations (Strategy Session, Custom Build) and anything unrecognized get no upsell: a call is not a moment to sell.
  return out.slice(0, 3);
}

/** The first rung: what to show someone who has bought nothing yet. */
export function firstOffers(): Offer[] {
  return [
    {
      id: "website",
      title: "A Quick Business Website",
      why: "One page with your services, contact details, and a call button, built from your own words.",
      priceLabel: usd(PRICE_CENTS["starter-website"]),
      href: checkout("starter-website"),
      cta: "Get the website",
    },
    {
      id: "nfc-cards",
      title: "NFC cards",
      why: "A tap on the card opens your review page, menu, or booking link.",
      priceLabel: `${usd(PRICE_CENTS["nfc-card-addon"])} each`,
      href: checkout("nfc-cards"),
      cta: "Add NFC cards",
    },
    {
      id: "launch-ad",
      title: "A launch ad",
      why: "A creator style video ad to get your business seen.",
      priceLabel: usd(PRICE_CENTS["ugc-ad-special"]),
      href: checkout("ugc-ad-special"),
      cta: "Add a launch ad",
    },
  ];
}
