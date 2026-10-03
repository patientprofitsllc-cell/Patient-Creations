import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { HowItWorksSimple } from "@/components/marketing/HowItWorksSimple";
import { StickyCta } from "@/components/home/StickyCta";
import { OfferStack } from "@/components/home/experience/OfferStack";
import { Proof } from "@/components/home/experience/Proof";
import { TrustRow } from "@/components/home/experience/TrustRow";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Marquee } from "@/components/motion/Marquee";
import { MotionReady } from "@/components/motion/MotionReady";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { WordRise } from "@/components/motion/WordRise";
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
  const bnpl = bnplEnabled();
  const revisions = offer?.revisionLimit ?? 1;
  // A strip of what we make, named as on the price list. Plain words, no links, so the repeat is harmless.
  const making = ["Websites", "UGC Ads", "Cinematic Ads", "Business Cards", "Rental Listing Films", "Lead Engines", "Payments Setup", "AI Agents", "Custom Software", "Monthly Ads"];

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
      <MotionReady />
      <ScrollProgress />
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main">
        {/* 1. Hero: one promise, one main button (the Website Special at its live price), the Growth Audit second. */}
        <section id="hero" className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-obsidian pb-10 pt-20 sm:pb-0 sm:pt-24">
          {/* Glass layers and a glowing network, drawn live (no video), with a still of the same scene from first paint. */}
          <HeroBackdrop poster="/assets/hero/hero-poster.jpg" posterMobile="/assets/hero/hero-poster-mobile.jpg" deferMs={600} />
          {/* Keeps the headline easy to read over any frame. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
          <ParallaxLayer speed={0.18} fade className="relative mx-auto max-w-4xl px-6 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold/80 sm:mb-6">Patient Creations</p>
            <h1 className="font-display text-[2.1rem] leading-tight text-ice min-[400px]:text-5xl sm:text-6xl md:text-7xl">
              <WordRise text="Build Your Business. Get More Customers. Automate the Work." shimmer={["Automate", "Work"]} />
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ice/80 sm:mt-6 sm:text-lg">
              Patient Creations helps businesses launch, market, generate leads, and automate operations with websites,
              content, growth systems, and AI.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <MagneticButton href={OFFER_CHECKOUT_HREF} cta="hero-website-special" className="w-full sm:w-auto">
                BUILD MY WEBSITE {price}
              </MagneticButton>
              <MagneticButton href="/audit" cta="hero-growth-audit" variant="ghost" className="w-full text-sm sm:w-auto">
                GET MY GROWTH AUDIT
              </MagneticButton>
            </div>
            <p className="mt-4 text-sm text-ice/70">
              A one-page website, live in about 72 hours, with a private preview first. Not sure what you need? The Growth Audit is{" "}
              {usd(AUDIT_FEE_CENTS)}, credited toward your first order.
            </p>
            <p className="mt-2 text-sm text-ice/60">
              Need more than a website? <Link href="#products" className="text-gold underline">See products and prices.</Link>
            </p>
          </ParallaxLayer>
        </section>

        {/* 2. What we make, drifting past. */}
        <Marquee
          className="border-t border-white/5 py-5 text-sm uppercase tracking-[0.3em] text-ice/40"
          items={making.map((m) => (
            <span key={m} className="whitespace-nowrap">
              <span aria-hidden className="mr-10 text-gold/60">✦</span>
              {m}
            </span>
          ))}
        />

        {/* 3. Why it's safe to start: true promises only. */}
        <TrustRow revisionsWebsiteSpecial={revisions} bnpl={bnpl} />

        {/* 4. Three questions, so a first-time visitor sees only the few things that fit them. */}
        <Reveal>
          <ProductFinder />
        </Reveal>

        {/* 5. The bundle, each part at its real price, and the real saving. */}
        <OfferStack prices={prices} />

        {/* 6. Proof, shown only once real reviews and case studies exist. */}
        <Proof />
        <CaseStudies />

        {/* 7. How it works. */}
        <Reveal className="defer-offscreen">
          <HowItWorksSimple />
        </Reveal>

        {/* 8. Every product and price on one list, grouped, with a jump link to each group. */}
        <PriceList className="py-16" />

        {/* 9. The questions most people ask, with the rest one tap away. */}
        <div className="defer-offscreen">
          <FaqSection faqs={topFaqs({ bnpl, prices })} />
          <p className="-mt-12 pb-8 text-center text-sm">
            <Link href="/faq" className="text-gold underline">
              See every question and answer
            </Link>
          </p>
        </div>

        {/* 10. Final call to action. */}
        <section id="final-cta" className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <div aria-hidden className="absolute inset-x-10 top-1/2 -z-10 h-48 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
          <Reveal effect="scale">
            <h2 className="font-display text-4xl text-ice sm:text-5xl">
              Ready to look <span className="text-shimmer italic">professional online?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ice/60">
              Order in a couple of minutes, fill in a short intake, and follow your project on a private page.
            </p>
            <MagneticButton href={OFFER_CHECKOUT_HREF} cta="final-website-special" className="mt-8">
              BUILD MY WEBSITE {price}
            </MagneticButton>
            <p className="mt-4 text-sm text-ice/50">
              Or <Link href="/audit" className="text-gold underline">start with a Growth Audit</Link>.
            </p>
          </Reveal>
        </section>

        <div className="defer-offscreen">
          <SeoWordbank />
        </div>
      </main>
      <StickyCta label="Website Special" price={price} href={OFFER_CHECKOUT_HREF} />
      <SiteFooter />
    </>
  );
}
