import { describe, expect, it } from "vitest";
import { createUniverse } from "@/lib/universe/commands";
import { createPatientCreationsDomain, FUNNEL_LEAK_MAX_PERCENT, FUNNEL_MIN_SAMPLE, type FounderData, type PcSources } from "@/lib/universe/domains/patientCreations";
import { InMemoryStore } from "@/lib/universe/store/memoryStore";
import { byImportance } from "@/lib/universe/protocol";
import { AGENT_IDS, type Claim } from "@/lib/universe/types";
import { checkCopyText } from "@/lib/universe/agents/logic";
import { GOOD_PAGE } from "./universeHelpers";

// Patient Creations plugged into the Agent Universe, with its data sources replaced by known numbers so every statement the
// agents make can be checked against what was put in.

const signal = (key: string, triggered: boolean, judged = true) => ({ key, triggered, judged, title: `Stage ${key}`, measure: `measure ${key}`, line: `line ${key}`, action: `act ${key}` });

const founder = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    bottleneck: { primary: null, signals: [signal("acquisition", true), signal("conversion", false, false), signal("fulfillment", false), signal("retention", false, false), signal("expansion", false, false)], note: "" },
    vision: { text: "", targetCents: 10_000_000, monthToDateCents: 250_000 },
    financials: { monthToDateCashCents: 250_000, mrrCents: 40_000, last30Cents: 310_000 },
    systems: { failedAgentRuns24h: 0, qaFailed24h: 0, emailFailures24h: 3, stuckProjects: 0, configured: [{ label: "Email sending (Resend)", on: false, fix: "" }, { label: "Text alerts (Twilio)", on: false, fix: "" }, { label: "Card payments (Stripe)", on: true, fix: "" }] },
    experience: { avgRating: 4.8, reviews: 6, messagesNeedingYou: 2, stuckProjects: 0 },
    sales: { todayCents: 0, leadsDue: 1, pipelineOpenCents: 900_000, newLeads30: 4, calls30: 2 },
    relationships: { activePartners: 2, waiting: 1, partnerPayableCents: 12_000, holdDays: 14, customerCommissionsCents: 0 },
    ...over,
  }) as unknown as FounderData;

const sources = (over: Partial<PcSources> = {}): PcSources => ({
  founder: async () => founder(),
  funnel: async () => ({ landing_page_view: 100, offer_view: 40, checkout_started: 20, checkout_completed: 1, audit_started: 3, audit_completed: 1 }),
  invoices: async () => ({ openCents: 150_000, openCount: 2, overdueCount: 1, overdueCents: 90_000 }),
  products: async () => [
    { slug: "a", name: "Alpha", category: "Websites", type: "PRIMARY", priceCents: 30_000, turnaround: "72 hours", description: "A complete one-page website for a small business." },
    { slug: "b", name: "Beta", category: "Software", type: "PRIMARY", priceCents: 500_000, turnaround: null, description: "x" },
  ],
  ...over,
});

const NOW = new Date("2026-09-24T12:00:00Z");
const setup = (s: PcSources = sources(), pages: Record<string, string> = {}) => {
  const domain = createPatientCreationsDomain({
    sources: s,
    now: () => NOW,
    fetchPage: async (url) => {
      const path = new URL(url).pathname;
      const html = pages[path] ?? GOOD_PAGE;
      return { status: 200, html, finalUrl: url, bytes: html.length };
    },
  });
  const store = new InMemoryStore();
  return { store, domain, u: createUniverse({ store, domain, deps: {}, probeTimeoutMs: 1000, snapshotTimeoutMs: 1000, agentTimeoutMs: 3000 }) };
};
const mission = async (ctx: ReturnType<typeof setup>, command: Parameters<typeof ctx.u.run>[0], text?: string) => {
  const r = await ctx.u.run(command, { text });
  if (r.kind !== "mission") throw new Error(JSON.stringify(r));
  return r.result;
};

