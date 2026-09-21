import { describe, expect, it } from "vitest";
import { BOTTLENECK_LINES, findBottleneck, type BottleneckFacts } from "@/lib/founder/bottleneck";
import { MAX_ACTIVE_IDEAS, QUESTIONS, VERDICT_TEXT, assessIdea, canMove, cleanAnswers, type Answers } from "@/lib/founder/ideas";
import { DEFAULT_ASSUMPTIONS, LENSES, lensValue, productProfits, rankProducts, ranksFor, type ProfitOrder, type RankInput } from "@/lib/founder/profit";
import { buildBrief, briefText, highestLeverage, type BriefFacts } from "@/lib/founder/brief";
import { rate } from "@/lib/revenue/metrics";
import { usd } from "@/lib/pricing/catalog";

// ---------------------------------------------------------------------------------------------------------------------
describe("the bottleneck rule", () => {
  const healthy: BottleneckFacts = {
    visitors30: 1_000,
    leads30: 50,
    newCustomers30: 10,
    customers: 20,
    visitorToCustomer: rate(15, 1_000),
    leadToWon: rate(10, 50),
    activeProjects: 3,
    stuckProjects: 0,
    avgDeliveryDays: 6,
    delivered60: 8,
    planShare: rate(6, 20),
    churn30: rate(0, 6),
    repeatCustomers: rate(6, 20),
  };
  const f = (over: Partial<BottleneckFacts>): BottleneckFacts => ({ ...healthy, ...over });
  const key = (over: Partial<BottleneckFacts>) => findBottleneck(f(over)).primary?.key ?? null;

  it("finds nothing broken in a healthy business, and says to keep measuring", () => {
    const r = findBottleneck(healthy);
    expect(r.primary).toBeNull();
    expect(r.signals.every((s) => !s.triggered)).toBe(true);
    expect(r.note).toMatch(/Keep measuring/);
  });

  it("says traffic is the constraint when there are few visitors and few leads", () => {
    expect(key({ visitors30: 40, leads30: 3 })).toBe("acquisition");
    expect(key({ visitors30: BOTTLENECK_LINES.minVisitors30 - 1, leads30: BOTTLENECK_LINES.minLeads30 - 1 })).toBe("acquisition");
  });

  it("does not call traffic low when leads are coming in some other way, such as partners", () => {
    expect(key({ visitors30: 40, leads30: 60, visitorToCustomer: rate(1, 40), leadToWon: rate(20, 60) })).toBeNull();
  });

  it("says conversion is the constraint when traffic is fine but few visitors buy", () => {
    expect(key({ visitorToCustomer: rate(3, 1_000) })).toBe("conversion");
    expect(key({ visitorToCustomer: rate(10, 1_000) })).toBeNull();
  });

  it("says conversion is the constraint when leads are plentiful but few become customers", () => {
    expect(key({ leadToWon: rate(2, 50) })).toBe("conversion");
  });

  it("says fulfillment is the constraint when sales are coming but delivery is slow, builds are stuck, or the backlog is big", () => {
    expect(key({ avgDeliveryDays: 20, delivered60: 5 })).toBe("fulfillment");
    expect(key({ stuckProjects: 2 })).toBe("fulfillment");
    expect(key({ activeProjects: 8 })).toBe("fulfillment");
    expect(key({ avgDeliveryDays: 20, delivered60: 1 })).toBeNull();
    expect(key({ avgDeliveryDays: null, delivered60: 0 })).toBeNull();
  });

  it("says keeping customers is the constraint when they buy but do not stay", () => {
    expect(key({ planShare: rate(1, 20) })).toBe("retention");
    expect(key({ churn30: rate(2, 10) })).toBe("retention");
    expect(key({ customers: 3, planShare: rate(0, 3) })).toBeNull();
  });

  it("says upsells are the constraint when customers stay but few buy again", () => {
    expect(key({ repeatCustomers: rate(1, 20) })).toBe("expansion");
    expect(key({ customers: 8, repeatCustomers: rate(0, 8) })).toBeNull();
  });

  it("picks the earliest broken stage, so fixing something lower never comes before a leak above it", () => {
    const allBroken = f({ visitors30: 10, leads30: 1, visitorToCustomer: rate(0, 10), stuckProjects: 3, planShare: rate(0, 20), repeatCustomers: rate(0, 20) });
    const r = findBottleneck(allBroken);
    expect(r.primary?.key).toBe("acquisition");
    expect(r.signals.filter((s) => s.triggered).map((s) => s.key)).toEqual(["acquisition", "fulfillment", "retention", "expansion"]);
    expect(key({ visitorToCustomer: rate(1, 1_000), stuckProjects: 3, planShare: rate(0, 20) })).toBe("conversion");
    expect(key({ stuckProjects: 3, planShare: rate(0, 20) })).toBe("fulfillment");
    expect(key({ planShare: rate(0, 20), repeatCustomers: rate(0, 20) })).toBe("retention");
  });

  it("shows the number it looked at and the line it measured against, for every stage", () => {
    for (const s of findBottleneck(healthy).signals) {
      expect(s.measure.length).toBeGreaterThan(10);
      expect(s.line).toMatch(/\d/);
      expect(s.action.length).toBeGreaterThan(20);
    }
  });

  it("says the constraint is getting the first visitors and customers when nothing is measured yet", () => {
    const empty = findBottleneck(f({ visitors30: 0, leads30: 0, newCustomers30: 0, customers: 0, activeProjects: 0, visitorToCustomer: rate(0, 0), leadToWon: rate(0, 0), planShare: rate(0, 0), churn30: rate(0, 0), repeatCustomers: rate(0, 0), avgDeliveryDays: null, delivered60: 0 }));
    expect(empty.primary?.key).toBe("acquisition");
  });
});

