import { beforeEach, describe, expect, it, vi } from "vitest";

// The partner program's doors: the public application, a partner's lead form, the referral link, and the owner's controls.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  session: null as Row | null,
  allowed: true,
  applied: [] as Row[],
  accepted: [] as Row[],
  partnerClicks: [] as string[],
  customerClicks: [] as string[],
  leads: [] as Row[],
  admin: [] as Row[],
}));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: h.allowed }) }));
vi.mock("@/lib/legal/acceptance", () => ({ recordAcceptance: async (a: Row) => void h.accepted.push({ scope: a.scope, refId: a.refId }) }));
vi.mock("@/lib/referrals/codes", () => ({ recordReferralClick: async (code: string) => void h.customerClicks.push(code) }));
vi.mock("@/lib/partners/service", () => ({
  applyToProgram: async (c: Row) => {
    h.applied.push(c);
    return { created: true, id: "par1" };
  },
  recordPartnerClick: async (code: string) => void h.partnerClicks.push(code),
  submitPartnerLead: async (token: string, input: Row) => {
    h.leads.push({ token, ...input });
    return input.businessName === "Known Co" ? { ok: true, alreadyKnown: true } : input.businessName === "Bad Co" ? { ok: false, error: "Your partner account is not active." } : { ok: true, alreadyKnown: false };
  },
  approvePartner: async (id: string, percent?: number) => (h.admin.push({ a: "approve", id, percent }), { ok: true }),
  declinePartner: async (id: string) => (h.admin.push({ a: "decline", id }), { ok: true }),
  pausePartner: async (id: string) => (h.admin.push({ a: "pause", id }), { ok: true }),
  setPartnerPercent: async (id: string, percent: number) => (h.admin.push({ a: "percent", id, percent }), { ok: true }),
  payApprovedForPartner: async (id: string, ref: string) => (h.admin.push({ a: "pay", id, ref }), { ok: true, amountCents: 15_000, count: 2 }),
}));

import { NextRequest } from "next/server";
import { POST as apply } from "@/app/api/partners/apply/route";
import { POST as lead } from "@/app/api/partners/lead/route";
import { POST as adminAct } from "@/app/api/admin/partners/[id]/route";
import { POST as adminPay } from "@/app/api/admin/partners/[id]/pay/route";
import { GET as click } from "@/app/api/referrals/click/route";

