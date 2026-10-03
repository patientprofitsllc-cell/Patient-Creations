import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { CONCEPTS, SHOW_EXAMPLES } from "@/lib/site/concepts";
import { INDUSTRIES } from "@/lib/site/industries";
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

export const metadata: Metadata = {
  title: "Website design concepts",
  description: "Full one-page website concepts for a barbershop, a restaurant and a local shop: the standard of design we build for small businesses.",
  alternates: { canonical: "/examples" },
};

export default function ExamplesPage() {
  // Only a full set of finished concepts gets a page; otherwise visitors go to the products instead.
  if (!SHOW_EXAMPLES) redirect("/pricing");
  const more = INDUSTRIES.filter((i) => !CONCEPTS.some((c) => c.slug === i.slug));

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main" className="bg-pc-bg pb-24 pt-32 text-pc-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">Design concepts</p>
            <h1 className="mt-5 text-[2.6rem] font-light leading-[1.02] tracking-[-0.035em] sm:text-6xl">
              A different business.
              <br />
              <span className="text-pc-mute">A different expression.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pc-mute">
              Three full websites we designed for invented businesses, to show the standard we build to. They&apos;re concepts, not customer sites. Yours is
              designed around your own brand, photos and customers.
            </p>
          </Reveal>

          <Stagger className="mt-14 space-y-8" step={120}>
            {CONCEPTS.map((c, i) => (
              <Link key={c.slug} href={`/examples/${c.slug}`} className="group relative block overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src={c.hero.src}
                  alt={c.hero.alt}
                  width={c.hero.width}
                  height={c.hero.height}
                  priority={i === 0}
                  sizes="(min-width: 1152px) 1152px, 100vw"
                  className="h-[440px] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:h-[520px]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                      Concept 0{i + 1} · {c.industry}
                    </p>
                    <p className="mt-3 text-4xl font-light leading-none tracking-[-0.03em] text-white sm:text-6xl">
                      {c.headline[0]} <i className="font-accent">{c.headline[1]}</i>
                    </p>
                    <p className="mt-3 text-sm text-white/70">Designed for “{c.brand}”</p>
                  </div>
                  <span className="inline-flex min-h-[48px] shrink-0 items-center gap-2 self-start rounded-xl bg-pc-sand px-5 text-sm font-semibold text-pc-ink sm:self-auto">
                    View the full site <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </Stagger>

          <Reveal className="mt-20 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-light tracking-tight">Your business isn&apos;t listed?</h2>
              <p className="mt-3 text-pc-mute">Every site is designed from scratch around your business. See what a website includes for your industry:</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {more.map((i) => (
                  <li key={i.slug}>
                    <Link href={`/websites/${i.slug}`} className="inline-flex min-h-[40px] items-center rounded-lg border border-white/10 px-3 text-sm text-pc-cream/80 hover:border-pc-sand hover:text-pc-sand">
                      {i.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-pc-sand/40 bg-pc-panel p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-pc-sand">Your first big move</p>
              <p className="mt-3 text-2xl font-light">Get a site designed to this standard.</p>
              <Link href={OFFER_CHECKOUT_HREF} className="cta-primary mt-6 flex min-h-[56px] items-center justify-center rounded-xl bg-pc-sand font-semibold text-pc-ink">
                Start a project →
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
