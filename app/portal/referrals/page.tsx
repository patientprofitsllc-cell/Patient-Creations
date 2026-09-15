import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { ensureReferralForCustomer } from "@/lib/referrals/codes";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const customer = await db.customer.findUnique({ where: { userId: session!.user.id as string } });
  if (!customer) return <p className="text-ice/50">No customer profile found.</p>;
  const referral = await ensureReferralForCustomer(customer.id);

  const [clicks, commissions] = await Promise.all([
    db.referralClick.findMany({ where: { referralId: referral.id }, orderBy: { createdAt: "desc" } }),
    db.commission.findMany({ where: { referralId: referral.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const link = `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/referrals/click?code=${referral.code}`;
  const totals = commissions.reduce(
    (acc, c) => {
      acc.gross += c.grossRevenueCents;
      if (c.state === "PAID") acc.paid += c.commissionCents;
      else if (["PENDING", "APPROVED", "PAYABLE"].includes(c.state)) acc.pending += c.commissionCents;
      return acc;
    },
    { gross: 0, paid: 0, pending: 0 },
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-champagne/70">Referral Program</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Share your creation and earn.</h1>
        <p className="mt-2 text-ice/50">Earn 10% commission on revenue from customers you refer.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <p className="mb-2 text-sm text-ice/50">Your referral link</p>
        <code className="block break-all rounded-lg bg-black/40 p-3 text-gold">{link}</code>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-ice/40">Clicks</p>
          <p className="mt-2 font-display text-2xl text-ice">{clicks.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-ice/40">Pending Commission</p>
          <p className="mt-2 font-display text-2xl text-champagne">{money(totals.pending)}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-ice/40">Paid Out</p>
          <p className="mt-2 font-display text-2xl text-gold">{money(totals.paid)}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-ice">Commission History</h2>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {commissions.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 text-sm">
              <span className="text-ice/60">{new Date(c.createdAt).toLocaleDateString()}</span>
              <span className="text-ice">{money(c.commissionCents)}</span>
              <span className="text-ice/40">{c.state}</span>
            </div>
          ))}
          {commissions.length === 0 && <p className="p-4 text-ice/40">No referred purchases yet.</p>}
        </div>
      </div>
    </div>
  );
}
