import { db } from "@/lib/db";
import { DeliveryForm } from "@/components/ads/DeliveryForm";
import { BRIEF_FIELDS, getAdPlan, planQuota, periodLabel, type BriefKey } from "@/lib/ads/plans";
import { adPlanMrrCents } from "@/lib/ads/data";

const money = (cents: number) => (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "text-champagne",
  PAST_DUE: "text-red-300",
  PENDING: "text-ice/50",
  CANCELED: "text-ice/40",
};

export default async function AdminAdsPage() {
  const period = periodLabel(new Date());
  const [subs, mrr] = await Promise.all([
    db.adSubscription.findMany({
      where: { status: { in: ["ACTIVE", "PAST_DUE", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      include: { customer: { include: { user: { select: { email: true, name: true } } } }, deliveries: { orderBy: { createdAt: "desc" } } },
    }),
    adPlanMrrCents(),
  ]);
  const ended = await db.adSubscription.count({ where: { status: "CANCELED" } });
  const needBrief = subs.filter((s) => s.status === "ACTIVE" && !JSON.parse(s.briefJson || "{}").offer).length;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl text-ice">Monthly Ads plans</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Active plans" value={String(mrr.active)} sub="paying monthly" />
          <Stat label="Monthly recurring" value={money(mrr.cents)} sub="from active plans" />
          <Stat label="Payment failed" value={String(mrr.pastDue)} sub="Stripe is retrying" />
          <Stat label="Waiting on a brief" value={String(needBrief)} sub={`${ended} canceled so far`} />
        </div>
        <p className="mt-3 text-xs text-ice/40">
          Work delivered by link or email is logged below so the customer sees it on their plan page. Period {period}. Unused items do not carry over.
        </p>
      </section>

      {subs.length === 0 ? (
        <p className="text-sm text-ice/50">No Monthly Ads plans yet.</p>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const plan = getAdPlan(s.planSlug);
            const quota = plan ? planQuota(plan).items : 0;
            const doneThisMonth = s.deliveries.filter((d) => d.period === period).reduce((n, d) => n + d.itemsCount, 0);
            let brief: Partial<Record<BriefKey, string>> = {};
            try {
              brief = JSON.parse(s.briefJson) as Partial<Record<BriefKey, string>>;
            } catch {
              /* unreadable brief shows as empty */
            }
            return (
              <article key={s.id} className="glass-panel rounded-2xl p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-ice">
                    {s.businessName} <span className="text-sm text-ice/50">· {plan?.name ?? s.planSlug} · {money(s.priceCents)}/mo</span>
                  </p>
                  <p className={`text-sm ${STATUS_STYLE[s.status] ?? "text-ice/60"}`}>{s.status}</p>
                </div>
                <p className="mt-1 text-xs text-ice/50">
                  {s.customer.user.name} · {s.customer.user.email}
                  {s.phone ? ` · ${s.phone}` : ""}
                  {s.currentPeriodEnd ? ` · renews ${s.currentPeriodEnd.toLocaleDateString()}` : ""}
                  {s.cancelAtPeriodEnd ? " · ends at period end" : ""}
                </p>
                <p className="mt-2 text-sm text-ice/80">
                  This month: <strong>{doneThisMonth}</strong> of {quota} items delivered
                </p>

                <details className="mt-3 text-sm text-ice/70">
                  <summary className="cursor-pointer text-ice/80 hover:text-gold">{brief.offer ? "Their brief" : "No brief yet"}</summary>
                  {brief.offer ? (
                    <dl className="mt-2 space-y-2">
                      {BRIEF_FIELDS.filter((f) => brief[f.key]).map((f) => (
                        <div key={f.key}>
                          <dt className="text-xs text-ice/40">{f.label}</dt>
                          <dd className="whitespace-pre-line">{brief[f.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-2 text-xs text-ice/50">They have not filled in this month&apos;s brief.</p>
                  )}
                </details>

                {s.deliveries.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-ice/60">
                    {s.deliveries.slice(0, 5).map((d) => (
                      <li key={d.id}>
                        {d.period} · {d.itemsCount} items · {d.note}
                      </li>
                    ))}
                  </ul>
                )}

                {(s.status === "ACTIVE" || s.status === "PAST_DUE") && <DeliveryForm subscriptionId={s.id} />}
                <p className="mt-3 break-all text-xs text-ice/30">Customer plan page: /monthly-ads/manage/{s.manageToken}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-2 font-display text-3xl text-ice">{value}</p>
      {sub && <p className="mt-1 text-xs text-ice/40">{sub}</p>}
    </div>
  );
}
