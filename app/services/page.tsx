import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { ReserveLink } from "@/components/services/ReserveLink";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SpecialsGrid } from "@/components/home/SpecialsGrid";
import { CARD_CTA_CLASS, money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";

// Market benchmarks for the six flagship builds. `you` and the name are only
// fallbacks: the table reads both from the live product rows, so it always
// matches the cards and the specials.
const PRICING = [
  { slug: "site", svc: "Cinematic AI Website", you: 200000, lo: 600000, hi: 3500000, src: "agency $6k–$35k+" },
  { slug: "saas", svc: "AI Software / App", you: 400000, lo: 1500000, hi: 15000000, src: "MVP $15k–$150k" },
  { slug: "agents", svc: "Multi-Agent System", you: 600000, lo: 3000000, hi: 12000000, src: "AI build $30k–$120k" },
  { slug: "ad", svc: "Cinematic Ad", you: 50000, lo: 150000, hi: 1500000, src: "short-form $1.5k–$15k" },
  { slug: "rental-listing-film", svc: "Rental Listing Film", you: 50000, lo: 100000, hi: 500000, src: "social video $1k–$5k" },
  { slug: "lead-engine", svc: "Lead Engine", you: 170000, lo: 250000, hi: 1500000, src: "retainer $1.25k–$5k/mo" },
];

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

  // Lowest price to highest, so the comparison table reads as a price ladder.
  const priceRows = PRICING.map((p) => {
    const live = products.find((x) => x.slug === p.slug);
    return { ...p, svc: live?.name ?? p.svc, you: live?.priceCents ?? p.you };
  }).sort((a, b) => a.you - b.you);
  const machineTotal = priceRows.reduce((s, p) => s + p.you, 0);
  const floorTotal = priceRows.reduce((s, p) => s + p.lo, 0);

  return (
    <>
      <SiteHeader />
      <main className="pt-32">
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
              Real 2026 benchmarks for the same deliverables, from published freelance and agency pricing guides.
              Every build lands at or below the low end of the market.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gold/15">
            {priceRows.map((p, i) => {
              const save = Math.round((1 - p.you / p.lo) * 100);
              const dollarsSaved = p.lo - p.you;
              // Scale the whole bar to the market high so "your price" reads
              // as a real, proportional sliver against the full range —
              // rather than a marker clamped to one edge of just [lo, hi].
              const youPct = Math.max(1.5, (p.you / p.hi) * 100);
              const loPct = (p.lo / p.hi) * 100;
              return (
                <div
                  key={p.svc}
                  className={`grid grid-cols-1 gap-3 p-5 sm:grid-cols-[1.5fr_0.8fr_1.7fr] sm:items-center ${i > 0 ? "border-t border-white/5" : ""}`}
                >
                  <div>
                    <p className="font-display text-lg text-ice">{p.svc}</p>
                  </div>
                  <div className="font-display text-2xl text-gold">
                    {money(p.you)}
                    <span className="mt-1 block font-body text-[11px] font-semibold text-ice/40">from · Core</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs text-ice/40">
                      <span>$0</span>
                      <span>
                        Market {money(p.lo)}–{money(p.hi)} · {p.src}
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-2.5 rounded-full bg-white/5">
                      {/* market range: the published low-to-high quote, as a share of the same scale */}
                      <div
                        className="absolute inset-y-0 rounded-full bg-white/10"
                        style={{ left: `${loPct}%`, right: 0 }}
                        title={`Market range: ${money(p.lo)}–${money(p.hi)}`}
                      />
                      {/* your price: a real proportional sliver against that same market scale */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-deep to-gold shadow-gold-glow"
                        style={{ width: `${youPct}%` }}
                        title={`Your price: ${money(p.you)}`}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-emerald-400/80">
                      {save}% below the market floor, {money(dollarsSaved)} less than the cheapest published quote
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-ice/40">
            The gold bar is your price, drawn to the same scale as the market range beside it. See how little of the
            chart it actually fills.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/10 to-white/[0.02] p-10 text-center">
            <p className="text-sm text-ice/60">Commission the whole machine, all six builds, for</p>
            <p className="my-3 font-display text-6xl text-transparent bg-clip-text bg-gradient-to-b from-champagne to-gold sm:text-7xl">
              {money(machineTotal)}
            </p>
            <p className="text-sm text-ice/40">
              against <s>{money(floorTotal)}</s> at the cheapest freelancer, or <s>$198,000</s> mid-market
            </p>
            <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["~49%", "Below the market floor"],
                ["$36k+", "Saved vs. freelancers"],
                ["$178k+", "Saved vs. agencies"],
                ["40–60%", "Faster to ship"],
              ].map(([big, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-display text-2xl text-gold">{big}</p>
                  <p className="mt-1 text-xs text-ice/40">{label}</p>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-xl text-sm text-ice/50">
              Agency-grade work at freelancer-floor prices, in half the time. There are no account managers or
              project-management layers to fund. A community of agents carries the comms, delivery, and sales that
              normally pad an agency invoice.
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ice/30">
            Ranges from published 2026 pricing guides (Fiverr, Elegant Themes, RipeMedia, Bookipi, ParallelLoop,
            Bolder Apps, Vidico, D-MAK, LYFE Marketing). These are representative market ranges, not quotes from
            named individuals; the Core tier is compared on deliverable, and real scope varies by project.
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
            {products.map((product) => (
              <ProductCard
                key={product.id}
                category={product.category}
                name={product.name}
                description={product.description}
                priceCents={product.priceCents}
                hasTiers={product.variants.length > 0}
                topTierCents={product.variants[product.variants.length - 1]?.priceCents}
                turnaround={product.turnaround}
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
