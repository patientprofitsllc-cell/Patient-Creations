"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { sendFunnelEvent } from "@/components/analytics/Track";
import { AUDIT_CHANNELS, AUDIT_DEFINITIONS, AUDIT_GOALS, type GrowthAuditReport } from "@/lib/audit/growthAudit";

const field = "mt-1 block w-full rounded-xl border border-white/15 bg-obsidian px-4 py-3 text-base text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

function Badge({ kind }: { kind: "Observed" | "Recommended" | "Estimated" }) {
  const tone = kind === "Observed" ? "border-emerald-400/40 text-emerald-300" : kind === "Recommended" ? "border-gold/50 text-gold" : "border-sky-400/40 text-sky-300";
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}>{kind}</span>;
}

export function AuditForm({ industries }: { industries: string[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GrowthAuditReport | null>(null);
  const [emailed, setEmailed] = useState(false);
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
      setReport(data.report as GrowthAuditReport);
      setEmailed(Boolean(data.emailed));
      setTimeout(() => resultRef.current?.focus(), 50);
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (report) {
    return (
      <div ref={resultRef} tabIndex={-1} className="mt-10 space-y-8 text-left outline-none" aria-live="polite">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your Growth Audit</p>
          <h2 className="mt-2 font-display text-3xl text-ice">{report.businessName}</h2>
          <p className="mt-2 text-sm text-ice/50">{emailed ? "We also emailed you a copy." : "Save this page: we could not send the email copy right now."}</p>
        </div>

        <section className="glass-panel rounded-2xl p-6" aria-labelledby="obs">
          <div className="flex items-center gap-3">
            <Badge kind="Observed" />
            <h3 id="obs" className="font-display text-xl text-ice">What we saw</h3>
          </div>
          <p className="mt-2 text-xs text-ice/40">{AUDIT_DEFINITIONS.observed}</p>
          {report.observed.website.note && <p className="mt-3 text-sm text-ice/70">{report.observed.website.note}</p>}
          <ul className="mt-3 space-y-2">
            {report.observed.items.map((i) => (
              <li key={i.label + i.source} className="flex items-start gap-3 text-sm text-ice/80">
                <span aria-hidden className={`mt-0.5 ${i.status === "good" ? "text-emerald-300" : i.status === "issue" ? "text-amber-300" : "text-ice/40"}`}>
                  {i.status === "good" ? "✓" : i.status === "issue" ? "!" : "·"}
                </span>
                <span>
                  {i.label}
                  {i.detail ? <span className="text-ice/50">: {i.detail}</span> : null}
                  <span className="sr-only">{i.status === "good" ? " (fine)" : i.status === "issue" ? " (needs attention)" : ""}</span>
                  <span className="ml-2 text-xs text-ice/30">{i.source}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-6" aria-labelledby="rec">
          <div className="flex items-center gap-3">
            <Badge kind="Recommended" />
            <h3 id="rec" className="font-display text-xl text-ice">What we suggest</h3>
          </div>
          <p className="mt-2 text-xs text-ice/40">{AUDIT_DEFINITIONS.recommended}</p>
          <ul className="mt-4 space-y-4">
            {report.recommended.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 p-4">
                <p className="text-ice">{r.title}</p>
                <p className="mt-1 text-sm text-ice/60">{r.why}</p>
                <p className="mt-2 text-xs text-ice/40">Based on: {r.basedOn.join("; ")}.</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-6" aria-labelledby="est">
          <div className="flex items-center gap-3">
            <Badge kind="Estimated" />
            <h3 id="est" className="font-display text-xl text-ice">What it costs and how long it takes</h3>
          </div>
          <p className="mt-2 text-xs text-ice/40">{AUDIT_DEFINITIONS.estimated}</p>
          <ul className="mt-3 divide-y divide-white/10 text-sm">
            {report.estimated.map((e) => (
              <li key={e.title} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-ice/80">
                <span>{e.title}</span>
                <span className="text-ice">
                  {e.price}
                  {e.timing && <span className="ml-2 text-xs text-ice/40">delivery target {e.timing}</span>}
                </span>
              </li>
            ))}
          </ul>
          {report.bundle && (
            <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
              <p className="text-ice">{report.bundle.title}: {report.bundle.price}</p>
              <p className="mt-1">Buying the same items one by one is {report.bundle.separately}, so the bundle saves {report.bundle.saving}.</p>
            </div>
          )}
        </section>

        <ul className="space-y-1 text-xs text-ice/40">
          {report.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <section className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/15 to-transparent p-6 text-center" aria-labelledby="plan">
          <h3 id="plan" className="font-display text-2xl text-ice">Get Your Patient Creations Growth Plan</h3>
          <p className="mt-2 text-sm text-ice/60">Start with the first suggestion, or book a call and we will walk through it with you.</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {report.recommended[0] && (
              <Link href={report.recommended[0].href} onClick={() => sendFunnelEvent("upsell_click", { source: "audit", offer: report.recommended[0].id })} className="inline-flex min-h-[48px] items-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-7 text-sm font-semibold text-obsidian shadow-gold-glow transition hover:brightness-110">
                Start with {report.recommended[0].title}
              </Link>
            )}
            <Link href="/services" className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-7 text-sm text-ice/80 transition hover:border-gold hover:text-gold">
              See everything we build
            </Link>
          </div>
        </section>
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
          Send me my audit and follow up about it. We look at your public homepage and what you tell us here, nothing else. See our{" "}
          <Link href="/privacy" className="text-gold underline">Privacy Policy</Link>. You can say &ldquo;no thanks&rdquo; at any time.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 text-base font-semibold text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto">
        {busy ? "Looking at your homepage..." : "Get my free audit"}
      </button>
      {busy && <p className="text-xs text-ice/40">This takes a few seconds. We are reading your public homepage.</p>}
    </form>
  );
}
