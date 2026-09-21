"use client";

import { useMemo, useState } from "react";
import { PLAN_DISCLAIMER, PLAN_LABEL, actualVsPlan, computePlan, gapSuggestions, type PlanLine } from "@/lib/revenue/plan";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";

/** The Planning Scenario: change the quantities and prices, see what it adds up to and how far it is from the target. */
export function PlanningCalculator({ initial, targetCents, actualOneTimeCents, actualMonthlyCents }: { initial: PlanLine[]; targetCents: number; actualOneTimeCents: number; actualMonthlyCents: number }) {
  const [qty, setQty] = useState<Record<string, string>>(() => Object.fromEntries(initial.map((l) => [l.id, String(l.quantity)])));
  const [price, setPrice] = useState<Record<string, string>>(() => Object.fromEntries(initial.map((l) => [l.id, String(l.unitCents / 100)])));

  const lines: PlanLine[] = useMemo(
    () => initial.map((l) => ({ ...l, quantity: Number(qty[l.id]), unitCents: Math.round(Number((price[l.id] ?? "").replace(/[$,]/g, "")) * 100) })),
    [initial, qty, price],
  );
  const result = useMemo(() => computePlan(lines, targetCents), [lines, targetCents]);
  const gap = gapSuggestions(result);
  const actual = actualVsPlan(actualOneTimeCents, actualMonthlyCents, result);

  function reset() {
    setQty(Object.fromEntries(initial.map((l) => [l.id, String(l.quantity)])));
    setPrice(Object.fromEntries(initial.map((l) => [l.id, String(l.unitCents / 100)])));
  }

  return (
    <section aria-labelledby="plan-title" className="glass-panel space-y-5 rounded-2xl p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">{PLAN_LABEL}</p>
        <h2 id="plan-title" className="mt-1 font-display text-2xl text-ice">What would it take to reach {money(targetCents)} a month?</h2>
        <p className="mt-2 text-sm text-ice/60">
          The quantities start as the example from your plan. The prices are today&apos;s prices from your price list. Change any number to try a different mix. {PLAN_DISCLAIMER}
        </p>
      </div>

      <ul className="divide-y divide-white/5">
        {initial.map((l) => {
          const r = result.lines.find((x) => x.id === l.id)!;
          const isTotal = l.id === "other";
          return (
            <li key={l.id} className="grid grid-cols-2 items-end gap-x-3 gap-y-2 py-3 sm:grid-cols-[1fr_6rem_8rem_8rem]">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-ice">{l.label}</p>
                <p className="text-xs text-ice/40">{l.kind === "monthly" ? "Repeats every month" : "One time"}</p>
              </div>
              <label className="block text-xs text-ice/50">
                {isTotal ? "How many" : "How many"}
                <input className={`${INPUT} mt-1`} value={qty[l.id]} onChange={(e) => setQty({ ...qty, [l.id]: e.target.value })} inputMode="numeric" disabled={isTotal} aria-label={`${l.label}, quantity`} />
              </label>
              <label className="block text-xs text-ice/50">
                {isTotal ? "Total, in dollars" : "Each, in dollars"}
                <input className={`${INPUT} mt-1`} value={price[l.id]} onChange={(e) => setPrice({ ...price, [l.id]: e.target.value })} inputMode="decimal" aria-label={`${l.label}, price`} />
              </label>
              <p className="col-span-2 text-right text-sm text-champagne sm:col-span-1 sm:self-center">{money(r.totalCents)}</p>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 p-4"><p className="text-xs text-ice/40">One-time</p><p className="mt-1 font-display text-2xl text-ice">{money(result.oneTimeCents)}</p></div>
        <div className="rounded-xl border border-white/10 p-4"><p className="text-xs text-ice/40">Monthly plans</p><p className="mt-1 font-display text-2xl text-ice">{money(result.monthlyCents)}</p></div>
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4"><p className="text-xs text-ice/50">Scenario total</p><p className="mt-1 font-display text-2xl text-champagne">{money(result.totalCents)}</p><p className="text-[11px] text-ice/50">{result.percentOfTarget}% of the target</p></div>
      </div>

      <div role="status" className="text-sm text-ice/80">
        {result.gapCents > 0 ? (
          <>
            <p>This scenario is {money(result.gapCents)} short of {money(targetCents)}.</p>
            {gap.length > 0 && (
              <p className="mt-1 text-ice/60">
                On its own, that gap would take: {gap.map((g) => `${g.extraUnits} more ${g.label}`).join(", or ")}. This only shows the arithmetic. It is not a recommendation.
              </p>
            )}
          </>
        ) : (
          <p>This scenario reaches {money(targetCents)}, by {money(-result.gapCents)}.</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 p-4 text-sm text-ice/70">
        <p className="text-ice">Against what is real</p>
        <p className="mt-1">
          This month so far you have collected {money(actualOneTimeCents)} in cash, and your active monthly plans are {money(actualMonthlyCents)} a month, {money(actual.actualCents)} together. That is {actual.percentOfTarget}% of the target
          {result.totalCents > 0 ? ` and ${actual.percentOfPlan}% of this scenario` : ""}.
        </p>
      </div>

      <button type="button" onClick={reset} className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/70 hover:border-gold/40 hover:text-gold">
        Reset to the example
      </button>
    </section>
  );
}
