import { beforeEach, describe, expect, it, vi } from "vitest";

// The checkout route with a deposit: what it stores, what it charges, and what it refuses. Everything it talks to is faked.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({
  orders: [] as Row[],
  stripeCalls: [] as Row[],
  completed: [] as string[],
  emails: [] as Row[],
  priced: { totalCents: 0, shippingCents: 0 },
}));

vi.mock("next-auth", () => ({ getServerSession: async () => ({ user: { id: "u1", email: "buyer@firm.example" } }) }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    customer: { findUnique: async () => ({ id: "c1" }) },
    product: {
      count: async () => 0,
      findMany: async () => [{ id: "prod1", name: "AI Software", slug: "saas" }],
    },
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
          return { id: "cs_1", url: "https://checkout.stripe.test/cs_1" };
        },
      },
    },
  }),
}));
vi.mock("@/lib/payments/completeOrder", () => ({ completeOrderPayment: async (id: string) => void h.completed.push(id) }));
vi.mock("@/lib/referrals/codes", () => ({ ensureReferralForCustomer: async () => ({ code: "X" }) }));
vi.mock("@/lib/analytics/events", () => ({ logEvent: async () => {} }));
vi.mock("@/lib/legal/acceptance", () => ({ recordAcceptance: async () => {} }));
vi.mock("@/lib/alerts/ownerAlerts", () => ({ notifyOwnerOfOrder: async () => {} }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void h.emails.push({ to, template, payload }) }));
vi.mock("@/lib/security/rateLimit", () => ({ rateLimit: () => ({ allowed: true }) }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/route";
import { DEPOSIT, PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const TOTAL = PRICE_CENTS.saas;
const DEP = Math.round((TOTAL * DEPOSIT.percent) / 100);

const post = (body: Row) =>
  POST(new NextRequest("http://localhost/api/checkout", { method: "POST", body: JSON.stringify({ productIds: ["prod1"], acceptTerms: true, ...body }) }));

beforeEach(() => {
  h.orders.length = 0;
  h.stripeCalls.length = 0;
  h.completed.length = 0;
  h.emails.length = 0;
  h.priced = { totalCents: TOTAL, shippingCents: 0 };
});

describe("checkout with a deposit", () => {
  it("stores the deposit and the balance, and charges the card exactly the deposit", async () => {
    const res = await post({ paymentPlan: "deposit" });
    expect(res.status).toBe(200);
    expect(h.orders[0]).toMatchObject({ totalCents: TOTAL, depositCents: DEP, balanceDueCents: TOTAL - DEP });
    const line = h.stripeCalls[0].line_items;
    expect(line).toHaveLength(1);
    expect(line[0].price_data.unit_amount).toBe(DEP);
    expect(line[0].price_data.product_data.name).toMatch(/Deposit/);
    // The order id goes with the session, so the webhook starts production; the invoice flow is separate.
    expect(h.stripeCalls[0].metadata).toEqual({ orderId: "ord1" });
  });

  it("charges the full total, with no balance, when the customer pays in full", async () => {
    await post({ paymentPlan: "full" });
    expect(h.orders[0]).toMatchObject({ totalCents: TOTAL, depositCents: 0, balanceDueCents: 0 });
    const charged = h.stripeCalls[0].line_items.reduce((s: number, l: Row) => s + l.price_data.unit_amount * l.quantity, 0);
    expect(charged).toBe(TOTAL);
  });

  it("defaults to paying in full when the customer says nothing", async () => {
    await post({});
    expect(h.orders[0]).toMatchObject({ depositCents: 0, balanceDueCents: 0 });
  });

  it("refuses a deposit on a small order, and creates no order", async () => {
    h.priced = { totalCents: DEPOSIT.minOrderCents - 1, shippingCents: 0 };
    const res = await post({ paymentPlan: "deposit" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/larger builds/i);
    expect(h.orders).toHaveLength(0);
    expect(h.stripeCalls).toHaveLength(0);
  });

  it("refuses a deposit on an order that ships goods", async () => {
    h.priced = { totalCents: TOTAL, shippingCents: 1200 };
    const res = await post({ paymentPlan: "deposit" });
    expect(res.status).toBe(400);
    expect(h.orders).toHaveLength(0);
  });

  it("does not let the browser choose the amounts", async () => {
    await post({ paymentPlan: "deposit", depositCents: 100, balanceDueCents: 0, totalCents: 100 });
    expect(h.orders[0]).toMatchObject({ depositCents: DEP, balanceDueCents: TOTAL - DEP });
  });

  it("tells a customer paying another way what is due now and later", async () => {
    await post({ paymentPlan: "deposit", paymentMethod: "zelle" });
    expect(h.stripeCalls).toHaveLength(0);
    expect(h.completed).toHaveLength(0);
    const mail = h.emails.find((e) => e.template === "order_received")!;
    expect(mail.payload.summary).toContain(`${usd(DEP)} deposit`);
    expect(mail.payload.summary).toContain(usd(TOTAL - DEP));
    expect(h.orders[0]).toMatchObject({ paymentMethod: "zelle", depositCents: DEP, balanceDueCents: TOTAL - DEP });
  });
});
