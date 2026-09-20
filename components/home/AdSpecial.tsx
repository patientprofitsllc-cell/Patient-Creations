"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPECIAL_FRAME, money } from "./specialFrame";
import { AD_SPECIAL_BLURB, AD_SPECIAL_INCLUDES } from "@/lib/site/adSpecials";

interface AdOption {
  slug: string;
  label: string;
  blurb: string;
  priceCents: number;
}

export function AdSpecial({
  cinematic,
  ugc,
  consultation,
  delivery,
}: {
  cinematic: Omit<AdOption, "label" | "blurb">;
  ugc: Omit<AdOption, "label" | "blurb">;
  consultation: { slug: string; priceCents: number };
  delivery?: string | null;
}) {
  const router = useRouter();
  const options: Record<"cinematic" | "ugc", AdOption> = {
    cinematic: { ...cinematic, label: "Cinematic Ad", blurb: AD_SPECIAL_BLURB.cinematic },
    ugc: { ...ugc, label: "UGC Ad", blurb: AD_SPECIAL_BLURB.ugc },
  };
  const [kind, setKind] = useState<"cinematic" | "ugc">("cinematic");
  const [qty, setQty] = useState(1);
  const chosen = options[kind];
  const total = chosen.priceCents * qty;

  return (
    <div className={`${SPECIAL_FRAME} flex flex-col items-center p-8 text-center`}>
      <span className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-obsidian">
        Special Offer
      </span>
      <h3 className="mt-5 font-display text-3xl text-ice">
        Ads that sell, <span className="text-gradient-champagne italic">your pick</span>
      </h3>
      <p className="mt-3 max-w-sm text-sm text-ice/60">Choose the style, then how many ads you want.</p>
      {delivery && <p className="mt-3 text-xs text-ice/40">{delivery}</p>}

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {(Object.keys(options) as Array<"cinematic" | "ugc">).map((key) => {
          const o = options[key];
          const active = kind === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setKind(key)}
              className={`flex flex-col items-center justify-start rounded-2xl border px-3 py-4 text-center transition ${
                active ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/40"
              }`}
            >
              <span className="block font-display text-lg text-ice">{o.label}</span>
              <span className="mt-1 block text-xs text-ice/50">{o.blurb}</span>
              <span className="mt-3 block font-display text-2xl text-champagne">
                {money(o.priceCents)}
                <span className="text-xs text-ice/40"> / ad</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-sm text-xs text-ice/60" aria-live="polite">
        {AD_SPECIAL_INCLUDES[kind]}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm text-ice/60">How many?</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ice hover:border-gold/40"
          aria-label="Fewer ads"
        >
          −
        </button>
        <span className="w-8 text-center font-display text-2xl text-ice" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(50, q + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ice hover:border-gold/40"
          aria-label="More ads"
        >
          +
        </button>
      </div>

      <div className="mt-auto w-full pt-6">
        <button
          type="button"
          onClick={() => router.push(`/checkout?product=${chosen.slug}&qty=${qty}`)}
          className="w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
        >
          Order {qty} {chosen.label}
          {qty > 1 ? "s" : ""} · {money(total)}
        </button>
        <p className="mt-4 text-xs text-ice/50">
          Want something custom?{" "}
          <Link href={`/checkout?product=${consultation.slug}`} className="text-gold hover:brightness-110">
            Book a {money(consultation.priceCents)} consultation
          </Link>{" "}
          — it&apos;s credited toward your build.
        </p>
      </div>
    </div>
  );
}
