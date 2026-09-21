"use client";

import Link from "next/link";
import { sendFunnelEvent } from "@/components/analytics/Track";
import { AUDIT_DEFINITIONS, type GrowthAuditReport } from "@/lib/audit/growthAudit";

function Badge({ kind }: { kind: "Observed" | "Recommended" | "Estimated" }) {
  const tone = kind === "Observed" ? "border-emerald-400/40 text-emerald-300" : kind === "Recommended" ? "border-gold/50 text-gold" : "border-sky-400/40 text-sky-300";
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}>{kind}</span>;
}

export interface CreditInfo {
  code: string;
  amount: string;
  expires: string;
  used: boolean;
}

/** The full audit, shown only to someone who has paid for it. Everything is labeled Observed, Recommended, or Estimated. */
export function AuditReportView({ report, credit }: { report: GrowthAuditReport; credit: CreditInfo | null }) {
  return (
    <div className="space-y-8 text-left">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your Growth Audit</p>
        <h2 className="mt-2 font-display text-3xl text-ice">{report.businessName}</h2>
      </div>

      {credit && (
        <section className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/15 to-transparent p-6" aria-labelledby="credit-title">
          <h3 id="credit-title" className="font-display text-xl text-ice">Your {credit.amount} credit</h3>
          <p className="mt-2 text-sm text-ice/70">
            Your audit fee comes back toward your first order. Enter this code in the coupon box at checkout. It works once, until {credit.expires}.
          </p>
          <p className="mt-3 select-all rounded-lg bg-black/40 px-4 py-3 text-center font-mono text-lg tracking-widest text-gold">{credit.code}</p>
          {credit.used && <p className="mt-2 text-xs text-amber-300">This code has already been used.</p>}
        </section>
      )}

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
        <p className="mt-2 text-sm text-ice/60">Start with the first suggestion, or reply to your audit email and we will walk through it with you.{credit ? " Your credit is applied at checkout." : ""}</p>
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
