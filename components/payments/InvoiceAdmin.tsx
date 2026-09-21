"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  number: string;
  kind: string;
  description: string;
  amount: string;
  status: string;
  email: string;
  issued: string;
  paid: string | null;
  via: string | null;
  url: string;
}

const STATUS: Record<string, string> = { OPEN: "Open", PAID: "Paid", VOID: "Cancelled" };

/** The owner's invoice tools: bill for extra work, copy a pay link, record a payment that arrived another way, cancel a mistake. */
export function InvoiceAdmin({ orders, invoices }: { orders: { id: string; label: string }[]; invoices: Row[] }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [dollars, setDollars] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function call(key: string, url: string, body?: unknown) {
    setBusy(key);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ ok: false, text: data.error ?? "That did not work." });
      else {
        setMessage({ ok: true, text: data.message ?? "Done." });
        router.refresh();
      }
      return res.ok;
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(dollars) * 100);
    if (!orderId || !Number.isFinite(cents) || cents <= 0 || !description.trim()) {
      setMessage({ ok: false, text: "Pick an order, enter an amount, and say what it is for." });
      return;
    }
    if (await call("issue", "/api/admin/invoices", { orderId, amountCents: cents, description })) {
      setDollars("");
      setDescription("");
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ ok: true, text: "Pay link copied." });
    } catch {
      setMessage({ ok: false, text: url });
    }
  }

  const field = "min-h-[44px] w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-ice";

  return (
    <div className="space-y-8">
      <form onSubmit={issue} className="glass-panel rounded-2xl p-6">
        <h2 className="text-ice">Bill for extra work</h2>
        <p className="mt-1 text-xs text-ice/40">The customer is emailed a private pay link. When it is paid, the order total goes up by this amount. Only paid orders are listed.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <label className="text-xs text-ice/50">Order
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className={`${field} mt-1`}>
              {orders.length === 0 && <option value="">No paid orders yet</option>}
              {orders.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-ice/50">Amount in dollars
            <input value={dollars} onChange={(e) => setDollars(e.target.value)} inputMode="decimal" placeholder="500" className={`${field} mt-1`} />
          </label>
        </div>
        <label className="mt-3 block text-xs text-ice/50">What it is for
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="Extra pages added after approval" className={`${field} mt-1`} />
        </label>
        <button type="submit" disabled={busy !== null} className="mt-4 min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 text-sm font-semibold text-obsidian disabled:opacity-50">
          {busy === "issue" ? "Sending..." : "Send invoice"}
        </button>
      </form>

      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-champagne" : "text-red-300"}`}>{message.text}</p>
      )}

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-ice">All invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-ice/50">None yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {invoices.map((i) => (
              <li key={i.id} className="space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ice">{i.number} · {i.amount} <span className="text-ice/40">({i.kind === "BALANCE" ? "final payment" : "extra work"})</span></span>
                  <span className={i.status === "OPEN" ? "text-gold" : "text-ice/50"}>{STATUS[i.status] ?? i.status}{i.paid ? ` ${i.paid}${i.via ? ` via ${i.via.toLowerCase()}` : ""}` : ""}</span>
                </div>
                <p className="text-ice/60">{i.email} · {i.description} · issued {i.issued}</p>
                {i.status === "OPEN" && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void copy(i.url)} className="min-h-[40px] rounded-full border border-white/15 px-4 text-xs text-ice/80 hover:border-gold/50">Copy pay link</button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => { if (window.confirm(`Record ${i.number} (${i.amount}) as paid? Only do this once the money has actually arrived.`)) void call(`paid-${i.id}`, `/api/admin/invoices/${i.id}/paid`); }}
                      className="min-h-[40px] rounded-full border border-white/15 px-4 text-xs text-ice/80 hover:border-gold/50 disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                    {i.kind === "EXTRA" && (
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => { if (window.confirm(`Cancel ${i.number}? The customer's link will stop working.`)) void call(`void-${i.id}`, `/api/admin/invoices/${i.id}/void`); }}
                        className="min-h-[40px] rounded-full border border-white/15 px-4 text-xs text-red-300 hover:border-red-300/50 disabled:opacity-50"
                      >
                        Cancel invoice
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
