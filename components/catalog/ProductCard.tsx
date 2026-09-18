import type { ReactNode } from "react";
import { SPECIAL_FRAME, money } from "@/components/home/specialFrame";
import { deliveryLine } from "@/lib/payments/deliveryWindow";

/**
 * The single product card used for every listing (homepage "What We Build" and
 * /services), in the same gold-outlined format as the specials, so name,
 * description, delivery line, and price are formatted identically everywhere.
 * `action` is the button, so callers can pass a plain link or the referral-aware one.
 */
export function ProductCard({
  category,
  name,
  description,
  priceCents,
  hasTiers,
  topTierCents,
  turnaround,
  action,
}: {
  category: string;
  name: string;
  description: string;
  priceCents: number;
  hasTiers?: boolean;
  topTierCents?: number;
  turnaround?: string | null;
  action: ReactNode;
}) {
  const delivery = deliveryLine(turnaround);
  return (
    <div className={`${SPECIAL_FRAME} flex flex-col items-center p-8 text-center transition hover:border-gold`}>
      <p className="text-xs uppercase tracking-[0.25em] text-gold/70">{category}</p>
      <h3 className="mt-3 font-display text-3xl text-ice">{name}</h3>
      <p className="mt-3 max-w-sm text-sm text-ice/60">{description}</p>
      {delivery && <p className="mt-3 text-xs text-ice/40">{delivery}</p>}
      <p className="mt-6 font-display text-5xl text-champagne">
        {money(priceCents)}
        {hasTiers && <span className="ml-1 text-sm text-ice/40">from</span>}
      </p>
      {hasTiers && topTierCents !== undefined && (
        <p className="mt-1 text-xs text-ice/40">Signature and Flagship tiers up to {money(topTierCents)}</p>
      )}
      <div className="mt-auto pt-6">{action}</div>
    </div>
  );
}
