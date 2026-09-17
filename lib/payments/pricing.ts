import { db } from "@/lib/db";
import { computeRushFeeCents, DeliverySpeedKey, DELIVERY_SPEEDS, getApplicableSpeeds } from "@/lib/payments/deliverySpeed";
import { getActiveProjectCount } from "@/lib/payments/productionLoad";
import { BULK_SETUP_WAIVER_MIN_QTY } from "@/lib/payments/bulkPricing";
import { calculateShippingCents } from "@/lib/payments/shipping";

export interface PricedOrder {
  subtotalCents: number;
  discountCents: number;
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
): Promise<PricedOrder> {
  if (productIds.length === 0) throw new Error("No products selected");
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

  // Merch (NFC cards, etc.) is a flat physical-goods purchase: no rush
  // production tiers, no add-ons, quantity instead. Enforced here, not just
  // hidden in the UI, so a manipulated request can't slip either past.
  if (primaryProduct.category === "Merch") {
    if (productIds.length > 1) throw new Error("Add-ons aren't available for this product");
    if (deliverySpeed !== "standard") throw new Error("Delivery speed options aren't available for this product");
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

  const items = productIds.map((id, i) => {
    const product = products.find((p) => p.id === id)!;
    const isPrimary = i === 0;
    let priceCents = isPrimary && primaryVariant ? primaryVariant.priceCents : product.priceCents;
    // Bulk order: waive the per-unit setup fee at BULK_SETUP_WAIVER_MIN_QTY+.
    if (isPrimary && product.setupFeeCents > 0 && primaryQuantity >= BULK_SETUP_WAIVER_MIN_QTY) {
      priceCents -= product.setupFeeCents;
    }
    return {
      productId: id,
      productVariantId: isPrimary && primaryVariant ? primaryVariant.id : null,
      priceCents,
      quantity: isPrimary ? primaryQuantity : 1,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  let discountCents = 0;
  if (couponCode) {
    discountCents = await resolveCouponDiscount(couponCode, subtotalCents);
  }

  const activeProjectCount = await getActiveProjectCount();
  const rushFeeCents = computeRushFeeCents(items[0].priceCents, deliverySpeed as DeliverySpeedKey, activeProjectCount);

  // Physical goods only. Domestic US, box included — see lib/payments/shipping.ts.
  const shippingQuote = primaryProduct.category === "Merch" ? calculateShippingCents(primaryQuantity) : null;
  const shippingCents = shippingQuote?.cents ?? 0;
  const shippingBoxLabel = shippingQuote?.boxLabel ?? null;

  const totalCents = Math.max(0, subtotalCents - discountCents + rushFeeCents + shippingCents);

  return { subtotalCents, discountCents, rushFeeCents, shippingCents, shippingBoxLabel, deliverySpeed, totalCents, items };
}

// Minimal, explicit coupon table. Replace with a `Coupon` DB model if the
// business needs self-serve coupon creation later.
const COUPONS: Record<string, number> = {
  LAUNCH10: 0.1,
};

async function resolveCouponDiscount(code: string, subtotalCents: number): Promise<number> {
  const rate = COUPONS[code.toUpperCase()];
  if (!rate) return 0;
  return Math.round(subtotalCents * rate);
}
