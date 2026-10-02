import Link from "next/link";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { PRICE_CENTS } from "@/lib/pricing/catalog";
import { PRICE_LIST, PRICE_LIST_SLUGS } from "@/lib/site/priceList";

/**
 * Everything we sell, grouped, one row each: name, what you get, price, and a button. Prices come from the live
 * product rows, falling back to the price list. A product that is switched off in the database is left out.
 */
export async function PriceList({ className = "" }: { className?: string }) {
  const rows = await db.product.findMany({
    where: { slug: { in: PRICE_LIST_SLUGS } },
    include: { variants: { where: { active: true }, select: { id: true } } },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  return (
    <section id="products" aria-labelledby="products-title" className={`mx-auto max-w-4xl scroll-mt-24 px-5 sm:px-6 ${className}`}>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Products and prices</p>
        <h2 id="products-title" className="mt-3 font-display text-3xl text-ice sm:text-4xl">
          Everything we make, <span className="text-gradient-champagne italic">on one list.</span>
        </h2>
        <nav aria-label="Jump to a group" className="mt-6 flex flex-wrap justify-center gap-2">
          {PRICE_LIST.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-ice/70 transition hover:border-gold/50 hover:text-gold">
              {g.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-10 space-y-10">
        {PRICE_LIST.map((g) => {
          const items = g.items.filter((i) => bySlug.get(i.slug)?.active ?? true);
          if (items.length === 0) return null;
          return (
            <div key={g.id} id={g.id} className="scroll-mt-24">
              <h3 className="font-display text-2xl text-ice">{g.title}</h3>
              <p className="mt-1 text-sm text-ice/50">{g.blurb}</p>
              <ul className="mt-4 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {items.map((i) => {
                  const row = bySlug.get(i.slug);
                  const cents = row?.priceCents ?? PRICE_CENTS[i.slug];
                  const from = i.from || (row?.variants.length ?? 0) > 0;
                  return (
                    <li key={i.slug} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                      <div className="flex-1">
                        <p className="font-semibold text-ice">{i.name}</p>
                        <p className="mt-1 text-sm text-ice/60">{i.line}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="whitespace-nowrap text-champagne">
                          {from && <span className="text-xs text-ice/50">from </span>}
                          <span className="font-display text-2xl">{money(cents)}</span>
                          {i.unit && <span className="text-xs text-ice/50"> {i.unit}</span>}
                        </p>
                        <Link
                          href={i.href ?? `/checkout?product=${i.slug}`}
                          className="inline-flex min-h-[44px] items-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian transition hover:brightness-110"
                        >
                          {i.cta ?? "Get it"}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {g.tip && (
                <p className="mt-3 text-sm text-gold/80">
                  {g.tip} <Link href="/monthly-ads" className="underline">See Monthly Ads</Link>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
