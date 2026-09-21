import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { AuditReportView } from "@/components/audit/AuditReportView";
import { PayButton } from "@/components/audit/PayButton";
import { db } from "@/lib/db";
import { AUDIT_CREDIT_DAYS, usd } from "@/lib/pricing/catalog";
import { auditTeaser, confirmAuditPayment } from "@/lib/audit/paid";
import type { GrowthAuditReport } from "@/lib/audit/growthAudit";

export const metadata: Metadata = { title: "Your Growth Audit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Private: only someone with this exact link can open it. It shows a free teaser until the fee is paid, then the whole audit.
export default async function AuditReportPage({ params, searchParams }: { params: { token: string }; searchParams: { session_id?: string } }) {
  if (!/^[a-f0-9]{48}$/.test(params.token)) notFound();
  let audit = await db.growthAudit.findUnique({ where: { token: params.token } });
  if (!audit) notFound();
  // Back from Stripe: ask Stripe (not the browser) whether it was paid, so the report opens without waiting for the webhook.
  if (audit.status === "PENDING" && searchParams.session_id) {
    await confirmAuditPayment(audit.id, searchParams.session_id);
    audit = (await db.growthAudit.findUnique({ where: { token: params.token } })) ?? audit;
  }
  const report = JSON.parse(audit.reportJson) as GrowthAuditReport;
  const paid = audit.status === "PAID";
  const teaser = auditTeaser(report);
  const fee = usd(audit.amountCents);
  const pendingConfirm = !paid && Boolean(searchParams.session_id);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 pb-28 pt-32 sm:pt-40">
        {paid ? (
          <AuditReportView
            report={report}
            credit={
              audit.creditCode && audit.creditExpiresAt
                ? { code: audit.creditCode, amount: fee, expires: audit.creditExpiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), used: Boolean(audit.creditUsedAt) }
                : null
            }
          />
        ) : (
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your Growth Audit</p>
            <h1 className="mt-3 font-display text-3xl text-ice sm:text-4xl">{report.businessName}</h1>
            {pendingConfirm && (
              <p role="status" className="mx-auto mt-6 max-w-md rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
                We are confirming your payment. If your audit does not open in a minute, refresh this page.
              </p>
            )}
            <div className="glass-panel mx-auto mt-8 max-w-xl rounded-2xl p-6 text-left">
              <p className="text-ice">{teaser.headline}</p>
              <p className="mt-3 text-sm text-ice/60">
                The full audit shows exactly what we saw, what we suggest, and what it costs. It is {fee}, and the whole fee comes back as a {fee} credit toward your first order within {AUDIT_CREDIT_DAYS} days.
              </p>
              <div className="mt-5">
                <PayButton token={params.token} label={`Get my audit for ${fee}`} />
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
