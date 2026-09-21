"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";
const BTN = "min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian disabled:opacity-50";

async function save(body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/founder-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? "That did not work." };
  } catch {
    return { ok: false, error: "Could not reach the server." };
  }
}

/** The long-term goals shown on the founder dashboard, in your own words. */
export function VisionEditor({ initial }: { initial: string }) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await save({ vision: text });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.error ?? "" });
    if (r.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs text-ice/50">
        Your long-term goals, in your own words
        <textarea className={`${INPUT} mt-1 py-2`} rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="For example: 100 paying customers by December. Two partners sending customers every month." />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={BTN}>{busy ? "Saving..." : "Save goals"}</button>
        {msg && <span role="status" className={`text-sm ${msg.ok ? "text-champagne" : "text-red-300"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

/** The labor rate and the payment fee that the profitability numbers use. */
export function AssumptionsForm({ laborRateDollars, processingPercent, processingFixedCents }: { laborRateDollars: number; processingPercent: number; processingFixedCents: number }) {
  const router = useRouter();
  const [labor, setLabor] = useState(String(laborRateDollars));
  const [pct, setPct] = useState(String(processingPercent));
  const [fixed, setFixed] = useState(String(processingFixedCents));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const laborCents = Math.round(Number(labor.replace(/[$,]/g, "")) * 100);
    const p = Number(pct);
    const f = Number(fixed);
    if (![laborCents, p, f].every(Number.isFinite) || laborCents < 0 || p < 0 || f < 0) {
      setMsg({ ok: false, text: "Enter the labor rate in dollars, the fee percent, and the fixed fee in cents." });
      return;
    }
    setBusy(true);
    const r = await save({ laborRateCentsPerHour: laborCents, processingPercent: p, processingFixedCents: Math.round(f) });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.error ?? "" });
    if (r.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="glass-panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="block text-xs text-ice/50">
        What your hour is worth, in dollars
        <input className={`${INPUT} mt-1`} value={labor} onChange={(e) => setLabor(e.target.value)} inputMode="decimal" />
      </label>
      <label className="block text-xs text-ice/50">
        Payment fee, percent
        <input className={`${INPUT} mt-1`} value={pct} onChange={(e) => setPct(e.target.value)} inputMode="decimal" />
      </label>
      <label className="block text-xs text-ice/50">
        Payment fee, fixed, in cents
        <input className={`${INPUT} mt-1`} value={fixed} onChange={(e) => setFixed(e.target.value)} inputMode="numeric" />
      </label>
      <button type="submit" disabled={busy} className={`${BTN} self-end`}>{busy ? "Saving..." : "Save"}</button>
      {msg && <p role="status" className={`text-sm sm:col-span-4 ${msg.ok ? "text-champagne" : "text-red-300"}`}>{msg.text}</p>}
    </form>
  );
}
