import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CARTABLE_SLUGS } from "@/lib/cart/store";
import { PRICE_CENTS, type PricedSlug } from "@/lib/pricing/catalog";
import { PRICE_LIST } from "@/lib/site/priceList";
import { rateLimit } from "@/lib/security/rateLimit";

const NAMES = new Map(PRICE_LIST.flatMap((g) => g.items.map((i) => [i.slug, i] as const)));

// Live names and prices for the products in a visitor's cart. Public: it answers only for products on the public price
// list, which anyone can already see, and knows nothing about the visitor.
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`cart-quote:${ip}`, 60, 60_000).allowed) return NextResponse.json({ items: [] }, { status: 429 });
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "").split(",").filter((s) => CARTABLE_SLUGS.includes(s)).slice(0, 20);
  if (slugs.length === 0) return NextResponse.json({ items: [] });
  let rows: { slug: string; name: string; priceCents: number; active: boolean; variants: { id: string }[] }[] = [];
  try {
    rows = await db.product.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true, priceCents: true, active: true, variants: { where: { active: true }, select: { id: true } } },
    });
  } catch {
    /* fall back to the price list below */
  }
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const items = slugs
    .map((slug) => {
      const row = bySlug.get(slug);
      const listed = NAMES.get(slug as PricedSlug)!;
      return {
        slug,
        name: listed.name,
        line: listed.line,
        unit: listed.unit ?? null,
        priceCents: row?.priceCents ?? PRICE_CENTS[slug as PricedSlug],
        from: Boolean(listed.from || (row?.variants.length ?? 0) > 0),
        available: row ? row.active : true,
      };
    })
    .filter((i) => i.available);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
