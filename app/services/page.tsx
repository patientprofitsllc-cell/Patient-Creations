import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { ReserveLink } from "@/components/services/ReserveLink";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SpecialsGrid } from "@/components/home/SpecialsGrid";
import { CARD_CTA_CLASS, money } from "@/components/home/specialFrame";
import { ScopePanel } from "@/components/catalog/ScopePanel";
import { MARKET_ROWS, compareRows, standingText, totalsOf } from "@/lib/site/marketComparison";
import { CARD_DESIGN_SLUGS } from "@/lib/payments/cardMix";
import { db } from "@/lib/db";

// Pulls the live product catalog from the DB. Revalidated every 60s
// instead of force-dynamic: a price/catalog change shows up within a
// minute (no redeploy needed) while most visitors get a cached, instant
// response instead of a fresh DB round-trip on every single request.
export const revalidate = 60;

export default async function ServicesPage() {
  const products = await db.product.findMany({
    where: { type: "PRIMARY", active: true },
    include: { variants: { where: { active: true }, orderBy: { priceCents: "asc" } } },
    // Lowest price first; sortOrder only breaks ties so equal prices stay stable.
    orderBy: [{ priceCents: "asc" }, { sortOrder: "asc" }],
  });

  // Lowest price to highest, so the comparison table reads as a price ladder. Whether each price is
  // below, at the low end of, or inside its range is worked out from the numbers, never typed in.
  const comparable = await db.product.findMany({ where: { slug: { in: MARKET_ROWS.map((r) => r.slug) }, active: true } });
  const priceRows = compareRows(comparable.map((p) => ({ slug: p.slug, name: p.name, priceCents: p.priceCents })));
  const totals = totalsOf(priceRows);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-32">
        <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Service Selection</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">Choose a build. The agents take it from there.</h1>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            Every service enters the same automated production system: research, strategy, build, QA, and
            perception review before delivery.
          </p>
        </section>

        <SpecialsGrid className="pb-24" />

        <section id="pricing" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-28">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl text-ice">Your price, next to the market.</h2>
            <p className="mt-3 text-ice/50">
              Published 2026 price ranges for the same kind of work. Some of our starting prices are below the range and
              some sit at its low end. Each row says which.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gold/15">
            {priceRows.map((p, i) => {
              // Scale the whole bar to the market high so our price reads as a proportional sliver against the full range.
              const youPct = Math.max(1.5, (p.youCents / p.hiCents) * 100);
              const loPct = (p.loCents / p.hiCents) * 100;
              return (
                <div
                  key={p.slug}
                  className={`grid grid-cols-1 gap-3 p-5 sm:grid-cols-[1.5fr_0.8fr_1.7fr] sm:items-center ${i > 0 ? "border-t border-white/5" : ""}`}
                >
                  <div>
                    <p className="font-display text-lg text-ice">{p.name}</p>
                  </div>
                  <div className="font-display text-2xl text-gold">
                    {money(p.youCents)}
                    <span className="mt-1 block font-body text-[11px] font-semibold text-ice/40">from · Core</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3 text-xs text-ice/40">
                      <span>$0</span>
                      <span className="text-right">
                        Market {money(p.loCents)} to {money(p.hiCents)}: {p.label}
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-2.5 rounded-full bg-white/5">
                      <div className="absolute inset-y-0 rounded-full bg-white/10" style={{ left: `${loPct}%`, right: 0 }} title={`Market range: ${money(p.loCents)} to ${money(p.hiCents)}`} />
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-deep to-gold shadow-gold-glow"
                        style={{ width: `${youPct}%` }}
                        title={`Our price: ${money(p.youCents)}`}
                      />
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${p.standing.position === "below" ? "text-emerald-400/80" : "text-ice/60"}`}>{standingText(p.standing)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-ice/40">The gold bar is our starting price, drawn to the same scale as the market range beside it.</p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/10 to-white/[0.02] p-10 text-center">
            <p className="text-sm text-ice/60">Commission all {priceRows.length} of these builds, at their starting prices, for</p>
            <p className="my-3 font-display text-6xl text-transparent bg-clip-text bg-gradient-to-b from-champagne to-gold sm:text-7xl">{money(totals.youCents)}</p>
            <p className="text-sm text-ice/40">
              against {money(totals.floorCents)} at the low end of each market range, and {money(totals.ceilingCents)} at the high end
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ice/30">
            Ranges come from published 2026 price guides:{" "}
            {MARKET_ROWS.map((r, i) => (
              <span key={r.slug}>
                {i > 0 && ", "}
                <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">
                  {r.source.name}
                </a>
              </span>
            ))}
            . They are representative ranges for the same kind of deliverable from freelancers and agencies, not quotes. Our builds are made with AI tools, and what each one includes is listed on its card below.
          </p>
        </section>

        <section id="book" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-28">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Services</p>
            <h2 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
              Pick a service <span className="text-gradient-champagne italic">and a tier</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ice/50">
              Your agent team answers questions, tracks delivery, and handles checkout on the same production
              pipeline that runs every build.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.filter((p) => !CARD_DESIGN_SLUGS.includes(p.slug)).map((product) => (
              <ProductCard
                key={product.id}
                category={product.category}
                name={product.name}
                description={product.description}
                priceCents={product.priceCents}
                hasTiers={product.variants.length > 0}
                topTierCents={product.variants[product.variants.length - 1]?.priceCents}
                turnaround={product.turnaround}
                detail={<ScopePanel slug={product.slug} />}
                action={
                  <Suspense
                    fallback={
                      <Link href={`/checkout?product=${product.slug}`} className={CARD_CTA_CLASS}>
                        Reserve this build
                      </Link>
                    }
                  >
                    <ReserveLink slug={product.slug} />
                  </Suspense>
                }
              />
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-center text-ice/40">
                No services seeded yet. Run <code className="text-gold">npm run db:seed</code>.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