// ---------------------------------------------------------------------------------------------------------------------
describe("the idea parking lot", () => {
  const all = (yes: string[], distracts: "yes" | "no" | "unsure" = "no"): Answers => {
    const a: Answers = {};
    for (const q of QUESTIONS) a[q.id] = q.id === "distracts" ? distracts : yes.includes(q.id) ? "yes" : "no";
    return a;
  };

  it("asks the seven questions from the plan, the last one about the bottleneck", () => {
    expect(QUESTIONS.map((q) => q.text)).toEqual([
      "Does this increase revenue?",
      "Does this increase recurring revenue?",
      "Does this improve customer acquisition?",
      "Does this improve fulfillment?",
      "Does this strengthen Patient Creations?",
      "Can it be delegated?",
      "Does it distract from the current bottleneck?",
    ]);
  });

  it("drops anything that is not a real answer to a real question", () => {
    expect(cleanAnswers({ revenue: "yes", recurring: "maybe", nonsense: "yes", distracts: 5 })).toEqual({ revenue: "yes" });
    expect(cleanAnswers(null)).toEqual({});
    expect(cleanAnswers("x")).toEqual({});
  });

  it("scores each good yes as a point and a distraction as minus two", () => {
    expect(assessIdea(all(["revenue", "recurring", "acquisition"])).score).toBe(3);
    expect(assessIdea(all(["revenue", "recurring", "acquisition"], "yes")).score).toBe(1);
  });

  it("says an idea that distracts from the bottleneck is not for now, however good it looks otherwise", () => {
    const a = assessIdea(all(["revenue", "recurring", "acquisition", "fulfillment", "strengthens", "delegate"], "yes"));
    expect(a.verdict).toBe("not-now");
    expect(a.reasons).toContain("It pulls you away from the current bottleneck");
  });

  it("calls an idea worth a look only with four or more good answers and no distraction, and skips one that does little", () => {
    expect(assessIdea(all(["revenue", "recurring", "acquisition", "strengthens"])).verdict).toBe("worth-a-look");
    expect(assessIdea(all(["revenue", "recurring"])).verdict).toBe("park");
    expect(assessIdea(all(["revenue"])).verdict).toBe("skip-for-now");
    expect(assessIdea(all([])).verdict).toBe("skip-for-now");
  });

  it("does not judge an idea before it has been questioned, and parks a half-answered one", () => {
    expect(assessIdea({}).verdict).toBe("unanswered");
    const partial = assessIdea({ revenue: "yes", recurring: "yes", acquisition: "yes", fulfillment: "yes" });
    expect(partial.complete).toBe(false);
    expect(partial.verdict).toBe("park");
    expect(assessIdea({ revenue: "yes" }).answered).toBe(1);
  });

  it("treats not sure as neither a point nor a penalty", () => {
    const a: Answers = {};
    for (const q of QUESTIONS) a[q.id] = "unsure";
    expect(assessIdea(a)).toMatchObject({ score: 0, complete: true, verdict: "skip-for-now" });
  });

  it("has words for every verdict", () => {
    for (const v of ["unanswered", "not-now", "worth-a-look", "park", "skip-for-now"] as const) expect(VERDICT_TEXT[v].length).toBeGreaterThan(20);
  });

  it("never starts an idea for the owner: starting is refused until every question is answered", () => {
    expect(canMove({ from: "PARKED", to: "DOING", answers: { revenue: "yes" }, doingCount: 0 })).toMatchObject({ ok: false });
    expect(canMove({ from: "PARKED", to: "DOING", answers: all(["revenue", "recurring", "acquisition", "strengthens"]), doingCount: 0 })).toEqual({ ok: true });
  });

  it("allows only two ideas in progress at once", () => {
    const good = all(["revenue", "recurring", "acquisition", "strengthens"]);
    expect(MAX_ACTIVE_IDEAS).toBe(2);
    expect(canMove({ from: "PARKED", to: "DOING", answers: good, doingCount: 1 })).toEqual({ ok: true });
    const full = canMove({ from: "PARKED", to: "DOING", answers: good, doingCount: 2 });
    expect(full).toMatchObject({ ok: false });
    if (!full.ok) expect(full.error).toMatch(/Finish or drop one first/);
  });

  it("makes the owner say so, out loud, before starting an idea that distracts from the bottleneck", () => {
    const distracting = all(["revenue", "recurring"], "yes");
    const r = canMove({ from: "PARKED", to: "DOING", answers: distracting, doingCount: 0 });
    expect(r).toMatchObject({ ok: false, needsOverride: true });
    expect(canMove({ from: "PARKED", to: "DOING", answers: distracting, doingCount: 0, override: true })).toEqual({ ok: true });
  });

  it("lets an idea be dropped, finished, or parked again without ceremony", () => {
    for (const to of ["DROPPED", "DONE", "PARKED"] as const) expect(canMove({ from: "PARKED", to, answers: {}, doingCount: 5 })).toEqual({ ok: true });
  });
});

