import { collectedCents } from "@/lib/payments/deposit";
import { dayKey, monthKey, startOfDay, startOfDayMinus, startOfMonth } from "@/lib/revenue/time";

// The numbers behind the revenue dashboard, as rules over plain rows. Pure (no database), so every definition is tested.
//
// Two honest limits, stated on the page too:
//   - Cash is what was actually collected on orders (deposits, balances, extra work) plus paid audit fees. Monthly plans
//     (Website Care, Monthly Ads) are billed by Stripe and are not recorded here as payments, so they appear as MRR: what the
//     active plans charge each month.
//   - We track no costs. So "profit" and "cost per lead" only exist where the owner has entered the spend.

export interface PaymentRow {
  amountCents: number;
  at: Date;
}

export interface OrderRow {
  id: string;
  customerId: string;
  paidAt: Date | null;
  totalCents: number;
  balanceDueCents: number;
  campaignSource: string | null;
  items: { slug: string; name: string; priceCents: number; quantity: number }[];
}

export interface SubRow {
  customerId: string;
  kind: "care" | "ads";
  status: string; // ACTIVE | PAST_DUE | CANCELED | PENDING
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpendRow {
  month: string; // 2026-09
  channel: string;
  amountCents: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const inRange = (d: Date, from: Date, to: Date) => d.getTime() >= from.getTime() && d.getTime() < to.getTime();

// ---------------------------------------------------------------------------------------------------------------------
// revenue

export interface Window {
  key: "today" | "last7" | "monthToDate" | "lastMonth" | "last30";
  label: string;
  from: Date;
  to: Date;
}

/** The windows the dashboard reports, all in the business's own time. `to` is exclusive. */
export function windows(now: Date): Window[] {
  const today = startOfDay(now);
  const tomorrow = startOfDayMinus(now, -1);
  const thisMonth = startOfMonth(now);
  return [
    { key: "today", label: "Today", from: today, to: tomorrow },
    { key: "last7", label: "Last 7 days", from: startOfDayMinus(now, 6), to: tomorrow },
    { key: "monthToDate", label: "This month so far", from: thisMonth, to: tomorrow },
    { key: "lastMonth", label: "Last month", from: startOfMonth(now, 1), to: thisMonth },
    { key: "last30", label: "Last 30 days", from: startOfDayMinus(now, 29), to: tomorrow },
  ];
}

export interface CashSplit {
  ordersCents: number;
  auditCents: number;
  totalCents: number;
}

export function cashIn(payments: PaymentRow[], audits: PaymentRow[], from: Date, to: Date): CashSplit {
  const ordersCents = sum(payments.filter((p) => inRange(p.at, from, to)).map((p) => p.amountCents));
  const auditCents = sum(audits.filter((p) => inRange(p.at, from, to)).map((p) => p.amountCents));
  return { ordersCents, auditCents, totalCents: ordersCents + auditCents };
}

export interface SeriesPoint {
  key: string;
  label: string;
  cents: number;
}

/** Cash by day for the last `days` days, oldest first, with a zero for a day with nothing. */
export function dailySeries(payments: PaymentRow[], audits: PaymentRow[], now: Date, days = 30): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const from = startOfDayMinus(now, i);
    const to = startOfDayMinus(now, i - 1);
    out.push({ key: dayKey(from), label: dayKey(from).slice(5), cents: cashIn(payments, audits, from, to).totalCents });
  }
  return out;
}

/** Cash by month for the last `months` months including this one, oldest first. */
export function monthlySeries(payments: PaymentRow[], audits: PaymentRow[], now: Date, months = 6): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const from = startOfMonth(now, i);
    const to = startOfMonth(now, i - 1);
    out.push({ key: monthKey(from), label: monthKey(from), cents: cashIn(payments, audits, from, to).totalCents });
  }
  return out;
}

const paidOrders = (orders: OrderRow[]) => orders.filter((o) => o.paidAt);

/** The average order: what customers ordered (the whole order, not just what has arrived), for orders paid in the window. */
export function averageOrderCents(orders: OrderRow[], from: Date, to: Date): { cents: number; count: number } {
  const inWindow = paidOrders(orders).filter((o) => inRange(o.paidAt!, from, to));
  return { cents: inWindow.length ? Math.round(sum(inWindow.map((o) => o.totalCents)) / inWindow.length) : 0, count: inWindow.length };
}

/** What each paying customer has paid so far, on average, from orders alone. Not a forecast. */
export function lifetimeValueCents(orders: OrderRow[]): { cents: number; customers: number } {
  const byCustomer = new Map<string, number>();
  for (const o of paidOrders(orders)) byCustomer.set(o.customerId, (byCustomer.get(o.customerId) ?? 0) + collectedCents(o));
  return { cents: byCustomer.size ? Math.round(sum([...byCustomer.values()]) / byCustomer.size) : 0, customers: byCustomer.size };
}

