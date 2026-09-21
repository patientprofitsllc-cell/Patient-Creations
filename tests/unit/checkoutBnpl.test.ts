import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Pay later (Klarna, Afterpay) at checkout, order and invoice and audit sessions: what gets sent to Stripe. Everything is faked.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  orders: [] as Row[],
  stripeCalls: [] as Row[],
  failFirstWithMethods: false,
  priced: { totalCents: 0, shippingCents: 0 },
}));

vi.mock("next-auth", () => ({ getServerSession: async () => ({ user: { id: "u1", email: "buyer@firm.example" } }) }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    customer: { findUnique: async () => ({ id: "c1" }) },
    product: { count: async () => 0, findMany: async () => [{ id: "prod1", name: "AI Software", slug: "saas" }] },
    productVariant: { findMany: async () => [] },
    order: {
      create: async ({ data }: Row) => {
        const row = { id: "ord" + (h.orders.length + 1), ...data };
        h.orders.push(row);
        return row;
      },
      update: async () => ({}),
    },
    websiteIntake: { findUnique: async () => null, create: async () => ({}) },
  },
}));
vi.mock("@/lib/payments/pricing", () => ({
  priceOrder: async () => ({
    subtotalCents: h.priced.totalCents,
    discountCents: 0,
    deliverySpeed: "standard",
    rushFeeCents: 0,
    shippingCents: h.priced.shippingCents,
    shippingBoxLabel: null,
    totalCents: h.priced.totalCents,
    couponApplied: null,
    items: [{ productId: "prod1", productVariantId: null, priceCents: h.priced.totalCents, quantity: 1 }],
  }),
  priceCardMix: async () => {
    throw new Error("not used");
  },
}));
vi.mock("@/lib/payments/stripe", () => ({
  isStripeConfigured: () => true,
  getStripe: () => ({
    checkout: {
      sessions: {
        create: async (args: Row) => {
          h.stripeCalls.push(args);
          if (h.failFirstWithMethods && args.payment_method_types && args.payment_method_types.length > 1) throw new Error("The payment method type provided: klarna is invalid");
          return { id: "cs_1", url: "https://checkout.stripe.test/cs_1" };
        },
      },
    },
  }),
}));
vi.mock("@/lib/payments/completeOrder", () => ({ completeOrderPayment: async () => {} }));
vi.mock("@/lib/referrals/codes", () => ({ ensureReferralForCustomer: async () => ({ code: "X" }) }));
vi.mock("@/lib/analytics/events", () => ({ logEvent: async () => {} }));
vi.mock("@/lib/legal/acceptance", () => ({ recordAcceptance: async () => {} }));
vi.mock("@/lib/alerts/ownerAlerts", () => ({ notifyOwnerOfOrder: async () => {} }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async () => {} }));
vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: true }) }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/route";
import { BNPL, DEPOSIT, PRICE_CENTS } from "@/lib/pricing/catalog";

const env = process.env as Record<string, string | undefined>;
const post = (body: Row) =>
  POST(new NextRequest("http://localhost/api/checkout", { method: "POST", body: JSON.stringify({ productIds: ["prod1"], acceptTerms: true, ...body }) }));

beforeEach(() => {
  h.orders.length = 0;
  h.stripeCalls.length = 0;
  h.failFirstWithMethods = false;
  h.priced = { totalCents: PRICE_CENTS.saas, shippingCents: 0 };
});
afterEach(() => {
  delete env.BNPL_ENABLED;
  vi.restoreAllMocks();
});

describe("pay later at checkout", () => {
  it("changes nothing while it is off: no payment method types are sent", async () => {
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[0]).not.toHaveProperty("payment_method_types");
  });

  it("names card and Klarna for a big order paid in full, and only card when it is over Klarna's limit", async () => {
    env.BNPL_ENABLED = "true";
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[0].payment_method_types).toEqual(["card", "klarna"]);
    h.priced = { totalCents: BNPL.klarnaMaxCents + 100, shippingCents: 0 };
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[1].payment_method_types).toEqual(["card"]);
  });

  it("looks at what is charged now: a deposit that fits gets pay later even when the whole order does not", async () => {
    env.BNPL_ENABLED = "true";
    h.priced = { totalCents: BNPL.klarnaMaxCents + 200_000, shippingCents: 0 };
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[0].payment_method_types).toEqual(["card"]);
    await post({ paymentPlan: "deposit" });
    expect(h.stripeCalls[1].payment_method_types).toEqual(["card", "klarna"]);
  });

  it("gives a website order both methods, and a small order card only", async () => {
    env.BNPL_ENABLED = "true";
    h.priced = { totalCents: PRICE_CENTS.site, shippingCents: 0 };
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[0].payment_method_types).toEqual(["card", "klarna", "afterpay_clearpay"]);
    h.priced = { totalCents: 3_000, shippingCents: 0 };
    await post({ paymentPlan: "full" });
    expect(h.stripeCalls[1].payment_method_types).toEqual(["card"]);
  });

  it("still sends the customer to a working checkout when Stripe refuses the pay-later request", async () => {
    env.BNPL_ENABLED = "true";
    h.failFirstWithMethods = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post({ paymentPlan: "full" });
    expect(res.status).toBe(200);
    expect((await res.json()).redirectUrl).toBe("https://checkout.stripe.test/cs_1");
    expect(h.stripeCalls.map((c) => c.payment_method_types)).toEqual([["card", "klarna"], ["card"]]);
  });

  it("keeps the deposit rule and the amount charged exactly as before", async () => {
    env.BNPL_ENABLED = "true";
    await post({ paymentPlan: "deposit" });
    expect(h.stripeCalls[0].line_items[0].price_data.unit_amount).toBe(Math.round((PRICE_CENTS.saas * DEPOSIT.percent) / 100));
  });
});
