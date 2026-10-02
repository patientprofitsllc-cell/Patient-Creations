import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { PriceList } from "@/components/catalog/PriceList";
import { FaqSection } from "@/components/marketing/FaqSection";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { bnplEnabled } from "@/lib/payments/bnpl";
import { ADD_ON_PITCH } from "@/lib/site/addOnPitch";
import { topFaqs } from "@/lib/site/faq";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const offer = await getOfferProduct();
  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);
  return {
    title: "Products and prices",
    description: `Every product and price on one page: websites from ${price}, video ads, Business Cards, Monthly Ads, and growth and AI builds.`,
    alternates: { canonical: "/pricing" },
  };
}

export default async function PricingPage() {
  const addOns = await db.product.findMany({ where: { type: "ORDER_BUMP", active: true }, orderBy: { priceCents: "asc" } });

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main">
        <section className="mx-auto max-w-4xl px-6 pb-4 pt-32 text-center">
          <h1 className="font-display text-4xl text-ice sm:text-5xl">
            Every price, <span className="text-gradient-champagne italic">on one page.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ice/60">
            No quote calls and no surprise fees. Pick what you need, pay at checkout, and follow your project on a private page.
          </p>
        </section>

        <PriceList className="py-12" />

        {addOns.length > 0 && (
          <section className="mx-auto max-w-4xl px-5 py-12 sm:px-6">
            <h2 className="font-display text-2xl text-ice">Optional extras at checkout</h2>
            <ul className="mt-4 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {addOns.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 p-4 sm:p-5">
                  <div>
                    <p className="font-semibold text-ice">{a.name}</p>
                    <p className="mt-1 text-sm text-ice/60">{ADD_ON_PITCH[a.slug]?.why ?? a.description}</p>
                  </div>
                  <p className="whitespace-nowrap font-display text-xl text-champagne">{money(a.priceCents)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqSection faqs={topFaqs({ bnpl: bnplEnabled() })} />
        <p className="-mt-12 pb-24 text-center text-sm">
          <Link href="/faq" className="text-gold underline">
            See every question and answer
          </Link>{" "}
          · <Link href="/services" className="text-gold underline">Full details of each service</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
