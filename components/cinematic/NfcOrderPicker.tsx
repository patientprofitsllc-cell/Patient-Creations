"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CARD_DESIGNS, CARD_MIX_PACK_SLUG } from "@/lib/payments/cardMix";

// One design at a time, or the mix-and-match pack where you choose how many of each.
const NFC_DESIGNS = [...CARD_DESIGNS, { slug: CARD_MIX_PACK_SLUG, name: "Mix & Match Pack (choose how many of each)" }];

export function NfcOrderPicker() {
  const router = useRouter();
  const [slug, setSlug] = useState(NFC_DESIGNS[0].slug);

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="rounded-full border border-gold/20 bg-obsidian px-5 py-2 text-sm text-ice/80 outline-none transition hover:border-gold/40"
      >
        {NFC_DESIGNS.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => router.push(`/checkout?product=${slug}`)}
        className="whitespace-nowrap rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
      >
        Order NFC Cards
      </button>
    </div>
  );
}
