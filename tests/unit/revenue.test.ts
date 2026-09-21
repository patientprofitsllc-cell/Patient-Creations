import { describe, expect, it } from "vitest";
import * as ReactNS from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PRICE_CENTS, TARGET, TIER_PRICE_OVERRIDES } from "@/lib/pricing/catalog";
import { BUSINESS_TZ, dayKey, isMonthKey, monthKey, startOfDay, startOfDayMinus, startOfMonth } from "@/lib/revenue/time";
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
  type ProspectRow,
  type SubRow,
} from "@/lib/revenue/metrics";
import { PLAN_DISCLAIMER, PLAN_LABEL, actualVsPlan, computePlan, exampleScenario, gapSuggestions } from "@/lib/revenue/plan";
import { PlanningCalculator } from "@/components/revenue/PlanningCalculator";
import { BarChart } from "@/components/revenue/BarChart";

// The test runner compiles JSX the classic way, which needs React in scope.
(globalThis as { React?: unknown }).React = ReactNS;

const iso = (s: string) => new Date(s);
const DAY = 86_400_000;

describe("days and months in the owner's time zone", () => {
  it("uses Eastern time", () => expect(BUSINESS_TZ).toBe("America/New_York"));

  it("starts a summer day at 4 in the morning UTC and a winter day at 5", () => {
    expect(startOfDay(iso("2026-09-21T15:00:00Z")).toISOString()).toBe("2026-09-21T04:00:00.000Z");
    expect(startOfDay(iso("2026-01-15T12:00:00Z")).toISOString()).toBe("2026-01-15T05:00:00.000Z");
  });

  it("still counts 11:30 at night on the 20th as the 20th, even though UTC is already the 21st", () => {
    const late = iso("2026-09-21T03:30:00Z");
    expect(dayKey(late)).toBe("2026-09-20");
    expect(startOfDay(late).toISOString()).toBe("2026-09-20T04:00:00.000Z");
  });

  it("finds the start of the next and previous day, and of months", () => {
    const now = iso("2026-09-21T15:00:00Z");
    expect(startOfDayMinus(now, -1).toISOString()).toBe("2026-09-22T04:00:00.000Z");
    expect(startOfDayMinus(now, 1).toISOString()).toBe("2026-09-20T04:00:00.000Z");
    expect(startOfMonth(now).toISOString()).toBe("2026-09-01T04:00:00.000Z");
    expect(startOfMonth(now, 1).toISOString()).toBe("2026-08-01T04:00:00.000Z");
    expect(startOfMonth(iso("2026-01-10T12:00:00Z"), 1).toISOString()).toBe("2025-12-01T05:00:00.000Z");
    expect(startOfMonth(now, -1).toISOString()).toBe("2026-10-01T04:00:00.000Z");
  });

  it("follows daylight saving time: the spring day is 23 hours long and the fall day is 25", () => {
    const spring = iso("2026-03-08T15:00:00Z");
    expect((startOfDayMinus(spring, -1).getTime() - startOfDay(spring).getTime()) / 3_600_000).toBe(23);
    const fall = iso("2026-11-01T15:00:00Z");
    expect((startOfDayMinus(fall, -1).getTime() - startOfDay(fall).getTime()) / 3_600_000).toBe(25);
  });

  it("names a month by the owner's calendar", () => {
    expect(monthKey(iso("2026-10-01T03:30:00Z"))).toBe("2026-09");
    expect(monthKey(iso("2026-10-01T05:30:00Z"))).toBe("2026-10");
    expect(isMonthKey("2026-09")).toBe(true);
    for (const bad of ["2026-13", "2026-9", "26-09", "", null, 202609]) expect(isMonthKey(bad), String(bad)).toBe(false);
  });
});

