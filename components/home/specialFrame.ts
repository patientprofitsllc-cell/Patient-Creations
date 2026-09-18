// The highlighted gold outline used by the homepage specials and the NFC card
// frame, so they read as one consistent "featured" treatment.
export const SPECIAL_FRAME =
  "relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent shadow-gold-glow";

export function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
