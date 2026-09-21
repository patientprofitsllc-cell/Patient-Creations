import { beforeEach, describe, expect, it, vi } from "vitest";

// One customer must never see or change another's records. These are the routes a signed-in customer (or a buyer with their
// confirmation link) can reach, tried with the wrong person, the wrong key, and no one at all.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  session: null as Row | null,
  projects: [] as Row[],
  revisions: [] as Row[],
  reviews: [] as Row[],
  orders: [] as Row[],
  intakes: [] as Row[],
  allowed: true,
}));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: h.allowed }) }));
vi.mock("@/lib/analytics/events", () => ({ logEvent: async () => {} }));
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findUnique: async ({ where }: Row) => {
        const p = h.projects.find((x) => x.id === where.id);
        return p ? { ...p, revisions: h.revisions.filter((r) => r.projectId === p.id) } : null;
      },
    },
    revision: { create: async ({ data }: Row) => { const r = { id: `r${h.revisions.length + 1}`, ...data }; h.revisions.push(r); return r; } },
    review: {
      upsert: async ({ where, update, create }: Row) => {
        const i = h.reviews.findIndex((r) => r.projectId === where.projectId);
        if (i >= 0) return Object.assign(h.reviews[i], update);
        const r = { id: `v${h.reviews.length + 1}`, ...create };
        h.reviews.push(r);
        return r;
      },
    },
    order: { findUnique: async ({ where }: Row) => h.orders.find((o) => o.id === where.id) ?? null },
    nfcIntake: {
      findUnique: async ({ where }: Row) => h.intakes.find((i) => i.orderId === where.orderId) ?? null,
      upsert: async ({ where, create, update }: Row) => {
        const i = h.intakes.findIndex((x) => x.orderId === where.orderId);
        if (i >= 0) return Object.assign(h.intakes[i], update);
        h.intakes.push(create);
        return create;
      },
    },
    inventoryItem: { findUnique: async () => null, update: async () => ({}) },
  },
}));

import { NextRequest } from "next/server";
import { POST as revise } from "@/app/api/portal/revisions/route";
import { POST as review } from "@/app/api/portal/reviews/route";
import { POST as nfc } from "@/app/api/checkout/nfc-intake/route";
import { ORDER_KEY_SHAPE, newOrderAccessKey, orderAccessOk, successPath } from "@/lib/orders/accessKey";

