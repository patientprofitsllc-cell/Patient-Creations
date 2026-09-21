"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";
const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export interface SpendEntry {
  id: string;
  month: string;
  channel: string;
  amountCents: number;
  note: string | null;
}

/** Record what you spent getting customers, so cost per lead and per customer are real. Nothing else reads it. */
export function SpendForm({ months, entries }: { months: string[]; entries: SpendEntry[] }) {
  const router = useRouter();
  const [month, setMonth] = useState(months[months.length - 1] ?? "");
  const [channel, setChannel] = useState("");
  const [dollars, setDollars] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(dollars.replace(/[$,]/g, "")) * 100);
    if (!channel.trim() || !Number.isFinite(cents) || cents <= 0) {
      setMessage({ ok: false, text: "Name the channel and enter an amount above zero." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/spend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, channel, amountCents: cents, note: note || undefined }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ ok: false, text: data.error ?? "That did not work." });
      else {
        setChannel("");
        setDollars("");
        setNote("");
        setMessage({ ok: true, text: "Added." });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this entry?")) return;
    const res = await fetch(`/api/admin/spend/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setMessage({ ok: false, text: "Could not remove it." });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="glass-panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[8rem_1fr_9rem_auto]">
        <label className="block text-xs text-ice/50">
          Month
          <select className={`${INPUT} mt-1`} value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ice/50">
          What it was for
          <input className={`${INPUT} mt-1`} value={channel} onChange={(e) => setChannel(e.target.value)} maxLength={60} placeholder="Facebook ads, flyers, a tool" />
        </label>
        <label className="block text-xs text-ice/50">
          Amount in dollars
          <input className={`${INPUT} mt-1`} value={dollars} onChange={(e) => setDollars(e.target.value)} inputMode="decimal" />
        </label>
        <button type="submit" disabled={busy} className="min-h-[44px] self-end rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian disabled:opacity-50">
          {busy ? "Adding..." : "Add"}
        </button>
        <label className="block text-xs text-ice/50 sm:col-span-4">
          Note (optional)
          <input className={`${INPUT} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
        </label>
      </form>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-champagne" : "text-red-300"}`}>
          {message.text}
        </p>
      )}
      {entries.length > 0 && (
        <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-ice/80">
                {e.month} · {e.channel}
                {e.note ? <span className="text-ice/40"> · {e.note}</span> : null}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-champagne">{money(e.amountCents)}</span>
                <button type="button" onClick={() => void remove(e.id)} className="min-h-[36px] rounded-full border border-white/15 px-3 text-xs text-ice/60 hover:border-red-300/50 hover:text-red-300">
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
