import Image from "next/image";
import type { CSSProperties } from "react";
import type { Concept } from "@/lib/site/concepts";

/**
 * One design concept, drawn as the full one-page website it would be: header, photographic hero, menu of services, a
 * story with photography, and a visit band. The buttons are inert (it's a concept), and nothing on it is a review,
 * rating or result. Colours come from the concept's own theme, so each looks like its own brand.
 */
export function ConceptSite({ c }: { c: Concept }) {
  const t = c.theme;
  const vars = { "--c-bg": t.bg, "--c-surface": t.surface, "--c-text": t.text, "--c-muted": t.muted, "--c-accent": t.accent, "--c-accent-text": t.accentText, "--c-line": `color-mix(in srgb, ${t.text} 14%, transparent)`, "--c-line-strong": `color-mix(in srgb, ${t.text} 32%, transparent)` } as CSSProperties;
  const display = t.display === "serif" ? "font-accent font-normal tracking-[-0.01em]" : "font-light tracking-[-0.04em]";
  const Button = ({ children, ghost = false }: { children: string; ghost?: boolean }) => (
    <span
      aria-disabled="true"
      className={`inline-flex min-h-[48px] cursor-default items-center rounded-full px-6 text-sm font-semibold ${ghost ? "border border-[color:var(--c-line-strong)] text-[color:var(--c-text)]" : "bg-[color:var(--c-accent)] text-[color:var(--c-accent-text)]"}`}
    >
      {children}
    </span>
  );

  return (
    <div style={vars} className="bg-[color:var(--c-bg)] text-[color:var(--c-text)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--c-accent)] font-accent text-sm text-[color:var(--c-accent)]">{c.monogram}</span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">{c.brand}</span>
        </p>
        <nav aria-hidden className="hidden gap-8 text-sm text-[color:var(--c-muted)] md:flex">
          {c.nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </nav>
        <span className="hidden sm:block">
          <Button>{c.cta}</Button>
        </span>
      </div>

      {/* Hero */}
      <div className="relative mx-3 overflow-hidden rounded-[1.75rem] sm:mx-6">
        <Image src={c.hero.src} alt={c.hero.alt} width={c.hero.width} height={c.hero.height} priority sizes="(min-width: 1280px) 1200px, 100vw" className="h-[78vh] max-h-[720px] min-h-[460px] w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-[#f7f2ea] sm:p-12">
          <p className="text-xs uppercase tracking-[0.3em] opacity-80">{c.kicker}</p>
          <h3 className={`mt-4 text-5xl leading-[0.95] sm:text-7xl lg:text-8xl ${display}`}>
            {c.headline[0]}
            <br />
            <i className="font-accent">{c.headline[1]}</i>
          </h3>
          <p className="mt-5 max-w-lg text-base opacity-85 sm:text-lg">{c.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button>{c.cta}</Button>
            <span aria-disabled="true" className="inline-flex min-h-[48px] cursor-default items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white">
              {c.nav[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--c-accent)]">{c.nav[0]}</p>
            <h4 className={`mt-4 text-5xl leading-none sm:text-6xl ${display}`}>{c.offerTitle}</h4>
          </div>
          <ul className="divide-y divide-[color:var(--c-line)] border-y border-[color:var(--c-line)]">
            {c.offers.map((o) => (
              <li key={o.name} className="flex items-baseline justify-between gap-6 py-5">
                <div>
                  <p className="text-xl">{o.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--c-muted)]">{o.detail}</p>
                </div>
                <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-[color:var(--c-accent)]">{o.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Story with photography */}
      <div className="bg-[color:var(--c-surface)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {c.gallery.map((g, i) => (
              <Image key={g.src} src={g.src} alt={g.alt} width={g.width} height={g.height} sizes="(min-width: 1024px) 300px, 45vw" className={`aspect-[4/5] w-full rounded-2xl object-cover ${i === 1 ? "mt-10" : ""}`} />
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--c-accent)]">{c.nav[1]}</p>
            <h4 className={`mt-4 text-4xl leading-[1.05] sm:text-5xl ${display}`}>{c.storyTitle}</h4>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[color:var(--c-muted)]">{c.story}</p>
            <div className="mt-8">
              <Button ghost>{c.cta}</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Visit */}
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--c-accent)]">{c.nav[2]}</p>
        <dl className="mt-6 grid gap-8 sm:grid-cols-3">
          {c.visit.map((v) => (
            <div key={v.label} className="border-t border-[color:var(--c-line)] pt-5">
              <dt className="text-xs uppercase tracking-[0.2em] text-[color:var(--c-muted)]">{v.label}</dt>
              <dd className="mt-2 text-xl">{v.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="border-t border-[color:var(--c-line)] px-6 py-6 text-center text-xs text-[color:var(--c-muted)]">
        {c.brand} is an invented business · A design concept by Patient Creations
      </p>
    </div>
  );
}
