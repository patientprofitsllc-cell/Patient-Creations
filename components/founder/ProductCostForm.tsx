"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";

export interface CostRow {
  slug: string;
  name: string;
  fulfillmentDollars: string;
  aiApiDollars: string;
  laborMinutes: string;
  softwareDollars: string;
  note: string;
}

const toCents = (v: string) => Math.round(Number(v.replace(/[$,]/g, "")) * 100);

/** What one unit of a product costs you: materials and shipping, AI and API, your time, software. Nothing is guessed for you. */
export function ProductCostForm({ rows, options }: { rows: CostRow[]; options: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [list, setList] = useState<CostRow[]>(rows);
  const [add, setAdd] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const update = (slug: string, patch: Partial<CostRow>) => setList((l) => l.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));

  async function save(r: CostRow) {
    const body = { slug: r.slug, fulfillmentCents: toCents(r.fulfillmentDollars || "0"), aiApiCents: toCents(r.aiApiDollars || "0"), laborMinutes: Math.round(Number(r.laborMinutes || "0")), softwareCents: toCents(r.softwareDollars || "0"), note: r.note || undefined };
    if (![body.fulfillmentCents, body.aiApiCents, body.laborMinutes, body.softwareCents].every((n) => Number.isFinite(n) && n >= 0)) {
      setMsg({ ok: false, text: "Each cost must be a number, zero or more." });
      return;
    }
    setBusy(r.slug);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/product-costs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "That did not work." });
      else {
        setMsg({ ok: true, text: `Saved ${r.name}.` });
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(null);
    }
  }

  const missing = options.filter((o) => !list.some((r) => r.slug === o.slug));

  return (
    <div className="space-y-4">
      {list.map((r) => (
        <div key={r.slug} className="glass-panel space-y-3 rounded-2xl p-4">
          <p className="text-ice">{r.name}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="block text-xs text-ice/50">Materials, shipping, and fulfillment per unit, in dollars<input className={`${INPUT} mt-1`} value={r.fulfillmentDollars} onChange={(e) => update(r.slug, { fulfillmentDollars: e.target.value })} inputMode="decimal" /></label>
            <label className="block text-xs text-ice/50">AI and API per unit, in dollars<input className={`${INPUT} mt-1`} value={r.aiApiDollars} onChange={(e) => update(r.slug, { aiApiDollars: e.target.value })} inputMode="decimal" /></label>
            <label className="block text-xs text-ice/50">Your time per unit, in minutes<input className={`${INPUT} mt-1`} value={r.laborMinutes} onChange={(e) => update(r.slug, { laborMinutes: e.target.value })} inputMode="numeric" /></label>
            <label className="block text-xs text-ice/50">Software per unit, in dollars<input className={`${INPUT} mt-1`} value={r.softwareDollars} onChange={(e) => update(r.slug, { softwareDollars: e.target.value })} inputMode="decimal" /></label>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block grow text-xs text-ice/50">Note (optional)<input className={`${INPUT} mt-1`} value={r.note} onChange={(e) => update(r.slug, { note: e.target.value })} maxLength={200} /></label>
            <button type="button" onClick={() => void save(r)} disabled={busy !== null} className="min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian disabled:opacity-50">
              {busy === r.slug ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ))}
      {missing.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-xs text-ice/50">
            Add costs for another product
            <select className={`${INPUT} mt-1 min-w-[16rem]`} value={add} onChange={(e) => setAdd(e.target.value)}>
              <option value="">Choose a product</option>
              {missing.map((o) => (
                <option key={o.slug} value={o.slug}>{o.name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!add}
            onClick={() => {
              const o = options.find((x) => x.slug === add);
              if (!o) return;
              setList((l) => [...l, { slug: o.slug, name: o.name, fulfillmentDollars: "", aiApiDollars: "", laborMinutes: "", softwareDollars: "", note: "" }]);
              setAdd("");
            }}
            className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/70 hover:border-gold/40 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-champagne" : "text-red-300"}`}>{msg.text}</p>}
    </div>
  );
}
