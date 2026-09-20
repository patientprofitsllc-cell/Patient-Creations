import { addOnAvailable } from "@/lib/site/addOnPitch";
import { OFFER_PERCENT, RECOVERY_COUPON } from "@/lib/funnel/cartRecovery";
import { db } from "@/lib/db";
import { computeRushFeeCents, DeliverySpeedKey, DELIVERY_SPEEDS, getApplicableSpeeds } from "@/lib/payments/deliverySpeed";
import { getActiveProjectCount } from "@/lib/payments/productionLoad";
import { BULK_SETUP_WAIVER_MIN_QTY } from "@/lib/payments/bulkPricing";
import { calculateShippingCents } from "@/lib/payments/shipping";
import { NFC_ADDON_SLUG, includedCardCount, priceNfcAddon } from "@/lib/payments/nfcAddon";
import { AD_SPECIAL_CATEGORY } from "@/lib/payments/quantityProducts";
import { CARD_DESIGN_SLUGS } from "@/lib/payments/cardMix";

export interface PriceOptions {
  /** A verified return-visitor offer (see lib/funnel/cartRecovery.ts). Only the server sets this. */
  recoveryOffer?: boolean;
}

export interface PricedOrder {
  subtotalCents: number;
  discountCents: number;
  /** The code that produced the discount, when there is one. */
  couponApplied?: string;
  rushFeeCents: number;
  shippingCents: number;
  shippingBoxLabel: string | null;
  deliverySpeed: string;
  totalCents: number;
  items: { productId: string; productVariantId: string | null; priceCents: number; quantity: number }[];
}

const MAX_PRIMARY_QUANTITY = 100;

/**
 * Server-side price computation — the client only ever sends product IDs
 * (and optionally a variant id for the primary item), a coupon code, and a
 * delivery speed key. Never trust a client-provided price: the rush fee is
 * recomputed here from the real, current production load, not whatever the
 * client displayed.
 */
