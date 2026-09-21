import { beforeEach, describe, expect, it, vi } from "vitest";

// The private links. A link opens exactly one customer's record: not a neighbour's, not one that does not exist, not one built
// to look like something else. A malformed link and an unknown link answer identically, so nothing reveals which exist.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  projects: [] as Row[],
  intakes: [] as Row[],
  subs: [] as Row[],
  messages: [] as Row[],
  builds: [] as Row[],
  allowed: true,
  lookups: [] as string[],
}));

vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: h.allowed }) }));
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findUnique: async ({ where }: Row) => {
        h.lookups.push(JSON.stringify(where));
        const p = h.projects.find((x) => (where.statusToken !== undefined ? x.statusToken === where.statusToken : x.id === where.id));
        return p ? { ...p, careSubscriptions: [] } : null;
      },
      findFirst: async ({ where }: Row) => {
        h.lookups.push(JSON.stringify(where));
        const p = h.projects.find((x) => x.previewToken === where.previewToken);
        return p ? { ...p, customer: { user: { email: "x@x.example" } }, order: { websiteIntake: null, items: [] } } : null;
      },
    },
    websiteIntake: { findUnique: async ({ where }: Row) => h.intakes.find((i) => i.token === where.token) ?? null },
    adSubscription: { findUnique: async ({ where }: Row) => h.subs.find((s) => s.manageToken === where.manageToken) ?? null },
    websiteBuild: { findFirst: async ({ where }: Row) => h.builds.find((b) => b.projectId === where.projectId) ?? null },
    revision: { findMany: async () => [] },
    projectMessage: {
      findMany: async ({ where }: Row) => h.messages.filter((m) => m.projectId === where.projectId),
      count: async () => 0,
      create: async ({ data }: Row) => { const m = { id: `m${h.messages.length + 1}`, createdAt: new Date(), ...data }; h.messages.push(m); return m; },
      update: async () => ({}),
    },
    notification: { create: async () => ({}) },
  },
}));
vi.mock("@/lib/agents/concierge", () => ({ CONCIERGE_NAME: "Concierge Agent", replyToCustomer: async () => ({ reply: "Thanks.", escalate: false }) }));

import { NextRequest } from "next/server";
import { guardAds } from "@/lib/ads/access";
import { guardIntake } from "@/lib/intake/access";
import { guardCare } from "@/lib/care/access";
import { guardPreview } from "@/lib/site/build/preview";
import { GET as readMessages, POST as sendMessage } from "@/app/api/status/[token]/messages/route";

