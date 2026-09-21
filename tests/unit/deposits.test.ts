import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- a small in-memory stand-in for the database, email, Stripe, and the delivery step ----
type Row = Record<string, any>;
const store = vi.hoisted(() => ({
  orders: [] as Row[],
  invoices: [] as Row[],
  payments: [] as Row[],
  projects: [] as Row[],
  logs: [] as Row[],
  emails: [] as Row[],
  finalized: [] as string[],
  stripe: { created: [] as Row[], sessions: {} as Record<string, Row>, configured: true },
}));

vi.mock("@/lib/db", () => {
  const match = (row: Row, where: Row) =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === "object" && "in" in (v as Row)) return (v as Row).in.includes(row[k]);
      return row[k] === v;
    });
  const order = (o: Row | undefined) =>
    o && { ...o, items: [{ product: { name: "AI Software" }, quantity: 1 }], customer: { id: "c1", user: { email: "buyer@firm.example", name: "Sam Buyer" } } };
  const invoice = (i: Row | undefined) => i && { ...i, order: order(store.orders.find((o) => o.id === i.orderId)) };
  const find = (rows: Row[], where: Row) => rows.find((r) => match(r, where));
  return {
    db: {
      order: {
        findUnique: async ({ where }: Row) => order(find(store.orders, where)) ?? null,
        findUniqueOrThrow: async ({ where }: Row) => {
          const o = find(store.orders, where);
          if (!o) throw new Error("no order");
          return order(o);
        },
        update: async ({ where, data }: Row) => {
          const o = find(store.orders, where)!;
          for (const [k, v] of Object.entries(data)) {
            if (v && typeof v === "object" && "increment" in (v as Row)) o[k] += (v as Row).increment;
            else o[k] = v;
          }
          return o;
        },
      },
      invoice: {
        create: async ({ data }: Row) => {
          const row = { id: "inv" + (store.invoices.length + 1), seq: store.invoices.length + 1, status: "OPEN", paidAt: null, paidVia: null, stripeSessionId: null, createdAt: new Date(), ...data };
          store.invoices.push(row);
          return row;
        },
        findUnique: async ({ where }: Row) => invoice(find(store.invoices, where)) ?? null,
        findUniqueOrThrow: async ({ where }: Row) => {
          const i = find(store.invoices, where);
          if (!i) throw new Error("no invoice");
          return invoice(i);
        },
        findFirst: async ({ where }: Row) => find(store.invoices, where) ?? null,
        updateMany: async ({ where, data }: Row) => {
          const rows = store.invoices.filter((r) => match(r, where));
          rows.forEach((r) => Object.assign(r, data));
          return { count: rows.length };
        },
      },
      payment: { create: async ({ data }: Row) => void store.payments.push(data) },
      project: {
        findUnique: async ({ where }: Row) => {
          const p = find(store.projects, where);
          return p && { ...p, order: store.orders.find((o) => o.id === p.orderId), customer: { user: { email: "buyer@firm.example" } } };
        },
      },
      auditLog: { findFirst: async ({ where }: Row) => find(store.logs, where) ?? null },
    },
  };
});
vi.mock("@/lib/analytics/events", () => ({ logEvent: vi.fn(async (event: string, entityType: string, entityId: string, payload?: Row) => void store.logs.push({ event, entityType, entityId, payload })) }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: vi.fn(async (to: string, template: string, payload: Row) => { store.emails.push({ to, template, payload }); return { ok: true, provider: "test" }; }) }));
vi.mock("@/lib/agents/orchestrator", () => ({ finalizeDelivery: vi.fn(async (id: string) => void store.finalized.push(id)) }));
vi.mock("@/lib/projects/statusToken", () => ({ statusUrlFor: (t: string) => `https://site.test/status/${t}` }));
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

