import { beforeEach, describe, expect, it, vi } from "vitest";

// The partner program's database side, against an in-memory stand-in: who earns, when it is approved, when it is paid, and
// that one partner can never see another's data.
type Row = Record<string, any>;
const S = vi.hoisted(() => ({
  partners: [] as Row[],
  clicks: [] as Row[],
  commissions: [] as Row[],
  prospects: [] as Row[],
  orders: [] as Row[],
  customers: [] as Row[],
  emails: [] as Row[],
  events: [] as Row[],
}));

vi.mock("@/lib/db", () => {
  const match = (row: Row, where: Row = {}): boolean =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === "object" && !(v instanceof Date)) {
        const o = v as Row;
        if ("in" in o) return o.in.includes(row[k]);
        if ("not" in o) return o.not === null ? row[k] !== null && row[k] !== undefined : row[k] !== o.not;
        if ("gte" in o) return row[k] >= o.gte;
      }
      return row[k] === v;
    });
  const find = (rows: Row[], where: Row) => rows.find((r) => match(r, where)) ?? null;
  const filter = (rows: Row[], where?: Row) => rows.filter((r) => match(r, where));
  let seq = 0;
  const id = (p: string) => `${p}${++seq}`;
  const orderWith = (o: Row | null) => o && { ...o, customer: S.customers.find((c) => c.id === o.customerId) };
  return {
    db: {
      partner: {
        findUnique: async ({ where }: Row) => find(S.partners, where),
        create: async ({ data }: Row) => {
          const p = { id: id("par"), code: null, status: "APPLIED", commissionPercent: 10, payoutNote: null, approvedAt: null, createdAt: new Date(), ...data };
          S.partners.push(p);
          return p;
        },
        updateMany: async ({ where, data }: Row) => {
          const rows = S.partners.filter((p) => match(p, where));
          rows.forEach((r) => Object.assign(r, data));
          return { count: rows.length };
        },
        findMany: async () => S.partners.map((p) => ({ ...p, commissions: S.commissions.filter((c) => c.partnerId === p.id), _count: { clicks: S.clicks.filter((c) => c.partnerId === p.id).length } })),
      },
      partnerClick: {
        create: async ({ data }: Row) => void S.clicks.push({ id: id("clk"), ...data }),
        count: async ({ where }: Row) => filter(S.clicks, where).length,
      },
      partnerCommission: {
        findUnique: async ({ where }: Row) => find(S.commissions, where),
        create: async ({ data }: Row) => {
          const c = { id: id("com"), createdAt: new Date(), approvedAt: null, paidAt: null, payoutRef: null, ...data };
          S.commissions.push(c);
          return c;
        },
        findMany: async ({ where }: Row = {}) => filter(S.commissions, where),
        updateMany: async ({ where, data }: Row) => {
          const rows = S.commissions.filter((c) => match(c, where));
          rows.forEach((r) => Object.assign(r, data));
          return { count: rows.length };
        },
      },
      prospect: {
        count: async ({ where }: Row) => filter(S.prospects, where).length,
        update: async ({ where, data }: Row) => Object.assign(find(S.prospects, where)!, data),
        findMany: async ({ where }: Row) => filter(S.prospects, where),
        findFirst: async ({ where }: Row) => find(S.prospects, where),
        groupBy: async () => {
          const by: Record<string, number> = {};
          S.prospects.filter((p) => p.partnerId).forEach((p) => (by[p.partnerId] = (by[p.partnerId] ?? 0) + 1));
          return Object.entries(by).map(([partnerId, n]) => ({ partnerId, _count: { _all: n } }));
        },
      },
      order: {
        findUnique: async ({ where }: Row) => orderWith(find(S.orders, where)),
        findMany: async ({ where }: Row) => filter(S.orders, where),
      },
      customer: { findMany: async ({ where }: Row) => filter(S.customers, where).map((c) => ({ ...c, orders: S.orders.filter((o) => o.customerId === c.id), projects: c.projects ?? [] })) },
    },
  };
});
vi.mock("@/lib/prospects/service", () => ({
  createProspect: async (input: Row) => {
    const dup = S.prospects.find((p) => p.businessName.toLowerCase() === String(input.businessName).trim().toLowerCase());
    if (dup) return { id: dup.id, duplicate: true };
    const row = { id: `pro${S.prospects.length + 1}`, businessName: String(input.businessName).trim(), email: String(input.email).toLowerCase(), source: input.source, status: "NEW", partnerId: null, createdAt: new Date() };
    S.prospects.push(row);
    return { id: row.id, duplicate: false };
  },
}));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void S.emails.push({ to, template, payload }) }));
vi.mock("@/lib/analytics/events", () => ({ logEvent: async (event: string, _t: string, _i: string, payload: Row) => void S.events.push({ event, payload }) }));

