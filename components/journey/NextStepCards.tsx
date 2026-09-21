"use client";

import Link from "next/link";
import { sendFunnelEvent, TrackView } from "@/components/analytics/Track";
import type { Offer } from "@/lib/journey/ladder";

/** The one to three next steps that fit what this customer just bought. A view and every click are counted. */
export function NextStepCards({ offers, heading = "Your next step", source }: { offers: Offer[]; heading?: string; source: string }) {
  if (offers.length === 0) return null;
  return (
    <section className="mt-10 text-left" aria-labelledby="next-step-title">
      <TrackView event="upsell_view" data={{ source, offers: offers.map((o) => o.id).join(",") }} />
      <p className="text-xs uppercase tracking-[0.3em] text-champagne/70">Recommended next</p>
      <h2 id="next-step-title" className="mt-2 font-display text-2xl text-ice">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-ice/50">Only things that fit what you just bought. All optional.</p>
      <ul className="mt-4 space-y-3">
        {offers.map((o) => (
          <li key={o.id} className="glass-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-ice">
                {o.title} <span className="ml-1 text-sm text-gold">{o.priceLabel}</span>
              </p>
              <p className="mt-1 text-sm text-ice/55">{o.why}</p>
            </div>
            <Link
              href={o.href}
              onClick={() => sendFunnelEvent("upsell_click", { source, offer: o.id })}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-obsidian transition hover:brightness-110"
            >
              {o.cta}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