const json = (url: string, body: unknown) => new NextRequest(`http://localhost${url}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
const good = { name: "Pat Agent", email: "pat@agency.example", company: "Agent Co", type: "web-designer", website: "", about: "I build websites for local restaurants and would recommend you.", agree: true, fax: "" };
const TOKEN = "a".repeat(48);
const asAdmin = () => (h.session = { user: { id: "u", role: "ADMIN" } });
const asCustomer = () => (h.session = { user: { id: "u", role: "CUSTOMER" } });

beforeEach(() => {
  h.session = null;
  h.allowed = true;
  for (const k of ["applied", "accepted", "partnerClicks", "customerClicks", "leads", "admin"] as const) h[k].length = 0;
});

describe("the public application", () => {
  it("accepts a good one, records the agreement, and creates the application", async () => {
    const res = await apply(json("/api/partners/apply", good));
    expect(res.status).toBe(200);
    expect(h.applied[0]).toMatchObject({ email: "pat@agency.example", type: "web-designer" });
    expect(h.accepted).toEqual([{ scope: "PARTNER", refId: "par1" }]);
  });

  it("refuses a bad one with a helpful message, and creates nothing", async () => {
    for (const bad of [{ ...good, email: "nope" }, { ...good, agree: false }, { ...good, type: "wizard" }, { ...good, about: "short" }, {}]) {
      const res = await apply(json("/api/partners/apply", bad));
      expect(res.status).toBe(400);
      expect(typeof (await res.json()).error).toBe("string");
    }
    expect((await apply(json("/api/partners/apply", "not json"))).status).toBe(400);
    expect(h.applied).toHaveLength(0);
  });

  it("answers a bot that fills the hidden field as if it worked, and creates nothing", async () => {
    const res = await apply(json("/api/partners/apply", { ...good, fax: "555-1212" }));
    expect(res.status).toBe(200);
    expect(h.applied).toHaveLength(0);
  });

  it("slows down someone who applies over and over", async () => {
    h.allowed = false;
    expect((await apply(json("/api/partners/apply", good))).status).toBe(429);
    expect(h.applied).toHaveLength(0);
  });
});

describe("a partner's lead form", () => {
  const body = { token: TOKEN, businessName: "Joe's Cuts", email: "joe@joescuts.example", permission: true };

  it("passes a good lead on with the partner's token", async () => {
    const res = await lead(json("/api/partners/lead", body));
    expect(res.status).toBe(200);
    expect(h.leads[0]).toMatchObject({ token: TOKEN, businessName: "Joe's Cuts" });
  });

  it("says the same thing whether or not we already knew the business", async () => {
    const known = await (await lead(json("/api/partners/lead", { ...body, businessName: "Known Co" }))).json();
    const fresh = await (await lead(json("/api/partners/lead", body))).json();
    expect(known).toEqual(fresh);
  });

  it("refuses a link that is not a real token shape, a missing permission, and an inactive partner", async () => {
    expect((await lead(json("/api/partners/lead", { ...body, token: "short" }))).status).toBe(400);
    expect((await lead(json("/api/partners/lead", { ...body, permission: "yes" }))).status).toBe(400);
    expect((await lead(json("/api/partners/lead", { ...body, businessName: "Bad Co" }))).status).toBe(400);
    expect(h.leads.filter((l) => l.token !== TOKEN || l.businessName !== "Bad Co")).toHaveLength(0);
  });

  it("slows down a partner who submits too many", async () => {
    h.allowed = false;
    expect((await lead(json("/api/partners/lead", body))).status).toBe(429);
  });
});

describe("the referral link", () => {
  const get = (code: string) => click(new NextRequest(`http://localhost/api/referrals/click?code=${code}`, { headers: { "x-forwarded-for": "9.9.9.9", "user-agent": "UA" } }));

  it("counts a partner's code for the partner, and sends the visitor on with the code", async () => {
    const res = await get("PCK7M2QX");
    expect(h.partnerClicks).toEqual(["PCK7M2QX"]);
    expect(h.customerClicks).toEqual([]);
    expect(res.headers.get("location")).toContain("ref=PCK7M2QX");
  });

  it("counts a customer's code the way it always did", async () => {
    const res = await get("1A2B3C4D");
    expect(h.customerClicks).toEqual(["1A2B3C4D"]);
    expect(h.partnerClicks).toEqual([]);
    expect(res.headers.get("location")).toContain("ref=1A2B3C4D");
  });
});

describe("the owner's controls", () => {
  const act = (body: unknown) => adminAct(json("/api/admin/partners/par1", body), { params: { id: "par1" } });
  const pay = (body: unknown) => adminPay(json("/api/admin/partners/par1/pay", body), { params: { id: "par1" } });

  it("are closed to a visitor and to a customer", async () => {
    expect((await act({ action: "approve" })).status).toBe(401);
    expect((await pay({ ref: "Zelle" })).status).toBe(401);
    asCustomer();
    expect((await act({ action: "approve" })).status).toBe(403);
    expect((await pay({ ref: "Zelle" })).status).toBe(403);
    expect(h.admin).toHaveLength(0);
  });

  it("let the owner approve, decline, pause, and change a percent", async () => {
    asAdmin();
    expect((await act({ action: "approve", percent: 12 })).status).toBe(200);
    expect((await act({ action: "decline" })).status).toBe(200);
    expect((await act({ action: "pause" })).status).toBe(200);
    expect((await act({ action: "percent", percent: 15 })).status).toBe(200);
    expect(h.admin).toEqual([{ a: "approve", id: "par1", percent: 12 }, { a: "decline", id: "par1" }, { a: "pause", id: "par1" }, { a: "percent", id: "par1", percent: 15 }]);
  });

  it("refuse an unknown action", async () => {
    asAdmin();
    expect((await act({ action: "delete-everything" })).status).toBe(400);
    expect(h.admin).toHaveLength(0);
  });

  it("record a payout only with a note about how it was paid", async () => {
    asAdmin();
    expect((await pay({ ref: "   " })).status).toBe(400);
    const ok = await pay({ ref: "Zelle confirmation 123" });
    expect(ok.status).toBe(200);
    expect((await ok.json()).message).toMatch(/\$150 paid for 2 commissions/);
    expect(h.admin).toEqual([{ a: "pay", id: "par1", ref: "Zelle confirmation 123" }]);
  });
});
