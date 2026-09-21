import { BarChart } from "@/components/revenue/BarChart";
import { PlanningCalculator } from "@/components/revenue/PlanningCalculator";
import { SpendForm } from "@/components/revenue/SpendForm";
import { loadRevenue } from "@/lib/revenue/service";
import { exampleScenario } from "@/lib/revenue/plan";
import { monthKey, startOfMonth } from "@/lib/revenue/time";
import type { Rate } from "@/lib/revenue/metrics";

export const dynamic = "force-dynamic";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const money2 = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const rateText = (r: Rate) => (r.percent === null ? `Not enough yet (${r.numerator} of ${r.denominator})` : `${r.percent}% (${r.numerator} of ${r.denominator})`);

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-1 font-display text-2xl text-ice">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-snug text-ice/40">{note}</p>}
    </div>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div>
        <h2 id={id} className="font-display text-2xl text-ice">{title}</h2>
        {intro && <p className="mt-1 max-w-3xl text-sm text-ice/50">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function RevenuePage() {
  const now = new Date();
  const d = await loadRevenue(now);
  const win = Object.fromEntries(d.windows.map((w) => [w.key, w]));
  const pct = Math.min(100, Math.round((d.monthToDate.combinedCents / d.targetCents) * 100));
  const months = [2, 1, 0].map((b) => monthKey(startOfMonth(now, b)));

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">The {money(d.targetCents)} month</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Revenue and growth</h1>
        <p className="mt-2 max-w-3xl text-sm text-ice/60">
          Real numbers from your orders, payments, plans, and prospects. {money(d.targetCents)} a month is a target to measure against, not a forecast and not a promise. Cash is what has actually been collected. Days and months follow Eastern time.
        </p>
        <div className="mt-5 glass-panel rounded-2xl p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-ice">This month so far: {money(d.monthToDate.combinedCents)} of {money(d.targetCents)}</p>
            <p className="text-sm text-ice/50">{pct}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress toward this month's target">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-ice/40">
            {money(d.monthToDate.cashCents)} collected this month plus {money(d.monthToDate.monthlyPlansCents)} a month from active plans (Website Care and Monthly Ads, billed by Stripe).
          </p>
        </div>
      </div>

      <Section id="revenue" title="Revenue" intro="Cash collected from orders (deposits, final payments, extra work) and audit fees.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {(["today", "last7", "monthToDate", "lastMonth", "last30"] as const).map((k) => (
            <Tile key={k} label={win[k].label} value={money(win[k].totalCents)} note={win[k].auditCents > 0 ? `${money(win[k].ordersCents)} orders, ${money(win[k].auditCents)} audits` : undefined} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Monthly plans (MRR)" value={money(d.retention.mrrCents)} note="What active plans charge each month. Not counted in the cash above." />
          <Tile label="Average order" value={d.averageOrder.last30.count ? money(d.averageOrder.last30.cents) : "None yet"} note={`Last 30 days, ${d.averageOrder.last30.count} orders. The whole order, not just what has arrived.`} />
          <Tile label="Paid per customer so far" value={d.lifetime.customers ? money(d.lifetime.cents) : "None yet"} note={`Across ${d.lifetime.customers} paying customers. What they have paid, not a forecast.`} />
          <Tile label="From existing customers" value={money(d.expansion.last30.cents)} note={`Last 30 days, ${d.expansion.last30.orders} repeat order${d.expansion.last30.orders === 1 ? "" : "s"}. Expansion revenue.`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart points={d.daily} label="Cash by day, last 30 days" showEvery={5} />
          <BarChart points={d.monthly} label="Cash by month, last 6 months" />
        </div>
      </Section>

      <Section id="sales" title="Sales" intro="Counts for prospects added in the last 30 days. Calls, proposals, and stages come from what you mark on each prospect, so they are only as complete as you keep them.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Tile label="Leads" value={String(d.sales.last30.leads)} note={`${d.sales.monthToDate.leads} this month`} />
          <Tile label="Qualified" value={String(d.sales.last30.qualified)} note="Replied, booked, paid for an audit, or bought." />
          <Tile label="Calls" value={String(d.sales.last30.calls)} note="Marked call booked or won." />
          <Tile label="Proposals" value={String(d.sales.last30.proposals)} note="Set to Proposal or Payment, or won." />
          <Tile label="New customers" value={String(d.sales.last30.purchases)} note="First paid order in the window." />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Tile label="Visitors who became customers" value={rateText(d.sales.visitorToCustomer)} note="New customers over unique visitors, last 30 days." />
          <Tile label="Leads who became customers" value={rateText(d.sales.leadToWon)} note="Prospects added in the window that are now won." />
          <Tile label="Close rate" value={rateText(d.sales.closeRate)} note={`Won over won plus lost. All time: ${rateText(d.sales.close)}.`} />
        </div>
      </Section>

      <Section id="marketing" title="Marketing" intro="Where customers come from, and what it costs. Cost figures exist only for the spend you enter below.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Visitors, last 30 days" value={String(d.marketing.visitors30)} note={`${d.marketing.visitorsToday} today. Unique visitors to the landing pages.`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-ice/70">Revenue by source, last 30 days</h3>
            {d.marketing.bySource.length === 0 ? (
              <p className="text-sm text-ice/40">No paid orders in this window yet.</p>
            ) : (
              <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
                {d.marketing.bySource.map((s) => (
                  <li key={s.source} className="flex justify-between gap-3 px-4 py-3">
                    <span className="text-ice/80">{s.source}</span>
                    <span className="text-champagne">{money(s.cents)} <span className="text-ice/40">· {s.orders} order{s.orders === 1 ? "" : "s"}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-ice/70">Cost of getting customers</h3>
            <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
              {d.marketing.months.map((m) => (
                <li key={m.month} className="px-4 py-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-ice/80">{m.month}</span>
                    <span className="text-champagne">{m.totalCents > 0 ? money2(m.totalCents) : "No spend entered"}</span>
                  </div>
                  <p className="mt-1 text-xs text-ice/50">
                    {m.leads} leads, {m.customers} new customers
                    {m.costPerLeadCents !== null ? ` · ${money2(m.costPerLeadCents)} per lead` : ""}
                    {m.costPerCustomerCents !== null ? ` · ${money2(m.costPerCustomerCents)} per customer` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SpendForm months={months} entries={d.marketing.spend} />
      </Section>

      <Section id="retention" title="Retention" intro="Monthly plans (Website Care and Monthly Ads). Churn is an estimate from when plans were last changed.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Active plans" value={String(d.retention.active)} note={d.retention.pastDue > 0 ? `${d.retention.pastDue} past due` : "None past due"} />
          <Tile label="Monthly plans (MRR)" value={money(d.retention.mrrCents)} />
          <Tile label="Ended in 30 days" value={String(d.retention.churned30)} note="Churn, in plans." />
          <Tile label="Churn, 30 days" value={rateText(d.retention.churn30)} note="Ended over plans live 30 days ago." />
          <Tile label="Still active" value={rateText(d.retention.retained30)} note="Renewal, as an estimate: of plans live 30 days ago." />
          <Tile label="Expansion, this month" value={money(d.expansion.monthToDate.cents)} note="Cash from customers who had bought before." />
        </div>
      </Section>

      <Section id="products" title="Products" intro="Ranked by units sold. Rates need at least three customers behind them, so one sale never shows as 100%.">
        <div className="grid gap-3 md:grid-cols-4">
          <Tile label="Most purchased" value={d.products.mostPurchased?.name ?? "None yet"} note={d.products.mostPurchased ? `${d.products.mostPurchased.units} sold` : undefined} />
          <Tile label="Most revenue" value={d.products.mostRevenue?.name ?? "None yet"} note={d.products.mostRevenue ? money(d.products.mostRevenue.revenueCents) : undefined} />
          <Tile label="Highest upsell rate" value={d.products.bestUpsell?.name ?? "Not enough yet"} note={d.products.bestUpsell ? `${rateText(d.products.bestUpsell.upsell)} bought something else later` : "Needs 3 first-time buyers of a product."} />
          <Tile label="Most on a monthly plan" value={d.products.bestOnPlan?.name ?? "Not enough yet"} note={d.products.bestOnPlan ? rateText(d.products.bestOnPlan.onPlan) : "Retention product. Needs 3 buyers of a product."} />
        </div>
        <p className="text-xs text-ice/40">Most profitable product: we do not track what each product costs to deliver, so profit cannot be worked out yet. Revenue is shown instead.</p>
        {d.products.all.length > 0 && (
          <div className="glass-panel overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ice/40">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Sold</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Upsell rate</th>
                  <th className="px-4 py-3">On a plan</th>
                </tr>
              </thead>
              <tbody>
                {d.products.all.map((p) => (
                  <tr key={p.slug} className="border-t border-white/5">
                    <td className="px-4 py-3 text-ice">{p.name}</td>
                    <td className="px-4 py-3 text-ice/70">{p.units}</td>
                    <td className="px-4 py-3 text-champagne">{money(p.revenueCents)}</td>
                    <td className="px-4 py-3 text-ice/60">{rateText(p.upsell)}</td>
                    <td className="px-4 py-3 text-ice/60">{rateText(p.onPlan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <PlanningCalculator initial={exampleScenario()} targetCents={d.targetCents} actualOneTimeCents={d.monthToDate.cashCents} actualMonthlyCents={d.monthToDate.monthlyPlansCents} />

      {d.truncated && <p className="text-xs text-ice/40">Showing the newest 5,000 records.</p>}
    </div>
  );
}
