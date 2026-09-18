// The highlighted gold outline used by the homepage specials and the NFC card
// frame, so they read as one consistent "featured" treatment.
export const SPECIAL_FRAME =
  "relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent shadow-gold-glow";

// Gold pill button used at the bottom of every card. The `after` overlay
// stretches the link over the whole (relatively positioned) card so the
// entire card is clickable, without nesting one link inside another.
export const CARD_CTA_CLASS =
  "inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110 after:absolute after:inset-0";

export function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
