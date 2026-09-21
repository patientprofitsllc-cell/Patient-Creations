"use client";

import Link from "next/link";
import { useState } from "react";
import { sendFunnelEvent } from "@/components/analytics/Track";
import { NEEDS, SUGGESTIONS, type NeedId } from "@/lib/journey/discovery";

/** Three big questions instead of fifteen services. One tap shows the few things that fit. */
export function ProductFinder() {
  const [need, setNeed] = useState<NeedId | null>(null);
  const picks = need ? SUGGESTIONS[need] : null;

  return (
    <section id="start" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-16 text-center" aria-labelledby="finder-title">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Start here</p>
      <h2 id="finder-title" className="mt-3 font-display text-3xl text-ice sm:text-4xl">
        What do you <span className="text-gradient-champagne italic">need most right now?</span>
      </h2>
      <div role="group" aria-label="Pick what you need" className="mt-8 grid gap-3 sm:grid-cols-3">
        {NEEDS.map((n) => {
          const on = need === n.id;
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setNeed(n.id);
                sendFunnelEvent("upsell_view", { source: "finder", need: n.id });
              }}
              className={`flex min-h-[88px] flex-col items-center justify-center rounded-2xl border px-4 py-4 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                on ? "border-gold bg-gold/10 shadow-gold-glow" : "border-white/10 bg-white/[0.02] hover:border-gold/40"
              }`}
            >
              <span className="font-display text-lg text-ice">{n.label}</span>
              <span className="mt-1 text-xs text-ice/50">{n.blurb}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-6 min-h-[2rem]">
        {picks ? (
          <ul className="grid gap-3 text-left sm:grid-cols-3">
            {picks.map((p) => (
              <li key={p.title} className="glass-panel flex flex-col rounded-2xl p-5">
                <p className="text-ice">{p.title}</p>
                <p className="mt-1 flex-1 text-sm text-ice/60">{p.why}</p>
                <p className="mt-3 text-sm text-gold">{p.price}</p>
                <Link
                  href={p.href}
                  onClick={() => sendFunnelEvent("upsell_click", { source: "finder", offer: p.title.slice(0, 40) })}
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-obsidian transition hover:brightness-110"
                >
                  See it
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ice/40">Pick one and we will show you where to start.</p>
        )}
      </div>
      <p className="mt-6 text-sm text-ice/50">
        Not sure? <Link href="/audit" className="text-gold underline">Get a free growth audit</Link> and we will tell you.
      </p>
    </section>
  );
}
