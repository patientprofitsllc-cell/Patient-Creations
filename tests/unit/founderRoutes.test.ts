import { beforeEach, describe, expect, it, vi } from "vitest";
import * as ReactNS from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// The founder dashboard's doors: ideas, product costs, settings, and the morning email.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  session: null as Row | null,
  ideas: [] as Row[],
  costs: [] as Row[],
  settings: [] as Row[],
  emails: [] as Row[],
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    founderIdea: {
      create: async ({ data }: Row) => void h.ideas.push({ id: `i${h.ideas.length + 1}`, status: "PARKED", ...data }),
      findUnique: async ({ where }: Row) => h.ideas.find((i) => i.id === where.id) ?? null,
      update: async ({ where, data }: Row) => Object.assign(h.ideas.find((i) => i.id === where.id)!, data),
      count: async ({ where }: Row) => h.ideas.filter((i) => i.status === where.status && i.id !== where.NOT.id).length,
      deleteMany: async ({ where }: Row) => {
        const n = h.ideas.length;
        h.ideas = h.ideas.filter((i) => i.id !== where.id);
        return { count: n - h.ideas.length };
      },
    },
    productCost: { upsert: async ({ where, create, update }: Row) => { const i = h.costs.findIndex((c) => c.slug === where.slug); if (i >= 0) Object.assign(h.costs[i], update); else h.costs.push(create); } },
    appSetting: { upsert: async ({ where, create, update }: Row) => { const i = h.settings.findIndex((c) => c.key === where.key); if (i >= 0) Object.assign(h.settings[i], update); else h.settings.push(create); } },
  },
}));
vi.mock("@/lib/founder/service", () => ({
  SETTING_KEYS: { laborRate: "labor_rate_cents_per_hour", processingPercent: "processing_percent", processingFixed: "processing_fixed_cents", vision: "vision_goals" },
  loadFounder: async () => ({ now: new Date("2026-09-21T12:00:00Z"), brief: { task: { title: "Answer 2 customer messages", reason: "x" }, items: [{ n: 1, question: "What happened yesterday?", lines: ["No cash was collected."] }] } }),
}));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void h.emails.push({ to, template, payload }) }));

import { NextRequest } from "next/server";
import { POST as createIdea } from "@/app/api/admin/ideas/route";
import { POST as updateIdea, DELETE as deleteIdea } from "@/app/api/admin/ideas/[id]/route";
import { POST as saveCost } from "@/app/api/admin/product-costs/route";
import { POST as saveSettings } from "@/app/api/admin/founder-settings/route";
import { GET as cron } from "@/app/api/cron/founder-brief/route";
import { IdeaBoard } from "@/components/founder/IdeaBoard";

