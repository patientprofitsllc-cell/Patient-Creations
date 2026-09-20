import { BULK_SETUP_WAIVER_MIN_QTY } from "@/lib/payments/bulkPricing";

export const NFC_ADDON_SLUG = "nfc-card-addon";

// Cards are a flat price (see the seed), so there is no volume special. These stay so the
// pricing code has one place to add a bulk price later: at or above this quantity every card
// is at most this price. It equals the list price, so nothing changes today.
export const NFC_ADDON_BULK_MIN_QTY = BULK_SETUP_WAIVER_MIN_QTY;
export const NFC_ADDON_BULK_UNIT_CENTS = 3000;

// The all-in-one bundle already includes this many NFC cards, so the card
// add-on isn't offered on top of it.
export const NFC_BUNDLE_SLUG = "all-in-one-bundle";
export const NFC_BUNDLE_CARD_COUNT = 3;
export const BASIC_PACKAGE_SLUG = "basic-package";
export const BASIC_PACKAGE_CARD_COUNT = 5;

// Products that ship with NFC cards in the price. The card add-on is not offered on top of these,
// and the order asks for a design for every included card after checkout.
const INCLUDED_CARDS: Record<string, number> = {
  [NFC_BUNDLE_SLUG]: NFC_BUNDLE_CARD_COUNT,
  [BASIC_PACKAGE_SLUG]: BASIC_PACKAGE_CARD_COUNT,
};

/** How many NFC cards come with this product, or 0 if it does not include any. */
export function includedCardCount(slug: string | null | undefined): number {
  return (slug && INCLUDED_CARDS[slug]) || 0;
}

const VIDEO_FREE_THRESHOLD_CENTS = 100000; // $1,000+ cinematic video tier ships with a free card

/**
 * The NFC card add-on's price depends on what it's bundled with: free on a
 * $1,000+ cinematic video tier, and its normal listed price ($30) on everything else. Shared by the server-side pricer and the
 * checkout form's client-side display so the two can never drift apart.
 */
export function resolveNfcAddonPriceCents(
  defaultPriceCents: number,
  primaryProduct: { slug: string; category: string },
  primaryPriceCents: number,
): number {
  if (primaryProduct.category === "Video" && primaryPriceCents >= VIDEO_FREE_THRESHOLD_CENTS) return 0;
  return defaultPriceCents;
}

export interface NfcAddonLine {
  quantity: number;
  priceCents: number;
}

/**
 * Prices `quantity` add-on cards. The video (free) offer is
 * for ONE card, so they apply to the first card only; every additional card is
 * the regular add-on price, or the bulk price once the order reaches
 * NFC_ADDON_BULK_MIN_QTY cards (which applies to all of them). Returned as up
 * to two lines because an order line can only carry one unit price.
 */
export function priceNfcAddon(
  defaultPriceCents: number,
  primaryProduct: { slug: string; category: string },
  primaryPriceCents: number,
  quantity: number,
): { lines: NfcAddonLine[]; totalCents: number } {
  const qty = Math.max(1, Math.floor(quantity));
  const unit =
    qty >= NFC_ADDON_BULK_MIN_QTY ? Math.min(defaultPriceCents, NFC_ADDON_BULK_UNIT_CENTS) : defaultPriceCents;
  const first = Math.min(resolveNfcAddonPriceCents(defaultPriceCents, primaryProduct, primaryPriceCents), unit);

  const lines: NfcAddonLine[] =
    qty === 1
      ? [{ quantity: 1, priceCents: first }]
      : first === unit
        ? [{ quantity: qty, priceCents: unit }]
        : [
            { quantity: 1, priceCents: first },
            { quantity: qty - 1, priceCents: unit },
          ];
  return { lines, totalCents: lines.reduce((s, l) => s + l.quantity * l.priceCents, 0) };
}