import { PARTNER, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import {
  DAILY_LEAD_CAP,
  applyToProgram,
  approveMaturedPartnerCommissions,
  approvePartner,
  declinePartner,
  loadAdminPartners,
  loadPartnerDashboard,
  payApprovedForPartner,
  pausePartner,
  recordPartnerClick,
  recordPartnerPurchase,
  setPartnerPercent,
  submitPartnerLead,
} from "@/lib/partners/service";

const DAY = 86_400_000;
const app = { name: "Pat Agent", email: "pat@agency.example", company: "Agent Co", type: "web-designer", website: "", about: "I build sites for restaurants and would recommend you." };

beforeEach(() => {
  for (const k of ["partners", "clicks", "commissions", "prospects", "orders", "customers", "emails", "events"] as const) S[k].length = 0;
});

async function activePartner(over: Row = {}, email = "pat@agency.example") {
  const { id } = await applyToProgram({ ...app, email });
  await approvePartner(id);
  Object.assign(S.partners.find((p) => p.id === id)!, over);
  return S.partners.find((p) => p.id === id)!;
}
const customer = (id: string, email: string, referredByCode: string | null = null, name = "Sam Buyer") => S.customers.push({ id, referredByCode, user: { email, name }, projects: [] });
const order = (id: string, customerId: string, over: Row = {}) =>
  S.orders.push({ id, customerId, status: "PAID", paidAt: new Date(), totalCents: PRICE_CENTS.site, shippingCents: 0, balanceDueCents: 0, items: [{ productId: "p", quantity: 1, product: { name: "Cinematic AI Website" } }], ...over });

describe("applying", () => {
  it("creates an application with a private token, no code yet, and tells the applicant and the owner", async () => {
    const r = await applyToProgram(app);
    expect(r.created).toBe(true);
    const p = S.partners[0];
    expect(p).toMatchObject({ status: "APPLIED", code: null, email: "pat@agency.example" });
    expect(p.token).toMatch(/^[a-f0-9]{48}$/);
    expect(S.emails.map((e) => e.template)).toEqual(["partner_application_received", "owner_new_order"]);
    expect(S.emails[0].to).toBe("pat@agency.example");
    expect(S.emails[1].payload.subject).toContain("Pat Agent");
  });

  it("does not create a second application for the same email, and does not say so", async () => {
    await applyToProgram(app);
    S.emails.length = 0;
    const again = await applyToProgram(app);
    expect(again.created).toBe(false);
    expect(S.partners).toHaveLength(1);
    expect(S.emails).toHaveLength(0);
  });
});

describe("the owner's decisions", () => {
  it("approving makes a unique code, sets the percent, and emails the dashboard link and the terms of pay", async () => {
    const { id } = await applyToProgram(app);
    S.emails.length = 0;
    expect((await approvePartner(id, 12)).ok).toBe(true);
    const p = S.partners[0];
    expect(p).toMatchObject({ status: "ACTIVE", commissionPercent: 12 });
    expect(p.code).toMatch(/^PC[A-HJKMNP-Z2-9]{6}$/);
    const mail = S.emails[0];
    expect(mail.template).toBe("partner_approved");
    expect(mail.payload.dashboardUrl).toContain(p.token);
    expect(mail.payload.link).toContain(p.code);
    expect(mail.payload).toMatchObject({ percent: 12, days: PARTNER.pendingDays });
  });

  it("gives two partners two different codes", async () => {
    const a = await activePartner({}, "a@x.example");
    const b = await activePartner({}, "b@x.example");
    expect(a.code).not.toBe(b.code);
  });

  it("refuses a percent outside 1 to 50, and refuses to approve twice", async () => {
    const { id } = await applyToProgram(app);
    expect((await approvePartner(id, 0)).ok).toBe(false);
    expect((await approvePartner(id, 51)).ok).toBe(false);
    expect((await approvePartner(id, 12.5)).ok).toBe(true);
    expect((await approvePartner(id)).ok).toBe(false);
    expect((await approvePartner("missing")).ok).toBe(false);
  });

  it("declines only an application, and emails them kindly", async () => {
    const { id } = await applyToProgram(app);
    S.emails.length = 0;
    expect((await declinePartner(id)).ok).toBe(true);
    expect(S.partners[0].status).toBe("DECLINED");
    expect(S.emails[0].template).toBe("partner_declined");
    expect((await declinePartner(id)).ok).toBe(false);
    const active = await activePartner({}, "z@x.example");
    expect((await declinePartner(active.id)).ok).toBe(false);
  });

  it("pauses an active partner, and can change a percent for future orders", async () => {
    const p = await activePartner();
    expect((await setPartnerPercent(p.id, 20)).ok).toBe(true);
    expect(p.commissionPercent).toBe(20);
    expect((await setPartnerPercent(p.id, 0)).ok).toBe(false);
    expect((await pausePartner(p.id)).ok).toBe(true);
    expect(p.status).toBe("PAUSED");
    expect((await pausePartner(p.id)).ok).toBe(false);
  });
});

describe("clicks on a partner's link", () => {
  it("are counted for an active partner only", async () => {
    const p = await activePartner();
    expect(await recordPartnerClick(p.code, "1.2.3.4", "UA")).toBe(true);
    expect(S.clicks).toHaveLength(1);
    expect(S.clicks[0].ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(S.clicks[0].ipHash).not.toContain("1.2.3.4");
    await pausePartner(p.id);
    expect(await recordPartnerClick(p.code, "1.2.3.4", "UA")).toBe(false);
    expect(await recordPartnerClick("PCNOTREAL", "1.2.3.4", null)).toBe(false);
    expect(await recordPartnerClick("1A2B3C4D", "1.2.3.4", null)).toBe(false);
    expect(S.clicks).toHaveLength(1);
  });
});

describe("leads a partner introduces", () => {
  const lead = { businessName: "Joe's Cuts", email: "Joe@JoesCuts.example", permission: true, note: "Needs a site" };

  it("becomes a new prospect owned by that partner, with a note, and the owner is told", async () => {
    const p = await activePartner();
    const r = await submitPartnerLead(p.token, lead);
    expect(r).toEqual({ ok: true, alreadyKnown: false });
    expect(S.prospects[0]).toMatchObject({ businessName: "Joe's Cuts", email: "joe@joescuts.example", partnerId: p.id, source: "partner", status: "NEW" });
    expect(S.prospects[0].notes).toContain("Introduced by partner Pat Agent");
    expect(S.emails.some((e) => e.payload.subject === "Partner lead: Joe's Cuts")).toBe(true);
  });

  it("needs the partner to be active, the permission box, a real name, and a real email", async () => {
    const p = await activePartner();
    expect((await submitPartnerLead(p.token, { ...lead, permission: false })).ok).toBe(false);
    expect((await submitPartnerLead(p.token, { ...lead, email: "nope" })).ok).toBe(false);
    expect((await submitPartnerLead(p.token, { ...lead, businessName: "x" })).ok).toBe(false);
    expect((await submitPartnerLead("f".repeat(48), lead)).ok).toBe(false);
    await pausePartner(p.id);
    expect((await submitPartnerLead(p.token, lead)).ok).toBe(false);
    expect(S.prospects).toHaveLength(0);
  });

  it("never takes over a business we already had, and tells the partner nothing more", async () => {
    const p = await activePartner();
    S.prospects.push({ id: "old", businessName: "Joe's Cuts", email: "joe@x.example", partnerId: null, status: "CONTACTED", createdAt: new Date() });
    const r = await submitPartnerLead(p.token, lead);
    expect(r).toEqual({ ok: true, alreadyKnown: true });
    expect(S.prospects).toHaveLength(1);
    expect(S.prospects[0].partnerId).toBeNull();
  });

  it("stops at the daily cap", async () => {
    const p = await activePartner();
    for (let i = 0; i < DAILY_LEAD_CAP; i++) S.prospects.push({ id: `x${i}`, businessName: `Biz ${i}`, partnerId: p.id, createdAt: new Date() });
    expect((await submitPartnerLead(p.token, lead)).ok).toBe(false);
  });
});

describe("earning a commission on a paid order", () => {
  it("is recorded, held, for a customer who signed up with the partner's code", async () => {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1");
    expect(await recordPartnerPurchase("o1")).toBe("recorded");
    const c = S.commissions[0];
    expect(c).toMatchObject({ partnerId: p.id, orderId: "o1", state: "PENDING", grossCents: PRICE_CENTS.site, commissionCents: Math.round(PRICE_CENTS.site * 0.1), percent: 10 });
    expect(c.pendingUntil.getTime()).toBeGreaterThan(Date.now() + (PARTNER.pendingDays - 1) * DAY);
  });

  it("is recorded for a person the partner registered as a lead, even without the link", async () => {
    const p = await activePartner();
    S.prospects.push({ id: "pr", businessName: "Joe", email: "sam@firm.example", partnerId: p.id, status: "NEW", createdAt: new Date() });
    customer("c1", "sam@firm.example", null);
    order("o1", "c1");
    expect(await recordPartnerPurchase("o1")).toBe("recorded");
    expect(S.commissions[0].partnerId).toBe(p.id);
  });

  it("is recorded once however many times it is asked", async () => {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1");
    expect(await recordPartnerPurchase("o1")).toBe("recorded");
    expect(await recordPartnerPurchase("o1")).toBe("exists");
    expect(S.commissions).toHaveLength(1);
  });

  it("does nothing for a customer nobody referred, a customer with a customer's referral code, or an order that is not paid", async () => {
    const p = await activePartner();
    customer("c1", "a@x.example", null);
    order("o1", "c1");
    customer("c2", "b@x.example", "1A2B3C4D");
    order("o2", "c2");
    customer("c3", "c@x.example", p.code);
    order("o3", "c3", { status: "PENDING" });
    expect(await recordPartnerPurchase("o1")).toBe("none");
    expect(await recordPartnerPurchase("o2")).toBe("none");
    expect(await recordPartnerPurchase("o3")).toBe("none");
    expect(await recordPartnerPurchase("missing")).toBe("none");
    expect(S.commissions).toHaveLength(0);
  });

  it("is refused, and the refusal is recorded, for a self-referral", async () => {
    const p = await activePartner();
    customer("c1", "PAT@agency.example", p.code);
    order("o1", "c1");
    await recordPartnerPurchase("o1");
    expect(S.commissions[0]).toMatchObject({ state: "REJECTED", commissionCents: 0 });
    expect(S.commissions[0].note).toMatch(/same person/);
  });

  it("is refused for a paused partner", async () => {
    const p = await activePartner();
    await pausePartner(p.id);
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1");
    await recordPartnerPurchase("o1");
    expect(S.commissions[0].state).toBe("REJECTED");
  });

  it("leaves shipping out of what counts", async () => {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1", { totalCents: 40_000, shippingCents: 10_000 });
    await recordPartnerPurchase("o1");
    expect(S.commissions[0].grossCents).toBe(30_000);
    expect(S.commissions[0].commissionCents).toBe(3_000);
  });

  it("counts a deposit order at its full value, but holds it until the balance is paid", async () => {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1", { totalCents: PRICE_CENTS.saas, balanceDueCents: PRICE_CENTS.saas / 2 });
    await recordPartnerPurchase("o1");
    expect(S.commissions[0].commissionCents).toBe(PRICE_CENTS.saas / 10);
    S.commissions[0].pendingUntil = new Date(Date.now() - 400 * DAY);
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 0, voided: 0 });
    expect(S.commissions[0].state).toBe("PENDING");
    S.orders[0].balanceDueCents = 0;
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 1, voided: 0 });
    expect(S.commissions[0].state).toBe("APPROVED");
  });

  it("earns nothing on an order that comes more than a year after the customer's first", async () => {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1", { paidAt: new Date(Date.now() - (PARTNER.windowDays + 30) * DAY) });
    order("o2", "c1");
    await recordPartnerPurchase("o2");
    expect(S.commissions[0].state).toBe("REJECTED");
    expect(S.commissions[0].note).toMatch(/more than a year/);
  });
});

