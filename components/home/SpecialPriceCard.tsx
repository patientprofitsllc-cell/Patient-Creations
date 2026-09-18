import Link from "next/link";
import { SPECIAL_FRAME, money } from "./specialFrame";

export function SpecialPriceCard({
  lead,
  accent,
  description,
  delivery,
  items,
  wasCents,
  nowCents,
  href,
  cta,
  footnote,
}: {
  lead: string;
  accent: string;
  description: string;
  delivery?: string | null;
  items?: string[];
  wasCents?: number;
  nowCents: number;
  href: string;
  cta: string;
  footnote?: string;
}) {
  return (
    <Link
      href={href}
      className={`${SPECIAL_FRAME} group flex flex-col items-center p-8 text-center transition hover:border-gold`}
    >
      <span className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-obsidian">
        Special Offer
      </span>
      <h3 className="mt-5 font-display text-3xl text-ice">
        {lead} <span className="text-gradient-champagne italic">{accent}</span>
      </h3>
      <p className="mt-3 max-w-sm text-sm text-ice/60">{description}</p>
      {delivery && <p className="mt-3 text-xs text-ice/40">{delivery}</p>}
      {items && (
        <ul className="mt-4 space-y-1 text-left text-sm text-ice/70">
          {items.map((item) => (
            <li key={item}>
              <span className="mr-2 text-gold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 flex items-baseline justify-center gap-3 font-display">
        {wasCents !== undefined && (
          <span className="text-xl text-ice/40 line-through decoration-red-400/70 decoration-2">{money(wasCents)}</span>
        )}
        <span className="text-5xl text-champagne">{money(nowCents)}</span>
      </p>
      {wasCents !== undefined && (
        <p className="mt-2 text-sm font-semibold text-emerald-400">You save {money(wasCents - nowCents)}</p>
      )}
      <div className="mt-auto pt-6">
        <span className="inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition group-hover:brightness-110">
          {cta}
        </span>
        {footnote && <p className="mt-4 text-xs text-ice/40">{footnote}</p>}
      </div>
    </Link>
  );
}
