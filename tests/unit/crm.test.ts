import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as ReactNS from "react";
import { createElement } from "react";
import { PRICE_CENTS } from "@/lib/pricing/catalog";
import {
  BEFORE_SALE_KEYS,
  STAGES,
  STAGE_KEYS,
  STALE_DAYS,
  buildBoard,
  buildCustomerCard,
  buildProspectCard,
  customerStage,
  isBeforeSaleKey,
  prospectOutcome,
  prospectStage,
  todayList,
  type CustomerFacts,
  type ProspectFacts,
} from "@/lib/crm/pipeline";
import { DEAL_PRODUCTS, dealProductName } from "@/lib/crm/labels";
import { PipelineBoard } from "@/components/crm/PipelineBoard";

// The test runner compiles JSX the classic way, which needs React in scope.
(globalThis as { React?: unknown }).React = ReactNS;

const NOW = new Date("2026-09-21T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);
const daysAhead = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

const prospect = (over: Partial<ProspectFacts> = {}): ProspectFacts => ({
  id: "p1",
  businessName: "Joe's Cuts",
  email: "joe@joescuts.example",
  source: "growth-audit",
  status: "NEW",
  stage: null,
  contactedAt: null,
  lastContactAt: null,
  createdAt: daysAgo(1),
  nextFollowUpAt: null,
  nextAction: null,
  valueCents: null,
  probability: null,
  productInterest: null,
  paidAudit: null,
  ...over,
});

const customer = (over: Partial<CustomerFacts> = {}): CustomerFacts => ({
  id: "c1",
  name: "Sam Buyer",
  email: "sam@firm.example",
  source: null,
  createdAt: daysAgo(40),
  orders: [{ status: "PAID", totalCents: 30_000, balanceDueCents: 0, createdAt: daysAgo(30), intakePending: false }],
  projects: [{ state: "COMPLETED" }],
  monthlyCents: 0,
  activePlans: 0,
  referralPurchases: 0,
  lastNoteAt: null,
  suggestedOffer: null,
  ...over,
});

describe("the eleven stages", () => {
  it("are the spec's, in order", () => {
    expect(STAGE_KEYS).toEqual(["NEW_LEAD", "CONTACTED", "AUDIT_SENT", "DISCOVERY", "PROPOSAL", "PAYMENT", "ONBOARDING", "DELIVERY", "UPSELL", "RETAINED", "REFERRAL"]);
  });

  it("split into six before the sale and five after, and only the first six can be set by hand", () => {
    expect(BEFORE_SALE_KEYS).toEqual(["NEW_LEAD", "CONTACTED", "AUDIT_SENT", "DISCOVERY", "PROPOSAL", "PAYMENT"]);
    expect(STAGES.filter((s) => s.side === "after")).toHaveLength(5);
    expect(isBeforeSaleKey("PROPOSAL")).toBe(true);
    expect(isBeforeSaleKey("UPSELL")).toBe(false);
    expect(isBeforeSaleKey("nonsense")).toBe(false);
    expect(isBeforeSaleKey(null)).toBe(false);
  });

  it("start with small default chances that only grow toward the sale", () => {
    const chances = STAGES.filter((s) => s.side === "before").map((s) => s.chance);
    expect([...chances].sort((a, b) => a - b)).toEqual(chances);
    expect(chances[0]).toBeLessThan(10);
    expect(chances[chances.length - 1]).toBeLessThan(100);
  });
});

describe("a prospect's stage", () => {
  it("is a new lead until something happens", () => {
    expect(prospectStage(prospect())).toBe("NEW_LEAD");
  });

  it("moves as things happen, without anyone moving it", () => {
    expect(prospectStage(prospect({ status: "CONTACTED" }))).toBe("CONTACTED");
    expect(prospectStage(prospect({ contactedAt: daysAgo(2) }))).toBe("CONTACTED");
    expect(prospectStage(prospect({ paidAudit: { primarySlug: null } }))).toBe("AUDIT_SENT");
    expect(prospectStage(prospect({ status: "REPLIED" }))).toBe("DISCOVERY");
    expect(prospectStage(prospect({ status: "CALL_BOOKED" }))).toBe("DISCOVERY");
  });

  it("goes with the furthest thing that has happened", () => {
    expect(prospectStage(prospect({ status: "CONTACTED", paidAudit: { primarySlug: null } }))).toBe("AUDIT_SENT");
    expect(prospectStage(prospect({ status: "CALL_BOOKED", paidAudit: { primarySlug: null } }))).toBe("DISCOVERY");
  });

  it("lets you move it ahead by hand, but not backward, and ignores stages that are not yours to set", () => {
    expect(prospectStage(prospect({ stage: "PROPOSAL" }))).toBe("PROPOSAL");
    expect(prospectStage(prospect({ stage: "PAYMENT", status: "CONTACTED" }))).toBe("PAYMENT");
    expect(prospectStage(prospect({ stage: "CONTACTED", status: "CALL_BOOKED" }))).toBe("DISCOVERY");
    expect(prospectStage(prospect({ stage: "UPSELL" }))).toBe("NEW_LEAD");
    expect(prospectStage(prospect({ stage: "garbage" }))).toBe("NEW_LEAD");
  });

  it("keeps won, lost, and do-not-contact prospects off the board", () => {
    expect(prospectOutcome("NEW")).toBe("open");
    expect(prospectOutcome("CALL_BOOKED")).toBe("open");
    expect(prospectOutcome("WON")).toBe("won");
    expect(prospectOutcome("LOST")).toBe("lost");
    expect(prospectOutcome("DO_NOT_CONTACT")).toBe("blocked");
  });
});

describe("a prospect's card", () => {
  it("uses the value you set, and says so", () => {
    const c = buildProspectCard(prospect({ valueCents: 450_000, productInterest: "site" }), NOW);
    expect(c.valueCents).toBe(450_000);
    expect(c.valueSource).toBe("yours");
  });

  it("falls back to the product's price when you named a product but no value", () => {
    const c = buildProspectCard(prospect({ productInterest: "lead-engine" }), NOW);
    expect(c.valueCents).toBe(PRICE_CENTS["lead-engine"]);
    expect(c.valueSource).toBe("catalog");
  });

  it("uses the audit analyst's top recommendation when nothing else is set, and labels it that way", () => {
    const c = buildProspectCard(prospect({ paidAudit: { primarySlug: "starter-website" } }), NOW);
    expect(c.productInterest).toBe("starter-website");
    expect(c.valueCents).toBe(PRICE_CENTS["starter-website"]);
    expect(c.valueSource).toBe("audit");
    expect(c.badges).toContain("Paid for an audit");
  });

  it("puts nothing on the board that it cannot back: no product means no value", () => {
    const c = buildProspectCard(prospect(), NOW);
    expect(c.valueCents).toBe(0);
    expect(c.valueSource).toBe("none");
    expect(buildProspectCard(prospect({ productInterest: "not-a-product" }), NOW).valueCents).toBe(0);
  });

  it("uses the stage's default chance unless you set one, and labels the default", () => {
    const d = buildProspectCard(prospect({ status: "CALL_BOOKED", productInterest: "site" }), NOW);
    expect(d.chance).toBe(STAGES.find((s) => s.key === "DISCOVERY")!.chance);
    expect(d.chanceIsDefault).toBe(true);
    expect(d.weightedCents).toBe(Math.round((PRICE_CENTS.site * d.chance) / 100));
    const own = buildProspectCard(prospect({ probability: 70, productInterest: "site" }), NOW);
    expect(own.chance).toBe(70);
    expect(own.chanceIsDefault).toBe(false);
    expect(own.weightedCents).toBe(Math.round(PRICE_CENTS.site * 0.7));
  });

  it("keeps a chance between 0 and 100", () => {
    expect(buildProspectCard(prospect({ probability: 250 }), NOW).chance).toBe(100);
    expect(buildProspectCard(prospect({ probability: -5 }), NOW).chance).toBe(0);
  });

  it("says what to do next: yours if you wrote one, otherwise a default for the stage", () => {
    expect(buildProspectCard(prospect({ nextAction: "Send the proposal Friday" }), NOW).nextAction).toBe("Send the proposal Friday");
    expect(buildProspectCard(prospect({ nextAction: "   " }), NOW).nextAction).toMatch(/website/i);
    expect(buildProspectCard(prospect({ stage: "PROPOSAL" }), NOW).nextAction).toMatch(/proposal/i);
  });

  it("is overdue when the follow-up date has arrived, and not before", () => {
    expect(buildProspectCard(prospect({ nextFollowUpAt: daysAgo(1) }), NOW).overdue).toBe(true);
    expect(buildProspectCard(prospect({ nextFollowUpAt: NOW }), NOW).overdue).toBe(true);
    expect(buildProspectCard(prospect({ nextFollowUpAt: daysAhead(2) }), NOW).overdue).toBe(false);
    expect(buildProspectCard(prospect(), NOW).overdue).toBe(false);
  });

  it("goes cold after two weeks with no contact, counting from the last contact if there is one", () => {
    expect(buildProspectCard(prospect({ createdAt: daysAgo(STALE_DAYS + 1) }), NOW).stale).toBe(true);
    expect(buildProspectCard(prospect({ createdAt: daysAgo(STALE_DAYS - 1) }), NOW).stale).toBe(false);
    expect(buildProspectCard(prospect({ createdAt: daysAgo(60), lastContactAt: daysAgo(3) }), NOW).stale).toBe(false);
    expect(buildProspectCard(prospect({ createdAt: daysAgo(60), contactedAt: daysAgo(20) }), NOW).stale).toBe(true);
  });
});

describe("a customer's stage", () => {
  it("does not exist until they have ordered", () => {
    expect(customerStage(customer({ orders: [], projects: [] }))).toBeNull();
    expect(buildCustomerCard(customer({ orders: [], projects: [] }), NOW)).toBeNull();
  });

  it("is Payment while an order is unpaid", () => {
    const f = customer({ orders: [{ status: "PENDING", totalCents: 100_000, balanceDueCents: 0, createdAt: daysAgo(1), intakePending: false }], projects: [] });
    expect(customerStage(f)).toBe("PAYMENT");
  });

  it("is Onboarding at the start of a project and Delivery once it is being built", () => {
    for (const state of ["PAID", "INTAKE_REQUIRED", "QUEUED", "RESEARCH", "STRATEGY"]) expect(customerStage(customer({ projects: [{ state }] }))).toBe("ONBOARDING");
    for (const state of ["CONCEPT", "GENERATION", "BUILD", "QA", "REVISION", "DELIVERY_READY", "EXCEPTION"]) expect(customerStage(customer({ projects: [{ state }] }))).toBe("DELIVERY");
  });

  it("goes with the furthest active project", () => {
    expect(customerStage(customer({ projects: [{ state: "PAID" }, { state: "BUILD" }, { state: "COMPLETED" }] }))).toBe("DELIVERY");
  });

  it("is Upsell when everything is delivered, Retained on a monthly plan, and Referral once someone they sent has paid", () => {
    expect(customerStage(customer())).toBe("UPSELL");
    expect(customerStage(customer({ projects: [{ state: "DELIVERED" }, { state: "CANCELLED" }] }))).toBe("UPSELL");
    expect(customerStage(customer({ activePlans: 1 }))).toBe("RETAINED");
    expect(customerStage(customer({ referralPurchases: 1 }))).toBe("REFERRAL");
    expect(customerStage(customer({ activePlans: 1, referralPurchases: 2 }))).toBe("REFERRAL");
  });

  it("puts a plan holder with a project still being built in Delivery, because that is the live work", () => {
    expect(customerStage(customer({ activePlans: 1, projects: [{ state: "BUILD" }] }))).toBe("DELIVERY");
  });
});

describe("a customer's card", () => {
  it("counts what has actually been collected, so a deposit order is not counted whole", () => {
    const f = customer({ orders: [{ status: "PAID", totalCents: 1_000_000, balanceDueCents: 500_000, createdAt: daysAgo(5), intakePending: false }], projects: [{ state: "BUILD" }] });
    const c = buildCustomerCard(f, NOW)!;
    expect(c.ltvCents).toBe(500_000);
    expect(c.valueCents).toBe(500_000);
    expect(c.badges).toContain("Balance owed");
    expect(c.nextAction).toMatch(/final payment/i);
  });

  it("shows an unpaid order as money waiting, not as money made", () => {
    const c = buildCustomerCard(customer({ orders: [{ status: "PENDING", totalCents: 300_000, balanceDueCents: 0, createdAt: daysAgo(1), intakePending: false }], projects: [] }), NOW)!;
    expect(c.stage).toBe("PAYMENT");
    expect(c.ltvCents).toBe(0);
    expect(c.valueCents).toBe(300_000);
    expect(c.nextAction).toMatch(/payment has not arrived/i);
  });

  it("says what is next from the real records", () => {
    expect(buildCustomerCard(customer({ projects: [{ state: "INTAKE_REQUIRED" }], orders: [{ status: "PAID", totalCents: 30_000, balanceDueCents: 0, createdAt: daysAgo(1), intakePending: true }] }), NOW)!.nextAction).toMatch(/intake/i);
    expect(buildCustomerCard(customer({ projects: [{ state: "EXCEPTION" }] }), NOW)!.nextAction).toMatch(/needs attention/i);
    expect(buildCustomerCard(customer({ suggestedOffer: "NFC cards" }), NOW)!.nextAction).toBe("Offer NFC cards");
    expect(buildCustomerCard(customer({ activePlans: 1 }), NOW)!.nextAction).toMatch(/review or a referral/i);
    expect(buildCustomerCard(customer({ referralPurchases: 1 }), NOW)!.nextAction).toMatch(/thank/i);
  });

  it("carries the monthly plan, the referrals, and the source", () => {
    const c = buildCustomerCard(customer({ monthlyCents: 7_900, activePlans: 1, referralPurchases: 2, source: "referral" }), NOW)!;
    expect(c.mrrCents).toBe(7_900);
    expect(c.referrals).toBe(2);
    expect(c.source).toBe("referral");
    expect(c.badges).toEqual(expect.arrayContaining(["Monthly plan", "2 referrals paid"]));
  });

  it("does not invent a value for an upsell", () => {
    const c = buildCustomerCard(customer({ suggestedOffer: "NFC cards" }), NOW)!;
    expect(c.valueCents).toBe(0);
  });
});

describe("the board", () => {
  const cards = [
    buildProspectCard(prospect({ id: "a", businessName: "A", productInterest: "site" }), NOW),
    buildProspectCard(prospect({ id: "b", businessName: "B", productInterest: "starter-website", nextFollowUpAt: daysAgo(1) }), NOW),
    buildProspectCard(prospect({ id: "c", businessName: "C", status: "CALL_BOOKED", valueCents: 900_000, probability: 50 }), NOW),
    buildCustomerCard(customer({ id: "d", orders: [{ status: "PAID", totalCents: 100_000, balanceDueCents: 40_000, createdAt: daysAgo(3), intakePending: false }], projects: [{ state: "BUILD" }], monthlyCents: 7_900, activePlans: 1 }), NOW)!,
  ];

  it("has one column per stage, in order, with every card in exactly one", () => {
    const { columns } = buildBoard(cards);
    expect(columns.map((c) => c.stage.key)).toEqual(STAGE_KEYS);
    expect(columns.reduce((s, c) => s + c.cards.length, 0)).toBe(cards.length);
    expect(columns.find((c) => c.stage.key === "NEW_LEAD")!.cards).toHaveLength(2);
    expect(columns.find((c) => c.stage.key === "DISCOVERY")!.cards.map((c) => c.name)).toEqual(["C"]);
  });

  it("lists overdue follow-ups first, then the bigger deals", () => {
    const col = buildBoard(cards).columns.find((c) => c.stage.key === "NEW_LEAD")!;
    expect(col.cards.map((c) => c.name)).toEqual(["B", "A"]);
  });

  it("adds up only what is before the sale as open opportunities, and never counts a customer's balance as one", () => {
    const { summary } = buildBoard(cards);
    expect(summary.openCents).toBe(PRICE_CENTS.site + PRICE_CENTS["starter-website"] + 900_000);
    expect(summary.weightedCents).toBe(Math.round(PRICE_CENTS.site * 0.05) + Math.round(PRICE_CENTS["starter-website"] * 0.05) + 450_000);
    expect(summary.owedCents).toBe(40_000);
    expect(summary.customers).toBe(1);
    expect(summary.lifetimeCents).toBe(60_000);
    expect(summary.mrrCents).toBe(7_900);
    expect(summary.overdue).toBe(1);
  });

  it("lists who needs you today: overdue first, then going cold, capped", () => {
    const cold = buildProspectCard(prospect({ id: "z", businessName: "Z", createdAt: daysAgo(30) }), NOW);
    const list = todayList([...cards, cold], 2);
    expect(list.map((c) => c.name)).toEqual(["B", "Z"]);
    expect(todayList([buildProspectCard(prospect(), NOW)])).toEqual([]);
  });
});

describe("product names", () => {
  it("come from one place, with prices from the price list", () => {
    expect(dealProductName("starter-website")).toBe("Quick Business Website");
    expect(dealProductName("mystery")).toBe("mystery");
    expect(dealProductName(null)).toBeNull();
    const site = DEAL_PRODUCTS.find((p) => p.slug === "site")!;
    expect(site.label).toContain("Cinematic AI Website");
    expect(site.label).toContain("2,000");
    for (const p of DEAL_PRODUCTS) expect(p.slug in PRICE_CENTS).toBe(true);
  });
});

describe("the board on the page", () => {
  const cards = [
    buildProspectCard(prospect({ id: "a", businessName: "Joe's Cuts", productInterest: "starter-website", nextFollowUpAt: daysAgo(1), createdAt: daysAgo(30) }), NOW),
    buildCustomerCard(customer({ id: "d", name: "Sam Buyer", suggestedOffer: "NFC cards" }), NOW)!,
  ];
  const html = renderToStaticMarkup(createElement(PipelineBoard, { columns: buildBoard(cards).columns }));

  it("shows every stage, with a friendly line for the empty ones", () => {
    for (const s of STAGES) expect(html).toContain(s.label);
    expect(html).toContain("Nobody here right now.");
  });

  it("shows each card with its name, link, value, next step, and warnings", () => {
    expect(html).toContain("Joe&#x27;s Cuts");
    expect(html).toContain('href="/admin/prospects/a"');
    expect(html).toContain('href="/admin/crm/d"');
    expect(html).toContain("Quick Business Website");
    expect(html).toContain("(default)");
    expect(html).toContain("Going cold");
    expect(html).toContain("Offer NFC cards");
    expect(html).toContain("Customer");
  });

  it("gives every stage a section a phone can jump to", () => {
    for (const k of STAGE_KEYS) expect(html).toContain(`id="stage-${k}"`);
  });
});
