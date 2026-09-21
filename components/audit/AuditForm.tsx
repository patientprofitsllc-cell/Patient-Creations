"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { sendFunnelEvent } from "@/components/analytics/Track";
import { PayButton } from "@/components/audit/PayButton";
import { AUDIT_CHANNELS, AUDIT_GOALS } from "@/lib/audit/growthAudit";

const field = "mt-1 block w-full rounded-xl border border-white/15 bg-obsidian px-4 py-3 text-base text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

interface Requested {
  token: string;
  feeLabel: string;
  creditDays: number;
  headline: string;
  checkoutUrl: string | null;
  notice: string | null;
}

export function AuditForm({ industries, feeLabel, creditDays }: { industries: string[]; feeLabel: string; creditDays: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState<Requested | null>(null);
  const started = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function begin() {
    if (started.current) return;
    started.current = true;
    sendFunnelEvent("audit_started", { source: "audit-page" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: f.get("businessName"),
          website: f.get("website"),
          industry: f.get("industry"),
          city: f.get("city"),
          email: f.get("email"),
          phone: f.get("phone"),
          goal: f.get("goal"),
          channels: f.getAll("channels"),
          consent: f.get("consent") === "on",
          company_url: f.get("company_url"),
        }),
      });
      if (res.status === 204) return;
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      // In development with no Stripe, the audit is already unlocked; go straight to it.
      if (data.paid && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setRequested({ token: data.token, feeLabel, creditDays, headline: data.teaser.headline, checkoutUrl: data.checkoutUrl, notice: data.notice });
      setTimeout(() => resultRef.current?.focus(), 50);
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (requested) {
    return (
      <div ref={resultRef} tabIndex={-1} className="mx-auto mt-10 max-w-xl text-left outline-none" aria-live="polite">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your audit is ready</p>
          <p className="mt-3 font-display text-2xl text-ice">{requested.headline}</p>
          <p className="mt-3 text-sm text-ice/60">
            The full audit shows exactly what we saw, what we suggest, and what it costs. It is {requested.feeLabel}, and the whole fee comes back as a {requested.feeLabel} credit toward your first order within {requested.creditDays} days.
          </p>
          <div className="mt-5">
            <PayButton token={requested.token} url={requested.checkoutUrl} label={`Get my audit for ${requested.feeLabel}`} />
          </div>
          {requested.notice && (
            <p role="alert" className="mt-3 text-sm text-amber-200">
              {requested.notice}
            </p>
          )}
          <p className="mt-4 text-xs text-ice/40">We also saved your audit at a private link, so you can come back to it. Secure payment by Stripe.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocus={begin} className="mt-10 space-y-6 text-left" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-ice/70">
          Business name
          <input name="businessName" required maxLength={120} autoComplete="organization" className={field} placeholder="Joe's Barbershop" />
        </label>
        <label className="block text-sm text-ice/70">
          Website <span className="text-ice/30">(optional)</span>
          <input name="website" maxLength={200} inputMode="url" autoComplete="url" className={field} placeholder="joesbarbershop.com" />
        </label>
        <label className="block text-sm text-ice/70">
          Industry
          <select name="industry" className={field} defaultValue="">
            <option value="">Choose one</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </label>
        <label className="block text-sm text-ice/70">
          Location
          <input name="city" maxLength={80} autoComplete="address-level2" className={field} placeholder="City and state" />
        </label>
        <label className="block text-sm text-ice/70">
          Email
          <input name="email" type="email" required maxLength={120} autoComplete="email" className={field} placeholder="you@yourbusiness.com" />
        </label>
        <label className="block text-sm text-ice/70">
          Phone <span className="text-ice/30">(optional)</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} placeholder="(555) 555-0142" />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm text-ice/70">What is your main goal?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {AUDIT_GOALS.map((g, i) => (
            <label key={g.value} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-white/15 px-4 text-sm text-ice/80 has-[:checked]:border-gold has-[:checked]:bg-gold/10">
              <input type="radio" name="goal" value={g.value} required defaultChecked={i === 1} className="accent-[#d4af6a]" />
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm text-ice/70">Where do customers find you today? <span className="text-ice/30">(pick any)</span></legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {AUDIT_CHANNELS.map((c) => (
            <label key={c} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-white/15 px-4 text-sm text-ice/80 has-[:checked]:border-gold has-[:checked]:bg-gold/10">
              <input type="checkbox" name="channels" value={c} className="accent-[#d4af6a]" />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Only a bot fills this in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input name="company_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-ice/60">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[#d4af6a]" />
        <span>
          Prepare my audit and follow up about it. We look at your public homepage and what you tell us here, nothing else. See our{" "}
          <Link href="/privacy" className="text-gold underline">Privacy Policy</Link>. You can say &ldquo;no thanks&rdquo; at any time.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 text-base font-semibold text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto">
        {busy ? "Reading your homepage..." : "See what we found"}
      </button>
      <p className="text-xs text-ice/40">You will see what we found before you pay anything. The full audit is {feeLabel}, credited in full toward your first order.</p>
      {busy && <p className="text-xs text-ice/40">This takes a few seconds. We are reading your public homepage.</p>}
    </form>
  );
}
