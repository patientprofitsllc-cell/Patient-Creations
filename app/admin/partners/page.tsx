import { PartnerAdmin } from "@/components/partners/PartnerAdmin";
import { approveMaturedCommissions } from "@/lib/referrals/commissions";
import { approveMaturedPartnerCommissions, loadAdminPartners } from "@/lib/partners/service";
import { PARTNER, usd } from "@/lib/pricing/catalog";

export const dynamic = "force-dynamic";

const date = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminPartnersPage() {
  // Nothing runs on a timer here, so commissions whose hold has ended are approved (or voided) whenever this page opens.
  await approveMaturedCommissions().catch(() => undefined);
  await approveMaturedPartnerCommissions().catch(() => undefined);
  const partners = await loadAdminPartners();

  const active = partners.filter((p) => p.status === "ACTIVE").length;
  const waiting = partners.filter((p) => p.status === "APPLIED").length;
  const owed = partners.reduce((s, p) => s + p.totals.approvedCents, 0);
  const pending = partners.reduce((s, p) => s + p.totals.pendingCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Partner program</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Partners</h1>
        <p className="mt-2 max-w-2xl text-sm text-ice/60">
          People who send you customers. Applications come from /partners. When you approve one, they are emailed a private dashboard and a link. Commissions are held {PARTNER.pendingDays} days, approved once the customer&apos;s whole order is paid, and paid by you, by hand.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-ice/40">Waiting for a decision</p><p className="mt-1 font-display text-2xl text-ice">{waiting}</p></div>
        <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-ice/40">Active partners</p><p className="mt-1 font-display text-2xl text-ice">{active}</p></div>
        <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-ice/40">Commissions on hold</p><p className="mt-1 font-display text-2xl text-ice">{usd(pending)}</p></div>
        <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-ice/40">Approved, for you to pay</p><p className="mt-1 font-display text-2xl text-champagne">{usd(owed)}</p></div>
      </div>

      <PartnerAdmin
        defaultPercent={PARTNER.defaultPercent}
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          company: p.company,
          type: p.type,
          website: p.website,
          about: p.about,
          status: p.status,
          code: p.code,
          percent: p.percent,
          applied: date(p.createdAt),
          clicks: p.clicks,
          leads: p.leads,
          commissions: p.commissions,
          pending: usd(p.totals.pendingCents),
          approved: usd(p.totals.approvedCents),
          approvedCents: p.totals.approvedCents,
          paid: usd(p.totals.paidCents),
          dashboardUrl: p.dashboardUrl,
        }))}
      />
    </div>
  );
}