// ---------------------------------------------------------------------------------------------------------------------
describe("product profitability", () => {
  const order = (over: Partial<ProfitOrder> = {}): ProfitOrder => ({
    status: "PAID",
    collectedCents: 100_000,
    paymentsCount: 1,
    commissionCents: 10_000,
    aiActualCents: 0,
    items: [{ slug: "a", name: "Alpha", priceCents: 60_000, quantity: 1 }, { slug: "b", name: "Bravo", priceCents: 40_000, quantity: 1 }],
    ...over,
  });
  const costs = { a: { fulfillmentCents: 5_000, aiApiCents: 2_000, laborMinutes: 120, softwareCents: 1_000 } };
  const assumptions = { ...DEFAULT_ASSUMPTIONS, laborRateCentsPerHour: 5_000 };
  const get = (rows: ReturnType<typeof productProfits>, slug: string) => rows.find((r) => r.slug === slug)!;

  it("splits an order's cash, fees, and commission across its products by value, and adds up exactly", () => {
    const rows = productProfits([order()], {}, assumptions);
    expect(get(rows, "a").revenueCents + get(rows, "b").revenueCents).toBe(100_000);
    expect(get(rows, "a").revenueCents).toBe(60_000);
    const fee = Math.round(100_000 * 0.029 + 30);
    expect(get(rows, "a").processingCents + get(rows, "b").processingCents).toBeGreaterThanOrEqual(fee - 1);
    expect(get(rows, "a").processingCents + get(rows, "b").processingCents).toBeLessThanOrEqual(fee + 1);
    expect(get(rows, "a").commissionCents).toBe(6_000);
    expect(get(rows, "b").commissionCents).toBe(4_000);
  });

  it("works out the contribution margin as revenue less every cost, with your time counted", () => {
    const a = get(productProfits([order()], costs, assumptions), "a");
    expect(a).toMatchObject({ fulfillmentCents: 5_000, aiApiCents: 2_000, laborCents: 10_000, softwareCents: 1_000, laborHours: 2 });
    expect(a.contributionCents).toBe(60_000 - a.processingCents - 6_000 - 5_000 - 2_000 - 10_000 - 1_000);
    expect(a.marginPercent).toBe(Math.round((a.contributionCents / 60_000) * 1000) / 10);
    expect(a.marginPerHourCents).toBe(Math.round(a.contributionCents / 2));
    expect(a.costsEntered).toBe(true);
  });

  it("does not treat a cost nobody entered as zero: the product is marked as having no costs", () => {
    const b = get(productProfits([order()], costs, assumptions), "b");
    expect(b.costsEntered).toBe(false);
    expect(b.laborCents).toBe(0);
    const rows = rankProducts(productProfits([order()], costs, assumptions).map((p) => ({ ...p, conversionPercent: null, retentionPercent: null, upsellPercent: null, customersBehind: 0 })));
    expect(lensValue(rows.find((r) => r.slug === "b")!, "contribution")).toBeNull();
    expect(lensValue(rows.find((r) => r.slug === "a")!, "contribution")).not.toBeNull();
  });

  it("counts what was collected on a deposit order, not the whole price", () => {
    const rows = productProfits([order({ collectedCents: 50_000, items: [{ slug: "a", name: "Alpha", priceCents: 100_000, quantity: 1 }] })], {}, assumptions);
    expect(get(rows, "a").revenueCents).toBe(50_000);
  });

  it("shows a refunded order as revenue and refund that cancel out, and still bears its fees", () => {
    const a = get(productProfits([order({ status: "REFUNDED", commissionCents: 0, items: [{ slug: "a", name: "Alpha", priceCents: 100_000, quantity: 1 }] })], {}, assumptions), "a");
    expect(a.revenueCents).toBe(100_000);
    expect(a.refundCents).toBe(100_000);
    expect(a.contributionCents).toBe(-a.processingCents);
  });

  it("uses what the production agents really cost when it is recorded, and the entered figure when it is not", () => {
    const actual = get(productProfits([order({ aiActualCents: 3_000 })], costs, assumptions), "a");
    expect(actual.aiApiCents).toBe(1_800);
    expect(actual.costsEntered).toBe(true);
    const entered = get(productProfits([order()], costs, assumptions), "a");
    expect(entered.aiApiCents).toBe(2_000);
  });

  it("multiplies per-unit costs by the quantity sold", () => {
    const a = get(productProfits([order({ items: [{ slug: "a", name: "Alpha", priceCents: 10_000, quantity: 5 }], collectedCents: 50_000, commissionCents: 0 })], costs, assumptions), "a");
    expect(a.units).toBe(5);
    expect(a.fulfillmentCents).toBe(25_000);
    expect(a.laborHours).toBe(10);
  });

  it("skips an order with nothing in it, and applies a payment fee per payment", () => {
    expect(productProfits([order({ items: [] })], {}, assumptions)).toEqual([]);
    const two = get(productProfits([order({ paymentsCount: 2, items: [{ slug: "a", name: "Alpha", priceCents: 1, quantity: 1 }] })], {}, assumptions), "a");
    const one = get(productProfits([order({ paymentsCount: 1, items: [{ slug: "a", name: "Alpha", priceCents: 1, quantity: 1 }] })], {}, assumptions), "a");
    expect(two.processingCents - one.processingCents).toBe(DEFAULT_ASSUMPTIONS.processingFixedCents);
  });

  const input = (slug: string, over: Partial<RankInput>): RankInput => ({
    slug, name: slug, units: 1, revenueCents: 100, refundCents: 0, processingCents: 0, commissionCents: 0, fulfillmentCents: 0, aiApiCents: 0, laborCents: 0, softwareCents: 0, contributionCents: 50, marginPercent: 50, laborHours: 1, marginPerHourCents: 50, costsEntered: true,
    conversionPercent: null, retentionPercent: null, upsellPercent: null, customersBehind: 0, ...over,
  });

  it("ranks 1 for the best in each measure, sharing a rank on a tie, and leaves out products with no honest number", () => {
    const ps = [input("x", { revenueCents: 300 }), input("y", { revenueCents: 200 }), input("z", { revenueCents: 200 }), input("w", { revenueCents: 100, costsEntered: false })];
    const r = ranksFor(ps, "revenue");
    expect([r.get("x"), r.get("y"), r.get("z"), r.get("w")]).toEqual([1, 2, 2, 4]);
    const c = ranksFor(ps, "contribution");
    expect(c.has("w")).toBe(false);
    expect(c.size).toBe(3);
  });

  it("only ranks retention and upsell when at least three customers stand behind them", () => {
    const thin = input("t", { retentionPercent: 100, upsellPercent: 100, customersBehind: 2 });
    const solid = input("s", { retentionPercent: 20, upsellPercent: 30, customersBehind: 3 });
    expect(lensValue(thin, "retention")).toBeNull();
    expect(lensValue(solid, "retention")).toBe(20);
    expect(ranksFor([thin, solid], "upsell").size).toBe(1);
  });

  it("ranks overall by the average of a product's ranks and says how many measures that used", () => {
    const ps = [
      input("best", { revenueCents: 500, contributionCents: 300, marginPercent: 60, marginPerHourCents: 300, conversionPercent: 5 }),
      input("mid", { revenueCents: 300, contributionCents: 100, marginPercent: 33, marginPerHourCents: 100, conversionPercent: 3 }),
      input("thin", { revenueCents: 100, costsEntered: false, conversionPercent: null }),
    ];
    const ranked = rankProducts(ps);
    expect(ranked.map((p) => p.slug)).toEqual(["best", "mid", "thin"]);
    expect(ranked[0]).toMatchObject({ overall: 1, lensesUsed: 5 });
    expect(ranked[2]).toMatchObject({ lensesUsed: 1, overall: 3 });
  });

  it("can be sorted by any one measure, with products that have no number in it last", () => {
    const ps = [input("a", { revenueCents: 100, conversionPercent: 9 }), input("b", { revenueCents: 900, conversionPercent: 2 }), input("c", { revenueCents: 500, conversionPercent: null })];
    expect(rankProducts(ps, "revenue").map((p) => p.slug)).toEqual(["b", "c", "a"]);
    expect(rankProducts(ps, "conversion").map((p) => p.slug)).toEqual(["a", "b", "c"]);
    expect(LENSES).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
describe("the founder operating brief", () => {
  const quiet: BriefFacts = {
    yesterday: { label: "Sunday", cashCents: 0, orders: 0, newLeads: 0, auditsPaid: 0, partnerApplications: 0, invoicesPaid: 0, deliveries: 0 },
    revenue: { last7Cents: 0, topProducts: [], topSources: [] },
    failures: { stuckProjects: [], failedAgentRuns24h: 0, qaFailed24h: 0, emailFailures24h: 0, pastDuePlans: 0, overdueInvoices: [] },
    attention: { messagesNeedingYou: 0, partnerApplications: 0, partnerPayableCents: 0, openInvoiceCents: 0, intakeStalled: 0, heldDeliveries: 0 },
    leads: [],
    upsell: [],
    partners: { waiting: 0, payableCents: 0, paused: 0 },
    bottleneck: null,
  };
  const f = (over: Partial<BriefFacts>): BriefFacts => ({ ...quiet, ...over });

  it("answers the eight questions of the plan, in order", () => {
    expect(buildBrief(quiet).items.map((i) => i.question)).toEqual([
      "What happened yesterday?",
      "What produced revenue?",
      "What failed?",
      "What needs attention?",
      "Which leads need follow-up?",
      "Which customers should be upsold?",
      "Which partnerships need attention?",
      "What is today's highest-leverage task?",
    ]);
  });

  it("says plainly when nothing happened, nothing failed, and nothing is waiting", () => {
    const b = buildBrief(quiet);
    expect(b.items[0].lines[0]).toBe("No cash was collected.");
    expect(b.items[1].lines[0]).toMatch(/Nothing produced revenue/);
    expect(b.items[2].lines).toEqual(["Nothing failed that the system can see."]);
    expect(b.items[3].lines).toEqual(["Nothing is waiting on you."]);
    expect(b.items[4].lines[0]).toMatch(/No lead is overdue/);
  });

  it("reports what really happened, with real amounts", () => {
    const b = buildBrief(f({ yesterday: { ...quiet.yesterday, cashCents: 250_000, orders: 2, newLeads: 4, auditsPaid: 1 }, revenue: { last7Cents: 300_000, topProducts: [{ name: "Cinematic AI Website", cents: 200_000 }], topSources: [{ source: "google", cents: 200_000 }] } }));
    expect(b.items[0].lines[0]).toBe(`${usd(250_000)} collected across 2 paid orders.`);
    expect(b.items[0].lines[1]).toContain("4 new leads");
    expect(b.items[1].lines.join(" ")).toContain(`Cinematic AI Website ${usd(200_000)}`);
    expect(b.items[1].lines.join(" ")).toContain("google");
  });

  it("lists every kind of failure and every kind of thing that needs attention", () => {
    const b = buildBrief(f({ failures: { stuckProjects: [{ name: "Joe's site" }], failedAgentRuns24h: 2, qaFailed24h: 1, emailFailures24h: 3, pastDuePlans: 1, overdueInvoices: [{ number: "PC-1005", amountCents: 500_000, days: 9 }] }, attention: { messagesNeedingYou: 2, partnerApplications: 1, partnerPayableCents: 20_000, openInvoiceCents: 500_000, intakeStalled: 1, heldDeliveries: 1 } }));
    const failed = b.items[2].lines.join(" ");
    for (const s of ["1 build stuck", "2 production agent runs", "1 quality check", "3 emails", "1 monthly plan past due", "1 invoice open"]) expect(failed).toContain(s);
    const attn = b.items[3].lines.join(" ");
    for (const s of ["2 customer messages", "1 partner application", usd(20_000), usd(500_000), "intake", "held until the final payment"]) expect(attn).toContain(s);
  });

  it("names the leads and the customers to follow up with, and marks the overdue ones", () => {
    const b = buildBrief(f({ leads: [{ name: "Joe's Cuts", nextAction: "Send the proposal", overdue: true, stale: false, valueCents: 200_000 }, { name: "Bella Nails", nextAction: "Call them", overdue: false, stale: true, valueCents: 0 }], upsell: [{ name: "Marcus", offer: "NFC cards" }] }));
    expect(b.items[4].lines[0]).toBe(`Joe's Cuts: Send the proposal (overdue), ${usd(200_000)}`);
    expect(b.items[4].lines[1]).toBe("Bella Nails: Call them (going cold)");
    expect(b.items[5].lines).toEqual(["Marcus: NFC cards"]);
  });

  it("picks the highest-leverage task in a fixed order: a stuck customer, a waiting customer, owed money, a hot lead, the bottleneck, then the pipeline", () => {
    const base = f({});
    expect(highestLeverage(f({ failures: { ...quiet.failures, stuckProjects: [{ name: "Joe's site" }] }, attention: { ...quiet.attention, messagesNeedingYou: 3 } })).title).toBe('Unblock "Joe\'s site"');
    expect(highestLeverage(f({ attention: { ...quiet.attention, messagesNeedingYou: 3 }, failures: { ...quiet.failures, overdueInvoices: [{ number: "PC-1", amountCents: 100, days: 9 }] } })).title).toBe("Answer 3 customer messages");
    expect(highestLeverage(f({ failures: { ...quiet.failures, overdueInvoices: [{ number: "PC-1", amountCents: 100_000, days: 9 }, { number: "PC-2", amountCents: 500_000, days: 8 }] }, leads: [{ name: "X", nextAction: "n", overdue: true, stale: false, valueCents: 1 }] })).title).toBe(`Collect invoice PC-2 (${usd(500_000)})`);
    expect(highestLeverage(f({ leads: [{ name: "Small", nextAction: "n", overdue: true, stale: false, valueCents: 100 }, { name: "Big", nextAction: "n", overdue: true, stale: false, valueCents: 900_000 }, { name: "Cold", nextAction: "n", overdue: false, stale: true, valueCents: 5_000_000 }], bottleneck: { title: "Getting people to find you", action: "Improve acquisition" } })).title).toBe("Follow up with Big");
    const b = highestLeverage(f({ bottleneck: { title: "Getting people to find you", action: "Improve acquisition" } }));
    expect(b.title).toBe("Improve acquisition");
    expect(b.reason).toMatch(/getting people to find you/);
    expect(highestLeverage(base).title).toMatch(/Add prospects/);
  });

  it("always gives a reason from the data, and never mentions numerology, luck, or the founder's numbers", () => {
    const scenarios = [quiet, f({ bottleneck: { title: "X", action: "Do X" } }), f({ leads: [{ name: "A", nextAction: "n", overdue: true, stale: false, valueCents: 10 }] })];
    for (const s of scenarios) {
      const b = buildBrief(s);
      expect(b.task.reason.length).toBeGreaterThan(20);
      const text = JSON.stringify(b) + briefText(b, "Monday");
      expect(text).not.toMatch(/numerolog|lucky|destiny|angel|life path|11\/2|1\/4\/11\/6/i);
    }
  });

  it("makes a plain-text email with all eight answers and a note that nothing is a prediction", () => {
    const text = briefText(buildBrief(quiet), "Monday, September 21, 2026");
    expect(text).toContain("Founder Operating Brief, Monday, September 21, 2026");
    for (let n = 1; n <= 8; n++) expect(text).toContain(`${n}. `);
    expect(text).toMatch(/Nothing here is a prediction/);
  });
});
