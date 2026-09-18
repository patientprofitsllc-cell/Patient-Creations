import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { FaqSection } from "@/components/marketing/FaqSection";
import { OfferCard } from "@/components/marketing/OfferCard";
import { money } from "@/components/home/specialFrame";
import { INDUSTRIES, getIndustry } from "@/lib/site/industries";
import { OFFER_CHECKOUT_HREF, getFaqs } from "@/lib/site/offer";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

export const revalidate = 60;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: { industry: string } }): Promise<Metadata> {
  const industry = getIndustry(params.industry);
  if (!industry) return {};
  const offer = await getOfferProduct();
  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);
  return {
    title: `Website for a ${industry.singular}, ${price}`,
    description: `A professional, mobile-ready one-page website for your ${industry.singular}: services, contact details, and a clear call to action. ${price}, with one revision included.`,
    alternates: { canonical: `/websites/${industry.slug}` },
  };
}

export default async function IndustryLandingPage({ params }: { params: { industry: string } }) {
  const industry = getIndustry(params.industry);
  if (!industry) notFound();
  const offer = await getOfferProduct();

  // Industry-specific questions first, then the two most-asked general ones.
  const general = getFaqs(money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS));
  const faqs = [...industry.faqs, general[0], general[1]];

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" data={{ industry: industry.slug }} />
      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-36 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Websites for {industry.name.toLowerCase()}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ice sm:text-5xl">{industry.headline}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ice/60">{industry.intro}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={OFFER_CHECKOUT_HREF}
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              BUILD MY WEBSITE — {money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS)}
            </Link>
            <Link href={`/examples/${industry.slug}`} className="champagne-border rounded-full px-8 py-4 text-sm tracking-wide text-champagne transition hover:bg-champagne/10">
              SEE A SAMPLE
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="font-display text-2xl text-ice sm:text-3xl">The problem</h2>
          <p className="mt-3 text-ice/60">{industry.problem}</p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="font-display text-2xl text-ice sm:text-3xl">What your {industry.singular} website does</h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {industry.features.map((f) => (
              <li key={f} className="glass-panel flex items-start gap-3 rounded-xl px-5 py-4 text-sm text-ice/80">
                <span aria-hidden className="mt-0.5 text-gold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <OfferCard priceCents={offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS} />
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SiteFooter />
    </>
  );
}
