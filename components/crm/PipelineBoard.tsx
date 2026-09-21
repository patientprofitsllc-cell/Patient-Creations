import Link from "next/link";
import type { Column, CrmCard } from "@/lib/crm/pipeline";
import { dealProductName } from "@/lib/crm/labels";

// The board: one column per stage. On a phone the columns stack (each is its own section); on a wide screen they sit
// side by side and scroll sideways. Presentational only, so it can be rendered and checked without a database.

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const day = (d: Date | null) => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null);

const SOURCE_LABEL: Record<string, string> = { "growth-audit": "Growth audit", "audit-inquiry": "Audit question", import: "Imported", manual: "Added by hand", referral: "Referral", partner: "Partner" };
const sourceLabel = (s: string | null) => (s ? (SOURCE_LABEL[s] ?? s) : null);

function Card({ c }: { c: CrmCard }) {
  const showValue = c.valueCents > 0;
  return (
    <li className={`rounded-xl border p-3 text-sm ${c.overdue ? "border-gold/60 bg-gold/5" : "border-white/10 bg-white/[0.02]"}`}>
      <Link href={c.href} className="block">
        <span className="flex items-start justify-between gap-2">
          <span className="font-medium text-ice">{c.name}</span>
          {c.kind === "customer" && <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ice/50">Customer</span>}
        </span>
        {(showValue || c.ltvCents > 0) && (
          <span className="mt-1 block text-ice/70">
            {c.kind === "customer" ? (
              <>
                Paid {money(c.ltvCents)}
                {c.valueCents > 0 ? <span className="text-gold"> · {money(c.valueCents)} {c.stage === "PAYMENT" ? "waiting" : "owed"}</span> : null}
                {c.mrrCents > 0 ? <span> · {money(c.mrrCents)}/mo</span> : null}
              </>
            ) : (
              <>
                {money(c.valueCents)}
                <span className="text-ice/40"> · {c.chance}%{c.chanceIsDefault ? " (default)" : ""}</span>
              </>
            )}
          </span>
        )}
        {c.productInterest && <span className="mt-1 block text-xs text-ice/50">{c.kind === "customer" ? "Next: " : "Interested in: "}{dealProductName(c.productInterest)}</span>}
        <span className="mt-2 block text-xs text-ice/70">{c.nextAction}</span>
        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ice/40">
          {c.overdue && c.nextActionAt && <span className="text-gold">Due {day(c.nextActionAt)}</span>}
          {c.stale && <span className="text-red-300">Going cold</span>}
          {c.lastContactAt && <span>Last contact {day(c.lastContactAt)}</span>}
          {sourceLabel(c.source) && <span>{sourceLabel(c.source)}</span>}
        </span>
        {c.badges.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {c.badges.map((b) => (
              <span key={b} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ice/60">{b}</span>
            ))}
          </span>
        )}
      </Link>
    </li>
  );
}

export function PipelineBoard({ columns }: { columns: Column[] }) {
  return (
    <div className="space-y-6 lg:grid lg:auto-cols-[290px] lg:grid-flow-col lg:gap-4 lg:space-y-0 lg:overflow-x-auto lg:pb-4">
      {columns.map((col) => (
        <section key={col.stage.key} id={`stage-${col.stage.key}`} aria-label={col.stage.label} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3">
          <header className="mb-3 px-1">
            <h3 className="flex items-baseline justify-between gap-2 text-sm font-medium text-ice">
              <span>{col.stage.label}</span>
              <span className="text-xs text-ice/40">{col.cards.length}</span>
            </h3>
            <p className="mt-0.5 text-[11px] leading-snug text-ice/40">{col.stage.hint}</p>
            {col.valueCents > 0 && (
              <p className="mt-1 text-[11px] text-ice/50">
                {money(col.valueCents)} {col.stage.side === "before" ? "in play" : "owed"}
              </p>
            )}
          </header>
          {col.cards.length === 0 ? (
            <p className="px-1 py-3 text-xs text-ice/30">Nobody here right now.</p>
          ) : (
            <ul className="space-y-2">
              {col.cards.map((c) => (
                <Card key={c.key} c={c} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
