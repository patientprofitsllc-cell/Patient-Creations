import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

// The three questions a new visitor can answer in one tap, and the few things that fit each answer. Fifteen
// services is too many to read; three choices is not. Prices come from the price list.

export type NeedId = "website" | "customers" | "automate";

export interface NeedChoice {
  id: NeedId;
  label: string;
  blurb: string;
}

export interface Suggestion {
  title: string;
  why: string;
  price: string;
  href: string;
}

export const NEEDS: readonly NeedChoice[] = [
  { id: "website", label: "I need a website", blurb: "Get online with something that looks the part." },
  { id: "customers", label: "I need more customers", blurb: "Get seen, and catch the people who look." },
  { id: "automate", label: "I want to automate my business", blurb: "Hand the repeat work to software." },
];

export const SUGGESTIONS: Record<NeedId, Suggestion[]> = {
  website: [
    { title: "Quick Business Website", why: "One page with your services, contact details, and a call button, built from your own words.", price: usd(PRICE_CENTS["starter-website"]), href: "/checkout?product=starter-website" },
    { title: "All-in-One Launch Bundle", why: "A website, ads, and NFC cards together, so you launch everything at once.", price: usd(PRICE_CENTS["all-in-one-bundle"]), href: "/checkout?product=all-in-one-bundle" },
    { title: "Cinematic AI Website", why: "A multi page site with a motion hero, for a business that wants to stand out.", price: `from ${usd(PRICE_CENTS.site)}`, href: "/checkout?product=site" },
  ],
  customers: [
    { title: "A launch ad", why: "A creator style video ad, a low-cost way to get in front of people.", price: usd(PRICE_CENTS["ugc-ad-special"]), href: "/checkout?product=ugc-ad-special" },
    { title: "Monthly Ads", why: "A fresh batch of ads every month. Cancel any time.", price: `from ${usd(PRICE_CENTS["ads-monthly-300"])} a month`, href: "/monthly-ads" },
    { title: "Lead Engine", why: "A landing page, lead capture, and automatic follow-up for the people who show interest.", price: `from ${usd(PRICE_CENTS["lead-engine"])}`, href: "/checkout?product=lead-engine" },
  ],
  automate: [
    { title: "Strategy Session", why: "Start with a live call, so we scope the right thing before you commit to a build.", price: usd(PRICE_CENTS["strategy-session"]), href: "/checkout?product=strategy-session" },
    { title: "Multi Agent System", why: "A team of AI helpers that work together on the repeat tasks in your business.", price: `from ${usd(PRICE_CENTS.agents)}`, href: "/checkout?product=agents" },
    { title: "AI Software", why: "Your idea turned into a working app, scoped on a call first.", price: `from ${usd(PRICE_CENTS.saas)}`, href: "/checkout?product=saas" },
  ],
};

export const JOURNEY = [
  { n: "01", stage: "Build", line: "Website and branding", detail: "Get online with a site, a look, and NFC cards that all match.", href: "/services" },
  { n: "02", stage: "Attract", line: "UGC and cinematic advertising", detail: "Ads that get people to look, one at a time or every month.", href: "/monthly-ads" },
  { n: "03", stage: "Capture", line: "Lead generation and funnels", detail: "Landing pages, lead capture, and follow-up so interest is not lost.", href: "/checkout?product=lead-engine" },
  { n: "04", stage: "Automate", line: "AI and agents", detail: "Software that does the repeat work for you.", href: "/agents" },
  { n: "05", stage: "Scale", line: "Systems and recurring growth", detail: "Monthly ads, website care, and connected systems that keep compounding.", href: "/pricing" },
] as const;
