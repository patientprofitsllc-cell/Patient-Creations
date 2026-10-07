import Link from "next/link";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SHOWCASE_SITES } from "@/lib/site/showcaseSites";

/** The current client sites. Plain <img> because the photos come from each site (or our /showcase proxy), not the optimiser. */
export function ClientSites() {
  return (
    <section aria-labelledby="client-sites" className="mb-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">Example websites</p>
        <h2 id="client-sites" className="mt-4 text-3xl font-light tracking-tight sm:text-5xl">
          General examples of what we build.
        </h2>
      </Reveal>
      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2" step={90}>
        {SHOWCASE_SITES.map((s) => {
          return (
            <Link key={s.slug} href={s.href} prefetch={false} className="group block overflow-hidden rounded-2xl border border-white/10 bg-pc-raised transition hover:border-pc-sand/60">
              <div className="relative h-52 overflow-hidden bg-pc-panel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={`${s.name} example website`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-pc-sand">{s.kind}</p>
                <h3 className="mt-2 text-2xl font-light tracking-tight text-pc-cream">{s.name}</h3>
                <p className="mt-2 text-sm text-pc-mute">{s.blurb}</p>
                <span className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-pc-sand">
                  View the example <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </Stagger>
    </section>
  );
}
