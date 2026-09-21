import { PRICE_CENTS, usd, type PricedSlug } from "@/lib/pricing/catalog";

// The products a deal can be about, by the names the owner uses. Prices come from the price list, never typed here.
const NAMES: Partial<Record<PricedSlug, string>> = {
  "nfc-cards": "NFC cards",
  "starter-website": "Quick Business Website",
  site: "Cinematic AI Website",
  "basic-package": "Basic Package",
  "all-in-one-bundle": "Launch Bundle",
  "ugc-ad-special": "UGC Ad Special",
  "cinematic-ad-special": "Cinematic Ad Special",
  ad: "Cinematic Ad",
  "rental-listing-film": "Rental Listing Film",
  "lead-engine": "Lead Engine",
  agents: "Multi-Agent Automation",
  saas: "AI Software",
  "strategy-session": "Strategy Session",
  "custom-build": "Custom Build Consultation",
  "care-plan": "Website Care Plan",
  "ads-monthly-300": "Monthly Ads Starter",
  "ads-monthly-500": "Monthly Ads Growth",
  "ads-monthly-1000": "Monthly Ads Scale",
};

export const DEAL_PRODUCTS = (Object.keys(NAMES) as PricedSlug[]).map((slug) => ({
  slug,
  label: `${NAMES[slug]} (${usd(PRICE_CENTS[slug])})`,
}));

/** A product slug as a name, or the slug itself if it is not one we list. */
export const dealProductName = (slug: string | null): string | null => (slug ? (NAMES[slug as PricedSlug] ?? slug) : null);
