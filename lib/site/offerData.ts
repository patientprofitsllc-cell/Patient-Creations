import { db } from "@/lib/db";
import { OFFER_SLUG } from "@/lib/site/offer";

// The live offer product row. Pages read the price from here so changing it in
// the database changes every page, button, and card at the next refresh.
export async function getOfferProduct() {
  return db.product.findFirst({ where: { slug: OFFER_SLUG, active: true } });
}

// Only used if the row is missing (e.g. an unseeded dev database), so pages
// still render instead of crashing.
export const FALLBACK_OFFER_PRICE_CENTS = 30000;
