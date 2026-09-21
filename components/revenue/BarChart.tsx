// A small bar chart made of plain boxes, so it works with no chart library and reads well on a phone. Each bar has a title
// (hover or long press) and the whole chart has a plain-language summary for screen readers.

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function BarChart({ points, label, showEvery = 1 }: { points: { key: string; label: string; cents: number }[]; label: string; showEvery?: number }) {
  const max = Math.max(1, ...points.map((p) => p.cents));
  const total = points.reduce((s, p) => s + p.cents, 0);
  return (
    <figure className="glass-panel rounded-2xl p-4">
      <figcaption className="mb-3 text-sm text-ice/70">
        {label} <span className="text-ice/40">· {money(total)} in all</span>
      </figcaption>
      <div role="img" aria-label={`${label}: ${points.map((p) => `${p.label} ${money(p.cents)}`).join(", ")}`} className="flex h-32 items-end gap-[3px]">
        {points.map((p) => (
          <div key={p.key} title={`${p.label}: ${money(p.cents)}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className={`w-full rounded-t ${p.cents > 0 ? "bg-gradient-to-t from-gold-deep to-gold" : "bg-white/5"}`} style={{ height: `${p.cents > 0 ? Math.max(4, Math.round((p.cents / max) * 100)) : 2}%` }} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-1 flex gap-[3px] text-[9px] text-ice/40">
        {points.map((p, i) => (
          <span key={p.key} className="min-w-0 flex-1 overflow-hidden text-center">
            {i % showEvery === 0 ? p.label : ""}
          </span>
        ))}
      </div>
    </figure>
  );
}