export async function priceOrder(
  productIds: string[],
  couponCode?: string,
  primaryVariantId?: string,
  deliverySpeed: string = "standard",
  primaryQuantity: number = 1,
  nfcAddonQuantity: number = 1,
  opts: PriceOptions = {},
): Promise<PricedOrder> {
  if (productIds.length === 0) throw new Error("No products selected");
  if (!Number.isInteger(nfcAddonQuantity) || nfcAddonQuantity < 1 || nfcAddonQuantity > MAX_PRIMARY_QUANTITY) {
    throw new Error(`Card quantity must be a whole number between 1 and ${MAX_PRIMARY_QUANTITY}`);
  }
  if (!DELIVERY_SPEEDS.some((s) => s.key === deliverySpeed)) {
    throw new Error("Invalid delivery speed selected");
  }
  if (!Number.isInteger(primaryQuantity) || primaryQuantity < 1 || primaryQuantity > MAX_PRIMARY_QUANTITY) {
    throw new Error(`Quantity must be a whole number between 1 and ${MAX_PRIMARY_QUANTITY}`);
  }

  const products = await db.product.findMany({ where: { id: { in: productIds }, active: true } });
  if (products.length !== new Set(productIds).size) {
    throw new Error("One or more selected products are invalid or inactive");
  }

  const primaryProduct = products.find((p) => p.id === productIds[0])!;

  // Extras that don't fit the main product are refused here too, not just hidden in the UI.
  for (const p of products) {
    if (p.type === "ORDER_BUMP" && !addOnAvailable(p.slug, primaryProduct.slug)) {
      throw new Error(`${p.name} isn't available with this product`);
    }
  }

  // A subscription is started from the customer's project page once their site
  // is live, through its own checkout. It can never be bought as a one-time order.
  if (products.some((p) => p.type === "SUBSCRIPTION")) {
    throw new Error("This plan is started from your project page after your website is live");
  }

  // Merch (NFC cards, etc.) is a flat physical-goods purchase: no rush
  // production tiers, no add-ons, quantity instead. Enforced here, not just
  // hidden in the UI, so a manipulated request can't slip either past.
  if (primaryProduct.category === "Merch") {
    if (productIds.length > 1) throw new Error("Add-ons aren't available for this product");
    if (deliverySpeed !== "standard") throw new Error("Delivery speed options aren't available for this product");
  }

  // Per-ad special: flat per-unit pricing, so rush tiers (which are computed
  // on a single unit's price) aren't offered. Enforced here, not just in the UI.
  if (primaryProduct.category === AD_SPECIAL_CATEGORY && deliverySpeed !== "standard") {
    throw new Error("Delivery speed options aren't available for this special");
  }

  if (includedCardCount(primaryProduct.slug) > 0 && products.some((p) => p.slug === NFC_ADDON_SLUG)) {
    throw new Error("This package already includes your NFC cards");
  }

  const applicableSpeeds = getApplicableSpeeds(primaryProduct.turnaround);
  if (!applicableSpeeds.some((s) => s.key === deliverySpeed)) {
    throw new Error("That delivery speed isn't available for this service");
  }

  let primaryVariant = null;
  if (primaryVariantId) {
    primaryVariant = await db.productVariant.findUnique({ where: { id: primaryVariantId } });
    if (!primaryVariant || primaryVariant.productId !== productIds[0] || !primaryVariant.active) {
      throw new Error("Selected tier is invalid for this service");
    }
  }

  const items = productIds.flatMap((id, i) => {
    const product = products.find((p) => p.id === id)!;
    const isPrimary = i === 0;

    // The card add-on can carry a quantity, and is priced as one or two lines
    // (first-card special + the rest, or one bulk line). See priceNfcAddon.
    if (!isPrimary && product.slug === NFC_ADDON_SLUG) {
      const primaryPriceCents = primaryVariant ? primaryVariant.priceCents : primaryProduct.priceCents;
      return priceNfcAddon(product.priceCents, primaryProduct, primaryPriceCents, nfcAddonQuantity).lines.map((line) => ({
        productId: id,
        productVariantId: null as string | null,
        priceCents: line.priceCents,
        quantity: line.quantity,
      }));
    }

    let priceCents = isPrimary && primaryVariant ? primaryVariant.priceCents : product.priceCents;
    // Bulk order: waive the per-unit setup fee at BULK_SETUP_WAIVER_MIN_QTY+.
    if (isPrimary && product.setupFeeCents > 0 && primaryQuantity >= BULK_SETUP_WAIVER_MIN_QTY) {
      priceCents -= product.setupFeeCents;
    }
    return [
      {
        productId: id,
        productVariantId: isPrimary && primaryVariant ? primaryVariant.id : null,
        priceCents,
        quantity: isPrimary ? primaryQuantity : 1,
      },
    ];
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const { discountCents, couponApplied } = await resolveDiscount(couponCode, subtotalCents, opts);

  const activeProjectCount = await getActiveProjectCount();
  const rushFeeCents = computeRushFeeCents(items[0].priceCents, deliverySpeed as DeliverySpeedKey, activeProjectCount);

  // Physical goods only. Domestic US, box included — see lib/payments/shipping.ts.
  const shippingQuote = primaryProduct.category === "Merch" ? calculateShippingCents(primaryQuantity) : null;
  const shippingCents = shippingQuote?.cents ?? 0;
  const shippingBoxLabel = shippingQuote?.boxLabel ?? null;

  const totalCents = Math.max(0, subtotalCents - discountCents + rushFeeCents + shippingCents);

  return { subtotalCents, discountCents, couponApplied, rushFeeCents, shippingCents, shippingBoxLabel, deliverySpeed, totalCents, items };
}

/**
 * Prices a mix-and-match card order: how many of each design. Each design is
 * its own order line (so the Stripe receipt, CRM, and inventory all show the
 * real breakdown). The bulk setup-fee waiver and the shipping box are decided
 * by the TOTAL card count across designs, not per design.
 */
export async function priceCardMix(mix: Record<string, number>, couponCode?: string, opts: PriceOptions = {}): Promise<PricedOrder> {
  const entries = Object.entries(mix).filter(([, qty]) => qty > 0);
  if (entries.length === 0) throw new Error("Choose at least one card");
  if (entries.some(([slug, qty]) => !CARD_DESIGN_SLUGS.includes(slug) || !Number.isInteger(qty) || qty < 1)) {
    throw new Error("One or more selected card designs are invalid");
  }
  const totalQty = entries.reduce((sum, [, qty]) => sum + qty, 0);
  if (totalQty > MAX_PRIMARY_QUANTITY) {
    throw new Error(`You can order up to ${MAX_PRIMARY_QUANTITY} cards at a time`);
  }

  const products = await db.product.findMany({
    where: { slug: { in: entries.map(([slug]) => slug) }, active: true, category: "Merch" },
  });
  if (products.length !== entries.length) throw new Error("One or more selected card designs are unavailable");

  const waiveSetup = totalQty >= BULK_SETUP_WAIVER_MIN_QTY;
  const items = entries.map(([slug, quantity]) => {
    const product = products.find((p) => p.slug === slug)!;
    return {
      productId: product.id,
      productVariantId: null as string | null,
      priceCents: waiveSetup ? product.priceCents - product.setupFeeCents : product.priceCents,
      quantity,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const { discountCents, couponApplied } = await resolveDiscount(couponCode, subtotalCents, opts);
  const shipping = calculateShippingCents(totalQty);
  const totalCents = Math.max(0, subtotalCents - discountCents + shipping.cents);

  return {
    subtotalCents,
    discountCents,
    couponApplied,
    rushFeeCents: 0,
    shippingCents: shipping.cents,
    shippingBoxLabel: shipping.boxLabel,
    deliverySpeed: "standard",
    totalCents,
    items,
  };
}

// Minimal, explicit coupon table. Replace with a `Coupon` DB model if the
// business needs self-serve coupon creation later.
const COUPONS: Record<string, number> = {
  LAUNCH10: 0.1,
};

/**
 * One discount per order: the better of the typed coupon and a verified
 * return-visitor offer (5%). They never stack.
 */
export async function resolveDiscount(couponCode: string | undefined, subtotalCents: number, opts: PriceOptions = {}) {
  const couponCents = couponCode ? await resolveCouponDiscount(couponCode, subtotalCents) : 0;
  const offerCents = opts.recoveryOffer ? Math.round((subtotalCents * OFFER_PERCENT) / 100) : 0;
  if (offerCents > couponCents) return { discountCents: offerCents, couponApplied: RECOVERY_COUPON as string | undefined };
  return { discountCents: couponCents, couponApplied: couponCents > 0 ? couponCode?.toUpperCase() : undefined };
}

async function resolveCouponDiscount(code: string, subtotalCents: number): Promise<number> {
  const rate = COUPONS[code.toUpperCase()];
  if (!rate) return 0;
  return Math.round(subtotalCents * rate);
}