const post = (url: string, body: unknown) => new NextRequest(`http://localhost${url}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
const asUser = (id: string) => (h.session = { user: { id, role: "CUSTOMER", email: `${id}@x.example` } });

beforeEach(() => {
  h.session = null;
  h.allowed = true;
  h.projects = [
    { id: "pA", state: "DELIVERED", customerId: "cA", customer: { userId: "uA" }, order: { items: [{ product: { revisionLimit: 2 } }] } },
    { id: "pB", state: "DELIVERED", customerId: "cB", customer: { userId: "uB" }, order: { items: [{ product: { revisionLimit: 2 } }] } },
    { id: "pC", state: "BUILD", customerId: "cA", customer: { userId: "uA" }, order: { items: [{ product: { revisionLimit: 2 } }] } },
  ];
  h.revisions = [];
  h.reviews = [];
  h.orders = [];
  h.intakes = [];
});

describe("asking for a change to a project", () => {
  const ask = (projectId: string, notes = "Make the header blue") => revise(post("/api/portal/revisions", { projectId, notes }));

  it("needs someone signed in, and answers 401 rather than a server error", async () => {
    const r = await ask("pA");
    expect(r.status).toBe(401);
    expect(h.revisions).toHaveLength(0);
  });

  it("works for the project's own customer", async () => {
    asUser("uA");
    expect((await ask("pA")).status).toBe(200);
    expect(h.revisions).toHaveLength(1);
    expect(h.revisions[0]).toMatchObject({ projectId: "pA", status: "REQUESTED" });
  });

  it("answers exactly the same for another customer's project as for one that does not exist", async () => {
    asUser("uA");
    const theirs = await ask("pB");
    const nothing = await ask("does-not-exist");
    expect(theirs.status).toBe(404);
    expect(nothing.status).toBe(404);
    expect(await theirs.json()).toEqual(await nothing.json());
    expect(h.revisions).toHaveLength(0);
  });

  it("refuses an empty or huge request and a bad body, and enforces the product's limit", async () => {
    asUser("uA");
    expect((await ask("pA", "   ")).status).toBe(400);
    expect((await ask("pA", "x".repeat(2001))).status).toBe(400);
    expect((await revise(post("/api/portal/revisions", "not json"))).status).toBe(400);
    expect((await ask("pA", "one")).status).toBe(200);
    expect((await ask("pA", "two")).status).toBe(200);
    expect((await ask("pA", "three")).status).toBe(400);
  });
});

describe("leaving a review", () => {
  const rate = (projectId: string, over: Row = {}) => review(post("/api/portal/reviews", { projectId, rating: 5, text: "Great", ...over }));

  it("needs someone signed in", async () => {
    expect((await rate("pA")).status).toBe(401);
    expect(h.reviews).toHaveLength(0);
  });

  it("saves a review for the customer's own delivered project", async () => {
    asUser("uA");
    expect((await rate("pA")).status).toBe(200);
    expect(h.reviews[0]).toMatchObject({ projectId: "pA", customerId: "cA", rating: 5 });
  });

  it("will not review or overwrite another customer's project, and answers the same as for a missing one", async () => {
    asUser("uA");
    const theirs = await rate("pB");
    const nothing = await rate("does-not-exist");
    expect([theirs.status, nothing.status]).toEqual([404, 404]);
    expect(await theirs.json()).toEqual(await nothing.json());
    h.reviews.push({ id: "v0", projectId: "pB", customerId: "cB", rating: 4, text: "Theirs" });
    await rate("pB", { text: "Overwritten" });
    expect(h.reviews.find((r) => r.projectId === "pB")!.text).toBe("Theirs");
  });

  it("waits until the project is delivered", async () => {
    asUser("uA");
    expect((await rate("pC")).status).toBe(409);
    expect(h.reviews).toHaveLength(0);
  });

  it("refuses a rating outside 1 to 5 or a fraction, and words that are too long", async () => {
    asUser("uA");
    for (const bad of [{ rating: 0 }, { rating: 6 }, { rating: 4.5 }, { text: "x".repeat(2001) }, { testimonial: "x".repeat(1001) }]) expect((await rate("pA", bad)).status).toBe(400);
    expect(h.reviews).toHaveLength(0);
  });

  it("cannot move a review to another project by sending a different id in the body's other fields", async () => {
    asUser("uA");
    await rate("pA");
    await review(post("/api/portal/reviews", { projectId: "pA", rating: 3, customerId: "cB", id: "hijack" }));
    expect(h.reviews).toHaveLength(1);
    expect(h.reviews[0]).toMatchObject({ projectId: "pA", customerId: "cA", rating: 3 });
  });
});

describe("the order confirmation key", () => {
  it("is long, random, and in the shape the server accepts", () => {
    const keys = new Set(Array.from({ length: 200 }, () => newOrderAccessKey()));
    expect(keys.size).toBe(200);
    for (const k of keys) {
      expect(k.length).toBeGreaterThanOrEqual(24);
      expect(ORDER_KEY_SHAPE.test(k)).toBe(true);
    }
  });

  it("opens an order only when the stored key matches exactly", () => {
    const k = newOrderAccessKey();
    expect(orderAccessOk(k, k)).toBe(true);
    expect(orderAccessOk(k, k + "x")).toBe(false);
    expect(orderAccessOk(k, k.slice(0, -1))).toBe(false);
    expect(orderAccessOk(k, newOrderAccessKey())).toBe(false);
    expect(orderAccessOk(null, k)).toBe(false);
    expect(orderAccessOk(undefined, k)).toBe(false);
    expect(orderAccessOk(k, undefined)).toBe(false);
    expect(orderAccessOk(k, "")).toBe(false);
    expect(orderAccessOk(k, 12345)).toBe(false);
    expect(orderAccessOk("", "")).toBe(false);
  });

  it("puts the key in the confirmation link", () => {
    expect(successPath("ord1", "KEY")).toBe("/checkout/success?order=ord1&k=KEY");
    expect(successPath("ord1", null)).toBe("/checkout/success?order=ord1");
  });
});

describe("saving card details from the confirmation page", () => {
  const KEY = "abcdefghijklmnopqrstuvwx";
  const body = (over: Row = {}) => ({ orderId: "o1", k: KEY, nfcContent: "Google review page", targetLink: "https://g.page/r/x", phone: "7625550100", email: "sam@firm.example", ...over });
  const seed = (over: Row = {}) => h.orders.push({ id: "o1", status: "PAID", accessToken: KEY, items: [{ quantity: 1, product: { slug: "nfc-instagram", category: "Merch" } }], ...over });

  it("saves for the buyer who has the link, and gives nothing back but a yes", async () => {
    seed();
    const r = await nfc(post("/api/checkout/nfc-intake", body()));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
    expect(h.intakes).toHaveLength(1);
  });

  it("refuses an order id without the key, or with the wrong key, and says the same as for an order that does not exist", async () => {
    seed();
    const noKey = await nfc(post("/api/checkout/nfc-intake", { ...body(), k: undefined }));
    const wrong = await nfc(post("/api/checkout/nfc-intake", body({ k: "zzzzzzzzzzzzzzzzzzzzzzzz" })));
    const missing = await nfc(post("/api/checkout/nfc-intake", body({ orderId: "nope" })));
    expect(noKey.status).toBe(400);
    expect([wrong.status, missing.status]).toEqual([404, 404]);
    expect(await wrong.json()).toEqual(await missing.json());
    expect(h.intakes).toHaveLength(0);
  });

  it("cannot overwrite another buyer's card details, even knowing their order id", async () => {
    seed();
    h.orders.push({ id: "o2", status: "PAID", accessToken: "OTHERKEYOTHERKEYOTHERKEY", items: [{ quantity: 1, product: { slug: "nfc-instagram", category: "Merch" } }] });
    h.intakes.push({ orderId: "o2", nfcContent: "Their real content", targetLink: "https://theirs.example", phone: "1", email: "b@b.example" });
    const r = await nfc(post("/api/checkout/nfc-intake", body({ orderId: "o2", nfcContent: "Attacker" })));
    expect(r.status).toBe(404);
    expect(h.intakes.find((i) => i.orderId === "o2")!.nfcContent).toBe("Their real content");
  });

  it("refuses an order that was refunded or cancelled, and an order with no key on file (made before keys existed)", async () => {
    seed({ status: "REFUNDED" });
    expect((await nfc(post("/api/checkout/nfc-intake", body()))).status).toBe(409);
    h.orders.length = 0;
    seed({ accessToken: null });
    expect((await nfc(post("/api/checkout/nfc-intake", body()))).status).toBe(404);
  });

  it("slows down someone who tries again and again, and handles a broken body", async () => {
    seed();
    expect((await nfc(post("/api/checkout/nfc-intake", "not json"))).status).toBe(400);
    h.allowed = false;
    expect((await nfc(post("/api/checkout/nfc-intake", body()))).status).toBe(429);
  });
});
