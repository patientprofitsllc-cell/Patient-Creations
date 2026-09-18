import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { OfferCard } from "@/components/marketing/OfferCard";
import { money } from "@/components/home/specialFrame";
import { INDUSTRIES } from "@/lib/site/industries";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const offer = await getOfferProduct();
  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);
  return {
    title: "Affordable websites for small and local businesses",
    description: `Professional one-page business websites for local businesses, starting at ${price}: mobile optimized, business-specific copy, basic SEO, and one revision.`,
    alternates: { canonical: "/websites" },
  };
}

export default async function WebsitesIndexPage() {
  const offer = await getOfferProduct();

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Websites</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
            Websites for <span className="text-gradient-champagne italic">local businesses.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ice/60">
            A professional, mobile-ready one-page website built around your business. Pick your industry to see what
            yours would include.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INDUSTRIES.map((i) => (
            <li key={i.slug}>
              <Link href={`/websites/${i.slug}`} className="glass-panel block rounded-xl px-4 py-3 text-sm text-ice transition hover:border-gold/40 hover:text-gold">
                {i.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-16">
          <OfferCard priceCents={offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
