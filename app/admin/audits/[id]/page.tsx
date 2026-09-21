import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CopyMessage, MarkContacted } from "@/components/audit/AuditAdminActions";
import type { OwnerBriefing } from "@/lib/audit/briefing";
import type { GrowthAuditReport } from "@/lib/audit/growthAudit";

const SEV = { high: "text-red-300 border-red-400/40", medium: "text-amber-300 border-amber-400/40", low: "text-ice/60 border-white/15" } as const;

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  if (!/^[a-z0-9]{20,40}$/.test(params.id)) notFound();
  const audit = await db.growthAudit.findUnique({ where: { id: params.id } });
  if (!audit) notFound();
  const briefing = audit.briefingJson ? (JSON.parse(audit.briefingJson) as OwnerBriefing) : null;
  const report = JSON.parse(audit.reportJson) as GrowthAuditReport;
  const prospect = audit.prospectId ? await db.prospect.findUnique({ where: { id: audit.prospectId }, select: { status: true, phone: true } }) : null;
  const contacted = Boolean(prospect && !["NEW", "AUDITED"].includes(prospect.status));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/audits" className="text-sm text-ice/50 hover:text-gold">← All paid audits</Link>
        <h2 className="mt-3 font-display text-2xl text-ice">{audit.businessName}</h2>
        <p className="mt-1 text-sm text-ice/50">
          {audit.email}
          {prospect?.phone ? ` · ${prospect.phone}` : ""} · {audit.status === "PAID" ? "paid" : "not paid"}
          {audit.creditCode ? ` · credit ${audit.creditCode} ${audit.creditUsedAt ? "(used)" : `(open until ${audit.creditExpiresAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`}` : ""}
        </p>
      </div>

      {!briefing ? (
        <p className="glass-panel rounded-2xl p-5 text-sm text-ice/60">{audit.status === "PAID" ? "The analyst briefing was not created for this audit." : "The analyst briefing is created when the audit is paid."}</p>
      ) : (
        <>
          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Analyst summary</p>
            <p className="mt-2 text-lg text-ice">{briefing.summary}</p>
            <p className="mt-2 text-xs text-ice/50">{briefing.confidenceNote}</p>
            <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
              <span className="text-gold">Next: </span>
              {briefing.nextAction}
            </p>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">What they need</p>
            {briefing.needs.length === 0 ? (
              <p className="mt-2 text-sm text-ice/50">No clear gap on the basics. Lead with a conversation.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {briefing.needs.map((n) => (
                  <li key={n.id} className="rounded-xl border border-white/10 p-4">
                    <p className="flex flex-wrap items-center gap-2 text-ice">
                      {n.need}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${SEV[n.severity]}`}>{n.severity}</span>
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-ice/60">
                      {n.evidence.map((e) => (
                        <li key={e}>Evidence: {e}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">What to offer</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
                <p className="text-xs text-gold">Offer first</p>
                <p className="mt-1 text-ice">{briefing.primary.title} <span className="text-gold">{briefing.primary.price}</span></p>
                <p className="mt-1 text-sm text-ice/60">{briefing.primary.why}</p>
              </div>
              {briefing.secondary && (
                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-xs text-ice/50">Then</p>
                  <p className="mt-1 text-ice">{briefing.secondary.title} <span className="text-gold">{briefing.secondary.price}</span></p>
                  <p className="mt-1 text-sm text-ice/60">{briefing.secondary.why}</p>
                </div>
              )}
            </div>
            {briefing.bundle && <p className="mt-3 text-sm text-ice/60">The {briefing.bundle.title} ({briefing.bundle.price}) covers several of these; buying the parts separately is {briefing.bundle.separately}.</p>}
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ice/50">Do not</p>
            <ul className="mt-1 space-y-1 text-sm text-ice/60">
              {briefing.avoid.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Ready-to-send message</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/40 p-4 font-sans text-sm text-ice/80">{briefing.suggestedMessage}</pre>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CopyMessage text={briefing.suggestedMessage} />
              <a href={`mailto:${audit.email}?subject=${encodeURIComponent("Your Growth Audit")}&body=${encodeURIComponent(briefing.suggestedMessage)}`} className="inline-flex min-h-[40px] items-center rounded-full border border-white/15 px-4 text-sm text-ice/80 transition hover:border-gold/50 hover:text-gold">
                Open in email
              </a>
              <MarkContacted auditId={audit.id} done={contacted} />
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Talking points and objections</p>
            <ul className="mt-3 space-y-2 text-sm text-ice/70">
              {briefing.talkingPoints.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 text-sm">
              {briefing.objections.map((o) => (
                <div key={o.objection}>
                  <dt className="text-ice">&ldquo;{o.objection}&rdquo;</dt>
                  <dd className="text-ice/60">{o.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <section className="glass-panel rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">What the customer sees</p>
        <ul className="mt-3 space-y-1 text-sm text-ice/60">
          {report.observed.items.map((i) => (
            <li key={i.label + i.source}>
              {i.status === "issue" ? "Needs attention: " : i.status === "good" ? "Fine: " : ""}
              {i.label}
              {i.detail ? ` (${i.detail})` : ""} <span className="text-ice/30">[{i.source}]</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ice/40">
          Customer's private report: <Link className="text-gold underline" href={`/audit/report/${audit.token}`}>/audit/report/…</Link>
        </p>
      </section>
    </div>
  );
}
