"use client";

import { useState } from "react";

/** Takes the customer to Stripe to pay an invoice. The invoice and its amount come from the server, never from this page. */
export function InvoicePayButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/invoice/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "We could not start checkout. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("We could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => void go()} disabled={busy} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 text-base font-semibold text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto">
        {busy ? "Opening secure checkout..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
