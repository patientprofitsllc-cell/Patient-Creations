import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { StickyCta } from "@/components/home/StickyCta";
import { OfferStack } from "@/components/home/experience/OfferStack";
import { Proof } from "@/components/home/experience/Proof";
import { TrustRow } from "@/components/home/experience/TrustRow";
import { FindYourMove } from "@/components/home/experience/FindYourMove";
import { BiggerPicture, IdeaToOnline, Reimagined, SectionHead } from "@/components/home/experience/Sections";
import { Showcase } from "@/components/home/experience/Showcase";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { PauseMotion } from "@/components/motion/PauseMotion";
import { WordRise } from "@/components/motion/WordRise";
import { Marquee } from "@/components/motion/Marquee";
import { MotionReady } from "@/components/motion/MotionReady";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroBackdrop } from "@/components/cinematic/HeroBackdrop";
import { SeoWordbank } from "@/components/home/SeoWordbank";
import { money } from "@/components/home/specialFrame";
import { TrackView } from "@/components/analytics/Track";
import { FaqSection } from "@/components/marketing/FaqSection";
import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, PRICE_CENTS, SPECIAL_CARE_MONTHS, usd, type PricedSlug } from "@/lib/pricing/catalog";
import { INDUSTRIES } from "@/lib/site/industries";
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
  const live = (slug: PricedSlug) => money(prices[slug] ?? PRICE_CENTS[slug]);
  // The gold band: what we make, in plain words (no links, so the repeat that makes the loop is harmless).
  const making = ["Websites", "AI Video Ads", "Smart Business Cards", "Cinematic Films", "Lead Engines", "AI Agents", "Custom Software", "Monthly Ads"];

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
      <main id="main" className="overflow-x-clip bg-pc-bg text-pc-cream">
        {/* 1. Hero: the promise, two buttons, and a look inside. */}
        <section id="hero" className="relative isolate overflow-hidden pb-16 pt-28 sm:pt-36">
          {/* The live network, dimmed into a starfield behind the headline. */}
          <HeroBackdrop poster="/assets/hero/hero-poster.jpg" posterMobile="/assets/hero/hero-poster-mobile.jpg" deferMs={600} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-pc-bg/85 via-pc-bg/80 to-pc-bg" />
          <div aria-hidden className="pc-glow absolute left-1/2 top-24 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-pc-sand/10 blur-[110px]" />
          <ParallaxLayer speed={0.12} fade className="relative mx-auto max-w-3xl px-5 text-center sm:px-6">
            <p className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-pc-sand min-[400px]:text-xs sm:tracking-[0.22em]">
              <span aria-hidden className="mr-3">✦</span>Creative thinking. Intelligent systems.
            </p>
            <h1 className="mt-7 text-[2.9rem] font-light leading-[1.02] tracking-[-0.045em] min-[400px]:text-[3.3rem] sm:text-7xl">
              <WordRise text="Built to stand out." />
              <br />
              <span className="text-pc-sand">
                <WordRise text="Made to move you forward." shimmer={["forward"]} />
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-pc-mute">
              Cinematic websites. Content that gets noticed. AI that gets to work. Everything your business needs for its next chapter.
            </p>
            <div className="mt-9 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mx-auto sm:max-w-lg">
              <MagneticButton href="#products" cta="hero-find-your-move" variant="sand">
                Find your next move
              </MagneticButton>
              <MagneticButton href="#experience" cta="hero-explore" variant="outline">
                Explore the experience
              </MagneticButton>
            </div>
            <p className="mt-6 text-sm text-pc-mute">Your business. Your brand. Built around you.</p>
          </ParallaxLayer>
          <div className="relative px-5 sm:px-6">
            <Showcase
              prices={{
                websiteSpecial: price,
                ugcAd: live("ugc-ad-special"),
                cinematicAd: live("cinematic-ad-special"),
                monthlyAds: live("ads-monthly-300"),
                careMonths: SPECIAL_CARE_MONTHS,
              }}
            />
          </div>
        </section>

        {/* 2. The gold band. */}
        <Marquee
          className="bg-pc-sand py-5 text-lg uppercase tracking-tight text-pc-ink sm:text-xl"
          seconds={30}
          items={making.map((m) => (
            <span key={m} className="whitespace-nowrap">
              <span aria-hidden className="mr-10">✦</span>
              {m}
            </span>
          ))}
        />

        {/* 3. Why it's safe to start: true promises only. */}
        <TrustRow revisionsWebsiteSpecial={revisions} bnpl={bnpl} />

        {/* 4. One creative partner, and what we build. */}
        <BiggerPicture websiteFrom={price} adFrom={live("ugc-ad-special")} />

        {/* 5. Sample designs, labeled as concepts. */}
        <Reimagined industryCount={INDUSTRIES.length} />

        {/* 6. Every product at its live price, a tab per group, and the Growth Audit for anyone unsure. */}
        <FindYourMove />

        {/* 7. The bundle: each part, the real one-by-one total, and the saving. */}
        <OfferStack prices={prices} />

        {/* 8. From idea to online. */}
        <IdeaToOnline careMonths={SPECIAL_CARE_MONTHS} />

        {/* 9. Proof, shown only once real reviews and case studies exist. */}
        <Proof />
        <CaseStudies />

        {/* 10. The questions most people ask, with the rest one tap away. */}
        <div className="defer-offscreen">
          <FaqSection faqs={topFaqs({ bnpl, prices })} />
          <p className="-mt-12 pb-8 text-center text-sm">
            <Link href="/faq" className="text-pc-sand underline">
              See every question and answer
            </Link>
          </p>
        </div>

        {/* 11. Final call to action. */}
        <section id="final-cta" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
          <div aria-hidden className="pc-glow absolute left-1/4 top-1/3 -z-10 h-64 w-2/3 rounded-full bg-pc-sand/10 blur-3xl" />
          <SectionHead label="05 / Your next chapter" line1="Ready when you are." line2="Let's build what's next.">
            Order in a couple of minutes, fill in a short intake, and follow your project on a private page.
          </SectionHead>
          <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <MagneticButton href={OFFER_CHECKOUT_HREF} cta="final-website-special" variant="sand">
              Start a project · {price}
            </MagneticButton>
            <MagneticButton href="/audit" cta="final-growth-audit" variant="outline">
              Get my growth audit
            </MagneticButton>
          </Reveal>
          <ul className="mt-6 space-y-1.5 text-sm text-pc-mute">
            <li className="flex gap-2">
              <span aria-hidden className="text-pc-sand">•</span>The Growth Audit helps you choose what to do first.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-pc-sand">•</span>
              {usd(AUDIT_FEE_CENTS)}, credited toward your first order within {AUDIT_CREDIT_DAYS} days.
            </li>
          </ul>
        </section>

        <div className="defer-offscreen">
          <SeoWordbank />
        </div>
      </main>
      <PauseMotion />
      <StickyCta label="Website Special" price={price} href={OFFER_CHECKOUT_HREF} />
      <SiteFooter />
    </>
  );
}
