import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroBackdrop } from "@/components/cinematic/HeroBackdrop";
import { PriceList } from "@/components/catalog/PriceList";
import { ProductFinder } from "@/components/home/ProductFinder";
import { SeoWordbank } from "@/components/home/SeoWordbank";
import { money } from "@/components/home/specialFrame";
import { TrackView } from "@/components/analytics/Track";
import { FaqSection } from "@/components/marketing/FaqSection";
import { AUDIT_FEE_CENTS, usd } from "@/lib/pricing/catalog";
import { LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config/site";
import { bnplEnabled } from "@/lib/payments/bnpl";
import { topFaqs } from "@/lib/site/faq";
import { getLivePrices } from "@/lib/site/livePrices";
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

// Same catalog/pricing data, cached and refreshed every 60s: a price or
// catalog change shows up within a minute with no redeploy, matching the
// revalidate strategy already used on /services.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [offer, prices] = await Promise.all([getOfferProduct(), getLivePrices()]);
  const offerCents = offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS;
  const price = money(offerCents);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ["Patient Profits", "The Digital Master"],
        url: SITE_URL,
        logo: `${SITE_URL}${LOGO_PATH}`,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Offer",
        name: "Website Special",
        description: "A custom one-page business website: mobile optimized, business-specific copy, basic SEO, deployed live, one revision, and 3 months of monthly maintenance.",
        price: (offerCents / 100).toFixed(2),
        priceCurrency: "USD",
        url: `${SITE_URL}${OFFER_CHECKOUT_HREF}`,
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main">
        {/* 1. Hero */}
        <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-obsidian pb-10 pt-20 sm:pb-0 sm:pt-24">
          {/* Glass layers and a glowing network, drawn live (no video), with a still of the same scene from first paint. */}
          <HeroBackdrop poster="/assets/hero/hero-poster.jpg" posterMobile="/assets/hero/hero-poster-mobile.jpg" deferMs={600} />
          {/* Keeps the headline easy to read over any frame. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold/80 sm:mb-6">Patient Creations</p>
            <h1 className="font-display text-[2.1rem] leading-tight text-ice min-[400px]:text-5xl sm:text-6xl md:text-7xl">
              Build Your Business. Get More Customers.{" "}
              <span className="text-gradient-champagne italic">Automate the Work.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ice/80 sm:mt-6 sm:text-lg">
              Patient Creations helps businesses launch, market, generate leads, and automate operations with websites,
              content, growth systems, and AI.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/audit"
                className="w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 sm:w-auto"
              >
                GET MY GROWTH AUDIT
              </Link>
              <Link
                href="#products"
                className="champagne-border w-full rounded-full px-8 py-4 text-sm tracking-wide text-champagne transition hover:bg-champagne/10 sm:w-auto"
              >
                SEE PRODUCTS AND PRICES
              </Link>
            </div>
            <p className="mt-4 text-sm text-ice/70">
              See what we found before you pay. The full audit is {usd(AUDIT_FEE_CENTS)}, credited toward your first order.
            </p>
            <p className="mt-2 text-sm text-ice/60">
              Just need a website? <Link href={OFFER_CHECKOUT_HREF} className="text-gold underline">Build it now for {price}.</Link>
            </p>
          </div>
        </section>

        {/* 2. Three questions, so a first-time visitor sees only the few things that fit them. */}
        <ProductFinder />

        {/* 3. Every product and price on one list, grouped, with a jump link to each group. */}
        <PriceList className="py-16" />

        {/* 4. The questions most people ask, with the rest one tap away. */}
        <div className="defer-offscreen">
          <FaqSection faqs={topFaqs({ bnpl: bnplEnabled(), prices })} />
          <p className="-mt-12 pb-8 text-center text-sm">
            <Link href="/faq" className="text-gold underline">
              See every question and answer
            </Link>
          </p>
        </div>

        {/* 5. Final call to action */}
        <section className="defer-offscreen mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl text-ice sm:text-4xl">
            Ready to look <span className="text-gradient-champagne italic">professional online?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            Order in a couple of minutes, fill in a short intake, and follow your project on a private page.
          </p>
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="mt-8 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
          >
            BUILD MY WEBSITE {price}
          </Link>
        </section>

        <div className="defer-offscreen">
          <SeoWordbank />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
