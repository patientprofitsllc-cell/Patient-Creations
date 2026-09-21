import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- a small in-memory stand-in for the database and for Stripe ----
type Row = Record<string, any>;
const store = vi.hoisted(() => ({ audits: [] as Row[], prospects: [] as Row[], events: [] as Row[], emails: [] as Row[], stripe: { created: [] as Row[], sessions: {} as Record<string, Row>, configured: true } }));

vi.mock("@/lib/db", () => {
  const match = (row: Row, where: Row) =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === "object" && "in" in (v as Row)) return (v as Row).in.includes(row[k]);
      if (v && typeof v === "object" && "not" in (v as Row)) return row[k] !== (v as Row).not;
      return row[k] === v;
    });
  return {
    db: {
      growthAudit: {
        create: async ({ data }: Row) => {
          const row = { id: "aud" + (store.audits.length + 1), createdAt: new Date(), status: "PENDING", creditCode: null, creditExpiresAt: null, creditUsedAt: null, paidAt: null, stripeSessionId: null, briefingJson: null, ...data };
          store.audits.push(row);
          return row;
        },
        findUnique: async ({ where }: Row) => store.audits.find((a) => Object.entries(where).every(([k, v]) => a[k] === v)) ?? null,
        findUniqueOrThrow: async ({ where }: Row) => {
          const r = store.audits.find((a) => Object.entries(where).every(([k, v]) => a[k] === v));
          if (!r) throw new Error("not found");
          return r;
        },
        updateMany: async ({ where, data }: Row) => {
          const rows = store.audits.filter((a) => match(a, where));
          rows.forEach((r) => Object.assign(r, data));
          return { count: rows.length };
        },
        update: async ({ where, data }: Row) => {
          const r = store.audits.find((a) => a.id === where.id)!;
          Object.assign(r, data);
          return r;
        },
      },
      prospect: {
        findUnique: async ({ where }: Row) => store.prospects.find((p) => p.id === where.id) ?? null,
        updateMany: async ({ where, data }: Row) => {
          const rows = store.prospects.filter((p) => match(p, where));
          rows.forEach((r) => Object.assign(r, data));
          return { count: rows.length };
        },
      },
      analyticsEvent: { create: async ({ data }: Row) => void store.events.push(data) },
    },
  };
});
vi.mock("@/lib/email/provider", () => ({ sendEmail: vi.fn(async (to: string, template: string, payload: Row) => { store.emails.push({ to, template, payload }); return { ok: true, provider: "test" }; }) }));
vi.mock("@/lib/payments/stripe", () => ({
  isStripeConfigured: () => store.stripe.configured,
  getStripe: () => ({
    checkout: {
      sessions: {
        create: async (args: Row) => {
          store.stripe.created.push(args);
          return { id: "cs_test_1", url: "https://checkout.stripe.test/pay/cs_test_1" };
        },
        retrieve: async (id: string) => store.stripe.sessions[id],
      },
    },
  }),
}));

import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, FEES, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { auditTeaser, confirmAuditPayment, consumeAuditCredit, createAuditRequest, handleAuditEvent, isAuditCreditCode, markAuditPaid, newCreditCode, resolveAuditCredit, startAuditCheckout } from "@/lib/audit/paid";
import { resolveDiscount } from "@/lib/payments/pricing";
import { buildGrowthAudit, type AuditInput } from "@/lib/audit/growthAudit";

const input: AuditInput = { businessName: "Joe's Cuts", website: null, email: "joe@joescuts.example", goal: "customers", channels: [], industry: "Barber", city: "Atlanta, GA" };
const report = buildGrowthAudit(input, null, {});

async function newAudit() {
  store.prospects.push({ id: "p1", status: "NEW" });
  return createAuditRequest({ input, report, prospectId: "p1", site: null, facts: null });
}

beforeEach(() => {
  store.audits.length = 0;
  store.prospects.length = 0;
  store.events.length = 0;
  store.emails.length = 0;
  store.stripe.created.length = 0;
  store.stripe.sessions = {};
  store.stripe.configured = true;
});

describe("the audit price", () => {
  it("is $19, kept apart from the shelf products, below the smallest thing we sell, and credited for 30 days", () => {
    expect(FEES["growth-audit"]).toBe(1900);
    expect(AUDIT_FEE_CENTS).toBe(1900);
    expect(usd(AUDIT_FEE_CENTS)).toBe("$19");
    expect(AUDIT_CREDIT_DAYS).toBe(30);
    expect(AUDIT_FEE_CENTS).toBeLessThan(Math.min(...Object.values(PRICE_CENTS)) + 1);
    expect(PRICE_CENTS).not.toHaveProperty(["growth-audit"]);
  });
});