describe("approving what has matured", () => {
  async function pendingCommission(over: Row = {}, orderOver: Row = {}) {
    const p = await activePartner();
    customer("c1", "sam@firm.example", p.code);
    order("o1", "c1", orderOver);
    await recordPartnerPurchase("o1");
    Object.assign(S.commissions[0], over);
    return p;
  }

  it("holds a commission until the hold has ended", async () => {
    await pendingCommission();
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 0, voided: 0 });
    expect(S.commissions[0].state).toBe("PENDING");
  });

  it("approves it once the hold has ended and the order is fully paid, and only once", async () => {
    await pendingCommission({ pendingUntil: new Date(Date.now() - DAY) });
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 1, voided: 0 });
    expect(S.commissions[0].state).toBe("APPROVED");
    expect(S.commissions[0].approvedAt).toBeInstanceOf(Date);
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 0, voided: 0 });
  });

  it("voids it if the order was refunded or cancelled first, even before the hold ends", async () => {
    await pendingCommission({}, {});
    S.orders[0].status = "REFUNDED";
    expect(await approveMaturedPartnerCommissions()).toEqual({ approved: 0, voided: 1 });
    expect(S.commissions[0].state).toBe("REFUNDED");
  });
});

describe("paying a partner", () => {
  async function approved(cents = [10_000, 5_000]) {
    const p = await activePartner();
    cents.forEach((c, i) => S.commissions.push({ id: `k${i}`, partnerId: p.id, orderId: `o${i}`, state: "APPROVED", commissionCents: c, grossCents: c * 10, percent: 10, createdAt: new Date() }));
    return p;
  }

  it("marks everything approved as paid together, records how, and emails the partner the total", async () => {
    const p = await approved();
    S.emails.length = 0;
    const r = await payApprovedForPartner(p.id, "Zelle confirmation 123");
    expect(r).toEqual({ ok: true, amountCents: 15_000, count: 2 });
    expect(S.commissions.every((c) => c.state === "PAID" && c.payoutRef === "Zelle confirmation 123" && c.paidAt instanceof Date)).toBe(true);
    expect(S.emails).toHaveLength(1);
    expect(S.emails[0]).toMatchObject({ template: "partner_payout_sent", to: "pat@agency.example" });
    expect(S.emails[0].payload.amount).toBe(usd(15_000));
  });

  it("cannot pay the same commissions twice, or pay nothing, or pay without a note", async () => {
    const p = await approved();
    expect((await payApprovedForPartner(p.id, "  ")).ok).toBe(false);
    expect((await payApprovedForPartner(p.id, "ref")).ok).toBe(true);
    expect((await payApprovedForPartner(p.id, "ref again")).ok).toBe(false);
    expect((await payApprovedForPartner("missing", "ref")).ok).toBe(false);
  });

  it("leaves pending, voided, and refused commissions alone", async () => {
    const p = await approved([10_000]);
    S.commissions.push({ id: "p", partnerId: p.id, orderId: "op", state: "PENDING", commissionCents: 900, createdAt: new Date() }, { id: "r", partnerId: p.id, orderId: "or", state: "REJECTED", commissionCents: 0, createdAt: new Date() });
    const r = await payApprovedForPartner(p.id, "ref");
    expect(r).toMatchObject({ ok: true, amountCents: 10_000, count: 1 });
    expect(S.commissions.find((c) => c.id === "p")!.state).toBe("PENDING");
  });
});

