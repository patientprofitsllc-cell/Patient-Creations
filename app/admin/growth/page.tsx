import { db } from "@/lib/db";
import { FUNNEL_EVENTS, type FunnelEvent } from "@/lib/analytics/funnel";
import { acquisitionProgress, funnelRows, getAcquisitionConfig } from "@/lib/analytics/growth";
import { NFC_BUNDLE_SLUG } from "@/lib/payments/nfcAddon";
import { OFFER_SLUG } from "@/lib/site/offer";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const EVENT_LABELS: Record<FunnelEvent, string> = {
  landing_page_view: "Landing page views",
  offer_view: "Saw the offer",
  checkout_started: "Started checkout",
  checkout_completed: "Paid",
  intake_started: "Opened the intake",
  intake_completed: "Finished the intake",
  production_started: "Build started",
  preview_created: "Preview created",
  revision_requested: "Revision requested",
  approved: "Approved",
  deployed: "Deployed live",
  upsell_view: "Saw an upsell",
  upsell_purchase: "Bought an upsell",
  subscription_started: "Started a care plan",
  referral_clicked: "Referral click",
  referral_purchase: "Referral purchase",
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-2 font-display text-3xl text-ice">{value}</p>
      {sub && <p className="mt-1 text-xs text-ice/40">{sub}</p>}
    </div>
  );
}

