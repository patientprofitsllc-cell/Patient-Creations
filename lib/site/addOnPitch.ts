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
}

export const EXTRA_REVISION_SLUG = "extra-revision-package";
export const EXTRA_REVISION_ROUNDS = 2;
const STARTER_WEBSITE_SLUG = "starter-website";
const SOCIAL_PACK_SLUG = "social-asset-pack";

export const ADD_ON_PITCH: Record<string, AddOnPitch> = {
  "brand-kit": {
    headline: "Look like one real brand everywhere",
    why: "A logo, color palette, and type guide made for your business, so your website, cards, and social posts all match. A consistent look makes a small business feel established.",
    bestFor: "Best if you don't have a logo yet, or yours feels dated",
    detail: "Delivered as files you can use anywhere.",
  },
  [EXTRA_REVISION_SLUG]: {
    headline: "Get it exactly right",
    why: `Your order includes one round of changes. This adds ${EXTRA_REVISION_ROUNDS} more, so you can refine the wording, colors, and details after you see it.`,
    bestFor: "Best if you have a clear vision, or more than one person to please",
    detail: "Applies to the preview of your website.",
  },
  [SOCIAL_PACK_SLUG]: {
    headline: "One visual, ready for every platform",
    why: "Your main visual sized for Stories and Reels (9:16), feed posts (1:1), and video (16:9), so you can post right away without resizing anything.",
    bestFor: "Best if you post on social media",
    detail: "For video and creative builds.",
  },
  "maintenance-3mo": {
    headline: "Launch, then keep it current",
    why: "Prices, hours, and offers change. Three months of updates and small fixes are covered up front, so changes get handled without a new order each time.",
    bestFor: "Best if your details change often",
    detail: "One payment. It does not renew on its own.",
  },
  "nfc-card-addon": {
    headline: "Turn happy customers into reviews and followers",
    why: "One tap on the card opens your Google review page, Instagram, menu, or booking link, so a customer can act in seconds while they're happy with you.",
    bestFor: "Best if you serve customers in person",
    detail: "Choose your designs right after checkout.",
  },
};

/**
 * Whether an add-on makes sense for the main product. The Social Asset Pack is
 * crops of a hero visual, which the Quick Business Website doesn't have, so it
 * isn't offered (or accepted) with it.
 */
export function addOnAvailable(addOnSlug: string, primarySlug: string): boolean {
  if (addOnSlug === SOCIAL_PACK_SLUG && primarySlug === STARTER_WEBSITE_SLUG) return false;
  return true;
}
