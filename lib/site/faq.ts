// Answers to the questions people ask, in one place, grouped by topic. The /faq page shows all of them and the homepage
// shows the most common few. Every answer is built from the same rules the site runs on (prices, delivery targets,
// payment and refund rules), so it cannot say something the rest of the site doesn't. Pure: safe in the browser and tests.
import { AD_PLANS } from "@/lib/ads/plans";
import { POLICY } from "@/lib/legal/config";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import {
  AUDIT_CREDIT_DAYS,
  AUDIT_FEE_CENTS,
  BNPL,
  BUNDLE_PARTS,
  BUNDLE_SEPARATELY_CENTS,
  DEPOSIT,
  PRICE_CENTS,
  SPECIAL_CARE_MONTHS,
  usd,
} from "@/lib/pricing/catalog";
import { OFFER_INCLUDES } from "@/lib/site/offer";

export interface Faq {
  q: string;
  a: string;
}

export interface FaqGroup {
  /** Also the anchor on /faq. */
  id: string;
  title: string;
  faqs: Faq[];
}

const p = (slug: keyof typeof PRICE_CENTS) => usd(PRICE_CENTS[slug]);
const lower = (items: string[]) => items.map((s) => s.charAt(0).toLowerCase() + s.slice(1)).join(", ");
const starter = AD_PLANS[0];
const scale = AD_PLANS[AD_PLANS.length - 1];