describe("the free preview", () => {
  it("shows real counts and a headline, and never the findings themselves", () => {
    const withSite = buildGrowthAudit(input, { checkedAt: "x", url: "https://a.example/", reachable: true, problems: 2, findings: [{ key: "https", label: "Loads securely (https)", ok: true }, { key: "viewport", label: "Declares a mobile layout", ok: false }, { key: "phone", label: "Shows a phone number", ok: false }] }, {});
    const t = auditTeaser(withSite);
    expect(t.checked).toBe(3);
    expect(t.needAttention).toBe(2);
    expect(t.headline).toMatch(/2 of 3 basic checks need attention/);
    expect(JSON.stringify(t)).not.toMatch(/mobile layout|phone number|securely/);
    expect(auditTeaser(report).headline).toMatch(/suggestion/);
  });
});

describe("credit codes", () => {
  it("look like AUDIT plus eight clear characters, and do not repeat", () => {
    const codes = new Set(Array.from({ length: 200 }, () => newCreditCode()));
    expect(codes.size).toBe(200);
    for (const c of codes) {
      expect(c).toMatch(/^AUDIT-[A-HJKMNP-Z2-9]{8}$/);
      expect(isAuditCreditCode(c)).toBe(true);
    }
    expect(isAuditCreditCode("LAUNCH10")).toBe(false);
    expect(isAuditCreditCode("AUDIT-0OIL1111")).toBe(false);
    expect(isAuditCreditCode(null)).toBe(false);
  });

  it("take the whole fee off an order, never more than the order, once, and only while valid", async () => {
    const a = await newAudit();
    await markAuditPaid(a.id, "cs_paid_1");
    const audit = store.audits[0];
    const code = audit.creditCode as string;
    expect(await resolveAuditCredit(code, 30_000)).toBe(1900);
    expect(await resolveAuditCredit(code.toLowerCase(), 30_000)).toBe(1900);
    expect(await resolveAuditCredit(code, 1500)).toBe(1500);
    expect(await resolveAuditCredit("AUDIT-ZZZZZZZZ", 30_000)).toBe(0);
    expect(await resolveAuditCredit(code, 30_000, new Date(audit.creditExpiresAt.getTime() + 1000))).toBe(0);
    expect(await consumeAuditCredit(code)).toBe(true);
    expect(await consumeAuditCredit(code)).toBe(false);
    expect(await resolveAuditCredit(code, 30_000)).toBe(0);
  });

  it("do nothing for an audit that has not been paid for", async () => {
    const a = await newAudit();
    store.audits[0].creditCode = "AUDIT-ABCDEFGH";
    store.audits[0].creditExpiresAt = new Date(Date.now() + 86_400_000);
    expect(store.audits[0].status).toBe("PENDING");
    expect(await resolveAuditCredit("AUDIT-ABCDEFGH", 30_000)).toBe(0);
    void a;
  });

  it("work as a coupon in the same place every other coupon does, and never stack with the return offer", async () => {
    const a = await newAudit();
    await markAuditPaid(a.id, "cs_paid_2");
    const code = store.audits[0].creditCode as string;
    expect((await resolveDiscount(code, 30_000)).discountCents).toBe(1900);
    expect((await resolveDiscount(code, 30_000)).couponApplied).toBe(code);
    expect((await resolveDiscount("LAUNCH10", 30_000)).discountCents).toBe(3000);
    expect((await resolveDiscount("AUDIT-NOTREAL2", 30_000)).discountCents).toBe(0);
  });
});

