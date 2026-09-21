import { beforeEach, describe, expect, it, vi } from "vitest";

// Patient AI's database side: it must only ever see the one customer it is asked about, and its model path must stay on a leash.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  customers: [] as Row[],
  notifications: [] as Row[],
  emails: [] as Row[],
  model: { calls: [] as Row[], reply: "" as string | Error },
}));

vi.mock("@/lib/db", () => ({
  db: {
    customer: {
      findUnique: async ({ where }: Row) => {
        const c = h.customers.find((x) => x.id === where.id);
        if (!c) return null;
        // the loader asks only for OPEN invoices
        return { ...c, orders: c.orders.map((o: Row) => ({ ...o, invoices: o.invoices.filter((i: Row) => i.status === "OPEN") })) };
      },
    },
    careSubscription: { count: async ({ where }: Row) => h.customers.find((c) => c.id === where.customerId)?.care ?? 0 },
    adSubscription: { findMany: async ({ where }: Row) => h.customers.find((c) => c.id === where.customerId)?.ads ?? [] },
    referral: { findUnique: async ({ where }: Row) => (h.customers.find((c) => c.id === where.customerId)?.referred != null ? { id: "ref-" + where.customerId } : null) },
    commission: { count: async ({ where }: Row) => h.customers.find((c) => "ref-" + c.id === where.referralId)?.referred ?? 0 },
    projectUpdate: { findFirst: async ({ where }: Row) => h.customers.flatMap((c) => c.projects).find((p: Row) => p.id === where.projectId)?.update ?? null },
    notification: { create: async ({ data }: Row) => void h.notifications.push(data) },
  },
}));
vi.mock("@/lib/workflows/progress", () => ({
  getProjectProgress: async (id: string) => ({ currentPhaseLabel: id.startsWith("pA") ? "Build" : "Research", percent: id.startsWith("pA") ? 55 : 10, isException: false }),
}));
vi.mock("@/lib/projects/statusToken", () => ({ statusUrlFor: (t: string) => `https://site.test/status/${t}` }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void h.emails.push({ to, template, payload }) }));
vi.mock("@/lib/ai/callModel", () => ({
  aiEnabled: () => process.env.AI_ENABLED === "true",
  callModel: async (args: Row) => {
    h.model.calls.push(args);
    if (h.model.reply instanceof Error) throw h.model.reply;
    return { text: h.model.reply, mocked: false, model: "test" };
  },
}));

import { askPatientAi, escalateToOwner, loadPortalFacts } from "@/lib/agents/patientAi";
import { patientAiReply } from "@/lib/agents/patientAiLogic";

const product = (name: string, slug: string, description: string) => ({ name, slug, description, revisionLimit: 2, turnaround: "2-3 weeks" });
const customer = (tag: "A" | "B") => ({
  id: `c${tag}`,
  user: { name: tag === "A" ? "Alpha Owner" : "Bravo Owner" },
  projects: [{ id: `p${tag}1`, orderId: `o${tag}1`, name: `${tag === "A" ? "ALPHA" : "BRAVO"}-SECRET project`, state: "BUILD", statusToken: `tok${tag}`, update: { message: `${tag === "A" ? "ALPHA" : "BRAVO"}-SECRET note` } }],
  orders: [
    {
      id: `o${tag}1`,
      status: "PAID",
      totalCents: tag === "A" ? 123_400 : 987_600,
      balanceDueCents: tag === "A" ? 0 : 400_000,
      createdAt: new Date(),
      items: [{ productId: "x", quantity: 1, product: product(`${tag === "A" ? "ALPHA" : "BRAVO"}-SECRET product`, "starter-website", "desc") }],
      invoices: [{ id: `i${tag}`, seq: tag === "A" ? 1 : 2, status: "OPEN", token: `invtok${tag}`, description: `${tag === "A" ? "ALPHA" : "BRAVO"}-SECRET invoice`, amountCents: 400_000 }],
    },
  ],
  care: tag === "A" ? 1 : 0,
  ads: [],
  referred: tag === "A" ? 3 : 0,
});

beforeEach(() => {
  h.customers.length = 0;
  h.customers.push(customer("A"), customer("B"));
  h.notifications.length = 0;
  h.emails.length = 0;
  h.model.calls.length = 0;
  h.model.reply = "";
  delete process.env.AI_ENABLED;
  delete process.env.ANTHROPIC_API_KEY;
});