export default async function AdminGrowthPage() {
  const cfg = getAcquisitionConfig();
  const now = new Date();

  const [paidOrders, eventGroups, landingRows, waiting] = await Promise.all([
    db.order.findMany({
      where: { status: "PAID", paidAt: { gte: cfg.start } },
      select: { customerId: true, totalCents: true, campaignSource: true, items: { select: { product: { select: { slug: true } } } } },
    }),
    db.analyticsEvent.groupBy({
      by: ["name"],
      _count: { _all: true },
      where: { createdAt: { gte: cfg.start }, name: { in: [...FUNNEL_EVENTS] } },
    }),
    db.analyticsEvent.findMany({
      where: { createdAt: { gte: cfg.start }, name: "landing_page_view" },
      select: { payloadJson: true },
      take: 20000,
    }),
    db.websiteIntake.findMany({
      where: { status: "STARTED", order: { status: "PAID" } },
      select: { businessName: true, order: { select: { paidAt: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const customers = new Set(paidOrders.map((o) => o.customerId));
  const progress = acquisitionProgress(cfg, customers.size, now);
  const revenue = paidOrders.reduce((s, o) => s + o.totalCents, 0);
  const websiteOrders = paidOrders.filter((o) => o.items.some((i) => i.product.slug === OFFER_SLUG || i.product.slug === NFC_BUNDLE_SLUG)).length;

  const counts: Partial<Record<FunnelEvent, number>> = {};
  for (const g of eventGroups) counts[g.name as FunnelEvent] = g._count._all;
  const visitors = new Set<string>();
  for (const r of landingRows) {
    try {
      const id = (JSON.parse(r.payloadJson) as { visitorId?: string }).visitorId;
      if (id) visitors.add(id);
    } catch {
      /* ignore an unreadable row */
    }
  }
  const rows = funnelRows(counts);
  const untracked = rows.filter((r) => !r.instrumented).length;

  const bySource = new Map<string, { orders: number; cents: number }>();
  for (const o of paidOrders) {
    const key = o.campaignSource ?? "direct or unknown";
    const cur = bySource.get(key) ?? { orders: 0, cents: 0 };
    bySource.set(key, { orders: cur.orders + 1, cents: cur.cents + o.totalCents });
  }
  const sources = [...bySource.entries()].sort((a, b) => b[1].orders - a[1].orders);

  const dayLabel = progress.notStarted ? "Not started" : progress.ended ? "Window ended" : `Day ${progress.dayNumber} of ${cfg.days}`;
  const pct = Math.min(100, Math.round((progress.current / progress.goal) * 100));
  const waitingDays = (paidAt: Date | null) => (paidAt ? Math.floor((now.getTime() - paidAt.getTime()) / 86_400_000) : 0);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl text-ice">{cfg.days}-day customer acquisition</h2>
          <p className="text-sm text-ice/50">
            {dayLabel} · started {cfg.start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Goal" value={String(progress.goal)} sub="paying customers" />
          <Stat label="Current" value={String(progress.current)} sub={`${pct}% of goal`} />
          <Stat label="Remaining" value={String(progress.remaining)} sub={`${progress.daysLeft} days left`} />
          <Stat label="Needed per day" value={String(progress.requiredPerDay)} sub={`actual so far: ${progress.actualPerDay.toFixed(1)}/day`} />
        </div>
        <p className="mt-3 text-xs text-ice/40">
          At the pace so far this would reach about {progress.projected} by the end of the window. That is arithmetic on your
          real counts, not a forecast. The goal, length, and start date come from the ACQUISITION_GOAL, ACQUISITION_DAYS, and
          ACQUISITION_START_DATE settings.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Revenue in window" value={money(revenue)} sub={`${paidOrders.length} paid orders`} />
        <Stat label="Website orders" value={String(websiteOrders)} sub="including the all-in-one bundle" />
        <Stat label="Unique visitors" value={String(visitors.size)} sub="landing page, by browser" />
        <Stat
          label="Visitor to customer"
          value={visitors.size > 0 ? `${((progress.current / visitors.size) * 100).toFixed(1)}%` : "n/a"}
          sub="paying customers / unique visitors"
        />
      </section>

      <section>
        <h2 className="font-display text-2xl text-ice">Funnel</h2>
        <p className="mt-1 text-sm text-ice/50">Event counts since the start date. Each row shows the share of the stage before it.</p>
        <div className="glass-panel mt-4 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ice/40">
              <tr>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3 text-right">Count</th>
                <th className="px-5 py-3 text-right">From previous</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.event} className="border-t border-white/5">
                  <td className="px-5 py-3 text-ice/80">{EVENT_LABELS[r.event]}</td>
                  {r.instrumented ? (
                    <>
                      <td className="px-5 py-3 text-right text-ice">{r.count}</td>
                      <td className="px-5 py-3 text-right text-ice/60">{r.rateFromPrevious === null ? "n/a" : `${r.rateFromPrevious}%`}</td>
                    </>
                  ) : (
                    <td colSpan={2} className="px-5 py-3 text-right text-xs text-ice/30">
                      not tracked yet
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {untracked > 0 && (
          <p className="mt-2 text-xs text-ice/40">
            {untracked} stages are defined but nothing records them yet.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-ice">Where paying customers came from</h2>
          {sources.length === 0 ? (
            <p className="mt-3 text-sm text-ice/40">No paid orders in the window yet.</p>
          ) : (
            <div className="glass-panel mt-4 rounded-2xl">
              {sources.map(([source, v]) => (
                <div key={source} className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm first:border-t-0">
                  <span className="text-ice/80">{source}</span>
                  <span className="text-ice/60">
                    {v.orders} orders · {money(v.cents)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-ice/40">
            Comes from ?utm_source, ?utm_campaign, and ?ref links. Add them to your links so this fills in.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-ice">Paid, waiting on the customer&apos;s intake</h2>
          {waiting.length === 0 ? (
            <p className="mt-3 text-sm text-ice/40">Nobody is waiting. Every paid website has its intake.</p>
          ) : (
            <div className="glass-panel mt-4 rounded-2xl">
              {waiting.map((w, i) => (
                <div key={i} className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm first:border-t-0">
                  <span className="text-ice/80">{w.businessName}</span>
                  <span className="text-ice/60">{waitingDays(w.order.paidAt)} days</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-ice/40">These builds haven&apos;t started. Message them from their project page.</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ice">Outreach pipeline</h2>
        <p className="mt-2 text-sm text-ice/50">
          Not available yet. Businesses found, audited, contacted, replied, and calls booked need the prospecting tool, which
          hasn&apos;t been built. Nothing here is estimated in the meantime.
        </p>
      </section>
    </div>
  );
}