describe("paying for the audit", () => {
  it("opens Stripe with the fee from the saved audit, the audit's id, and a return address that carries the session", async () => {
    const a = await newAudit();
    const r = await startAuditCheckout(a.id);
    expect(r).toEqual({ ok: true, url: "https://checkout.stripe.test/pay/cs_test_1" });
    const s = store.stripe.created[0];
    expect(s.mode).toBe("payment");
    expect(s.line_items[0].price_data.unit_amount).toBe(1900);
    expect(s.metadata).toEqual({ kind: "growth_audit", auditId: a.id });
    expect(s.customer_email).toBe("joe@joescuts.example");
    expect(s.success_url).toMatch(/\/audit\/report\/[a-f0-9]{48}\?session_id=\{CHECKOUT_SESSION_ID\}$/);
    expect(s.line_items[0].price_data.product_data.name).toMatch(/credited toward your first order/);
  });

  it("never unlocks the report for free in production, and only mocks payment in development", async () => {
    store.stripe.configured = false;
    const a = await newAudit();
    const env = process.env as Record<string, string | undefined>;
    const saved = env.NODE_ENV;
    env.NODE_ENV = "production";
    const prod = await startAuditCheckout(a.id);
    expect(prod.ok).toBe(false);
    expect(store.audits[0].status).toBe("PENDING");
    env.NODE_ENV = "development";
    const dev = await startAuditCheckout(a.id);
    expect(dev).toMatchObject({ ok: true, paid: true });
    expect(store.audits[0].status).toBe("PAID");
    env.NODE_ENV = saved;
  });

  it("marks it paid once: credit code, expiry, one email to the customer with the code, one alert to the owner, even if it is called twice", async () => {
    const a = await newAudit();
    const first = await markAuditPaid(a.id, "cs_paid_3");
    const second = await markAuditPaid(a.id, "cs_paid_3");
    expect(first.firstTime).toBe(true);
    expect(second.firstTime).toBe(false);
    const audit = store.audits[0];
    expect(audit.status).toBe("PAID");
    expect(audit.creditCode).toMatch(/^AUDIT-/);
    const days = Math.round((audit.creditExpiresAt.getTime() - audit.paidAt.getTime()) / 86_400_000);
    expect(days).toBe(AUDIT_CREDIT_DAYS);
    const toCustomer = store.emails.filter((e) => e.template === "growth_audit_ready");
    expect(toCustomer).toHaveLength(1);
    expect(toCustomer[0].to).toBe("joe@joescuts.example");
    expect(toCustomer[0].payload.creditCode).toBe(audit.creditCode);
    expect(toCustomer[0].payload.creditAmount).toBe("$19");
    const toOwner = store.emails.filter((e) => e.template === "owner_audit_lead");
    expect(toOwner).toHaveLength(1);
    expect(toOwner[0].payload.subject).toMatch(/PAID growth audit: Joe's Cuts/);
    expect(toOwner[0].payload.body).toMatch(/ANALYST:/);
    expect(toOwner[0].payload.body).toMatch(/\/admin\/audits\//);
    expect(store.events.map((e) => e.name)).toEqual(["audit_paid", "audit_completed"]);
  });

  it("writes the owner's briefing on payment, and moves the lead forward", async () => {
    const a = await newAudit();
    await markAuditPaid(a.id, "cs_paid_4");
    const briefing = JSON.parse(store.audits[0].briefingJson);
    expect(briefing.primary.slug).toBe("starter-website");
    expect(briefing.suggestedMessage).toContain(store.audits[0].creditCode);
    expect(store.prospects[0].status).toBe("AUDITED");
    expect(store.prospects[0].auditedAt).toBeInstanceOf(Date);
  });

  it("asks Stripe, not the browser, and refuses the wrong audit, the wrong amount, an unpaid session, or a malformed id", async () => {
    const a = await newAudit();
    const good = { id: "cs_live_1", payment_status: "paid", amount_total: 1900, metadata: { kind: "growth_audit", auditId: a.id } };
    store.stripe.sessions = { cs_live_1: good, cs_live_2: { ...good, id: "cs_live_2", amount_total: 100 }, cs_live_3: { ...good, id: "cs_live_3", payment_status: "unpaid" }, cs_live_4: { ...good, id: "cs_live_4", metadata: { kind: "growth_audit", auditId: "other" } } };
    expect(await confirmAuditPayment(a.id, "cs_live_2")).toBe(false);
    expect(await confirmAuditPayment(a.id, "cs_live_3")).toBe(false);
    expect(await confirmAuditPayment(a.id, "cs_live_4")).toBe(false);
    expect(await confirmAuditPayment(a.id, "not-a-session")).toBe(false);
    expect(store.audits[0].status).toBe("PENDING");
    expect(await confirmAuditPayment(a.id, "cs_live_1")).toBe(true);
    expect(store.audits[0].status).toBe("PAID");
  });

  it("handles the webhook: only a paid growth audit for the right amount, and other events are left alone", async () => {
    const a = await newAudit();
    const ev = (over: Row, type = "checkout.session.completed") => ({ type, data: { object: { id: "cs_wh_1", payment_status: "paid", amount_total: 1900, metadata: { kind: "growth_audit", auditId: a.id }, ...over } } }) as never;
    await handleAuditEvent(ev({}, "invoice.paid"));
    await handleAuditEvent(ev({ metadata: { kind: "ads_plan", auditId: a.id } }));
    await handleAuditEvent(ev({ amount_total: 1 }));
    await handleAuditEvent(ev({ payment_status: "unpaid" }));
    expect(store.audits[0].status).toBe("PENDING");
    await handleAuditEvent(ev({}));
    expect(store.audits[0].status).toBe("PAID");
    await handleAuditEvent(ev({}));
    expect(store.emails.filter((e) => e.template === "growth_audit_ready")).toHaveLength(1);
  });
});

describe("pay later never applies to the audit fee", () => {
  const env = process.env as Record<string, string | undefined>;
  afterEach(() => {
    delete env.BNPL_ENABLED;
  });

  it("sends nothing extra while it is off, and card only when it is on, so Klarna cannot appear on a small fee", async () => {
    const a = await newAudit();
    await startAuditCheckout(a.id);
    expect(store.stripe.created[0]).not.toHaveProperty("payment_method_types");
    env.BNPL_ENABLED = "true";
    store.stripe.created.length = 0;
    await startAuditCheckout(a.id);
    expect(store.stripe.created[0].payment_method_types).toEqual(["card"]);
  });
});