describe("cash in a window", () => {
  const NOW = iso("2026-09-21T15:00:00Z");
  const pay = (at: string, amountCents: number) => ({ at: iso(at), amountCents });

  it("reports today, the last 7 days, this month, last month, and the last 30 days, each ending at the end of today", () => {
    const w = windows(NOW);
    expect(w.map((x) => x.key)).toEqual(["today", "last7", "monthToDate", "lastMonth", "last30"]);
    const end = startOfDayMinus(NOW, -1).getTime();
    for (const x of w.filter((y) => y.key !== "lastMonth")) expect(x.to.getTime()).toBe(end);
    expect(w[4].from.getTime()).toBe(startOfDayMinus(NOW, 29).getTime());
    expect(w[3].to.getTime()).toBe(w[2].from.getTime());
  });

  it("puts a payment on the owner's day, and splits orders from audit fees", () => {
    const payments = [pay("2026-09-21T03:30:00Z", 10_000), pay("2026-09-21T14:00:00Z", 5_000)];
    const audits = [pay("2026-09-21T14:30:00Z", 1_900)];
    const today = windows(NOW)[0];
    expect(cashIn(payments, audits, today.from, today.to)).toEqual({ ordersCents: 5_000, auditCents: 1_900, totalCents: 6_900 });
    const yesterday = { from: startOfDayMinus(NOW, 1), to: today.from };
    expect(cashIn(payments, audits, yesterday.from, yesterday.to).totalCents).toBe(10_000);
  });

  it("counts the start of a window and not its end", () => {
    const w = windows(NOW)[0];
    expect(cashIn([{ at: w.from, amountCents: 100 }], [], w.from, w.to).totalCents).toBe(100);
    expect(cashIn([{ at: w.to, amountCents: 100 }], [], w.from, w.to).totalCents).toBe(0);
  });

  it("makes 30 daily points, oldest first, with zeros for quiet days, and 6 monthly points", () => {
    const d = dailySeries([pay("2026-09-21T14:00:00Z", 700)], [], NOW, 30);
    expect(d).toHaveLength(30);
    expect(d[29]).toMatchObject({ key: "2026-09-21", cents: 700 });
    expect(d[0].key).toBe("2026-08-23");
    expect(d.slice(0, 29).every((p) => p.cents === 0)).toBe(true);
    const m = monthlySeries([pay("2026-08-15T12:00:00Z", 900), pay("2026-09-02T12:00:00Z", 100)], [], NOW, 6);
    expect(m.map((p) => p.key)).toEqual(["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]);
    expect(m[4].cents).toBe(900);
    expect(m[5].cents).toBe(100);
  });
});

const order = (id: string, customerId: string, paidAt: string | null, over: Partial<OrderRow> = {}): OrderRow => ({
  id,
  customerId,
  paidAt: paidAt ? iso(paidAt) : null,
  totalCents: 30_000,
  balanceDueCents: 0,
  campaignSource: null,
  items: [{ slug: "starter-website", name: "Quick Business Website", priceCents: 30_000, quantity: 1 }],
  ...over,
});

describe("orders", () => {
  const from = iso("2026-09-01T04:00:00Z");
  const to = iso("2026-10-01T04:00:00Z");

  it("averages what was ordered, not just what has arrived, and ignores unpaid orders", () => {
    const orders = [order("a", "c1", "2026-09-05T12:00:00Z", { totalCents: 100_000, balanceDueCents: 50_000 }), order("b", "c2", "2026-09-06T12:00:00Z", { totalCents: 30_000 }), order("x", "c3", null), order("old", "c4", "2026-08-05T12:00:00Z")];
    expect(averageOrderCents(orders, from, to)).toEqual({ cents: 65_000, count: 2 });
    expect(averageOrderCents([], from, to)).toEqual({ cents: 0, count: 0 });
  });

  it("works out what each paying customer has paid so far, counting only what was collected", () => {
    const orders = [order("a", "c1", "2026-09-05T12:00:00Z", { totalCents: 100_000, balanceDueCents: 50_000 }), order("b", "c1", "2026-09-06T12:00:00Z", { totalCents: 30_000 }), order("c", "c2", "2026-09-07T12:00:00Z", { totalCents: 20_000 })];
    expect(lifetimeValueCents(orders)).toEqual({ cents: 50_000, customers: 2 });
    expect(lifetimeValueCents([])).toEqual({ cents: 0, customers: 0 });
  });

  it("counts expansion as cash from customers who had already bought, in the window only", () => {
    const orders = [order("a", "c1", "2026-08-10T12:00:00Z"), order("b", "c1", "2026-09-10T12:00:00Z", { totalCents: 40_000 }), order("c", "c2", "2026-09-11T12:00:00Z"), order("d", "c1", "2026-10-05T12:00:00Z")];
    expect(expansionCents(orders, from, to)).toEqual({ cents: 40_000, orders: 1 });
  });

  it("counts a customer as new only in the window of their first paid order", () => {
    const orders = [order("a", "c1", "2026-08-10T12:00:00Z"), order("b", "c1", "2026-09-10T12:00:00Z"), order("c", "c2", "2026-09-11T12:00:00Z"), order("d", "c3", null)];
    expect(newCustomers(orders, from, to)).toBe(1);
  });

  it("adds up cash by source, biggest first, with a name for the unknown", () => {
    const orders = [
      order("a", "c1", "2026-09-05T12:00:00Z", { campaignSource: "google" }),
      order("b", "c2", "2026-09-06T12:00:00Z", { campaignSource: "google", totalCents: 70_000 }),
      order("c", "c3", "2026-09-07T12:00:00Z", { totalCents: 20_000 }),
      order("d", "c4", "2026-08-07T12:00:00Z", { campaignSource: "facebook" }),
    ];
    expect(revenueBySource(orders, from, to)).toEqual([{ source: "google", orders: 2, cents: 100_000 }, { source: "direct or unknown", orders: 1, cents: 20_000 }]);
  });
});

describe("sales", () => {
  const from = iso("2026-08-22T04:00:00Z");
  const to = iso("2026-09-22T04:00:00Z");
  const p = (status: string, over: Partial<ProspectRow> = {}): ProspectRow => ({ status, stage: null, createdAt: iso("2026-09-10T12:00:00Z"), hasPaidAudit: false, ...over });

  it("counts leads, qualified, calls, and proposals for prospects added in the window", () => {
    const prospects = [
      p("NEW"),
      p("CONTACTED"),
      p("REPLIED"),
      p("CALL_BOOKED"),
      p("WON"),
      p("LOST"),
      p("NEW", { hasPaidAudit: true }),
      p("CONTACTED", { stage: "PROPOSAL" }),
      p("NEW", { stage: "PAYMENT" }),
      p("CALL_BOOKED", { createdAt: iso("2026-06-01T12:00:00Z") }),
    ];
    const f = salesFunnel(prospects, 3, from, to);
    expect(f).toEqual({ leads: 9, qualified: 4, calls: 2, proposals: 3, purchases: 3, won: 1, lost: 1 });
  });

  it("gives a rate with the numbers behind it, or nothing to say when there is nothing to divide", () => {
    expect(rate(1, 4)).toEqual({ numerator: 1, denominator: 4, percent: 25 });
    expect(rate(1, 3).percent).toBe(33.3);
    expect(rate(0, 0)).toEqual({ numerator: 0, denominator: 0, percent: null });
    expect(closeRate({ won: 3, lost: 1 }).percent).toBe(75);
    expect(closeRate({ won: 0, lost: 0 }).percent).toBeNull();
  });

  it("counts unique visitors once each", () => {
    expect(uniqueVisitors([{ visitorId: "a" }, { visitorId: "a" }, { visitorId: "b" }, {}, { visitorId: "" }])).toBe(2);
  });
});

describe("what it costs", () => {
  const spend = [
    { month: "2026-09", channel: "Facebook ads", amountCents: 30_000 },
    { month: "2026-09", channel: "Flyers", amountCents: 10_000 },
    { month: "2026-08", channel: "Facebook ads", amountCents: 99_900 },
  ];

  it("works out cost per lead and per new customer from the spend entered for that month only", () => {
    const s = spendSummary(spend, ["2026-09"], 20, 4);
    expect(s.totalCents).toBe(40_000);
    expect(s.costPerLeadCents).toBe(2_000);
    expect(s.costPerCustomerCents).toBe(10_000);
    expect(s.byChannel).toEqual([{ channel: "Facebook ads", cents: 30_000 }, { channel: "Flyers", cents: 10_000 }]);
  });

  it("says nothing when there is no spend, no leads, or no customers, instead of dividing by zero", () => {
    expect(spendSummary(spend, ["2026-07"], 5, 5)).toMatchObject({ totalCents: 0, costPerLeadCents: null, costPerCustomerCents: null });
    expect(spendSummary(spend, ["2026-09"], 0, 0)).toMatchObject({ costPerLeadCents: null, costPerCustomerCents: null });
  });
});

describe("monthly plans", () => {
  const NOW = iso("2026-09-21T15:00:00Z");
  const sub = (status: string, createdDaysAgo: number, updatedDaysAgo: number, priceCents = 7_900, kind: "care" | "ads" = "care"): SubRow => ({ customerId: `c${Math.random()}`, kind, status, priceCents, createdAt: new Date(NOW.getTime() - createdDaysAgo * DAY), updatedAt: new Date(NOW.getTime() - updatedDaysAgo * DAY) });

  it("adds up active plans and what they charge, and flags the ones that are past due", () => {
    const s = subscriptionSummary([sub("ACTIVE", 90, 5), sub("ACTIVE", 60, 5, 50_000, "ads"), sub("PAST_DUE", 60, 3), sub("CANCELED", 200, 100)], NOW);
    expect(s).toMatchObject({ active: 3, pastDue: 1, mrrCents: 7_900 + 50_000 + 7_900 });
  });

  it("counts a plan that ended in the last 30 days as churn against the plans live 30 days ago", () => {
    const s = subscriptionSummary([sub("ACTIVE", 90, 5), sub("ACTIVE", 90, 5), sub("ACTIVE", 90, 5), sub("CANCELED", 90, 10)], NOW);
    expect(s.churned30).toBe(1);
    expect(s.churn30).toEqual({ numerator: 1, denominator: 4, percent: 25 });
    expect(s.retained30).toEqual({ numerator: 3, denominator: 4, percent: 75 });
  });

  it("does not count a plan that ended long ago, or one that started and ended inside the window", () => {
    const s = subscriptionSummary([sub("ACTIVE", 90, 5), sub("CANCELED", 200, 100), sub("CANCELED", 10, 3)], NOW);
    expect(s.churned30).toBe(0);
    expect(s.churn30.denominator).toBe(1);
  });

  it("reports nothing to compare when there are no plans", () => {
    const s = subscriptionSummary([], NOW);
    expect(s).toMatchObject({ active: 0, mrrCents: 0, churned30: 0 });
    expect(s.churn30.percent).toBeNull();
  });
});

describe("products", () => {
  const item = (slug: string, name: string, priceCents: number, quantity = 1) => ({ slug, name, priceCents, quantity });
  const orders: OrderRow[] = [
    order("1", "c1", "2026-08-01T12:00:00Z", { items: [item("starter-website", "Quick Business Website", 30_000)] }),
    order("2", "c1", "2026-08-20T12:00:00Z", { items: [item("nfc-cards", "NFC cards", 3_000, 5)] }),
    order("3", "c2", "2026-08-02T12:00:00Z", { items: [item("starter-website", "Quick Business Website", 30_000)] }),
    order("4", "c3", "2026-08-03T12:00:00Z", { items: [item("starter-website", "Quick Business Website", 30_000)] }),
    order("5", "c4", "2026-08-04T12:00:00Z", { items: [item("lead-engine", "Lead Engine", 170_000)] }),
    order("6", "c5", "2026-08-05T12:00:00Z", { items: [item("starter-website", "Quick Business Website", 30_000)] }),
  ];
  const subs: SubRow[] = [{ customerId: "c1", kind: "care", status: "ACTIVE", priceCents: 7_900, createdAt: iso("2026-08-25T12:00:00Z"), updatedAt: iso("2026-08-25T12:00:00Z") }];
  const stats = productStats(orders, subs);
  const bySlug = (s: string) => stats.find((x) => x.slug === s)!;

  it("counts units and revenue at the price charged", () => {
    expect(bySlug("starter-website")).toMatchObject({ units: 4, revenueCents: 120_000 });
    expect(bySlug("nfc-cards")).toMatchObject({ units: 5, revenueCents: 15_000 });
    expect(stats[0].slug).toBe("nfc-cards");
  });

  it("works out the upsell rate from customers whose FIRST order had the product", () => {
    expect(bySlug("starter-website").upsell).toEqual({ numerator: 1, denominator: 4, percent: 25 });
    expect(bySlug("nfc-cards").upsell.denominator).toBe(0);
    expect(bySlug("lead-engine").upsell.percent).toBe(0);
  });

  it("works out how many buyers of a product are on a monthly plan now", () => {
    expect(bySlug("starter-website").onPlan).toEqual({ numerator: 1, denominator: 4, percent: 25 });
    expect(bySlug("lead-engine").onPlan.percent).toBe(0);
  });

  it("names a best product by a rate only when at least three customers stand behind it", () => {
    expect(topBy(stats, (s) => s.upsell)?.slug).toBe("starter-website");
    expect(topBy(stats, (s) => s.upsell, 5)).toBeNull();
    const oneSale = productStats([order("z", "c9", "2026-08-01T12:00:00Z")], []);
    expect(topBy(oneSale, (s) => s.upsell)).toBeNull();
  });
});

describe("the planning scenario", () => {
  const lines = exampleScenario();
  const line = (id: string) => lines.find((l) => l.id === id)!;

  it("is called a Planning Scenario, and says it is not expected or guaranteed revenue", () => {
    expect(PLAN_LABEL).toBe("Planning Scenario");
    expect(PLAN_DISCLAIMER).toMatch(/not expected revenue/);
    expect(PLAN_DISCLAIMER).toMatch(/not guaranteed revenue/);
  });

  it("starts from the plan's quantities and today's prices from the price list", () => {
    expect(lines.map((l) => [l.id, l.quantity])).toEqual([["websites", 30], ["bundles", 10], ["ads", 40], ["cinematic", 8], ["lead", 5], ["agents", 2], ["other", 1]]);
    expect(line("websites").unitCents).toBe(PRICE_CENTS["starter-website"]);
    expect(line("bundles").unitCents).toBe(PRICE_CENTS["all-in-one-bundle"]);
    expect(line("ads").unitCents).toBe(PRICE_CENTS["ads-monthly-500"]);
    expect(line("cinematic").unitCents).toBe(PRICE_CENTS.site);
    expect(line("lead").unitCents).toBe(TIER_PRICE_OVERRIDES["lead-engine"]!.Signature);
    expect(line("agents").unitCents).toBe(PRICE_CENTS.agents);
    expect(line("ads").kind).toBe("monthly");
  });

  it("adds up, and separates one-time from monthly", () => {
    const r = computePlan(lines);
    const expected = lines.reduce((s, l) => s + l.quantity * l.unitCents, 0);
    expect(r.totalCents).toBe(expected);
    expect(r.monthlyCents).toBe(40 * PRICE_CENTS["ads-monthly-500"]);
    expect(r.oneTimeCents + r.monthlyCents).toBe(r.totalCents);
    expect(r.targetCents).toBe(TARGET.monthlyRevenueCents);
    expect(r.gapCents).toBe(TARGET.monthlyRevenueCents - expected);
    expect(r.percentOfTarget).toBe(Math.round((expected / TARGET.monthlyRevenueCents) * 1000) / 10);
  });

  it("treats bad numbers as zero and caps absurd ones", () => {
    const r = computePlan([{ ...line("websites"), quantity: NaN }, { ...line("ads"), quantity: -5 }, { ...line("agents"), quantity: 1e12, unitCents: 1e12 }]);
    expect(r.lines[0].totalCents).toBe(0);
    expect(r.lines[1].totalCents).toBe(0);
    expect(Number.isSafeInteger(r.totalCents)).toBe(true);
    expect(r.lines[2].quantity).toBe(100_000);
  });

  it("shows how many more of a line would close a gap, smallest first, and nothing when there is no gap", () => {
    const small = computePlan([{ id: "a", label: "Alpha", kind: "one-time", quantity: 1, unitCents: 100_000 }], 1_000_000);
    const g = gapSuggestions(small);
    expect(g[0]).toEqual({ label: "Alpha", extraUnits: 9 });
    const many = computePlan([{ id: "a", label: "Cheap", kind: "one-time", quantity: 1, unitCents: 1_000 }, { id: "b", label: "Big", kind: "one-time", quantity: 1, unitCents: 500_000 }], 1_000_000);
    expect(gapSuggestions(many).map((x) => x.label)).toEqual(["Big", "Cheap"]);
    expect(gapSuggestions(computePlan(lines, 1))).toEqual([]);
    expect(gapSuggestions(computePlan([{ id: "other", label: "Other", kind: "one-time", quantity: 1, unitCents: 100 }], 10_000))).toEqual([]);
  });

  it("compares real cash and plans to the scenario and the target", () => {
    const r = computePlan(lines);
    const a = actualVsPlan(500_000, 100_000, r);
    expect(a.actualCents).toBe(600_000);
    expect(a.percentOfTarget).toBe(6);
    expect(a.percentOfPlan).toBe(Math.round((600_000 / r.totalCents) * 1000) / 10);
    expect(actualVsPlan(0, 0, computePlan([]))).toEqual({ actualCents: 0, percentOfPlan: 0, percentOfTarget: 0 });
  });
});

describe("the dashboard pieces on the page", () => {
  it("shows the calculator as a Planning Scenario, with its disclaimer, and never labels it expected or guaranteed revenue", () => {
    const html = renderToStaticMarkup(createElement(PlanningCalculator, { initial: exampleScenario(), targetCents: TARGET.monthlyRevenueCents, actualOneTimeCents: 123_400, actualMonthlyCents: 50_000 }));
    expect(html).toContain("Planning Scenario");
    expect(html).toContain("not expected revenue");
    expect(html).not.toMatch(/(?<!not )expected revenue/i);
    expect(html).not.toMatch(/(?<!not )guaranteed revenue/i);
    for (const l of exampleScenario()) expect(html).toContain(l.label);
    expect(html).toContain("Scenario total");
    expect(html).toContain("Against what is real");
    expect(html).toContain("$1,234 in cash");
  });

  it("draws a chart with a plain-language summary and a bar for every point", () => {
    const points = [{ key: "a", label: "09-01", cents: 1_000 }, { key: "b", label: "09-02", cents: 0 }, { key: "c", label: "09-03", cents: 4_000 }];
    const html = renderToStaticMarkup(createElement(BarChart, { points, label: "Cash by day" }));
    expect(html).toContain('role="img"');
    expect(html).toContain("Cash by day: 09-01 $10, 09-02 $0, 09-03 $40");
    expect(html.match(/title="/g)).toHaveLength(3);
    expect(html).toContain("$50 in all");
  });
});