/** Every question and answer, by topic. `bnpl` is whether pay-later is switched on at checkout. */
export function faqGroups({ bnpl }: { bnpl: boolean }): FaqGroup[] {
  const bundleSaving = BUNDLE_SEPARATELY_CENTS - PRICE_CENTS["all-in-one-bundle"];
  return [
    {
      id: "start",
      title: "Getting started",
      faqs: [
        {
          q: "What do you make?",
          a: "Websites, video ads, Business Cards, and growth tools for small businesses: lead capture, payments, custom software, and AI agents. Every product and its price is on the Products and Prices list.",
        },
        {
          q: "I'm not sure what I need. Where do I start?",
          a: `Most businesses start with the ${p("website-special")} Website Special. If you'd like advice first, the Growth Audit (${usd(AUDIT_FEE_CENTS)}) looks at your business and tells you what to do first, and its fee is credited toward your first order within ${AUDIT_CREDIT_DAYS} days. For bigger builds, book a ${p("strategy-session")} Strategy Session; that fee is credited toward the build.`,
        },
        {
          q: "How do I contact you?",
          a: `Call or text ${CONTACT_PHONE_DISPLAY}, or email ${CONTACT_EMAIL}.`,
        },
      ],
    },
    {
      id: "websites",
      title: "Websites",
      faqs: [
        {
          q: `What's included in the ${p("website-special")} Website Special?`,
          a: `A custom one-page website: ${lower(OFFER_INCLUDES)}. Maintenance means up to 3 small updates a month (text, hours, prices, phone number, or links), your site kept online, and your domain looked after.`,
        },
        {
          q: "What's the difference between the Website Special and the Cinematic AI Website?",
          a: `The Website Special (${p("website-special")}) is one page, ready in about 72 hours, with ${SPECIAL_CARE_MONTHS} months of maintenance. The Cinematic AI Website (from ${p("site")}) has up to 5 pages, a cinematic motion hero, and 2 revision rounds, and takes 2 to 3 weeks. Bigger tiers add more pages.`,
        },
        {
          q: "How long does a website take?",
          a: "The Website Special's target is 72 hours once we have your business information. The Cinematic AI Website takes 2 to 3 weeks. These are targets, not guarantees: they can take longer if we're waiting on you.",
        },
        {
          q: "What do I need to give you?",
          a: "Your business name, what you do, your phone number, and your hours. Services, prices, social links, a logo, and photos help, but you can skip anything you don't have. The intake takes about 3 to 5 minutes, right after you pay.",
        },
        {
          q: "Do I need a domain? What about hosting?",
          a: "If you own a domain, we help you connect it. If not, we help you choose one. We put your site live at launch.",
        },
        {
          q: "Will this get me to the top of Google?",
          a: "We set up the basics Google looks for (page titles, descriptions, headings, and a fast mobile page). Nobody can honestly promise rankings, and we don't.",
        },
      ],
    },
    {
      id: "after-launch",
      title: "After your site is live",
      faqs: [
        {
          q: `What happens after the ${SPECIAL_CARE_MONTHS} months of maintenance?`,
          a: `You can keep it going with Website Care for ${p("care-plan")} a month: up to 3 small updates a month, and your site kept online and your domain looked after. It's optional, you start it from your project page, and you can cancel any time.`,
        },
        {
          q: "How do I ask for an update or follow my project?",
          a: "Everything happens on your private project page: progress, your preview, revision requests, and updates once you're live. We send you the link after you order.",
        },
      ],
    },
    {
      id: "ads",
      title: "Ads and video",
      faqs: [
        {
          q: "Should I buy single ads or Monthly Ads?",
          a: `Single ads are best if you want one or two: a UGC Ad is ${p("ugc-ad-special")} and a Cinematic Ad is ${p("cinematic-ad-special")}. If you want ads every month, Monthly Ads is much cheaper per ad: from ${p("ads-monthly-300")} a month for ${starter.counts.shortAds} short ads, up to ${scale.counts.shortAds} ads plus cinematic videos on the bigger plans. Cancel any time.`,
        },
        {
          q: "What's the difference between a UGC Ad and a Cinematic Ad?",
          a: "A UGC Ad looks like a customer or creator made it, with an AI presenter talking to camera and 3 opening hooks to test. A Cinematic Ad is a polished, film-style spot. Both are up to 30 seconds, with a caption and headline options written for you.",
        },
        {
          q: "Do you run my ads or pay for ad spend?",
          a: "No. We make the ads and you post them or run them on your own ad accounts. Ad spend is paid by you, directly to the platform.",
        },
        {
          q: "How long do ads take?",
          a: "Single ads have a target of 5 to 7 days. Monthly Ads batches arrive within about 7 to 14 business days of your monthly brief, depending on the plan.",
        },
      ],
    },
    {
      id: "bundle",
      title: "The All-in-One Bundle",
      faqs: [
        {
          q: "What's in the All-in-One Launch Bundle?",
          a: `A Website Special with ${SPECIAL_CARE_MONTHS} months of maintenance, ${BUNDLE_PARTS.cinematicAds} Cinematic Ads, ${BUNDLE_PARTS.ugcAds} UGC Ads, and ${BUNDLE_PARTS.cards} Business Cards of your choice, for ${p("all-in-one-bundle")}.${bundleSaving > 0 ? ` Bought one by one, the same things cost ${usd(BUNDLE_SEPARATELY_CENTS)}, so you save ${usd(bundleSaving)}.` : ""}`,
        },
      ],
    },
    {
      id: "business-cards",
      title: "Business Cards",
      faqs: [
        {
          q: "How do the Business Cards work?",
          a: `Each card has a chip inside. A customer taps it with their phone and it opens your review page, menu, socials, WiFi, or booking link. They're ${p("nfc-cards")} each, setup included, and you can mix and match designs.`,
        },
        {
          q: "When do the cards arrive?",
          a: "They usually ship 5 to 7 business days after you pick your designs. Shipping within the US is added at checkout, based on how many cards you order.",
        },
      ],
    },
    {
      id: "paying",
      title: "Paying",
      faqs: [
        {
          q: "How do I pay?",
          a: `By card at checkout, and work starts right away. You can also ask to pay by Zelle or Apple Pay and we'll send you instructions.${bnpl ? ` On orders of ${usd(BNPL.minCents)} or more, you may be able to pay over time with Klarna or Afterpay at checkout.` : ""}`,
        },
        {
          q: "Can I pay a deposit?",
          a: `Yes, on orders over ${usd(DEPOSIT.overCents)} that don't include anything we ship (like Business Cards). You pay ${DEPOSIT.percent}% to start, and the rest is due before your final files are released or your site is launched.`,
        },
        {
          q: "Can I get a refund?",
          a: `All sales are final, because everything is made to order for you. Each order includes the revision rounds stated for it, so you can get it right before it's done. If a Business Card arrives damaged or doesn't work, email us within ${POLICY.defectClaimDays} days of delivery. Monthly plans can be canceled any time and stop at the end of the period you've paid for. The full Refund Policy has the details.`,
        },
      ],
    },
  ];
}

/** The few questions most people ask, for the homepage. */
export function topFaqs(opts: { bnpl: boolean }): Faq[] {
  const all = faqGroups(opts).flatMap((g) => g.faqs);
  const pick = (start: string) => all.find((f) => f.q.startsWith(start));
  return [
    pick("I'm not sure what I need"),
    pick("What's included in the"),
    pick("How long does a website take"),
    pick("Should I buy single ads"),
    pick("What's in the All-in-One"),
    pick("How do I pay"),
    pick("Can I get a refund"),
  ].filter((f): f is Faq => Boolean(f));
}
