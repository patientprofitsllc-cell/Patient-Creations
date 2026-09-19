import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { TrackView } from "@/components/analytics/Track";
import { INDUSTRIES, getIndustry } from "@/lib/site/industries";
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export function generateMetadata({ params }: { params: { industry: string } }): Metadata {
  const industry = getIndustry(params.industry);
  if (!industry) return {};
  return {
    title: `${industry.name} website example`,
    description: `A sample one-page website design for a ${industry.singular}: services, contact details, and a clear call to action.`,
    alternates: { canonical: `/examples/${industry.slug}` },
  };
}

export default function ExampleDetailPage({ params }: { params: { industry: string } }) {
  const industry = getIndustry(params.industry);
  if (!industry) notFound();

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" data={{ industry: industry.slug }} />
      <main id="main" className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <Link href="/examples" className="text-xs text-ice/40 hover:text-gold">
          ← All examples
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ice sm:text-4xl">
          A website for a {industry.singular}
        </h1>
        <p className="mt-3 max-w-2xl rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-ice/70">
          This is a sample design concept, not a real business or customer result. The buttons are inactive. Your
          website is built around your own services, brand, and contact details.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 truncate text-xs text-ice/40">yourbusiness.com</span>
          </div>
          <SiteRenderer site={industry.sample} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
          >
            BUILD MY WEBSITE
          </Link>
          <Link href={`/websites/${industry.slug}`} className="text-sm text-gold hover:brightness-110">
            What a {industry.singular} website includes →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