describe("Patient Creations as the first domain", () => {
  it("supplies everything the universal agents need, and nothing is left half-defined", () => {
    const d = createPatientCreationsDomain({ sources: sources() });
    expect(d.id).toBe("patient-creations");
    expect(d.stakeholders.length).toBe(12);
    expect(d.probes.length).toBeGreaterThanOrEqual(12);
    expect(d.surfaces.length).toBeGreaterThanOrEqual(3);
    expect(d.levers.filter((l) => !l.experiment).every((l) => l.severity)).toBe(true);
    expect(d.levers.filter((l) => l.experiment).every((l) => !l.severity)).toBe(true);
    for (const kind of ["business", "website", "products", "journey", "growth", "customers", "conversion", "strategy", "research", "daily", "weekly"] as const) expect(d.components[kind]?.length, kind).toBeGreaterThan(0);
    // Every topic a component asks about is either read by a probe, or observed on a page, or honestly reported as unknown.
    const probeTopics = new Set(d.probes.map((p) => p.topic));
    expect(["acquisition", "conversion", "fulfillment", "retention", "expansion", "cash", "systems", "experience", "funnel", "catalog", "partners"].every((t) => probeTopics.has(t))).toBe(true);
  });

  it("holds the owner's rules as constraints and as banned wording", () => {
    const d = createPatientCreationsDomain({ sources: sources() });
    const banned = d.constraints.flatMap((c) => c.bannedPhrases ?? []);
    const forbids = d.constraints.flatMap((c) => c.forbidsActions);
    for (const a of ["change_pricing", "issue_refund", "change_payment_config", "send_mass_communication", "spend_money", "delete_customer_data"]) expect(forbids).toContain(a);
    for (const w of ["We guarantee more reviews.", "Trenton will call you.", "Our destiny matrix says so."]) expect(banned.some((b) => new RegExp(b, "i").test(w)), w).toBe(true);
    expect(checkCopyText("A one-page site in 72 hours.", "A one-page site in 72 hours.", [], banned).ok).toBe(true);
  });
});

describe("what the agents say about it is what the data says", () => {
  it("reports each number exactly as the sources gave it", async () => {
    const r = await mission(setup(), "AUDIT_BUSINESS");
    const text = r.facts.filter((f) => f.label === "FACT").map((f) => f.statement).join("\n");
    expect(text).toContain("$2,500");
    expect(text).toContain("$100,000 monthly goal");
    expect(text).toContain("$1,500");
    expect(text).toContain("$900");
    expect(text).toContain("3 emails failed");
    expect(text).toContain("4.8 from 6 reviews");
    expect(text).toContain("2 customer messages waiting");
    expect(text).toContain("1 of 20 (5%) continued");
    expect(text).toContain("Beta");
    expect(r.facts.every((f) => f.label !== "FACT" || f.source.length > 0)).toBe(true);
  });

  it("puts the earliest broken stage first, as the founder rule does, ahead of cosmetic problems", async () => {
    const r = await mission(setup(), "AUDIT_BUSINESS");
    const top = r.decision.tasks[0];
    expect(top.priority).toBe("P1");
    expect(top.title.toLowerCase()).toMatch(/audit|offers|partner link|people|find|customers who are waiting|waiting/);
    const images = r.decision.tasks.findIndex((t) => /image gaps/i.test(t.title));
    const acquisition = r.decision.tasks.findIndex((t) => /more of the right people/i.test(t.title));
    if (images !== -1 && acquisition !== -1) expect(acquisition).toBeLessThan(images);
  });

  it("says a stage cannot be judged yet, and does not call it a problem", async () => {
    const r = await mission(setup(), "AUDIT_BUSINESS");
    const conv = r.facts.find((f) => f.key === "bottleneck.conversion")!;
    expect(conv.statement).toContain("not enough data yet");
    expect(conv.signal).toBe("neutral");
    expect(conv.tags).toContain("low-sample");
  });

  it("only calls a funnel step a leak when enough people entered it, and shows the counts", async () => {
    expect(FUNNEL_MIN_SAMPLE).toBe(5);
    expect(FUNNEL_LEAK_MAX_PERCENT).toBe(10);
    const r = await mission(setup(), "AUDIT_BUSINESS");
    const leak = r.facts.find((f) => f.key === "funnel.checkout_started.checkout_completed")!;
    expect(leak.signal).toBe("negative");
    const small = r.facts.find((f) => f.key === "funnel.audit_started.audit_completed")!;
    expect(small.signal).toBe("neutral");
    expect(small.statement).toContain("Too few to judge");
  });

  it("treats optional services being off as fine and essential ones as problems", async () => {
    const r = await mission(setup(), "AUDIT_BUSINESS");
    expect(r.facts.find((f) => f.key === "config.Email sending (Resend)")!.signal).toBe("negative");
    expect(r.facts.find((f) => f.key === "config.Text alerts (Twilio)")!.signal).toBe("neutral");
    expect(r.facts.find((f) => f.key === "config.Card payments (Stripe)")!.signal).toBe("neutral");
  });
});