(globalThis as { React?: unknown }).React = ReactNS;
const env = process.env as Record<string, string | undefined>;
const post = (url: string, body: unknown) => new NextRequest(`http://localhost${url}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
const asAdmin = () => (h.session = { user: { id: "u", role: "ADMIN" } });
const GOOD = { revenue: "yes", recurring: "yes", acquisition: "yes", fulfillment: "no", strengthens: "yes", delegate: "no", distracts: "no" };
const DISTRACTS = { revenue: "yes", recurring: "no", acquisition: "no", fulfillment: "no", strengthens: "no", delegate: "no", distracts: "yes" };

beforeEach(() => {
  h.session = null;
  h.ideas = [];
  h.costs = [];
  h.settings = [];
  h.emails = [];
  delete env.CRON_SECRET;
});

describe("saving and answering ideas", () => {
  it("is closed to a visitor and to a customer", async () => {
    expect((await createIdea(post("/api/admin/ideas", { title: "An idea" }))).status).toBe(401);
    h.session = { user: { id: "u", role: "CUSTOMER" } };
    expect((await createIdea(post("/api/admin/ideas", { title: "An idea" }))).status).toBe(403);
    expect(h.ideas).toHaveLength(0);
  });

  it("parks a new idea, scored from its answers, and never starts it", async () => {
    asAdmin();
    expect((await createIdea(post("/api/admin/ideas", { title: "Sell to dentists", notes: "n", answers: GOOD }))).status).toBe(200);
    expect(h.ideas[0]).toMatchObject({ title: "Sell to dentists", status: "PARKED", verdict: "worth-a-look", score: 4 });
    expect(JSON.parse(h.ideas[0].answersJson)).toEqual(GOOD);
  });

  it("refuses a title that is too short or missing, and ignores answers that are not real", async () => {
    asAdmin();
    expect((await createIdea(post("/api/admin/ideas", { title: "x" }))).status).toBe(400);
    expect((await createIdea(post("/api/admin/ideas", {}))).status).toBe(400);
    await createIdea(post("/api/admin/ideas", { title: "An idea", answers: { revenue: "maybe", bogus: "yes", distracts: "yes" } }));
    expect(JSON.parse(h.ideas[0].answersJson)).toEqual({ distracts: "yes" });
  });
});

describe("moving an idea", () => {
  const move = (id: string, body: unknown) => updateIdea(post(`/api/admin/ideas/${id}`, body), { params: { id } });
  const seed = (over: Row = {}) => h.ideas.push({ id: `i${h.ideas.length + 1}`, title: "T", status: "PARKED", answersJson: JSON.stringify(GOOD), score: 4, verdict: "park", ...over });

  it("does not start an idea until all seven questions are answered", async () => {
    asAdmin();
    seed({ answersJson: JSON.stringify({ revenue: "yes" }) });
    const r = await move("i1", { to: "DOING" });
    expect(r.status).toBe(409);
    expect((await r.json()).error).toMatch(/all seven questions/);
    expect(h.ideas[0].status).toBe("PARKED");
  });

  it("starts an answered idea, and saves answers sent with the request", async () => {
    asAdmin();
    seed({ answersJson: JSON.stringify({ revenue: "yes" }) });
    const r = await move("i1", { to: "DOING", answers: GOOD });
    expect(r.status).toBe(200);
    expect(h.ideas[0].status).toBe("DOING");
    expect(JSON.parse(h.ideas[0].answersJson)).toEqual(GOOD);
  });

  it("holds the line at two ideas in progress", async () => {
    asAdmin();
    seed({ status: "DOING" });
    seed({ status: "DOING" });
    seed();
    const r = await move("i3", { to: "DOING" });
    expect(r.status).toBe(409);
    expect((await r.json()).error).toMatch(/Finish or drop one first/);
    expect(h.ideas[2].status).toBe("PARKED");
  });

  it("asks before starting an idea that distracts from the bottleneck, and starts it only with an override", async () => {
    asAdmin();
    seed({ answersJson: JSON.stringify(DISTRACTS) });
    const first = await move("i1", { to: "DOING" });
    expect(first.status).toBe(409);
    expect((await first.json()).needsOverride).toBe(true);
    expect((await move("i1", { to: "DOING", override: true })).status).toBe(200);
    expect(h.ideas[0].status).toBe("DOING");
  });

  it("finishes and drops ideas freely, stamping when", async () => {
    asAdmin();
    seed({ status: "DOING" });
    expect((await move("i1", { to: "DONE", note: "shipped" })).status).toBe(200);
    expect(h.ideas[0]).toMatchObject({ status: "DONE", decisionNote: "shipped" });
    expect(h.ideas[0].decidedAt).toBeInstanceOf(Date);
  });

  it("refuses an unknown status, a missing idea, and answers it does not know", async () => {
    asAdmin();
    seed();
    expect((await move("i1", { to: "DELETED" })).status).toBe(400);
    expect((await move("nope", { to: "DONE" })).status).toBe(404);
    await move("i1", { answers: { revenue: "maybe", bogus: "yes" } });
    expect(JSON.parse(h.ideas[0].answersJson)).toEqual(GOOD);
  });

  it("deletes an idea only for the owner", async () => {
    seed();
    expect((await deleteIdea(new NextRequest("http://localhost/x", { method: "DELETE" }), { params: { id: "i1" } })).status).toBe(401);
    asAdmin();
    expect((await deleteIdea(new NextRequest("http://localhost/x", { method: "DELETE" }), { params: { id: "i1" } })).status).toBe(200);
    expect((await deleteIdea(new NextRequest("http://localhost/x", { method: "DELETE" }), { params: { id: "i1" } })).status).toBe(404);
  });
});

describe("the owner's own numbers", () => {
  it("saves a product's costs, and only for a product we sell, as whole numbers", async () => {
    asAdmin();
    const ok = { slug: "starter-website", fulfillmentCents: 0, aiApiCents: 150, laborMinutes: 45, softwareCents: 200, note: "hosting" };
    expect((await saveCost(post("/api/admin/product-costs", ok))).status).toBe(200);
    expect(h.costs[0]).toMatchObject({ slug: "starter-website", aiApiCents: 150, laborMinutes: 45 });
    for (const bad of [{ ...ok, slug: "free-money" }, { ...ok, aiApiCents: -1 }, { ...ok, laborMinutes: 1.5 }, { ...ok, softwareCents: 1e12 }, {}]) expect((await saveCost(post("/api/admin/product-costs", bad))).status).toBe(400);
    expect(h.costs).toHaveLength(1);
  });

  it("updates rather than duplicates a product's costs", async () => {
    asAdmin();
    const base = { slug: "site", fulfillmentCents: 0, aiApiCents: 0, laborMinutes: 10, softwareCents: 0 };
    await saveCost(post("/api/admin/product-costs", base));
    await saveCost(post("/api/admin/product-costs", { ...base, laborMinutes: 90 }));
    expect(h.costs).toHaveLength(1);
    expect(h.costs[0].laborMinutes).toBe(90);
  });

  it("saves the labor rate, the payment fee, and the goals, and refuses nonsense", async () => {
    asAdmin();
    expect((await saveSettings(post("/api/admin/founder-settings", { laborRateCentsPerHour: 7_500, processingPercent: 2.9, processingFixedCents: 30, vision: "100 customers by December" }))).status).toBe(200);
    expect(h.settings.map((s) => [s.key, s.value])).toEqual([["labor_rate_cents_per_hour", "7500"], ["processing_percent", "2.9"], ["processing_fixed_cents", "30"], ["vision_goals", "100 customers by December"]]);
    for (const bad of [{}, { processingPercent: 50 }, { laborRateCentsPerHour: -1 }, { processingFixedCents: 1.5 }, { vision: "x".repeat(2001) }]) expect((await saveSettings(post("/api/admin/founder-settings", bad))).status).toBe(400);
  });

  it("is closed to everyone but the owner", async () => {
    expect((await saveCost(post("/api/admin/product-costs", { slug: "site" }))).status).toBe(401);
    expect((await saveSettings(post("/api/admin/founder-settings", { vision: "x" }))).status).toBe(401);
    h.session = { user: { id: "u", role: "CUSTOMER" } };
    expect((await saveSettings(post("/api/admin/founder-settings", { vision: "x" }))).status).toBe(403);
    expect(h.settings).toHaveLength(0);
  });
});

describe("the morning email", () => {
  const call = (auth?: string) => cron(new NextRequest("http://localhost/api/cron/founder-brief", { headers: auth ? { authorization: auth } : {} }));
  const SECRET = "a-long-secret-of-at-least-24-chars";

  it("does not exist to anyone while no secret is set", async () => {
    expect((await call()).status).toBe(404);
    expect((await call(`Bearer ${SECRET}`)).status).toBe(404);
    expect(h.emails).toHaveLength(0);
  });

  it("does not exist to someone with the wrong secret, or a secret that is too short", async () => {
    env.CRON_SECRET = SECRET;
    expect((await call()).status).toBe(404);
    expect((await call("Bearer wrong")).status).toBe(404);
    expect((await call(`Bearer ${SECRET}x`)).status).toBe(404);
    env.CRON_SECRET = "short";
    expect((await call("Bearer short")).status).toBe(404);
    expect(h.emails).toHaveLength(0);
  });

  it("emails the brief to the owner when the secret is right", async () => {
    env.CRON_SECRET = SECRET;
    const res = await call(`Bearer ${SECRET}`);
    expect(res.status).toBe(200);
    expect(h.emails).toHaveLength(1);
    expect(h.emails[0].payload.subject).toContain("Answer 2 customer messages");
    expect(h.emails[0].payload.body).toContain("Founder Operating Brief");
    expect(h.emails[0].payload.body).toContain("What happened yesterday?");
  });
});

describe("the idea board on the page", () => {
  const html = renderToStaticMarkup(
    createElement(IdeaBoard, {
      bottleneckTitle: "Getting people to find you",
      doingCount: 1,
      max: 2,
      ideas: [
        { id: "a", title: "Sell to dentists", notes: null, status: "PARKED", answers: GOOD as never, created: "Sep 21, 2026", decisionNote: null },
        { id: "b", title: "A mobile app", notes: "later", status: "PARKED", answers: DISTRACTS as never, created: "Sep 20, 2026", decisionNote: null },
        { id: "c", title: "Better invoices", notes: null, status: "DOING", answers: GOOD as never, created: "Sep 19, 2026", decisionNote: null },
      ],
    }),
  );

  it("shows the seven questions for a new idea and the current bottleneck to judge them against", () => {
    for (const q of ["Does this increase revenue?", "Does it distract from the current bottleneck?"]) expect(html).toContain(q);
    expect(html).toContain("Your current bottleneck");
    expect(html).toContain("Getting people to find you");
    expect(html).toContain("Saving an idea does not start it");
  });

  it("groups ideas, shows how many are in progress, and gives each one a verdict", () => {
    expect(html).toContain("Doing now");
    expect(html).toContain("(1 of 2)");
    expect(html).toContain("Sell to dentists");
    expect(html).toContain("Not now. It pulls you off the current bottleneck.");
    expect(html).toContain("Start this one");
    expect(html).toContain("Mark done");
  });
});
