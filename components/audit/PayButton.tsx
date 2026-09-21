"use client";

import { useState } from "react";
import { sendFunnelEvent } from "@/components/analytics/Track";

/** Takes the visitor to Stripe to pay the audit fee. The address comes from the server, never from this page. */
export function PayButton({ token, label, url }: { token?: string; label: string; url?: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null);
    sendFunnelEvent("upsell_click", { source: "audit-pay", offer: "growth-audit" });
    if (url) {
      window.location.href = url;
      return;
    }
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch("/api/audit/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
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
