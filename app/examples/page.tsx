import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { IndustryGrid } from "@/components/marketing/IndustryGrid";
import { TrackView } from "@/components/analytics/Track";
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

export const metadata: Metadata = {
  title: "Website examples for local businesses",
  description:
    "See sample one-page website designs for barbers, salons, restaurants, contractors, pressure washing, landscaping, auto detailing, realtors, photographers, trainers, cleaners, and local shops.",
  alternates: { canonical: "/examples" },
};

export default function ExamplesPage() {
  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main" className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Examples</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
            One system, <span className="text-gradient-champagne italic">every kind of business.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ice/60">
            These are sample designs that show how a one-page site adapts to different industries. They&apos;re design
            concepts, not real businesses or customer results. Yours is built around your services, your brand, and
            your customers.
          </p>
        </div>
        <div className="mt-12">
          <IndustryGrid />
        </div>
        <div className="mt-14 text-center">
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
          >
            BUILD MY WEBSITE
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
