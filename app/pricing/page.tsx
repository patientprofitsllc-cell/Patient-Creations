import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { FaqSection } from "@/components/marketing/FaqSection";
import { GrowthLadder } from "@/components/marketing/GrowthLadder";
import { OfferCard } from "@/components/marketing/OfferCard";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { ADD_ON_PITCH } from "@/lib/site/addOnPitch";
import { CARE_PLAN_INCLUDES, CARE_PLAN_TIMING_NOTE, getCarePlanProduct } from "@/lib/site/carePlan";
import { getFaqs } from "@/lib/site/offer";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const offer = await getOfferProduct();
  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);
  return {
    title: `Pricing: a professional website starting at ${price}`,
    description: `Simple pricing for small business websites. The ${price} Quick Business Website includes custom one-page design, mobile optimization, copy, basic SEO, deployment, and one revision.`,
    alternates: { canonical: "/pricing" },
  };
}

const NOT_INCLUDED = [
  "Multi-page websites or online stores",
  "Custom features or integrations beyond a booking, call, or text link",
  "Logo and brand design (available as an add-on)",
  "More than one revision round (extra rounds are an add-on)",
  "Ongoing hosting, updates, and monitoring after launch",
];

export default async function PricingPage() {
  const [offer, addOns, care] = await Promise.all([
    getOfferProduct(),
    db.product.findMany({ where: { type: "ORDER_BUMP", active: true }, orderBy: { priceCents: "asc" } }),
    getCarePlanProduct(),
  ]);

  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main>
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-32 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Pricing</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
            One clear price to <span className="text-gradient-champagne italic">get online.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ice/60">
            No quote calls and no surprise fees. Everything else is optional.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-12">
          <OfferCard priceCents={offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS} />
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="font-display text-2xl text-ice sm:text-3xl">What&apos;s not included</h2>
          <p className="mt-2 text-sm text-ice/50">So there are no surprises, here&apos;s what the {price} website doesn&apos;t cover.</p>
          <ul className="mt-6 space-y-2">
            {NOT_INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ice/70">
                <span aria-hidden className="mt-0.5 text-ice/40">
                  –
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {addOns.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="font-display text-2xl text-ice sm:text-3xl">Add-ons at checkout</h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addOns.map((a) => (
                <div key={a.id} className="glass-panel rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-lg text-ice">{a.name}</p>
                    <p className="text-champagne">{money(a.priceCents)}</p>
                  </div>
                  {ADD_ON_PITCH[a.slug] ? (
                    <>
                      <p className="mt-2 font-display text-base text-ice">{ADD_ON_PITCH[a.slug].headline}</p>
                      <p className="mt-1 text-sm text-ice/60">{ADD_ON_PITCH[a.slug].why}</p>
                      <p className="mt-2 text-xs text-gold/80">{ADD_ON_PITCH[a.slug].bestFor}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ice/60">{a.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {care && (
          <section className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="font-display text-2xl text-ice sm:text-3xl">After you&apos;re live: the care plan</h2>
            <p className="mt-2 text-sm text-ice/50">
              {money(care.priceCents)} a month, optional, and started from your project page once your website is live.
            </p>
            <ul className="mt-6 space-y-2">
              {CARE_PLAN_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                  <span aria-hidden className="mt-0.5 text-gold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ice/40">{CARE_PLAN_TIMING_NOTE}</p>
          </section>
        )}

        <GrowthLadder />
        <FaqSection faqs={getFaqs(price)} />

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <Link
            href="/checkout?product=starter-website"
            className="inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
          >
            BUILD MY WEBSITE
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
