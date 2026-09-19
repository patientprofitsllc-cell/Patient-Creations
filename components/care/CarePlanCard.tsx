"use client";

import { useEffect, useState } from "react";

const BUTTON =
  "rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-50";

export function CarePlanCard({
  token,
  state,
  priceLabel,
  includes,
  notIncluded,
  timingNote,
  renewsOn,
  cancelsAtPeriodEnd,
}: {
  token: string;
  state: "offer" | "active" | "past_due";
  priceLabel: string;
  includes: string[];
  notIncluded: string[];
  timingNote: string;
  renewsOn: string | null;
  cancelsAtPeriodEnd: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justStarted, setJustStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    try {
      setJustStarted(new URLSearchParams(window.location.search).get("care") === "started");
    } catch {
      /* ignore */
    }
  }, []);

  async function go(path: "checkout" | "portal") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/care/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, acceptTerms: path === "checkout" ? agreed : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (state !== "offer") {
    return (
      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Website Care Plan</p>
        <p className="mt-2 font-display text-xl text-ice">{state === "past_due" ? "Your latest payment didn't go through" : "Your care plan is active"}</p>
        <p className="mt-2 text-sm text-ice/60">
          {state === "past_due"
            ? "We'll retry automatically. You can update your card any time."
            : cancelsAtPeriodEnd && renewsOn
              ? `It ends on ${renewsOn} and won't renew.`
              : renewsOn
                ? `Next payment: ${renewsOn}.`
                : "Message us on this page to request an update."}
        </p>
        {state === "active" && <p className="mt-2 text-xs text-ice/40">To request an update, send us a message on this page. {timingNote}</p>}
        <button type="button" onClick={() => void go("portal")} disabled={busy} className={`${BUTTON} mt-4`}>
          {busy ? "Opening…" : "Manage billing"}
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/5 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Website Care Plan</p>
      {justStarted && (
        <p className="mt-2 rounded-lg bg-black/30 p-3 text-sm text-ice/80">Thanks. Your plan is being set up and will show as active here within a minute or so.</p>
      )}
      <p className="mt-2 font-display text-3xl text-ice">
        {priceLabel}
        <span className="text-base text-ice/50"> / month</span>
      </p>
      <ul className="mt-4 space-y-2">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
            <span aria-hidden className="mt-0.5 text-gold">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ice/40">{timingNote}</p>
      <p className="mt-1 text-xs text-ice/40">Not included: {notIncluded.join("; ").toLowerCase()}.</p>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ice/60 has-[:checked]:border-gold/50">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c39b52]" />
        <span>
          I understand this plan <strong className="text-ice/80">renews automatically every month at {priceLabel}</strong> until I cancel, that I can cancel any time (effective at the end of the paid month, with no refund for the current month), and I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold underline">Terms of Service</a>, including binding arbitration, and the{" "}
          <a href="/refunds" target="_blank" rel="noopener noreferrer" className="text-gold underline">Refund and Cancellation Policy</a>.
        </span>
      </label>
      <button type="button" onClick={() => void go("checkout")} disabled={busy || !agreed} className={`${BUTTON} mt-4`}>
        {busy ? "Opening checkout…" : `Start the care plan, ${priceLabel}/month`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
