"use client";

import Link from "next/link";
import { useState } from "react";
import { trackCta } from "@/components/analytics/Track";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export interface MoveCard {
  slug: string;
  eyebrow?: string;
  name: string;
  /** The live price, already formatted for display. */
  price: string;
  from: boolean;
  unit?: string;
  line: string;
  points?: string[];
  href: string;
  cta: string;
  featured?: boolean;
}

export interface MoveGroup {
  id: string;
  title: string;
  blurb: string;
  cards: MoveCard[];
}

/** The products, one tab per group, as the concept site's priced cards. The first card of a group can be featured. */
export function MoveTabs({ groups }: { groups: MoveGroup[] }) {
  const [active, setActive] = useState(groups[0]?.id);
  const g = groups.find((x) => x.id === active) ?? groups[0];
  if (!g) return null;
  return (
    <div className="mt-10">
      <div role="tablist" aria-label="Product groups" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {groups.map((x) => (
          <button
            key={x.id}
            id={`move-tab-${x.id}`}
            type="button"
            role="tab"
            aria-selected={x.id === g.id}
            aria-controls="move-panel"
            onClick={() => {
              setActive(x.id);
              trackCta(`prices-tab-${x.id}`);
            }}
            className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-4 text-sm transition ${x.id === g.id ? "bg-pc-sand font-semibold text-pc-ink" : "text-pc-mute hover:text-pc-cream"}`}
          >
            {x.title}
            <span className={`text-[0.65rem] ${x.id === g.id ? "text-pc-ink/60" : "text-pc-mute/60"}`}>{String(x.cards.length).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 max-w-xl text-sm text-pc-mute">{g.blurb}</p>

      <div key={g.id} id="move-panel" role="tabpanel" aria-labelledby={`move-tab-${g.id}`} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {g.cards.map((c, i) => (
          <article
            key={c.slug}
            className={`pc-swap flex flex-col rounded-2xl border p-6 sm:p-7 ${c.featured ? "border-pc-sand/70 bg-gradient-to-b from-pc-raised to-pc-panel shadow-[0_0_60px_-20px_rgba(219,183,126,0.45)]" : "border-white/10 bg-pc-panel"}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {c.eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-pc-sand">{c.eyebrow}</p>}
            <h3 className="mt-3 text-2xl font-light tracking-tight text-pc-cream">{c.name}</h3>
            {c.from && <p className="mt-4 text-xs uppercase tracking-[0.15em] text-pc-mute">Starting at</p>}
            <p className={`${c.from ? "mt-1" : "mt-4"} text-5xl font-light tracking-[-0.04em] text-pc-cream`}>
              {c.price}
              {c.unit && <span className="ml-2 text-sm tracking-normal text-pc-mute">{c.unit}</span>}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-pc-mute">{c.line}</p>
            {c.points && c.points.length > 0 && (
              <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-pc-cream/85">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden className="text-pc-sand">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex-1" />
            <Link
              href={c.href}
              onClick={() => trackCta(`prices-${c.slug}`)}
              className={`flex min-h-[56px] items-center justify-center rounded-xl px-4 text-center text-base font-semibold transition active:scale-[0.98] ${c.featured ? "cta-primary mt-7 bg-pc-sand text-pc-ink hover:brightness-110" : "mt-7 border border-white/15 text-pc-cream hover:border-pc-sand hover:text-pc-sand"}`}
            >
              {c.cta}
            </Link>
            <AddToCartButton slug={c.slug} className="mt-3 w-full" />
          </article>
        ))}
      </div>
    </div>
  );
}
