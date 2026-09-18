import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SeedCanvas } from "@/components/cinematic/SeedCanvas";
import { HowItWorks } from "@/components/cinematic/HowItWorks";
import { AdSpecial } from "@/components/home/AdSpecial";
import { NfcShowcase } from "@/components/home/NfcShowcase";
import { SeoWordbank } from "@/components/home/SeoWordbank";
import { SpecialPriceCard } from "@/components/home/SpecialPriceCard";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { businessDays } from "@/lib/payments/deliveryWindow";
import { LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config/site";

// Same catalog/pricing data, cached and refreshed every 60s — a price or
// catalog change shows up within a minute with no redeploy, matching the
// revalidate strategy already used on /services.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// The six flagship builds — the same lineup /services compares against the
// market. Displayed lowest price to highest, not DB sortOrder.
const FEATURED_SLUGS = ["site", "saas", "agents", "ad", "rental-listing-film", "lead-engine"];
const SPECIAL_SLUGS = [
  "starter-website",
  "cinematic-ad-special",
  "ugc-ad-special",
  "all-in-one-bundle",
  "strategy-session",
  "nfc-cards",
];

// Display-only "was" prices for the two website specials. What checkout
// actually charges is always the live database price, shown as the "now" price.
const STARTER_WAS_CENTS = 50000;
const SITE_WAS_CENTS = 500000;

// Plain-language taglines for this homepage teaser only — quick to read at a
// glance. The fuller, more detailed copy still lives on /services and at
// checkout for anyone already deciding between tiers.
const TAGLINES: Record<string, string> = {
  site: "A beautiful, professional website — built fast and easy for anyone to use.",
  saas: "A real app with logins, payments, and AI built right in.",
  agents: "A team of AI workers that get things done for you, automatically.",
  ad: "A short, scroll-stopping video ad made for social media.",
  "rental-listing-film": "A stunning video tour that gets your rental booked faster.",
  "lead-engine": "Finds new customers and sends them straight to you.",
};

export default async function HomePage() {
  const rows = await db.product.findMany({
    where: { slug: { in: [...FEATURED_SLUGS, ...SPECIAL_SLUGS] }, active: true },
  });
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .sort((a, b) => a.priceCents - b.priceCents);

  const starter = bySlug.get("starter-website");
  const siteProduct = bySlug.get("site");
  const regularAd = bySlug.get("ad");
  const cinAd = bySlug.get("cinematic-ad-special");
  const ugcAd = bySlug.get("ugc-ad-special");
  const consult = bySlug.get("strategy-session");
  const bundle = bySlug.get("all-in-one-bundle");
  const nfc = bySlug.get("nfc-cards");

  // Each special carries the price it's sorted by, so the grid always reads
  // lowest price to highest no matter which specials are active.
  const specials: { key: string; sortCents: number; node: ReactNode }[] = [];

  if (cinAd && ugcAd && consult) {
    specials.push({
      key: "ads",
      sortCents: Math.min(cinAd.priceCents, ugcAd.priceCents),
      node: (
        <AdSpecial
          cinematic={{
            slug: cinAd.slug,
            priceCents: cinAd.priceCents,
            wasCents: regularAd && regularAd.priceCents > cinAd.priceCents ? regularAd.priceCents : undefined,
          }}
          ugc={{ slug: ugcAd.slug, priceCents: ugcAd.priceCents }}
          consultation={{ slug: consult.slug, priceCents: consult.priceCents }}
        />
      ),
    });
  }

  if (starter && starter.priceCents < STARTER_WAS_CENTS) {
    specials.push({
      key: "starter",
      sortCents: starter.priceCents,
      node: (
        <SpecialPriceCard
          lead="Your website,"
          accent={`now ${money(starter.priceCents)}`}
          blurb={`A simple one-page website with your products, pictures, and descriptions. Live in ${businessDays(starter.turnaround ?? "3-5 days")}.`}
          wasCents={STARTER_WAS_CENTS}
          nowCents={starter.priceCents}
          href={`/checkout?product=${starter.slug}`}
          cta="Claim this special"
          footnote="Add a matching NFC card for just $45 at checkout."
        />
      ),
    });
  }

  if (bundle) {
    const separately =
      starter && cinAd && ugcAd && nfc
        ? starter.priceCents + 2 * cinAd.priceCents + 2 * ugcAd.priceCents + 3 * nfc.priceCents
        : undefined;
    specials.push({
      key: "bundle",
      sortCents: bundle.priceCents,
      node: (
        <SpecialPriceCard
          lead="The all-in-one"
          accent="launch bundle"
          blurb="Everything you need to launch, for one fixed price."
          items={["A Starter Website", "2 Cinematic Ads", "2 UGC Ads", "3 NFC cards of your choice"]}
          wasCents={separately && separately > bundle.priceCents ? separately : undefined}
          nowCents={bundle.priceCents}
          href={`/checkout?product=${bundle.slug}`}
          cta="Get the bundle"
          footnote="You pick your NFC card designs right after checkout."
        />
      ),
    });
  }

  if (siteProduct && siteProduct.priceCents < SITE_WAS_CENTS) {
    specials.push({
      key: "site",
      sortCents: siteProduct.priceCents,
      node: (
        <SpecialPriceCard
          lead="Cinematic AI Website,"
          accent={`now ${money(siteProduct.priceCents)}`}
          blurb={`A stunning, professional website built fast and easy for anyone to use. Live in ${businessDays(siteProduct.turnaround ?? "2-3 weeks")}.`}
          wasCents={SITE_WAS_CENTS}
          nowCents={siteProduct.priceCents}
          href={`/checkout?product=${siteProduct.slug}`}
          cta="Claim this special"
          footnote={`Includes ${siteProduct.revisionLimit} rounds of revisions.`}
        />
      ),
    });
  }

  specials.sort((a, b) => a.sortCents - b.sortCents);

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
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden bg-studio-radial pt-24">
          <SeedCanvas className="pointer-events-none absolute inset-0 h-full w-full" />
          <div className="relative mx-auto max-w-3xl px-6">
            <Link
              href="/services#pricing"
              className="champagne-border mb-6 inline-block rounded-full px-5 py-2 text-xs tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              Compare the pricing
            </Link>
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold/80">Patient Profits · Global</p>
            <p className="mb-3 font-display text-lg italic text-champagne/80">The Digital Master.</p>
            <h1 className="font-display text-5xl leading-tight text-ice sm:text-6xl md:text-7xl">
              The machine that <span className="text-gradient-champagne italic">builds your wealth</span>, built to order.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ice/60">
              Cinematic websites, software, and multi-agent systems. Agency quality at freelancer-floor pricing. A
              community of AI agents handles your questions, your timeline, and your checkout, so the work moves
              while you do.
            </p>
          </div>
        </section>

        {specials.length > 0 && (
          <section id="specials" className="mx-auto max-w-5xl scroll-mt-24 px-6 pt-16">
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Specials</p>
              <h2 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
                Current <span className="text-gradient-champagne italic">specials</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-ice/50">Every special below, lowest price first.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {specials.map((s) => (
                <div key={s.key} className="flex flex-col [&>*]:flex-1">
                  {s.node}
                </div>
              ))}
            </div>
          </section>
        )}

        {nfc && <NfcShowcase priceCents={nfc.priceCents} />}

        <section className="mx-auto max-w-6xl px-6 pb-8 pt-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Featured</p>
            <h2 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
              What <span className="text-gradient-champagne italic">We Build</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ice/50">
              Six builds, one production system. Every service enters the same automated pipeline: research,
              strategy, build, QA, and perception review before delivery.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.slug}
                href={`/checkout?product=${product.slug}`}
                className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:border-gold/40 hover:shadow-gold-glow"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_0%,rgba(224,196,138,0.18),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="relative z-10 flex flex-1 flex-col">
                  <p className="text-xs uppercase tracking-widest text-gold/60">{product.category}</p>
                  <h3 className="mt-2 font-display text-xl text-ice">{product.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-ice/50">{TAGLINES[product.slug] ?? product.description}</p>
                  <p className="mt-4 font-display text-2xl text-champagne">
                    {money(product.priceCents)}
                    <span className="ml-1 text-sm text-ice/40">from</span>
                  </p>
                  <span className="mt-4 text-sm text-gold transition group-hover:brightness-125">Reserve this build →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="text-sm text-gold hover:brightness-110">
              See every service &amp; compare pricing →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-28 text-center">
          <h2 className="font-display text-3xl text-ice sm:text-4xl">
            Build once. <span className="text-gradient-champagne">Own the machine.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            Every enquiry is handled by the agent community. See what a build costs against the market, or meet the
            fleet this same system already runs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/services#book"
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              Pick a service for building
            </Link>
          </div>
        </section>

        <section id="tour" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">How It Works</p>
            <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
              An automated production system, not a freelancer.
            </h2>
          </div>
          <HowItWorks />
          <div className="mt-16">
            <Link href="/guided-app-tour" className="text-sm text-gold hover:brightness-110">
              Take the full guided tour →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-16 pt-4 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#tour"
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              See how it works
            </Link>
            <Link
              href="/gallery"
              className="champagne-border rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              See the fleet
            </Link>
          </div>
        </section>

        <SeoWordbank />
      </main>
      <Link
        href="/services"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-gold px-4 py-2 text-xs font-semibold tracking-wide text-obsidian shadow-lg shadow-black/40 transition hover:brightness-110"
      >
        Products &amp; Services
      </Link>
      <SiteFooter />
    </>
  );
}
