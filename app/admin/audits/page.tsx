import Link from "next/link";
import { db } from "@/lib/db";
import { AUDIT_FEE_CENTS, usd } from "@/lib/pricing/catalog";
import type { OwnerBriefing } from "@/lib/audit/briefing";

const day = (d: Date | null) => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

export default async function AuditsPage() {
  const [paid, unpaid, counts] = await Promise.all([
    db.growthAudit.findMany({ where: { status: "PAID" }, orderBy: { paidAt: "desc" }, take: 100 }),
    db.growthAudit.count({ where: { status: "PENDING" } }),
    db.growthAudit.groupBy({ by: ["status"], _count: true }),
  ]);
  const now = new Date();
  const revenue = paid.reduce((s, a) => s + a.amountCents, 0);
  const credited = paid.filter((a) => a.creditUsedAt).length;
  void counts;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-ice">Paid audits</h2>
        <p className="mt-2 max-w-2xl text-sm text-ice/50">
          Everyone who paid for a Growth Audit is a serious lead. For each, the analyst read their homepage and tells you what they need, which product to offer first, and what to say.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Paid audits", String(paid.length)],
          ["Audit fees", usd(revenue)],
          ["Credits used on an order", `${credited} of ${paid.length}`],
          ["Started, not paid", String(unpaid)],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-ice/40">{label}</p>
            <p className="mt-1 font-display text-2xl text-ice">{value}</p>
          </div>
        ))}
      </div>

      <section className="glass-panel rounded-2xl">
        <p className="border-b border-white/5 px-5 py-4 text-ice">Newest first (fee {usd(AUDIT_FEE_CENTS)}, credited toward the first order)</p>
        {paid.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ice/40">No one has paid for an audit yet.</p>
        ) : (
          <ul>
            {paid.map((a) => {
              const b = a.briefingJson ? (JSON.parse(a.briefingJson) as OwnerBriefing) : null;
              const credit = a.creditUsedAt ? "credit used" : a.creditExpiresAt && a.creditExpiresAt < now ? "credit expired" : "credit open";
              return (
                <li key={a.id} className="border-t border-white/5 px-5 py-4 text-sm first:border-t-0">
                  <Link href={`/admin/audits/${a.id}`} className="block hover:text-gold">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-ice">{a.businessName}</p>
                      <p className="text-xs text-ice/40">
                        {day(a.paidAt)} · {credit}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-ice/50">{b ? b.summary : "Briefing not available."}</p>
                    {b && (
                      <p className="mt-1 text-xs text-gold/80">
                        Offer first: {b.primary.title} ({b.primary.price})
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
