import type { AddOnPitch } from "@/lib/site/addOnPitch";

// One optional extra, shown as a card that says what it does and why someone
// would add it. The whole card is the tap target, and a real (visually hidden)
// checkbox keeps it keyboard and screen-reader friendly.

export function AddOnCard({
  name,
  fallbackDescription,
  pitch,
  priceLabel,
  checked,
  onChange,
}: {
  name: string;
  fallbackDescription: string;
  pitch?: AddOnPitch;
  priceLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div
        className={`rounded-2xl border p-4 transition sm:p-5 peer-focus-visible:ring-2 peer-focus-visible:ring-gold ${
          checked ? "border-gold bg-gold/10 shadow-gold-glow" : "border-gold/30 bg-gradient-to-br from-gold/[0.06] to-transparent hover:border-gold/60"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
              checked ? "border-gold bg-gold text-obsidian" : "border-gold/50 text-transparent"
            }`}
          >
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70">{name}</p>
                <p className="mt-1 font-display text-lg leading-snug text-ice sm:text-xl">{pitch?.headline ?? name}</p>
              </div>
              <p className="shrink-0 font-display text-xl text-champagne">{priceLabel}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ice/70">{pitch?.why ?? fallbackDescription}</p>
            {pitch && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="rounded-full border border-gold/30 px-3 py-1 text-gold/90">{pitch.bestFor}</span>
                {pitch.detail && <span className="text-ice/40">{pitch.detail}</span>}
                <span className="text-ice/50">{pitch.timing}</span>
              </div>
            )}
            <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${checked ? "text-gold" : "text-ice/30"}`}>{checked ? "Added to your order" : "Tap to add"}</p>
          </div>
        </div>
      </div>
    </label>
  );
}
