import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroBackdrop } from "@/components/cinematic/HeroBackdrop";
import { ProductCard } from "@/components/catalog/ProductCard";
import { HomeTabs, type HomeTab } from "@/components/home/HomeTabs";
import { NfcShowcase } from "@/components/home/NfcShowcase";
import { SeoWordbank } from "@/components/home/SeoWordbank";
import { SpecialsGrid } from "@/components/home/SpecialsGrid";
import { CARD_CTA_CLASS, money } from "@/components/home/specialFrame";
import { TrackOnScreen, TrackView } from "@/components/analytics/Track";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { FaqSection } from "@/components/marketing/FaqSection";
import { GrowthLadder } from "@/components/marketing/GrowthLadder";
import { HowItWorksSimple } from "@/components/marketing/HowItWorksSimple";
import { IndustryGrid } from "@/components/marketing/IndustryGrid";
import { OfferCard } from "@/components/marketing/OfferCard";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { db } from "@/lib/db";
import { AUDIT_FEE_CENTS, usd } from "@/lib/pricing/catalog";
import { LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config/site";
import { OFFER_CHECKOUT_HREF, TRUST_ITEMS, getFaqs } from "@/lib/site/offer";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

// Same catalog/pricing data, cached and refreshed every 60s: a price or
// catalog change shows up within a minute with no redeploy, matching the
// revalidate strategy already used on /services.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// The six flagship builds, the same lineup /services compares against the
// market. Displayed lowest price to highest, not DB sortOrder.
const FEATURED_SLUGS = ["site", "saas", "agents", "ad", "rental-listing-film", "lead-engine"];

export default async function HomePage() {
  const [offer, rows] = await Promise.all([
    getOfferProduct(),
    db.product.findMany({
      where: { slug: { in: [...FEATURED_SLUGS, "nfc-cards"] }, active: true },
      include: { variants: { where: { active: true }, orderBy: { priceCents: "asc" } } },
    }),
  ]);
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .sort((a, b) => a.priceCents - b.priceCents);
  const nfc = bySlug.get("nfc-cards");
  const adsAndCreation = featured.filter((p) => p.slug === "ad" || p.slug === "rental-listing-film");
  const saasAndAgents = featured.filter((p) => p.slug === "saas" || p.slug === "agents" || p.slug === "lead-engine");

  const offerCents = offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS;
  const price = money(offerCents);

  const productCard = (product: (typeof featured)[number]) => (
    <ProductCard
      key={product.slug}
      category={product.category}
      name={product.name}
      description={product.description}
      priceCents={product.priceCents}
      hasTiers={product.variants.length > 0}
      topTierCents={product.variants[product.variants.length - 1]?.priceCents}
      turnaround={product.turnaround}
      action={
        <Link href={`/checkout?product=${product.slug}`} className={CARD_CTA_CLASS}>
          Reserve this build
        </Link>
      }
    />
  );

  const tabs: HomeTab[] = [
    {
      id: "websites",
      label: "Websites",
      blurb: "Get online, done for you",
      panel: (
        <div className="space-y-16 pb-16 pt-8">
          <div id="offer" className="scroll-mt-24">
            <TrackOnScreen event="offer_view">
              <OfferCard priceCents={offerCents} />
            </TrackOnScreen>
          </div>
          <SpecialsGrid exclude={["ads", "starter"]} heading="More website" />
          <CaseStudies />
          <section>
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Examples</p>
              <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
                One system, <span className="text-gradient-champagne italic">every kind of business.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-ice/50">
                Sample designs that show how a one-page site adapts to your industry. They&apos;re design concepts, not
                real customer results.
              </p>
            </div>
            <IndustryGrid />
            <div className="mt-10 text-center">
              <Link href="/examples" className="text-sm text-gold hover:brightness-110">
                See all examples →
              </Link>
            </div>
          </section>
          <HowItWorksSimple />
          <ProblemSection />
          <FaqSection faqs={getFaqs(price)} />
        </div>
      ),
    },
    {
      id: "business-cards",
      label: "Business Cards",
      blurb: "Tap-to-share smart cards",
      panel: (
        <div className="space-y-6 pb-16 pt-8 text-center">
          <p className="mx-auto max-w-xl text-ice/60">
            A tap opens your review page, menu, socials, or booking link. Pick a design below, or mix and match.
          </p>
          {nfc && <NfcShowcase priceCents={nfc.priceCents} />}
        </div>
      ),
    },
    {
      id: "ai-ads",
      label: "AI Creation & Ads",
      blurb: "Cinematic and UGC video",
      panel: (
        <div className="space-y-16 pb-16 pt-8">
          <p className="mx-auto max-w-xl text-center text-ice/60">
            Scroll-stopping video ads, made with AI: cinematic, creator-style (UGC), or a rental listing film, priced
            per ad. A fresh batch every month if you want it on autopilot.
          </p>
          <SpecialsGrid exclude={["starter", "bundle", "site"]} heading="Ad" />
          {adsAndCreation.length > 0 && (
            <section>
              <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Bigger builds</p>
                <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
                  Flagship <span className="text-gradient-champagne italic">video work.</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{adsAndCreation.map(productCard)}</div>
            </section>
          )}
          <section className="glass-panel mx-auto max-w-2xl rounded-2xl p-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">On autopilot</p>
            <h2 className="mt-3 font-display text-2xl text-ice">Monthly Ads</h2>
            <p className="mt-2 text-sm text-ice/60">A fresh batch of ads every month. Cancel any time.</p>
            <Link href="/monthly-ads" className={`mt-5 inline-block ${CARD_CTA_CLASS}`}>
              See the plans
            </Link>
          </section>
        </div>
      ),
    },
    {
      id: "saas-agents",
      label: "SaaS & Creation Agents",
      blurb: "Software and AI agent teams",
      panel: (
        <div className="space-y-16 pb-16 pt-8">
          <p className="mx-auto max-w-xl text-center text-ice/60">
            Your idea turned into a working app, or a team of AI agents that work the repeat tasks in your business.
            Every build starts scoped on a call, so we build the right thing the first time.
          </p>
          {saasAndAgents.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{saasAndAgents.map(productCard)}</div>
          )}
          <section className="glass-panel mx-auto max-w-2xl rounded-2xl p-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Not sure what you need?</p>
            <h2 className="mt-3 font-display text-2xl text-ice">Start with a Strategy Session</h2>
            <p className="mt-2 text-sm text-ice/60">
              A live call to scope the right build before you commit. The fee is credited toward the project.
            </p>
            <Link href="/checkout?product=strategy-session" className={`mt-5 inline-block ${CARD_CTA_CLASS}`}>
              Book a Strategy Session
            </Link>
          </section>
        </div>
      ),
    },
  ];

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
                href="/services"
                className="champagne-border w-full rounded-full px-8 py-4 text-sm tracking-wide text-champagne transition hover:bg-champagne/10 sm:w-auto"
              >
                EXPLORE SERVICES
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

        {/* 2. Trust row */}
        <section aria-label="What you get" className="border-y border-white/5 bg-white/[0.02]">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 text-sm text-ice/70">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden className="text-gold">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Four bar tabs: everything below is grouped under one of these, so nothing is a long, undifferentiated scroll. */}
        <HomeTabs tabs={tabs} />

        {/* 4. What comes after: shared across every tab, so it isn't repeated four times. */}
        <div className="defer-offscreen border-t border-white/5">
          <GrowthLadder />
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
