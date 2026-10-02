import { db } from "@/lib/db";
import type { LivePrices } from "@/lib/site/faq";

/**
 * Every product's live price, from the same rows the price list and checkout read. Used where prices are written into
 * sentences (the FAQ), so the words never disagree with the numbers next to them. Empty if the database can't be
 * reached, and callers then fall back to the price list.
 */
export async function getLivePrices(): Promise<LivePrices> {
  try {
    const rows = await db.product.findMany({ select: { slug: true, priceCents: true } });
    return Object.fromEntries(rows.map((r) => [r.slug, r.priceCents]));
  } catch (e) {
    console.warn("live prices: using the price list,", e instanceof Error ? e.message : e);
    return {};
  }
}
