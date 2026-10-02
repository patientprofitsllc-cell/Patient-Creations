// The reason to add each optional extra, in one place, so checkout and the
// pricing page say the same thing. Client-safe (no database). Prices are never
// written here: they come from the product rows. Every line describes what the
// add-on really does; there are no invented popularity claims or statistics.

export interface AddOnPitch {
  /** The benefit, as a headline. */
  headline: string;
  /** Why someone would add it. */
  why: string;
  /** Who it suits. */
  bestFor: string;
  /** What they get or how it works, when that isn't obvious. */
  detail?: string;
  /** How much time it adds, so the delivery estimate is never a surprise. */
  timing: string;
}

export const EXTRA_REVISION_SLUG = "extra-revision-package";
export const EXTRA_REVISION_ROUNDS = 2;
const SOCIAL_PACK_SLUG = "social-asset-pack";

/** The Extra Revision Package pitch, worded for the number of rounds the chosen product already includes. */
export function revisionPitchWhy(includedRounds: number): string {
  const has = includedRounds === 1 ? "one round of changes" : `${includedRounds} rounds of changes`;
  return `Your order includes ${has}. This adds ${EXTRA_REVISION_ROUNDS} more, so you can refine the wording, colors, and details after you see it.`;
}

export const ADD_ON_PITCH: Record<string, AddOnPitch> = {
  "brand-kit": {
    headline: "Look like one real brand everywhere",
    why: "A logo, color palette, and type guide made for your business, so your website, cards, and social posts all match. A consistent look makes a small business feel established.",
    bestFor: "Best if you don't have a logo yet, or yours feels dated",
    detail: "Delivered as files you can use anywhere.",
    timing: "Adds about 3 business days.",
  },
  [EXTRA_REVISION_SLUG]: {
    headline: "Get it exactly right",
    why: revisionPitchWhy(1),
    bestFor: "Best if you have a clear vision, or more than one person to please",
    detail: "Applies to the first version we send you.",
    timing: "Each round takes about 2 business days after you send your changes.",
  },
  [SOCIAL_PACK_SLUG]: {
    headline: "One visual, ready for every platform",
    why: "Your main visual sized for Stories and Reels (9:16), feed posts (1:1), and video (16:9), so you can post right away without resizing anything.",
    bestFor: "Best if you post on social media",
    detail: "For video and creative builds.",
    timing: "Adds about 1 business day.",
  },
  "nfc-card-addon": {
    headline: "Turn happy customers into reviews and followers",
    why: "One tap on the card opens your Google review page, Instagram, menu, or booking link, so a customer can act in seconds while they're happy with you.",
    bestFor: "Best if you serve customers in person",
    detail: "Choose your designs right after checkout.",
    timing: "Cards ship separately, usually 5 to 7 business days after you pick your designs.",
  },
};

// Products with a hero visual or video to crop for social. Only these get the Social Asset Pack.
const VISUAL_SLUGS = new Set(["site", "ad", "rental-listing-film", "basic-package", "cinematic-ad-special", "ugc-ad-special", "all-in-one-bundle"]);
// Consultations are calls: there is nothing to revise, brand, crop, or ship with them.
const CONSULTATION_SLUGS = new Set(["strategy-session", "custom-build"]);
const isCard = (slug: string) => slug.startsWith("nfc-");

/**
 * Whether an add-on makes sense with the main product, so checkout only offers (and only accepts) extras that do
 * something for it:
 * - nothing on a consultation, which is a call;
 * - the Social Asset Pack only on products with a hero visual or video to crop (not the Website Special, software,
 *   automation, or cards);
 * - no Extra Revision Package on Business Cards, which have no revision rounds;
 * - no Business Card add-on on a Business Card order, which already picks its cards.
 */
export function addOnAvailable(addOnSlug: string, primarySlug: string): boolean {
  if (CONSULTATION_SLUGS.has(primarySlug)) return false;
  if (addOnSlug === SOCIAL_PACK_SLUG) return VISUAL_SLUGS.has(primarySlug);
  if (addOnSlug === EXTRA_REVISION_SLUG && isCard(primarySlug)) return false;
  if (addOnSlug === "nfc-card-addon" && isCard(primarySlug)) return false;
  return true;
}
