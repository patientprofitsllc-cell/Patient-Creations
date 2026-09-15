import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const PRICING = [
  { svc: "Cinematic Website", note: "single fast build", you: 200000, lo: 600000, hi: 3500000, src: "agency $6k–$35k+" },
  { svc: "AI Software / App", note: "accounts, billing, AI", you: 400000, lo: 1500000, hi: 15000000, src: "MVP $15k–$150k" },
  { svc: "Multi-Agent System", note: "orchestrator, dashboard", you: 600000, lo: 3000000, hi: 12000000, src: "AI build $30k–$120k" },
  { svc: "Cinematic Ad", note: "master plus cutdowns", you: 50000, lo: 150000, hi: 1500000, src: "short-form $1.5k–$15k" },
  { svc: "Rental Listing Film", note: "film and copy", you: 50000, lo: 100000, hi: 500000, src: "social video $1k–$5k" },
  { svc: "Lead Engine", note: "sourcing and scoring", you: 170000, lo: 250000, hi: 1500000, src: "retainer $1.25k–$5k/mo" },
];
const MACHINE_TOTAL = PRICING.reduce((s, p) => s + p.you, 0);
const FLOOR_TOTAL = PRICING.reduce((s, p) => s + p.lo, 0);

export default async function ServicesPage({ searchParams }: { searchParams: { ref?: string } }) {
  const products = await db.product.findMany({
    where: { type: "PRIMARY", active: true },
    include: { variants: { where: { active: true }, orderBy: { priceCents: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  const refSuffix = searchParams.ref ? `&ref=${encodeURIComponent(searchParams.ref)}` : "";

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

        <section id="pricing" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-28">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl text-ice">Your price, next to the market.</h2>
            <p className="mt-3 text-ice/50">
              Real 2026 benchmarks for the same deliverables, from published freelance and agency pricing guides.
              Every build lands at or below the low end of the market.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gold/15">
            {PRICING.map((p, i) => {
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
                    <p className="text-sm text-ice/40">{p.note}</p>
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
                      {save}% below the market floor — {money(dollarsSaved)} less than the cheapest published quote
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-ice/40">
            The gold bar is your price, drawn to the same scale as the market range beside it — see how little of the
            chart it actually fills.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/10 to-white/[0.02] p-10 text-center">
            <p className="text-sm text-ice/60">Commission the whole machine — all six builds — for</p>
            <p className="my-3 font-display text-6xl text-transparent bg-clip-text bg-gradient-to-b from-champagne to-gold sm:text-7xl">
              {money(MACHINE_TOTAL)}
            </p>
            <p className="text-sm text-ice/40">
              against <s>{money(FLOOR_TOTAL)}</s> at the cheapest freelancer, or <s>$198,000</s> mid-market
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
              project-management layers to fund — a community of agents carries the comms, delivery, and sales that
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
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl text-ice">Pick a service and a tier.</h2>
            <p className="mt-3 text-ice/50">
              Your agent team answers questions, tracks delivery, and handles checkout on the same production
              pipeline that runs every build.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="glass-panel flex flex-col rounded-2xl p-8">
                <p className="text-xs uppercase tracking-widest text-gold/60">{product.category}</p>
                <h3 className="mt-3 font-display text-2xl text-ice">{product.name}</h3>
                <p className="mt-3 flex-1 text-sm text-ice/50">{product.description}</p>
                {product.turnaround && <p className="mt-3 text-xs text-ice/30">Turnaround: {product.turnaround}</p>}
                <p className="mt-6 font-display text-3xl text-champagne">
                  {money(product.priceCents)}
                  {product.variants.length > 0 && <span className="ml-1 text-sm text-ice/40">from</span>}
                </p>
                {product.variants.length > 0 && (
                  <p className="mt-1 text-xs text-ice/30">
                    Signature and Flagship tiers available up to {money(product.variants[product.variants.length - 1].priceCents)}
                  </p>
                )}
                <Link
                  href={`/checkout?product=${product.slug}${refSuffix}`}
                  className="mt-6 rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-center text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
                >
                  Reserve this build
                </Link>
              </div>
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-center text-ice/40">
                No services seeded yet — run <code className="text-gold">npm run db:seed</code>.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
