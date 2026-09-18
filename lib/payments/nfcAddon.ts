export const NFC_ADDON_SLUG = "nfc-card-addon";

// The all-in-one bundle already includes this many NFC cards, so the card
// add-on isn't offered on top of it.
export const NFC_BUNDLE_SLUG = "all-in-one-bundle";
export const NFC_BUNDLE_CARD_COUNT = 3;

const STARTER_WEBSITE_SLUG = "starter-website";
const VIDEO_FREE_THRESHOLD_CENTS = 100000; // $1,000+ cinematic video tier ships with a free card

/**
 * The NFC card add-on's price depends on what it's bundled with: $45 on the
 * Starter Website, free on a $1,000+ cinematic video tier, and its normal
 * listed price on everything else. Shared by the server-side pricer and the
 * checkout form's client-side display so the two can never drift apart.
 */
export function resolveNfcAddonPriceCents(
  defaultPriceCents: number,
  primaryProduct: { slug: string; category: string },
  primaryPriceCents: number,
): number {
  if (primaryProduct.slug === STARTER_WEBSITE_SLUG) return 4500;
  if (primaryProduct.category === "Video" && primaryPriceCents >= VIDEO_FREE_THRESHOLD_CENTS) return 0;
  return defaultPriceCents;
}