/** Revenue from customers who had already bought before: what an existing customer added in the window. */
export function expansionCents(orders: OrderRow[], from: Date, to: Date): { cents: number; orders: number } {
  const sorted = paidOrders(orders).sort((a, b) => a.paidAt!.getTime() - b.paidAt!.getTime());
  const seen = new Set<string>();
  let cents = 0;
  let n = 0;
  for (const o of sorted) {
    if (seen.has(o.customerId) && inRange(o.paidAt!, from, to)) {
      cents += collectedCents(o);
      n++;
    }
    seen.add(o.customerId);
  }
  return { cents, orders: n };
}

/** Cash by where the customer came from, for orders paid in the window. Biggest first. */
export function revenueBySource(orders: OrderRow[], from: Date, to: Date): { source: string; orders: number; cents: number }[] {
  const by = new Map<string, { orders: number; cents: number }>();
  for (const o of paidOrders(orders).filter((x) => inRange(x.paidAt!, from, to))) {
    const key = o.campaignSource ?? "direct or unknown";
    const cur = by.get(key) ?? { orders: 0, cents: 0 };
    by.set(key, { orders: cur.orders + 1, cents: cur.cents + collectedCents(o) });
  }
  return [...by.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.cents - a.cents);
}

// ---------------------------------------------------------------------------------------------------------------------
// sales

export interface ProspectRow {
  status: string;
  stage: string | null;
  createdAt: Date;
  hasPaidAudit: boolean;
}

export interface SalesFunnel {
  leads: number;
  qualified: number;
  calls: number;
  proposals: number;
  purchases: number;
  won: number;
  lost: number;
}

/**
 * The sales counts for leads created in the window. Qualified means someone replied, booked a call, paid for an audit, or
 * became a customer. Calls are prospects marked call booked or won. Proposals are those you set to Proposal or Payment.
 * These are your own markings, so they are only as complete as you keep them.
 */
export function salesFunnel(prospects: ProspectRow[], newCustomers: number, from: Date, to: Date): SalesFunnel {
  const p = prospects.filter((x) => inRange(x.createdAt, from, to));
  return {
    leads: p.length,
    qualified: p.filter((x) => ["REPLIED", "CALL_BOOKED", "WON"].includes(x.status) || x.hasPaidAudit).length,
    calls: p.filter((x) => ["CALL_BOOKED", "WON"].includes(x.status)).length,
    proposals: p.filter((x) => x.stage === "PROPOSAL" || x.stage === "PAYMENT" || x.status === "WON").length,
    purchases: newCustomers,
    won: p.filter((x) => x.status === "WON").length,
    lost: p.filter((x) => x.status === "LOST").length,
  };
}

/** A rate with the numbers behind it, or null when there is nothing to divide by. */
export interface Rate {
  numerator: number;
  denominator: number;
  percent: number | null;
}
export const rate = (numerator: number, denominator: number): Rate => ({ numerator, denominator, percent: denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : null });

/** Close rate: of the prospects that were decided (won or lost), how many were won. */
export const closeRate = (f: Pick<SalesFunnel, "won" | "lost">): Rate => rate(f.won, f.won + f.lost);

/** How many customers made their first paid order inside the window. */
export function newCustomers(orders: OrderRow[], from: Date, to: Date): number {
  const first = new Map<string, Date>();
  for (const o of paidOrders(orders)) {
    const cur = first.get(o.customerId);
    if (!cur || o.paidAt! < cur) first.set(o.customerId, o.paidAt!);
  }
  return [...first.values()].filter((d) => inRange(d, from, to)).length;
}

// ---------------------------------------------------------------------------------------------------------------------
// marketing

/** Unique visitors from the landing-page events: each row's visitor id, counted once. */
export function uniqueVisitors(rows: { visitorId?: string }[]): number {
  return new Set(rows.map((r) => r.visitorId).filter(Boolean)).size;
}

export interface SpendSummary {
  totalCents: number;
  byChannel: { channel: string; cents: number }[];
  costPerLeadCents: number | null;
  costPerCustomerCents: number | null;
}

