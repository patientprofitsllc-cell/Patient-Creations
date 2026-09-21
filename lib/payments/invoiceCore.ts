import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";

// Invoices, the part with no side effects beyond the database. The payment flow is in invoices.ts.

export const baseUrl = () => (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const invoiceNumber = (seq: number) => `PC-${1000 + seq}`;
export const invoiceUrl = (token: string) => `${baseUrl()}/invoice/${token}`;
const newToken = () => randomBytes(24).toString("hex");

export const INVOICE_TOKEN_RE = /^[a-f0-9]{48}$/;
/** An extra invoice is between $1 and $50,000. */
export const MIN_EXTRA_INVOICE_CENTS = 100;
export const MAX_EXTRA_INVOICE_CENTS = 5_000_000;

export { collectedCents } from "@/lib/payments/deposit";

/** The bill for what remains after a deposit. Safe to call twice: it returns the open one if it exists. */
export async function issueBalanceInvoice(orderId: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: { include: { product: { select: { name: true } } } } } });
  if (order.balanceDueCents <= 0) return null;
  const existing = await db.invoice.findFirst({ where: { orderId, kind: "BALANCE", status: "OPEN" } });
  if (existing) return existing;
  const names = order.items.map((i) => i.product.name).join(", ");
  return db.invoice.create({
    data: { orderId, token: newToken(), kind: "BALANCE", description: `Final payment: ${names}`.slice(0, 200), amountCents: order.balanceDueCents },
  });
}

export type ExtraInvoiceResult = { ok: true; invoice: Awaited<ReturnType<typeof db.invoice.create>> } | { ok: false; error: string };

/** Added work the owner bills separately. Paying it raises the order's total. */
export async function issueExtraInvoice(input: { orderId: string; amountCents: number; description: string }): Promise<ExtraInvoiceResult> {
  const description = input.description.trim().slice(0, 200);
  if (!description) return { ok: false, error: "Say what the invoice is for." };
  if (!Number.isInteger(input.amountCents) || input.amountCents < MIN_EXTRA_INVOICE_CENTS || input.amountCents > MAX_EXTRA_INVOICE_CENTS) {
    return { ok: false, error: `The amount must be between ${usd(MIN_EXTRA_INVOICE_CENTS)} and ${usd(MAX_EXTRA_INVOICE_CENTS)}.` };
  }
  const order = await db.order.findUnique({ where: { id: input.orderId }, select: { id: true, status: true } });
  if (!order) return { ok: false, error: "That order was not found." };
  if (order.status !== "PAID") return { ok: false, error: "Only a paid order can be invoiced for extra work." };
  const invoice = await db.invoice.create({ data: { orderId: order.id, token: newToken(), kind: "EXTRA", description, amountCents: input.amountCents } });
  return { ok: true, invoice };
}