import { DEPOSIT, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { collectedCents, depositLineItems, quoteDeposit } from "@/lib/payments/deposit";
import { issueBalanceInvoice, issueExtraInvoice, invoiceNumber, MAX_EXTRA_INVOICE_CENTS } from "@/lib/payments/invoiceCore";
import { holdDeliveryForBalance } from "@/lib/payments/balanceGate";
import { confirmInvoicePayment, handleInvoiceEvent, markInvoicePaid, startInvoiceCheckout, voidInvoice } from "@/lib/payments/invoices";

const TOTAL = PRICE_CENTS.saas;
const DEPOSIT_CENTS = Math.round((TOTAL * DEPOSIT.percent) / 100);

/** A paid deposit order that still owes its balance, with a project in DELIVERY_READY. */
function depositOrder(over: Row = {}) {
  store.orders.push({ id: "o1", status: "PAID", totalCents: TOTAL, balanceDueCents: TOTAL - DEPOSIT_CENTS, depositCents: DEPOSIT_CENTS, ...over });
  store.projects.push({ id: "p1", orderId: "o1", name: "AI Software", state: "DELIVERY_READY", statusToken: "tok" });
}

beforeEach(() => {
  for (const k of ["orders", "invoices", "payments", "projects", "logs", "emails", "finalized"] as const) store[k].length = 0;
  store.stripe.created.length = 0;
  store.stripe.sessions = {};
  store.stripe.configured = true;
});

describe("the deposit rules", () => {
  it("offer a deposit only on big orders, at the set percent, and the two parts add up exactly", () => {
    const q = quoteDeposit(TOTAL);
    expect(q.eligible).toBe(true);
    expect(q.percent).toBe(DEPOSIT.percent);
    expect(q.depositCents).toBe(DEPOSIT_CENTS);
    expect(q.depositCents + q.balanceCents).toBe(TOTAL);
  });

  it("start at the minimum order and not a cent below it", () => {
    expect(quoteDeposit(DEPOSIT.minOrderCents).eligible).toBe(true);
    const below = quoteDeposit(DEPOSIT.minOrderCents - 1);
    expect(below.eligible).toBe(false);
    expect(below.depositCents).toBe(DEPOSIT.minOrderCents - 1);
    expect(below.balanceCents).toBe(0);
  });

  it("never apply to an order that ships physical goods", () => {
    const q = quoteDeposit(TOTAL, { shippingCents: 1200 });
    expect(q.eligible).toBe(false);
    expect(q.reason).toMatch(/paid in full/i);
    expect(q.balanceCents).toBe(0);
  });

  it("split odd totals without losing a cent", () => {
    for (const total of [DEPOSIT.minOrderCents + 1, 333_333, 1_234_567, 9_999_999]) {
      const q = quoteDeposit(total);
      expect(q.depositCents + q.balanceCents).toBe(total);
    }
  });

  it("count as collected everything except what is still owed", () => {
    expect(collectedCents({ totalCents: TOTAL, balanceDueCents: TOTAL - DEPOSIT_CENTS })).toBe(DEPOSIT_CENTS);
    expect(collectedCents({ totalCents: TOTAL, balanceDueCents: 0 })).toBe(TOTAL);
    expect(collectedCents({ totalCents: 100, balanceDueCents: 500 })).toBe(0);
  });
});

describe("the card charge for a deposit", () => {
  it("is one line for exactly the deposit, and says what is still due", () => {
    const items = depositLineItems({ productNames: ["AI Software", "Brand Kit"], depositCents: DEPOSIT_CENTS, balanceCents: TOTAL - DEPOSIT_CENTS });
    expect(items).toHaveLength(1);
    expect(items[0].price_data.unit_amount).toBe(DEPOSIT_CENTS);
    expect(items[0].quantity).toBe(1);
    expect(items[0].price_data.product_data.name).toContain("AI Software, Brand Kit");
    expect(items[0].price_data.product_data.description).toContain(usd(TOTAL - DEPOSIT_CENTS));
  });

  it("keeps a very long product list inside Stripe's name limit", () => {
    const items = depositLineItems({ productNames: Array.from({ length: 80 }, (_, i) => `Product number ${i}`), depositCents: DEPOSIT_CENTS, balanceCents: 1 });
    expect(items[0].price_data.product_data.name.length).toBeLessThanOrEqual(250);
  });
});

describe("the final-payment invoice", () => {
  it("is for exactly what remains, and asking twice gives the same one", async () => {
    depositOrder();
    const a = await issueBalanceInvoice("o1");
    const b = await issueBalanceInvoice("o1");
    expect(a?.amountCents).toBe(TOTAL - DEPOSIT_CENTS);
    expect(a?.kind).toBe("BALANCE");
    expect(b?.id).toBe(a?.id);
    expect(store.invoices).toHaveLength(1);
    expect(a?.token).toMatch(/^[a-f0-9]{48}$/);
  });

  it("is not created for an order that owes nothing", async () => {
    depositOrder({ balanceDueCents: 0 });
    expect(await issueBalanceInvoice("o1")).toBeNull();
  });

  it("numbers invoices from 1001", () => {
    expect(invoiceNumber(1)).toBe("PC-1001");
  });
});

describe("billing for extra work", () => {
  it("needs a real description, a sensible amount, and a paid order", async () => {
    depositOrder();
    expect((await issueExtraInvoice({ orderId: "o1", amountCents: 50_000, description: "  " })).ok).toBe(false);
    expect((await issueExtraInvoice({ orderId: "o1", amountCents: 0, description: "x" })).ok).toBe(false);
    expect((await issueExtraInvoice({ orderId: "o1", amountCents: 99, description: "x" })).ok).toBe(false);
    expect((await issueExtraInvoice({ orderId: "o1", amountCents: 12.5 as number, description: "x" })).ok).toBe(false);
    const tooBig = await issueExtraInvoice({ orderId: "o1", amountCents: MAX_EXTRA_INVOICE_CENTS + 1, description: "x" });
    expect(tooBig.ok).toBe(false);
    if (!tooBig.ok) expect(tooBig.error).toContain(usd(MAX_EXTRA_INVOICE_CENTS));
    expect((await issueExtraInvoice({ orderId: "nope", amountCents: 50_000, description: "x" })).ok).toBe(false);
    store.orders.push({ id: "o2", status: "PENDING", totalCents: 100, balanceDueCents: 0 });
    expect((await issueExtraInvoice({ orderId: "o2", amountCents: 50_000, description: "x" })).ok).toBe(false);
    expect(store.invoices).toHaveLength(0);
    const ok = await issueExtraInvoice({ orderId: "o1", amountCents: 50_000, description: "Extra pages" });
    expect(ok.ok).toBe(true);
    expect(store.invoices).toHaveLength(1);
  });
});

describe("paying an invoice", () => {
  it("records the payment once, clears the balance, and sends the customer a receipt and the owner a note", async () => {
    depositOrder();
    const inv = (await issueBalanceInvoice("o1"))!;
    const first = await markInvoicePaid(inv.id, "STRIPE", "cs_test_1");
    expect(first.firstTime).toBe(true);
    expect(store.orders[0].balanceDueCents).toBe(0);
    expect(store.payments).toHaveLength(1);
    expect(store.payments[0]).toMatchObject({ orderId: "o1", amountCents: inv.amountCents, provider: "STRIPE", status: "PAID" });
    expect(store.invoices[0]).toMatchObject({ status: "PAID", paidVia: "STRIPE", stripeSessionId: "cs_test_1" });
    expect(store.emails.map((e) => e.template)).toEqual(["invoice_paid", "owner_new_order"]);
    expect(store.emails[0].to).toBe("buyer@firm.example");
    expect(collectedCents(store.orders[0] as any)).toBe(TOTAL);
  });

  it("does nothing the second time, however many times Stripe or the browser reports it", async () => {
    depositOrder();
    const inv = (await issueBalanceInvoice("o1"))!;
    await markInvoicePaid(inv.id, "STRIPE", "cs_test_1");
    const again = await markInvoicePaid(inv.id, "STRIPE", "cs_test_1");
    expect(again.firstTime).toBe(false);
    expect(store.payments).toHaveLength(1);
    expect(store.emails).toHaveLength(2);
    expect(store.orders[0].balanceDueCents).toBe(0);
  });

  it("raises the order total when extra work is paid, and leaves the balance alone", async () => {
    depositOrder();
    const extra = await issueExtraInvoice({ orderId: "o1", amountCents: 75_000, description: "Extra pages" });
    if (!extra.ok) throw new Error("expected ok");
    await markInvoicePaid(extra.invoice.id, "MANUAL");
    expect(store.orders[0].totalCents).toBe(TOTAL + 75_000);
    expect(store.orders[0].balanceDueCents).toBe(TOTAL - DEPOSIT_CENTS);
    expect(store.finalized).toHaveLength(0);
  });
});

describe("holding delivery until the balance is paid", () => {
  it("holds a finished build, invoices the balance, and emails the customer once", async () => {
    depositOrder();
    expect(await holdDeliveryForBalance("p1", "hold")).toBe(true);
    expect(await holdDeliveryForBalance("p1", "hold")).toBe(true);
    expect(store.invoices).toHaveLength(1);
    expect(store.emails.filter((e) => e.template === "balance_due_ready")).toHaveLength(1);
    expect(store.emails[0].payload.amount).toBe(usd(TOTAL - DEPOSIT_CENTS));
    expect(store.emails[0].payload.invoiceUrl).toContain(store.invoices[0].token);
    expect(store.logs.some((l) => l.event === "project.delivery_held")).toBe(true);
  });

  it("does not hold anything when nothing is owed", async () => {
    depositOrder({ balanceDueCents: 0 });
    expect(await holdDeliveryForBalance("p1", "hold")).toBe(false);
    expect(store.invoices).toHaveLength(0);
    expect(store.emails).toHaveLength(0);
  });

  it("releases the delivery exactly once when the balance is paid", async () => {
    depositOrder();
    await holdDeliveryForBalance("p1", "hold");
    const inv = store.invoices[0];
    await markInvoicePaid(inv.id, "STRIPE", "cs_test_1");
    await markInvoicePaid(inv.id, "STRIPE", "cs_test_1");
    expect(store.finalized).toEqual(["p1"]);
    const receipt = store.emails.find((e) => e.template === "invoice_paid")!;
    expect(receipt.payload.released).toBe(true);
  });

  it("does not release a website build automatically: the owner launches it, and is told it is paid", async () => {
    depositOrder();
    await holdDeliveryForBalance("p1", "notify");
    expect(store.logs.some((l) => l.event === "project.balance_requested")).toBe(true);
    expect(store.logs.some((l) => l.event === "project.delivery_held")).toBe(false);
    expect(store.emails.find((e) => e.template === "balance_due_ready")?.payload.beforeLaunch).toBe(true);
    await markInvoicePaid(store.invoices[0].id, "STRIPE", "cs_test_1");
    expect(store.finalized).toHaveLength(0);
    const owner = store.emails.find((e) => e.template === "owner_new_order")!;
    expect(owner.payload.body).toMatch(/launch it now/i);
  });

  it("does not release anything if the project is not waiting", async () => {
    depositOrder();
    await holdDeliveryForBalance("p1", "hold");
    store.projects[0].state = "COMPLETED";
    await markInvoicePaid(store.invoices[0].id, "STRIPE", "cs_test_1");
    expect(store.finalized).toHaveLength(0);
  });
});

describe("checkout for an invoice", () => {
  it("rejects a link that is not real", async () => {
    const r = await startInvoiceCheckout("f".repeat(48));
    expect(r).toMatchObject({ ok: false, status: 400 });
  });

  it("charges exactly the invoice amount, and is kept apart from order payments", async () => {
    depositOrder();
    const inv = (await issueBalanceInvoice("o1"))!;
    const r = await startInvoiceCheckout(inv.token);
    expect(r).toMatchObject({ ok: true, url: "https://checkout.stripe.test/pay/cs_test_1" });
    const args = store.stripe.created[0];
    expect(args.line_items[0].price_data.unit_amount).toBe(inv.amountCents);
    expect(args.metadata).toEqual({ kind: "invoice", invoiceId: inv.id });
    // The order webhook treats an orderId as "this order is paid in full"; an invoice session must never carry one.
    expect(args.metadata).not.toHaveProperty("orderId");
    expect(args.success_url).toContain("{CHECKOUT_SESSION_ID}");
    expect(args.success_url).toContain(inv.token);
  });

  it("has no card payment in production without Stripe, and pays with a stand-in in development", async () => {
    depositOrder();
    const inv = (await issueBalanceInvoice("o1"))!;
    store.stripe.configured = false;
    const env = process.env as Record<string, string | undefined>;
    const before = env.NODE_ENV;
    env.NODE_ENV = "production";
    expect(await startInvoiceCheckout(inv.token)).toMatchObject({ ok: false, status: 503 });
    expect(store.invoices[0].status).toBe("OPEN");
    env.NODE_ENV = "development";
    expect(await startInvoiceCheckout(inv.token)).toMatchObject({ ok: true, paid: true });
    expect(store.invoices[0]).toMatchObject({ status: "PAID", paidVia: "MOCK" });
    env.NODE_ENV = before;
  });

  it("does not start a second checkout for a paid or cancelled invoice", async () => {
    depositOrder();
    const paid = (await issueBalanceInvoice("o1"))!;
    await markInvoicePaid(paid.id, "MANUAL");
    expect(await startInvoiceCheckout(paid.token)).toMatchObject({ ok: true, paid: true });
    const extra = await issueExtraInvoice({ orderId: "o1", amountCents: 50_000, description: "Extra" });
    if (!extra.ok) throw new Error("expected ok");
    await voidInvoice(extra.invoice.id);
    expect(await startInvoiceCheckout(extra.invoice.token)).toMatchObject({ ok: false, status: 409 });
    expect(store.stripe.created).toHaveLength(0);
  });
});

describe("trusting Stripe, not the browser", () => {
  async function open() {
    depositOrder();
    return (await issueBalanceInvoice("o1"))!;
  }
  const session = (inv: Row, over: Row = {}) => ({ id: "cs_test_1", payment_status: "paid", amount_total: inv.amountCents, metadata: { kind: "invoice", invoiceId: inv.id }, ...over });

  it("confirms a genuine paid session", async () => {
    const inv = await open();
    store.stripe.sessions.cs_test_1 = session(inv);
    expect(await confirmInvoicePayment(inv.id, "cs_test_1")).toBe(true);
    expect(store.invoices[0].status).toBe("PAID");
  });

  it("refuses a session that is unpaid, for a different amount, or for a different invoice", async () => {
    const inv = await open();
    for (const bad of [session(inv, { payment_status: "unpaid" }), session(inv, { amount_total: 100 }), session(inv, { metadata: { kind: "invoice", invoiceId: "other" } }), session(inv, { metadata: { kind: "growth_audit", auditId: "x" } })]) {
      store.stripe.sessions.cs_test_1 = bad;
      expect(await confirmInvoicePayment(inv.id, "cs_test_1")).toBe(false);
    }
    expect(store.invoices[0].status).toBe("OPEN");
    expect(await confirmInvoicePayment(inv.id, "not a session id")).toBe(false);
    expect(store.payments).toHaveLength(0);
  });

  it("handles the webhook the same way, and ignores sessions that are not invoices", async () => {
    const inv = await open();
    const evt = (obj: Row) => ({ type: "checkout.session.completed", data: { object: obj } }) as any;
    await handleInvoiceEvent(evt(session(inv, { amount_total: 5 })));
    await handleInvoiceEvent(evt({ id: "cs_x", payment_status: "paid", amount_total: inv.amountCents, metadata: { orderId: "o1" } }));
    await handleInvoiceEvent({ type: "invoice.paid", data: { object: session(inv) } } as any);
    expect(store.invoices[0].status).toBe("OPEN");
    await handleInvoiceEvent(evt(session(inv)));
    await handleInvoiceEvent(evt(session(inv)));
    expect(store.invoices[0].status).toBe("PAID");
    expect(store.payments).toHaveLength(1);
  });
});

describe("cancelling an invoice", () => {
  it("is allowed for open extra work, and never for the final payment or anything already paid", async () => {
    depositOrder();
    const balance = (await issueBalanceInvoice("o1"))!;
    expect((await voidInvoice(balance.id)).ok).toBe(false);
    const extra = await issueExtraInvoice({ orderId: "o1", amountCents: 50_000, description: "Extra" });
    if (!extra.ok) throw new Error("expected ok");
    expect((await voidInvoice(extra.invoice.id)).ok).toBe(true);
    expect(store.invoices.find((i) => i.id === extra.invoice.id)?.status).toBe("VOID");
    expect((await voidInvoice(extra.invoice.id)).ok).toBe(false);
    const paidExtra = await issueExtraInvoice({ orderId: "o1", amountCents: 60_000, description: "More" });
    if (!paidExtra.ok) throw new Error("expected ok");
    await markInvoicePaid(paidExtra.invoice.id, "MANUAL");
    expect((await voidInvoice(paidExtra.invoice.id)).ok).toBe(false);
    expect((await voidInvoice("missing")).ok).toBe(false);
  });
});
