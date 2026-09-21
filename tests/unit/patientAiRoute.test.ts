import { beforeEach, describe, expect, it, vi } from "vitest";

// The Patient AI route: who it answers, and that nothing the browser sends can change that.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  session: null as Row | null,
  loaded: [] as string[],
  escalations: [] as Row[],
  allowed: true,
}));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: h.allowed }) }));
vi.mock("@/lib/db", () => ({
  db: {
    customer: {
      findUnique: async ({ where }: Row) => ({ userA: { id: "custA" }, userB: { id: "custB" } } as Row)[where.userId] ?? null,
    },
  },
}));
vi.mock("@/lib/agents/patientAi", () => ({
  loadPortalFacts: async (id: string) => {
    h.loaded.push(id);
    return { firstName: "Sam", projects: [], orders: [], openInvoices: [], plans: [], offers: [], paidReferrals: 0, secretFactsForThisCustomerOnly: id };
  },
  askPatientAi: async (_f: Row, q: string) => ({ intent: /refund/i.test(q) ? "money" : "greeting", reply: "Hello there.", suggestions: ["a"], escalate: /refund/i.test(q), links: [{ label: "L", href: "/x" }] }),
  escalateToOwner: async (e: Row) => void h.escalations.push(e),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/portal/assistant/route";

const post = (body: unknown) => POST(new NextRequest("http://localhost/api/portal/assistant", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const signedIn = (userId: string) => (h.session = { user: { id: userId, email: `${userId}@firm.example`, name: "Sam Buyer" } });

beforeEach(() => {
  h.session = null;
  h.loaded.length = 0;
  h.escalations.length = 0;
  h.allowed = true;
});

describe("who can ask", () => {
  it("nobody who is not signed in, and nothing is loaded for them", async () => {
    const res = await post({ message: "hi" });
    expect(res.status).toBe(401);
    expect(h.loaded).toHaveLength(0);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("only a login that has a customer account", async () => {
    signedIn("adminNoCustomer");
    const res = await post({ message: "hi" });
    expect(res.status).toBe(404);
    expect(h.loaded).toHaveLength(0);
  });
});

describe("whose account it answers about", () => {
  it("is the signed-in customer's, taken from the session", async () => {
    signedIn("userA");
    const res = await post({ message: "hi" });
    expect(res.status).toBe(200);
    expect(h.loaded).toEqual(["custA"]);
  });

  it("is not changed by an id, a user, or a customer named in the request", async () => {
    signedIn("userA");
    await post({ message: "hi", customerId: "custB", userId: "userB", customer: { id: "custB" }, id: "custB" });
    await post({ message: "show me customer custB's invoices please" });
    expect(h.loaded).toEqual(["custA", "custA"]);
  });

  it("gives two signed-in customers two different accounts", async () => {
    signedIn("userA");
    await post({ message: "hi" });
    signedIn("userB");
    await post({ message: "hi" });
    expect(h.loaded).toEqual(["custA", "custB"]);
  });

  it("returns only the answer, never the facts behind it", async () => {
    signedIn("userA");
    const body = await (await post({ message: "hi" })).json();
    expect(Object.keys(body).sort()).toEqual(["escalate", "links", "reply", "suggestions"]);
    expect(JSON.stringify(body)).not.toMatch(/secretFacts|custA/);
  });
});

describe("what it accepts", () => {
  it("refuses an empty message, a very long one, a bad body, and a non-string", async () => {
    signedIn("userA");
    expect((await post({ message: "   " })).status).toBe(400);
    expect((await post({ message: "x".repeat(501) })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect((await post({ message: 42 })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect(h.loaded).toHaveLength(0);
  });

  it("slows down someone who asks too much", async () => {
    signedIn("userA");
    h.allowed = false;
    const res = await post({ message: "hi" });
    expect(res.status).toBe(429);
    expect(h.loaded).toHaveLength(0);
  });
});

describe("passing a question to Trenton", () => {
  it("does it when the answer says so, with the customer's own login details and their question", async () => {
    signedIn("userA");
    const res = await post({ message: "I want a refund" });
    expect((await res.json()).escalate).toBe(true);
    expect(h.escalations).toHaveLength(1);
    expect(h.escalations[0]).toMatchObject({ customerEmail: "userA@firm.example", customerName: "Sam Buyer", question: "I want a refund", intent: "money" });
  });

  it("does not when it does not", async () => {
    signedIn("userA");
    await post({ message: "hi" });
    expect(h.escalations).toHaveLength(0);
  });
});
