import Link from "next/link";
import { SPECIAL_FRAME, money } from "@/components/home/specialFrame";
import { DELIVERY_NOTE, OFFER_CHECKOUT_HREF, OFFER_INCLUDES, OFFER_NAME } from "@/lib/site/offer";

/** The $300 offer. The price comes from the product row, never from here. */
export function OfferCard({
  priceCents,
  wasCents,
  ctaLabel = "BUILD MY WEBSITE",
}: {
  priceCents: number;
  /** Display-only "regular" price; shown struck through only when it is above the live price. */
  wasCents?: number;
  ctaLabel?: string;
}) {
  return (
    <div className={`${SPECIAL_FRAME} p-8 sm:p-12`}>
      <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{OFFER_NAME}</p>
          {wasCents && wasCents > priceCents && (
            <p className="mt-4 text-lg text-ice/40 line-through decoration-gold/60">{money(wasCents)}</p>
          )}
          <p className={`${wasCents && wasCents > priceCents ? "mt-1" : "mt-4"} font-display text-7xl text-champagne sm:text-8xl`}>
            {money(priceCents)}
          </p>
          <p className="mt-1 text-sm text-ice/50">One-time price. No agency headache.</p>
          <Link
            href={OFFER_CHECKOUT_HREF}
            className="mt-8 inline-block w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-center text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 sm:w-auto"
          >
            {ctaLabel}
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 text-left sm:grid-cols-2">
          {OFFER_INCLUDES.map((item) => (
            <li key={item} className="flex items-start gap-3 text-ice/80">
              <span aria-hidden className="mt-0.5 text-gold">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-center text-xs text-ice/40 md:text-left">{DELIVERY_NOTE}</p>
    </div>
  );
}
