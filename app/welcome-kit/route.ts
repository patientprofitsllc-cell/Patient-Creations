import KIT from "@/lib/site/welcomeKit/kit.html?raw";
import { db } from "@/lib/db";
import { KIT_SLUGS, kitValues, renderKit, type KitRow } from "@/lib/site/welcomeKit/render";

// The welcome kit, rendered from the same product rows as the price list and checkout, and refreshed on the same
// 60-second cycle, so the three never disagree. If the database can't be reached the kit falls back to the price list.
export const revalidate = 60;

export async function GET() {
  let rows: KitRow[] = [];
  try {
    rows = await db.product.findMany({
      where: { slug: { in: [...KIT_SLUGS] } },
      select: { slug: true, priceCents: true, revisionLimit: true, turnaround: true },
    });
  } catch (e) {
    console.warn("welcome kit: using price list fallback,", e instanceof Error ? e.message : e);
  }
  return new Response(renderKit(KIT, kitValues(rows)), {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, noai, noimageai" },
  });
}