const A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const B = "bbbbbbbbbbbbbbbbbbbbbbbb";
const req = (body?: unknown) => new NextRequest("http://localhost/x", { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

const BAD_LINKS = ["", "short", "a".repeat(15), "a".repeat(41), "../../etc/passwd", "aaaaaaaaaaaaaaaa'; DROP TABLE Project;--", "aaaaaaaaaaaaaaaa%00aaaa", "aaaaaaaaaaaaaaaa aaaaaaaa", "AAAAAAAAAAAAAAAA\naaaaaaaa", "{}", "[object Object]", "undefined", "null"];

beforeEach(() => {
  h.projects = [
    { id: "pA", statusToken: A, previewToken: A, name: "Alpha project", customerId: "cA" },
    { id: "pB", statusToken: B, previewToken: B, name: "Bravo project", customerId: "cB" },
  ];
  h.intakes = [{ token: A, orderId: "oA", businessName: "Alpha Co" }, { token: B, orderId: "oB", businessName: "Bravo Co" }];
  h.subs = [{ manageToken: A, businessName: "Alpha Co", customer: { user: { email: "a@x.example" } } }, { manageToken: B, businessName: "Bravo Co", customer: { user: { email: "b@x.example" } } }];
  h.messages = [{ id: "m1", projectId: "pA", sender: "CUSTOMER", authorName: "You", body: "Alpha secret note", createdAt: new Date() }, { id: "m2", projectId: "pB", sender: "CUSTOMER", authorName: "You", body: "Bravo secret note", createdAt: new Date() }];
  h.builds = [{ projectId: "pA", version: 1, status: "PREVIEW" }, { projectId: "pB", version: 1, status: "PREVIEW" }];
  h.allowed = true;
  h.lookups = [];
});

describe("each private link opens one customer's record", () => {
  it("plan link: gives back that plan and only that plan", async () => {
    const a = await guardAds(req(), A, "brief", 20);
    const b = await guardAds(req(), B, "brief", 20);
    expect((a as Row).sub?.businessName).toBe("Alpha Co");
    expect((b as Row).sub?.businessName).toBe("Bravo Co");
  });

  it("intake link: gives back that intake and only that intake", async () => {
    const a = await guardIntake(req(), A, 20);
    const b = await guardIntake(req(), B, 20);
    expect((a as Row).intake?.businessName).toBe("Alpha Co");
    expect((b as Row).intake?.businessName).toBe("Bravo Co");
  });

  it("care link: the token in the body finds that project and only that project", async () => {
    const a = await guardCare(req({ token: A }), "checkout", 5);
    const b = await guardCare(req({ token: B }), "checkout", 5);
    expect((a as Row).project?.name).toBe("Alpha project");
    expect((b as Row).project?.name).toBe("Bravo project");
  });

  it("preview link: gives back that project and only that project", async () => {
    const a = await guardPreview(new NextRequest("http://localhost/x"), A, 10, "approve");
    const b = await guardPreview(new NextRequest("http://localhost/x"), B, 10, "approve");
    expect((a as Row).preview?.project.name).toBe("Alpha project");
    expect((b as Row).preview?.project.name).toBe("Bravo project");
  });
});

describe("a bad or unknown link", () => {
  const status = async (p: Promise<Record<string, any>>) => {
    const r = await p;
    return "response" in r ? { status: r.response.status, body: await r.response.json() } : { status: 200, body: null };
  };
  const guards: [string, (t: string) => Promise<Record<string, any>>][] = [
    ["plan", (t) => guardAds(req(), t, "brief", 20)],
    ["intake", (t) => guardIntake(req(), t, 20)],
    ["care", (t) => guardCare(req({ token: t }), "checkout", 5)],
    ["preview", (t) => guardPreview(new NextRequest("http://localhost/x"), t, 10, "approve")],
  ];

  it("gets a plain 404 from every kind of link, whatever it looks like", async () => {
    for (const [name, guard] of guards) for (const bad of [...BAD_LINKS, "c".repeat(24)]) expect((await status(guard(bad))).status, `${name}: ${JSON.stringify(bad)}`).toBe(404);
  });

  it("gets exactly the same answer whether the link is malformed or well formed but unknown", async () => {
    for (const [name, guard] of guards) {
      const malformed = await status(guard("short"));
      const unknown = await status(guard("c".repeat(24)));
      expect(malformed, name).toEqual(unknown);
      expect(malformed.body).toEqual({ error: "Not found" });
    }
  });

  it("is never looked up in the database when it is not the right shape", async () => {
    for (const [, guard] of guards) await guard("../../etc/passwd");
    expect(h.lookups).toHaveLength(0);
  });

  it("is refused after too many tries, before any lookup", async () => {
    h.allowed = false;
    for (const [name, guard] of guards) expect((await status(guard(A))).status, name).toBe(429);
    expect(h.lookups).toHaveLength(0);
  });
});

describe("the project message thread", () => {
  const read = (token: string) => readMessages(new NextRequest("http://localhost/x"), { params: { token } });
  const send = (token: string, message: string) => sendMessage(new NextRequest("http://localhost/x", { method: "POST", body: JSON.stringify({ message }) }), { params: { token } });

  it("shows a customer their own messages and never a neighbour's", async () => {
    const a = JSON.stringify(await (await read(A)).json());
    const b = JSON.stringify(await (await read(B)).json());
    expect(a).toContain("Alpha secret note");
    expect(a).not.toContain("Bravo");
    expect(b).toContain("Bravo secret note");
    expect(b).not.toContain("Alpha");
  });

  it("adds a message only to the project the link belongs to", async () => {
    const r = await send(A, "Hello from Alpha");
    expect(r.status).toBe(200);
    expect(h.messages.filter((m) => m.body === "Hello from Alpha").every((m) => m.projectId === "pA")).toBe(true);
    expect(h.messages.some((m) => m.projectId === "pB" && m.body.includes("Alpha"))).toBe(false);
  });

  it("answers a bad link with a plain 404 for both reading and writing", async () => {
    for (const bad of BAD_LINKS.filter(Boolean)) {
      expect((await read(bad)).status, bad).toBe(404);
      expect((await send(bad, "hi")).status, bad).toBe(404);
    }
    expect((await read("c".repeat(24))).status).toBe(404);
    expect(h.messages).toHaveLength(2);
  });

  it("does not put one customer's link in another's thread by any request body", async () => {
    await sendMessage(new NextRequest("http://localhost/x", { method: "POST", body: JSON.stringify({ message: "hi", projectId: "pB", token: B }) }), { params: { token: A } });
    expect(h.messages.filter((m) => m.projectId === "pB")).toHaveLength(1);
  });
});
