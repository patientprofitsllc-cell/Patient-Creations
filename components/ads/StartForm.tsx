"use client";

import { useState } from "react";

const FIELD = "w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-ice placeholder:text-ice/30";

/** Starts a Monthly Ads plan: the business name, an account if needed, and a required agreement that names the monthly renewal. */
export function StartForm({ planSlug, planName, priceLabel, signedIn }: { planSlug: string; planName: string; priceLabel: string; signedIn: boolean }) {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = businessName.trim().length > 0 && (signedIn || (name.trim() && /\S+@\S+\.\S+/.test(email) && password.length >= 8));

  async function submit() {
    if (!agreed) {
      setError("Please tick the box to agree to the terms before you continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug,
          acceptTerms: agreed,
          businessName,
          phone: phone || undefined,
          account: signedIn ? undefined : { name, email, password },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string };
      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-4 text-ice">About your business</h2>
        <label htmlFor="ads-business" className="sr-only">
          Business name
        </label>
        <input id="ads-business" className={FIELD} placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={120} autoComplete="organization" />
        <label htmlFor="ads-phone" className="sr-only">
          Phone (optional)
        </label>
        <input id="ads-phone" className={`${FIELD} mt-3`} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} autoComplete="tel" inputMode="tel" />
      </div>

      {!signedIn && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-1 text-ice">Create your account</h2>
          <p className="mb-4 text-xs text-ice/50">So you can find your plan again. Already have an account? Sign in first, then come back here.</p>
          <label htmlFor="ads-name" className="sr-only">
            Your name
          </label>
          <input id="ads-name" className={FIELD} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
          <label htmlFor="ads-email" className="sr-only">
            Email
          </label>
          <input id="ads-email" type="email" className={`${FIELD} mt-3`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <label htmlFor="ads-password" className="sr-only">
            Password (at least 8 characters)
          </label>
          <input id="ads-password" type="password" className={`${FIELD} mt-3`} placeholder="Password (at least 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ice/60 has-[:checked]:border-gold/50">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c39b52]" />
        <span>
          I understand this plan <strong className="text-ice/80">renews automatically every month at {priceLabel}</strong> until I cancel, that I can cancel any time (effective at the end of the paid month, with no refund for the current month), that ads are made with AI and no sales or results are promised, and I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            Terms of Service
          </a>
          , including binding arbitration, the{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            Privacy Policy
          </a>
          , and the{" "}
          <a href="/refunds" target="_blank" rel="noopener noreferrer" className="text-gold underline">
            Refund and Cancellation Policy
          </a>{" "}
          (<strong className="text-ice/80">all sales are final</strong>).
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !valid || !agreed}
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? "Opening checkout…" : `START ${planName.replace("Monthly Ads ", "").toUpperCase()} ${priceLabel}/MONTH`}
      </button>
    </form>
  );
}