describe("when a source is down", () => {
  it("reports that data as not available and still reports what it could read", async () => {
    const s = sources({ founder: async () => { throw new Error("db down"); } });
    const r = await mission(setup(s), "AUDIT_BUSINESS");
    expect(r.facts.some((f) => f.label === "UNKNOWN" && f.key === "probe.bottleneck.acquisition")).toBe(true);
    expect(r.facts.some((f) => f.label === "FACT" && f.key === "invoices.overdue")).toBe(true);
    expect(r.report).toContain("DATA NOT AVAILABLE");
    expect(r.facts.filter((f) => f.label === "FACT").every((f) => !f.statement.includes("db down"))).toBe(true);
  });

  it("offers no conclusion and no tasks when nothing at all can be read", async () => {
    const dead = () => Promise.reject(new Error("down"));
    const s: PcSources = { founder: dead, funnel: dead, invoices: dead, products: dead };
    const ctx = setup(s);
    ctx.domain.surfaces = [];
    const r = await mission(ctx, "AUDIT_BUSINESS");
    expect(r.decision.summary).toContain("Nothing could be established");
    expect(r.decision.tasks).toHaveLength(0);
    expect(r.decision.confidence).toBe("LOW");
    expect(r.decision.nextActions[0]).toContain("Restore the connection");
    expect(ctx.store.tasks).toHaveLength(0);
  });
});

describe("the requests from the spec, on this business", () => {
  it("a whole-business analysis wakes all eleven and finishes", async () => {
    const r = await mission(setup(), "ASK_MASTER", "Analyze Patient Creations and identify the most important areas that should be investigated to improve the business.");
    expect(r.status).toBe("COMPLETED");
    expect(new Set(r.messages.map((m) => m.agent))).toEqual(new Set(AGENT_IDS.filter((a) => a !== "MASTER")));
  });

  it("a subscription question wakes only the deciding minds and offers three options, not a yes", async () => {
    const r = await mission(setup(), "ASK_MASTER", "Should Patient Creations introduce a subscription?");
    expect(r.route.intent).toBe("decision");
    expect(new Set(r.messages.map((m) => m.agent))).toEqual(new Set(["GATHERER", "PERSPECTIVE", "THINKING", "FEELINGS", "LOGIC", "ORGANIZER"]));
    const options = (r.messages.find((m) => m.agent === "THINKING")!.payload!.options as { option: string }[]).map((o) => o.option);
    expect(options).toEqual(expect.arrayContaining(["Pilot it small first", "Commit fully", "Defer and answer the open questions first"]));
  });

  it("a rewrite that promises reviews or names a person is refused", async () => {
    const ctx = setup(sources(), {});
    const bad = createUniverse({ store: ctx.store, domain: ctx.domain, deps: { writeCopy: async () => "We guarantee more reviews. Trenton will build it for $5." } });
    const r = await bad.run("ASK_MASTER", { text: "Rewrite this product description.", attachments: [{ kind: "text", value: "A website for your business." }] });
    expect(r.kind === "mission" && r.result.copy?.accepted).toBe(false);
    const report = r.kind === "mission" ? r.result.report : "";
    expect(report).not.toContain("will build it");
    expect(report).toContain("guarantee");
  });

  it("a website audit finds the real problems on a bad page and names the page", async () => {
    const bad = `<html><head></head><body><a href="/x">Buy now</a><a href="/y">Order today</a><a href="/z">Start now</a><a href="/w">Book a call</a><a href="/v">Sign up</a><a href="/u">Get started</a><img src="/i.png"></body></html>`;
    const r = await mission(setup(sources(), { "/services": bad }), "AUDIT_WEBSITE");
    const texts = r.messages.find((m) => m.agent === "LOOK")!.findings.map((c) => c.text);
    expect(texts.some((t) => t.startsWith("Services page"))).toBe(true);
    expect(texts.some((t) => t.startsWith("Home page") && /no main heading|no title/.test(t))).toBe(false);
    expect(r.route.intent).toBe("audit-website");
  });
});

describe("importance follows the business's own order", () => {
  const c = (id: string, o: Partial<Claim>): Claim => ({ id, agent: "THINKING", kind: "recommendation", text: id, target: "t", stance: "pursue", severity: "medium", evidence: [], ...o });
  it("sorts by severity, then the business's own rank, then how much evidence", () => {
    const sorted = [c("many", { severity: "high", evidence: ["a", "b", "c"], rank: 5 }), c("first", { severity: "high", evidence: ["a"], rank: 1 }), c("low", { severity: "low", evidence: ["a", "b", "c", "d"], rank: 0 }), c("unranked", { severity: "high", evidence: ["a", "b"] })].sort(byImportance).map((x) => x.id);
    expect(sorted).toEqual(["first", "many", "unranked", "low"]);
  });
});
