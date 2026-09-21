import { db } from "@/lib/db";
import { TARGET } from "@/lib/pricing/catalog";
import {
  averageOrderCents,
  cashIn,
  closeRate,
  dailySeries,
  expansionCents,
  lifetimeValueCents,
  monthlySeries,
  newCustomers,
  productStats,
  rate,
  revenueBySource,
  salesFunnel,
  spendSummary,
  subscriptionSummary,
  topBy,
  uniqueVisitors,
  windows,
  type OrderRow,
  type PaymentRow,
  type ProspectRow,
  type SpendRow,
  type SubRow,
} from "@/lib/revenue/metrics";
import { monthKey, startOfDayMinus, startOfMonth } from "@/lib/revenue/time";

// Reads the records and works out the dashboard. A few thousand rows is the scale here, so this reads them in a handful of
// bounded queries and does the arithmetic in the pure functions.

const LIMIT = 5000;

export async function loadRevenue(now = new Date()) {
  const since = startOfMonth(now, 5);
  const last30 = startOfDayMinus(now, 29);

  const [paymentsRaw, auditsRaw, ordersRaw, prospectsRaw, paidAuditEmails, landing, care, ads, spendRaw] = await Promise.all([
    db.payment.findMany({ where: { status: "PAID", provider: { not: "MOCK" }, createdAt: { gte: since } }, select: { amountCents: true, createdAt: true }, take: LIMIT }),
    db.growthAudit.findMany({ where: { status: "PAID", NOT: { stripeSessionId: { startsWith: "mock_" } }, paidAt: { gte: since } }, select: { amountCents: true, paidAt: true }, take: LIMIT }),
    db.order.findMany({
      where: { status: "PAID", paidAt: { not: null } },
      select: { id: true, customerId: true, paidAt: true, totalCents: true, balanceDueCents: true, campaignSource: true, items: { select: { priceCents: true, quantity: true, product: { select: { slug: true, name: true } } } } },
      orderBy: { paidAt: "desc" },
      take: LIMIT,
    }),
    db.prospect.findMany({ select: { status: true, stage: true, createdAt: true, email: true }, take: LIMIT }),
    db.growthAudit.findMany({ where: { status: "PAID" }, select: { email: true }, take: LIMIT }),
    db.analyticsEvent.findMany({ where: { name: "landing_page_view", createdAt: { gte: last30 } }, select: { payloadJson: true, createdAt: true }, take: 20000 }),
    db.careSubscription.findMany({ select: { customerId: true, status: true, priceCents: true, createdAt: true, updatedAt: true }, take: LIMIT }),
    db.adSubscription.findMany({ where: { status: { not: "PENDING" } }, select: { customerId: true, status: true, priceCents: true, createdAt: true, updatedAt: true }, take: LIMIT }),
    db.marketingSpend.findMany({ orderBy: [{ month: "desc" }, { createdAt: "desc" }], take: 500 }),
  ]);

  const payments: PaymentRow[] = paymentsRaw.map((p) => ({ amountCents: p.amountCents, at: p.createdAt }));
  const audits: PaymentRow[] = auditsRaw.filter((a) => a.paidAt).map((a) => ({ amountCents: a.amountCents, at: a.paidAt! }));
  const orders: OrderRow[] = ordersRaw.map((o) => ({
    id: o.id,
    customerId: o.customerId,
    paidAt: o.paidAt,
    totalCents: o.totalCents,
    balanceDueCents: o.balanceDueCents,
    campaignSource: o.campaignSource,
    items: o.items.map((i) => ({ slug: i.product.slug, name: i.product.name, priceCents: i.priceCents, quantity: i.quantity })),
  }));
  const auditEmails = new Set(paidAuditEmails.map((a) => a.email.toLowerCase()));
  const prospects: ProspectRow[] = prospectsRaw.map((p) => ({ status: p.status, stage: p.stage, createdAt: p.createdAt, hasPaidAudit: Boolean(p.email && auditEmails.has(p.email.toLowerCase())) }));
  const subs: SubRow[] = [...care.map((s) => ({ ...s, kind: "care" as const })), ...ads.map((s) => ({ ...s, kind: "ads" as const }))];
  const spend: SpendRow[] = spendRaw.map((s) => ({ month: s.month, channel: s.channel, amountCents: s.amountCents }));

  const ws = windows(now);
  const w = Object.fromEntries(ws.map((x) => [x.key, x])) as Record<(typeof ws)[number]["key"], (typeof ws)[number]>;
  const cash = Object.fromEntries(ws.map((x) => [x.key, cashIn(payments, audits, x.from, x.to)])) as Record<(typeof ws)[number]["key"], ReturnType<typeof cashIn>>;

  const subsSummary = subscriptionSummary(subs, now);
  const visitors = (from: Date) =>
    uniqueVisitors(
      landing
        .filter((r) => r.createdAt >= from)
        .map((r) => {
          try {
            return JSON.parse(r.payloadJson) as { visitorId?: string };
          } catch {
            return {};
          }
        }),
    );

  const customers30 = newCustomers(orders, w.last30.from, w.last30.to);
  const customersMtd = newCustomers(orders, w.monthToDate.from, w.monthToDate.to);
  const funnel30 = salesFunnel(prospects, customers30, w.last30.from, w.last30.to);
  const funnelMtd = salesFunnel(prospects, customersMtd, w.monthToDate.from, w.monthToDate.to);
  const visitors30 = visitors(w.last30.from);

  // spend, month by month for the last three months
  const monthsTable = [2, 1, 0].map((back) => {
    const from = startOfMonth(now, back);
    const to = startOfMonth(now, back - 1);
    const key = monthKey(from);
    const leads = salesFunnel(prospects, 0, from, to).leads;
    const cust = newCustomers(orders, from, to);
    return { month: key, leads, customers: cust, ...spendSummary(spend, [key], leads, cust) };
  });

  const products = productStats(orders, subs);
  const monthlyPlansCents = subsSummary.mrrCents;

  return {
    now,
    targetCents: TARGET.monthlyRevenueCents,
    windows: ws.map((x) => ({ key: x.key, label: x.label, ...cash[x.key] })),
    monthToDate: { cashCents: cash.monthToDate.totalCents, monthlyPlansCents, combinedCents: cash.monthToDate.totalCents + monthlyPlansCents },
    daily: dailySeries(payments, audits, now, 30),
    monthly: monthlySeries(payments, audits, now, 6),
    averageOrder: { monthToDate: averageOrderCents(orders, w.monthToDate.from, w.monthToDate.to), last30: averageOrderCents(orders, w.last30.from, w.last30.to) },
    lifetime: lifetimeValueCents(orders),
    expansion: { monthToDate: expansionCents(orders, w.monthToDate.from, w.monthToDate.to), last30: expansionCents(orders, w.last30.from, w.last30.to) },
    sales: {
      last30: funnel30,
      monthToDate: funnelMtd,
      visitorToCustomer: rate(customers30, visitors30),
      leadToWon: rate(funnel30.won, funnel30.leads),
      closeRate: closeRate(funnel30),
      close: closeRate(salesFunnel(prospects, 0, new Date(0), new Date(8.64e15))),
    },
    marketing: {
      visitors30,
      visitorsToday: visitors(w.today.from),
      bySource: revenueBySource(orders, w.last30.from, w.last30.to),
      months: monthsTable,
      spend: spendRaw.slice(0, 30).map((s) => ({ id: s.id, month: s.month, channel: s.channel, amountCents: s.amountCents, note: s.note })),
    },
    retention: { ...subsSummary },
    products: {
      all: products.slice(0, 12),
      mostPurchased: products[0] ?? null,
      mostRevenue: [...products].sort((a, b) => b.revenueCents - a.revenueCents)[0] ?? null,
      bestUpsell: topBy(products, (p) => p.upsell),
      bestOnPlan: topBy(products, (p) => p.onPlan),
    },
    truncated: ordersRaw.length === LIMIT || paymentsRaw.length === LIMIT,
  };
}
