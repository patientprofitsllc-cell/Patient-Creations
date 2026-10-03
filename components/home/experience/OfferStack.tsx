import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { BUNDLE_PARTS, PRICE_CENTS, SPECIAL_CARE_MONTHS, bundleSeparatelyCents, usd, type PricedSlug } from "@/lib/pricing/catalog";
import type { LivePrices } from "@/lib/site/faq";

/**
 * The All-in-One bundle, as the concept site's tan card: the parts, the bundle price, and the real saving counting up.
 * Every number is the live price of a product you can buy on its own, so the crossed-out total is true. Hidden when the
 * bundle isn't actually cheaper.
 */
export function OfferStack({ prices }: { prices: LivePrices }) {
  const c = (slug: PricedSlug) => prices[slug] ?? PRICE_CENTS[slug];
  const lines = [
    { label: "Website Special", sub: `Your one-page website + ${SPECIAL_CARE_MONTHS} months of maintenance`, qty: 1 },
    { label: "Cinematic Ads", sub: "Bring a film-style feel to your brand", qty: BUNDLE_PARTS.cinematicAds },
    { label: "UGC Ads", sub: "Creator-style content, powered by AI", qty: BUNDLE_PARTS.ugcAds },
    { label: "Business Cards", sub: "Your choice of tap-to-share designs", qty: BUNDLE_PARTS.cards },
  ];
  const separately = bundleSeparatelyCents({ website: c("website-special"), cinematicAd: c("cinematic-ad-special"), ugcAd: c("ugc-ad-special"), card: c("nfc-cards") });
  const bundle = c("all-in-one-bundle");
  const saving = separately - bundle;
  if (saving <= 0) return null;

  return (
    <section id="bundle" aria-labelledby="bundle-title" className="mx-auto max-w-6xl scroll-mt-24 px-5 sm:px-6">
      <Reveal effect="scale">
        <div className="grid gap-10 overflow-hidden rounded-3xl bg-pc-tan p-7 text-pc-ink sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-ink/70">The All-in-One Launch Bundle</p>
            <h2 id="bundle-title" className="mt-6 text-[3.2rem] leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Your launch.
              <br />
              <i className="font-accent text-[1.12em]">Fully loaded.</i>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-snug text-pc-ink/70">
              A new website. Ads to introduce it. Business cards that keep the connection going.
            </p>
            <p className="mt-8 text-6xl font-light tracking-[-0.04em]">{usd(bundle)}</p>
            <p className="text-pc-ink/70">one complete bundle</p>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-pc-ink/60">
                Bought one by one <s className="decoration-pc-ink/60">{usd(separately)}</s>
              </span>
              <span className="rounded-full bg-pc-ink px-3 py-1 font-semibold text-pc-sand">
                You save <CountUp cents={saving} />
              </span>
            </p>
            <Link
              href="/checkout?product=all-in-one-bundle"
              className="mt-8 inline-flex min-h-[60px] items-center gap-3 rounded-xl bg-pc-ink px-8 text-base font-semibold text-pc-cream transition hover:bg-black active:scale-[0.98]"
            >
              Build my launch bundle <span aria-hidden>→</span>
            </Link>
          </div>

          <div>
            <Stagger className="space-y-3" step={110} effect="right">
              {lines.map((l, i) => (
                <div key={l.label} className="flex items-center gap-4 rounded-xl border border-pc-ink/10 bg-[#e6d3b0]/70 px-5 py-4">
                  <span className="text-xs text-pc-ink/50">0{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-lg">{l.label}</p>
                    <p className="text-xs text-pc-ink/60">{l.sub}</p>
                  </div>
                  <span className="text-2xl font-light">{l.qty}×</span>
                </div>
              ))}
            </Stagger>
            <p className="mt-5 text-center text-sm text-pc-ink/60">One connected start for your next chapter. Pick your card designs right after checkout.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