describe("loading a customer's facts", () => {
  it("returns that customer's own projects, orders, invoices, and plans", async () => {
    const f = (await loadPortalFacts("cA"))!;
    expect(f.firstName).toBe("Alpha");
    expect(f.projects[0]).toMatchObject({ name: "ALPHA-SECRET project", percent: 55, phaseLabel: "Build", latestUpdate: "ALPHA-SECRET note", statusUrl: "https://site.test/status/tokA" });
    expect(f.orders[0].totalCents).toBe(123_400);
    expect(f.openInvoices[0]).toMatchObject({ number: "PC-1001", description: "ALPHA-SECRET invoice", amountCents: 400_000 });
    expect(f.openInvoices[0].url).toContain("invtokA");
    expect(f.plans).toEqual(["Website Care"]);
    expect(f.paidReferrals).toBe(3);
  });

  it("never contains anything that belongs to another customer, in either direction", async () => {
    const a = JSON.stringify(await loadPortalFacts("cA"));
    const b = JSON.stringify(await loadPortalFacts("cB"));
    expect(a).not.toMatch(/BRAVO|Bravo|987600|invtokB|tokB/);
    expect(b).not.toMatch(/ALPHA|Alpha|123400|invtokA|tokA/);
  });

  it("has nothing for an id that is not a customer", async () => {
    expect(await loadPortalFacts("nobody")).toBeNull();
  });

  it("suggests only what fits what this customer owns", async () => {
    const f = (await loadPortalFacts("cA"))!;
    // owns a starter website and the care plan: care must not be offered again
    expect(f.offers.map((o) => o.title).join(" ")).not.toMatch(/Care/i);
  });

  it("answers the two customers differently, each from their own records", async () => {
    const a = patientAiReply("what do I owe?", (await loadPortalFacts("cA"))!);
    const b = patientAiReply("where is my project?", (await loadPortalFacts("cB"))!);
    expect(a.reply).toContain("ALPHA-SECRET invoice");
    expect(a.reply).not.toContain("BRAVO");
    expect(b.reply).toContain("BRAVO-SECRET project");
    expect(b.reply).not.toContain("ALPHA");
  });
});

describe("the optional model", () => {
  const enable = () => {
    process.env.AI_ENABLED = "true";
    process.env.ANTHROPIC_API_KEY = "test-key-not-real";
  };

  it("is not called when AI is off", async () => {
    const f = (await loadPortalFacts("cA"))!;
    const r = await askPatientAi(f, "how do I get more customers?");
    expect(h.model.calls).toHaveLength(0);
    expect(r.intent).toBe("customers");
  });

  it("is never asked about money, contact, invoices, or files, even when on", async () => {
    enable();
    const f = (await loadPortalFacts("cA"))!;
    for (const q of ["I want a refund", "can I talk to someone", "what do I owe?", "how do I send my logo?", "can you rush it", "change the colors"]) {
      h.model.reply = JSON.stringify({ reply: "I will refund you everything.", escalate: false });
      const r = await askPatientAi(f, q);
      expect(r.reply, q).not.toMatch(/refund you everything/);
    }
    expect(h.model.calls).toHaveLength(0);
  });

  it("uses a safe model reply, with only this customer's facts in the prompt", async () => {
    enable();
    h.model.reply = JSON.stringify({ reply: "Focus on one clear call to action on your homepage.", escalate: false });
    const f = (await loadPortalFacts("cA"))!;
    const r = await askPatientAi(f, "how do I get more customers?");
    expect(r.reply).toBe("Focus on one clear call to action on your homepage.");
    expect(h.model.calls).toHaveLength(1);
    expect(h.model.calls[0].prompt).toContain("ALPHA-SECRET");
    expect(h.model.calls[0].prompt).not.toMatch(/BRAVO/);
  });

  it("throws away a model reply that promises results or invents a price, and falls back to the rules", async () => {
    enable();
    const f = (await loadPortalFacts("cA"))!;
    for (const bad of ["This is guaranteed to double your sales.", "Get it for $3 today.", "Pay at https://evil.example/x"]) {
      h.model.reply = JSON.stringify({ reply: bad, escalate: false });
      const r = await askPatientAi(f, "how do I get more customers?");
      expect(r.reply, bad).toMatch(/cannot see your website traffic/);
    }
  });

  it("falls back when the model fails or returns junk", async () => {
    enable();
    const f = (await loadPortalFacts("cA"))!;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    h.model.reply = new Error("upstream down");
    expect((await askPatientAi(f, "how do I get more customers?")).intent).toBe("customers");
    h.model.reply = "not json at all";
    expect((await askPatientAi(f, "how do I get more customers?")).reply).toMatch(/cannot see your website traffic/);
    spy.mockRestore();
  });

  it("lets a model ask for a person but never cancel one the rules already asked for", async () => {
    enable();
    const f = (await loadPortalFacts("cA"))!;
    h.model.reply = JSON.stringify({ reply: "I am not sure about that one.", escalate: true });
    expect((await askPatientAi(f, "how do I get more customers?")).escalate).toBe(true);
  });
});

describe("handing a question to Trenton", () => {
  it("leaves a note in the admin dashboard and sends an email, trimmed", async () => {
    await escalateToOwner({ customerEmail: "sam@firm.example", customerName: "Sam", question: "x".repeat(900), intent: "unsure" });
    expect(h.notifications[0]).toMatchObject({ audience: "admin" });
    expect(h.notifications[0].body.length).toBeLessThan(260);
    expect(h.emails[0].payload.subject).toContain("Sam");
    expect(h.emails[0].payload.body.length).toBeLessThan(700);
  });

  it("never throws, even if both fail", async () => {
    h.notifications.push = (() => {
      throw new Error("db down");
    }) as never;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(escalateToOwner({ customerEmail: "a@b.example", customerName: "", question: "hi", intent: "unsure" })).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