/** Spend the owner entered for the months the window touches, and what it works out to per lead and per new customer. */
export function spendSummary(spend: SpendRow[], months: string[], leads: number, customers: number): SpendSummary {
  const rows = spend.filter((s) => months.includes(s.month));
  const totalCents = sum(rows.map((r) => r.amountCents));
  const by = new Map<string, number>();
  for (const r of rows) by.set(r.channel, (by.get(r.channel) ?? 0) + r.amountCents);
  return {
    totalCents,
    byChannel: [...by.entries()].map(([channel, cents]) => ({ channel, cents })).sort((a, b) => b.cents - a.cents),
    costPerLeadCents: totalCents > 0 && leads > 0 ? Math.round(totalCents / leads) : null,
    costPerCustomerCents: totalCents > 0 && customers > 0 ? Math.round(totalCents / customers) : null,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// retention

export interface SubscriptionSummary {
  active: number;
  mrrCents: number;
  pastDue: number;
  /** Plans that ended in the last 30 days. */
  churned30: number;
  /** Of the plans that were live 30 days ago, the share that are still live. null if there were none. */
  retained30: Rate;
  churn30: Rate;
}

const LIVE = ["ACTIVE", "PAST_DUE"];

/**
 * Monthly plans. A plan "ended" when it is CANCELED and was last changed in the last 30 days (that is when it was cancelled).
 * Churn is plans that ended over plans that were live at the start of the window (live now, plus those that ended in it).
 * This is a close estimate from the records we keep, and it is labeled that way.
 */
export function subscriptionSummary(subs: SubRow[], now: Date): SubscriptionSummary {
  const cutoff = new Date(now.getTime() - 30 * 86_400_000);
  const active = subs.filter((s) => LIVE.includes(s.status));
  const ended = subs.filter((s) => s.status === "CANCELED" && s.updatedAt >= cutoff && s.createdAt < cutoff);
  const liveAtStart = subs.filter((s) => s.createdAt < cutoff && (LIVE.includes(s.status) || (s.status === "CANCELED" && s.updatedAt >= cutoff)));
  const stillLive = liveAtStart.filter((s) => LIVE.includes(s.status));
  return {
    active: active.length,
    mrrCents: sum(active.map((s) => s.priceCents)),
    pastDue: active.filter((s) => s.status === "PAST_DUE").length,
    churned30: ended.length,
    retained30: rate(stillLive.length, liveAtStart.length),
    churn30: rate(ended.length, liveAtStart.length),
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// product

export interface ProductStat {
  slug: string;
  name: string;
  /** Units sold. */
  units: number;
  /** Revenue at the price charged, before any discount. */
  revenueCents: number;
  /** Of customers whose FIRST order included it, the share who later ordered something else. */
  upsell: Rate;
  /** Of customers who ever bought it, the share with a live monthly plan now. */
  onPlan: Rate;
}

export function productStats(orders: OrderRow[], subs: SubRow[]): ProductStat[] {
  const paid = paidOrders(orders).sort((a, b) => a.paidAt!.getTime() - b.paidAt!.getTime());
  const byCustomer = new Map<string, OrderRow[]>();
  for (const o of paid) byCustomer.set(o.customerId, [...(byCustomer.get(o.customerId) ?? []), o]);
  const livePlan = new Set(subs.filter((s) => LIVE.includes(s.status)).map((s) => s.customerId));

  const stats = new Map<string, { name: string; units: number; revenueCents: number; firstBuyers: Set<string>; upsold: Set<string>; buyers: Set<string> }>();
  const get = (slug: string, name: string) => {
    let s = stats.get(slug);
    if (!s) stats.set(slug, (s = { name, units: 0, revenueCents: 0, firstBuyers: new Set(), upsold: new Set(), buyers: new Set() }));
    return s;
  };
  for (const o of paid) {
    for (const i of o.items) {
      const s = get(i.slug, i.name);
      s.units += i.quantity;
      s.revenueCents += i.priceCents * i.quantity;
      s.buyers.add(o.customerId);
    }
  }
  for (const [customerId, list] of byCustomer) {
    for (const i of list[0].items) {
      const s = get(i.slug, i.name);
      s.firstBuyers.add(customerId);
      if (list.length > 1) s.upsold.add(customerId);
    }
  }
  return [...stats.entries()]
    .map(([slug, s]) => ({
      slug,
      name: s.name,
      units: s.units,
      revenueCents: s.revenueCents,
      upsell: rate(s.upsold.size, s.firstBuyers.size),
      onPlan: rate([...s.buyers].filter((c) => livePlan.has(c)).length, s.buyers.size),
    }))
    .sort((a, b) => b.units - a.units || b.revenueCents - a.revenueCents);
}

/** The best by a rate, but only among products with at least `minCustomers` behind the number, so one sale is not a "100%". */
export function topBy(stats: ProductStat[], pick: (s: ProductStat) => Rate, minCustomers = 3): ProductStat | null {
  const ok = stats.filter((s) => pick(s).denominator >= minCustomers && pick(s).percent !== null);
  ok.sort((a, b) => (pick(b).percent ?? 0) - (pick(a).percent ?? 0) || pick(b).denominator - pick(a).denominator);
  return ok[0] ?? null;
}
