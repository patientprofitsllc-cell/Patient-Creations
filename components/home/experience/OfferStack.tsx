import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { BUNDLE_PARTS, PRICE_CENTS, SPECIAL_CARE_MONTHS, bundleSeparatelyCents, usd, type PricedSlug } from "@/lib/pricing/catalog";
import type { LivePrices } from "@/lib/site/faq";

/**
 * The All-in-One bundle as an offer stack: each part at its real price, the real total crossed out, the bundle price,
 * and the saving counting up. Every number is the live price of a product you can buy on its own, so the anchor is true.
 * Hidden when the bundle isn't actually cheaper.
 */
export function OfferStack({ prices }: { prices: LivePrices }) {
  const c = (slug: PricedSlug) => prices[slug] ?? PRICE_CENTS[slug];
  const lines = [
    { label: `Website Special, with ${SPECIAL_CARE_MONTHS} months of care`, qty: 1, each: c("website-special") },
    { label: "Cinematic Ads", qty: BUNDLE_PARTS.cinematicAds, each: c("cinematic-ad-special") },
    { label: "UGC Ads, 3 hooks each", qty: BUNDLE_PARTS.ugcAds, each: c("ugc-ad-special") },
    { label: "Business Cards of your choice", qty: BUNDLE_PARTS.cards, each: c("nfc-cards") },
  ];
  const separately = bundleSeparatelyCents({ website: c("website-special"), cinematicAd: c("cinematic-ad-special"), ugcAd: c("ugc-ad-special"), card: c("nfc-cards") });
  const bundle = c("all-in-one-bundle");
  const saving = separately - bundle;
  if (saving <= 0) return null;

  return (
    <section id="bundle" aria-labelledby="bundle-title" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-20 sm:px-6">
      <Reveal className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Launch everything at once</p>
        <h2 id="bundle-title" className="mt-3 font-display text-4xl text-ice sm:text-5xl">
          The All-in-One <span className="text-shimmer italic">Launch Bundle</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ice/60">A website, {BUNDLE_PARTS.cinematicAds + BUNDLE_PARTS.ugcAds} video ads, and Business Cards to hand out. One order, one price.</p>
      </Reveal>

      <div className="mt-10 grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <Stagger className="space-y-3" step={110} effect="left">
          {lines.map((l) => (
            <div key={l.label} className="glass-panel flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
              <p className="text-ice">
                <span className="mr-2 font-display text-xl text-gold">{l.qty}×</span>
                {l.label}
              </p>
              <p className="whitespace-nowrap text-sm text-ice/60">{usd(l.each * l.qty)}</p>
            </div>
          ))}
        </Stagger>

        <Reveal effect="scale" delay={250}>
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent p-8 text-center shadow-gold-glow">
            <p className="text-sm text-ice/50">Bought one by one</p>
            <p className="mt-1 font-display text-2xl text-ice/40 line-through decoration-gold/70">{usd(separately)}</p>
            <p className="mt-4 text-sm text-ice/60">As one bundle</p>
            <p className="font-display text-6xl text-champagne">{usd(bundle)}</p>
            <p className="mt-3 inline-block rounded-full bg-emerald-400/10 px-4 py-1 text-sm font-semibold text-emerald-300">
              You save <CountUp cents={saving} />
            </p>
            <Link
              href="/checkout?product=all-in-one-bundle"
              className="cta-primary mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 font-semibold text-obsidian transition hover:brightness-110 active:scale-[0.97]"
            >
              Get the bundle →
            </Link>
            <p className="mt-3 text-xs text-ice/40">Pick your card designs right after checkout.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
