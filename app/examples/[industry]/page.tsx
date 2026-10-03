import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { ConceptSite } from "@/components/concepts/ConceptSite";
import { CONCEPTS, SHOW_EXAMPLES, getConcept } from "@/lib/site/concepts";
import { getIndustry } from "@/lib/site/industries";
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ industry: c.slug }));
}

export function generateMetadata({ params }: { params: { industry: string } }): Metadata {
  const c = getConcept(params.industry);
  if (!c) return {};
  return {
    title: `${c.industry} website design concept`,
    description: `A full one-page website concept for a ${c.industry.toLowerCase()}: ${c.intro}`,
    alternates: { canonical: `/examples/${c.slug}` },
  };
}

export default function ConceptPage({ params }: { params: { industry: string } }) {
  const c = getConcept(params.industry);
  // The retired wireframe samples go to their industry page; anything else is a 404.
  if (!c || !SHOW_EXAMPLES) {
    if (getIndustry(params.industry)) redirect(`/websites/${params.industry}`);
    notFound();
  }
  const others = CONCEPTS.filter((x) => x.slug !== c.slug);

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" data={{ concept: c.slug }} />
      <main id="main" className="bg-pc-bg pt-24 text-pc-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <Link href="/examples" className="text-xs text-pc-mute hover:text-pc-sand">
              ← All concepts
            </Link>
            <h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">
              {c.industry} website <i className="font-accent text-pc-sand">concept</i>
            </h1>
            <p className="mt-1 text-sm text-pc-mute">An invented business, designed to show our standard. The buttons are inactive.</p>
          </div>
          <Link href={OFFER_CHECKOUT_HREF} className="inline-flex min-h-[48px] items-center self-start rounded-xl bg-pc-sand px-5 text-sm font-semibold text-pc-ink sm:self-auto">
            Get a site like this →
          </Link>
        </div>

        {/* The concept, framed like a browser window. */}
        <div className="mx-auto max-w-[1240px] px-2 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
            <div aria-hidden className="flex items-center gap-2 border-b border-white/10 bg-pc-panel px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 truncate rounded bg-white/[0.05] px-3 py-0.5 text-xs text-pc-mute">{c.brand.toLowerCase().replace(/[^a-z]+/g, "")}.com</span>
            </div>
            <ConceptSite c={c} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">Why it works</p>
              <ul className="mt-5 space-y-3">
                {c.notes.map((n) => (
                  <li key={n} className="flex gap-3 text-pc-cream/85">
                    <span aria-hidden className="text-pc-sand">✓</span>
                    {n}
                  </li>
                ))}
              </ul>
              <Link href={`/websites/${c.slug}`} className="mt-6 inline-block border-b border-white/20 pb-1 text-sm text-pc-cream hover:border-pc-sand">
                What a {c.industry.toLowerCase()} website includes →
              </Link>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">More concepts</p>
              <ul className="mt-5 space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/examples/${o.slug}`} className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4 hover:border-pc-sand">
                      <span>
                        {o.industry} · <i className="font-accent text-pc-sand">{o.headline[1]}</i>
                      </span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
