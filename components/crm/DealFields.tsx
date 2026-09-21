"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "min-h-[44px] rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";
const GHOST = "min-h-[44px] rounded-full border border-white/15 px-5 py-2 text-sm text-ice/70 transition hover:border-gold/40 hover:text-gold disabled:opacity-50";

export interface DealValues {
  stage: string; // "" means automatic
  valueDollars: string;
  chance: string;
  productInterest: string;
  nextAction: string;
}

/** The sales-pipeline fields for one prospect: stage, what the deal is worth, your chance, what it is about, what happens next. */
export function DealFields({
  id,
  initial,
  stages,
  products,
  autoStageLabel,
  disabled,
}: {
  id: string;
  initial: DealValues;
  stages: { key: string; label: string }[];
  products: { slug: string; label: string }[];
  autoStageLabel: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof DealValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  async function send(body: unknown, ok: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/prospects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ ok: false, text: typeof data.error === "string" ? data.error : "That did not work." });
      else {
        setMessage({ ok: true, text: ok });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const dollars = v.valueDollars.trim();
    const chance = v.chance.trim();
    const cents = dollars === "" ? null : Math.round(Number(dollars.replace(/[$,]/g, "")) * 100);
    const pct = chance === "" ? null : Number(chance.replace(/%/g, ""));
    if ((cents !== null && (!Number.isFinite(cents) || cents < 0)) || (pct !== null && (!Number.isFinite(pct) || pct < 0 || pct > 100))) {
      setMessage({ ok: false, text: "The value must be a dollar amount and the chance a number from 0 to 100." });
      return;
    }
    void send(
      {
        stage: v.stage === "" ? null : v.stage,
        valueCents: cents,
        probability: pct === null ? null : Math.round(pct),
        productInterest: v.productInterest === "" ? null : v.productInterest,
        nextAction: v.nextAction.trim() === "" ? null : v.nextAction.trim(),
      },
      "Saved.",
    );
  }

  return (
    <form onSubmit={save} className="glass-panel space-y-4 rounded-2xl p-6">
      <div>
        <h3 className="text-ice">Sales pipeline</h3>
        <p className="mt-1 text-xs text-ice/40">
          Where they are, what the deal is worth, and what happens next. Anything you leave blank is worked out for you and labeled as a default. Your chance number is your own estimate, not a forecast.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs text-ice/50">
          Sales stage
          <select className={`${INPUT} mt-1`} value={v.stage} onChange={set("stage")} disabled={disabled || busy}>
            <option value="">Automatic (now: {autoStageLabel})</option>
            {stages.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ice/50">
          What they are interested in
          <select className={`${INPUT} mt-1`} value={v.productInterest} onChange={set("productInterest")} disabled={disabled || busy}>
            <option value="">Not set</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ice/50">
          Deal value in dollars
          <input className={`${INPUT} mt-1`} value={v.valueDollars} onChange={set("valueDollars")} inputMode="decimal" placeholder="Blank uses the product's price" disabled={disabled || busy} />
        </label>
        <label className="block text-xs text-ice/50">
          Your chance of winning, in percent
          <input className={`${INPUT} mt-1`} value={v.chance} onChange={set("chance")} inputMode="numeric" placeholder="Blank uses the stage's default" disabled={disabled || busy} />
        </label>
      </div>
      <label className="block text-xs text-ice/50">
        What happens next
        <input className={`${INPUT} mt-1`} value={v.nextAction} onChange={set("nextAction")} maxLength={200} placeholder="Send the proposal by Friday" disabled={disabled || busy} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={BUTTON} disabled={disabled || busy}>
          {busy ? "Saving..." : "Save"}
        </button>
        <button type="button" className={GHOST} disabled={disabled || busy} onClick={() => void send({ logContact: true }, "Recorded that you just talked to them.")}>
          I just talked to them
        </button>
      </div>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-champagne" : "text-red-300"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
