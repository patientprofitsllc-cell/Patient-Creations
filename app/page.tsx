import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SeedCanvas } from "@/components/cinematic/SeedCanvas";
import { HowItWorks } from "@/components/cinematic/HowItWorks";
import { ProductCard } from "@/components/catalog/ProductCard";
import { NfcShowcase } from "@/components/home/NfcShowcase";
import { SeoWordbank } from "@/components/home/SeoWordbank";
import { SpecialsGrid } from "@/components/home/SpecialsGrid";
import { CARD_CTA_CLASS } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config/site";

// Same catalog/pricing data, cached and refreshed every 60s — a price or
// catalog change shows up within a minute with no redeploy, matching the
// revalidate strategy already used on /services.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// The six flagship builds — the same lineup /services compares against the
// market. Displayed lowest price to highest, not DB sortOrder.
const FEATURED_SLUGS = ["site", "saas", "agents", "ad", "rental-listing-film", "lead-engine"];

export default async function HomePage() {
  const rows = await db.product.findMany({
    where: { slug: { in: [...FEATURED_SLUGS, "nfc-cards"] }, active: true },
    include: { variants: { where: { active: true }, orderBy: { priceCents: "asc" } } },
  });
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .sort((a, b) => a.priceCents - b.priceCents);
  const nfc = bySlug.get("nfc-cards");

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

        <SpecialsGrid />

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
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