describe("what a partner sees on their dashboard", () => {
  it("is their own link, numbers, leads, customers, and commissions, and nothing about anyone's contact details", async () => {
    const a = await activePartner({}, "a@x.example");
    const b = await activePartner({}, "b@x.example");
    S.clicks.push({ partnerId: a.id }, { partnerId: a.id }, { partnerId: b.id });
    S.prospects.push({ id: "l1", businessName: "Alpha Lead Co", email: "alpha-lead@secret.example", status: "CONTACTED", partnerId: a.id, createdAt: new Date() }, { id: "l2", businessName: "Bravo Lead Co", email: "bravo-lead@secret.example", status: "NEW", partnerId: b.id, createdAt: new Date() });
    customer("cA", "alpha-buyer@secret.example", a.code, "Alice Alpha");
    customer("cB", "bravo-buyer@secret.example", b.code, "Bob Bravo");
    order("oA", "cA");
    order("oB", "cB");
    await recordPartnerPurchase("oA");
    await recordPartnerPurchase("oB");

    const da = (await loadPartnerDashboard(a.token))!;
    const db_ = (await loadPartnerDashboard(b.token))!;
    expect(da.stats).toMatchObject({ clicks: 2, leads: 1, customers: 1 });
    expect(da.link).toContain(a.code);
    expect(da.leads).toEqual([expect.objectContaining({ name: "Alpha Lead Co", status: "We have reached out" })]);
    expect(da.customers).toEqual([{ firstName: "Alice", status: "Ordered" }]);
    expect(da.commissions).toHaveLength(1);
    expect(da.commissions[0]).toMatchObject({ what: "Cinematic AI Website", state: "PENDING" });
    expect(da.commissions[0].detail).toMatch(/Held until/);
    expect(da.totals.pendingCents).toBe(Math.round(PRICE_CENTS.site * 0.1));

    const jsonA = JSON.stringify(da);
    expect(jsonA).not.toMatch(/Bravo|Bob|bravo|b@x\.example/);
    expect(jsonA).not.toMatch(/secret\.example/);
    expect(JSON.stringify(db_)).not.toMatch(/Alpha|Alice|alpha|a@x\.example/);
    expect(da.assets.length).toBeGreaterThan(3);
    expect(da.assets[0].text).toContain(a.code);
  });

  it("is nothing for an unknown link or a declined applicant, and a plain waiting page for one under review", async () => {
    expect(await loadPartnerDashboard("f".repeat(48))).toBeNull();
    const { id } = await applyToProgram(app);
    const p = S.partners.find((x) => x.id === id)!;
    const waiting = (await loadPartnerDashboard(p.token))!;
    expect(waiting.partner.status).toBe("APPLIED");
    expect(waiting.link).toBeNull();
    expect(waiting.assets).toEqual([]);
    await declinePartner(id);
    expect(await loadPartnerDashboard(p.token)).toBeNull();
  });
});

describe("what the owner sees", () => {
  it("lists every partner with clicks, leads, and money by state", async () => {
    const p = await activePartner();
    S.clicks.push({ partnerId: p.id });
    S.prospects.push({ id: "l1", businessName: "X Co", partnerId: p.id, status: "NEW", createdAt: new Date() });
    S.commissions.push({ id: "k", partnerId: p.id, orderId: "o", state: "APPROVED", commissionCents: 7_000, createdAt: new Date() });
    const [row] = await loadAdminPartners();
    expect(row).toMatchObject({ name: "Pat Agent", status: "ACTIVE", clicks: 1, leads: 1, commissions: 1 });
    expect(row.totals.approvedCents).toBe(7_000);
    expect(row.dashboardUrl).toContain(p.token);
  });
});
