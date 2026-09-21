import { BNPL } from "@/lib/pricing/catalog";

// Buy now, pay later (Klarna and Afterpay) at card checkout. The customer pays Klarna or Afterpay over time; we are paid up
// front by Stripe, less a higher fee than a card. Rules, all pure so they are tested:
//   - It is OFF until BNPL_ENABLED=true is set, so nothing changes until the owner has turned the methods on in Stripe.
//   - It is only offered on a one-time card checkout whose amount is inside the range (see BNPL in the price catalog).
//   - When it is on but the amount is outside the range, card is named explicitly, so a method switched on in the Stripe
//     dashboard cannot appear on a small order (a $19 audit) where the fee would eat the sale.
//   - If Stripe refuses the request for any reason (a method not activated, a limit changed), the checkout is retried with
//     card only, so a customer is never sent an error because of an optional payment method.

export type BnplMethod = "klarna" | "afterpay_clearpay";

export const bnplEnabled = (env: Record<string, string | undefined> = process.env): boolean => env.BNPL_ENABLED === "true";

/** The methods whose limits this amount fits. */
export function bnplMethodsFor(amountCents: number): BnplMethod[] {
  if (!Number.isFinite(amountCents) || amountCents < BNPL.minCents) return [];
  const out: BnplMethod[] = [];
  if (amountCents <= BNPL.klarnaMaxCents) out.push("klarna");
  if (amountCents <= BNPL.afterpayMaxCents) out.push("afterpay_clearpay");
  return out;
}

/**
 * The payment method types to send to Stripe for a one-time payment, or undefined to leave it to Stripe as today (BNPL off).
 * Wallets such as Apple Pay and Google Pay come with "card".
 */
export function paymentMethodTypesFor(amountCents: number, env: Record<string, string | undefined> = process.env): string[] | undefined {
  if (!bnplEnabled(env)) return undefined;
  return ["card", ...bnplMethodsFor(amountCents)];
}

/** What to tell a customer before they pay, or null when there is nothing to say. */
export function bnplNotice(amountCents: number, enabled: boolean): string | null {
  if (!enabled) return null;
  const methods = bnplMethodsFor(amountCents);
  if (methods.length === 0) return null;
  const names = methods.map((m) => (m === "klarna" ? "Klarna" : "Afterpay"));
  return `You can also split this into payments with ${names.join(" or ")} when you pay by card. They will check whether you qualify, and they, not us, collect the installments.`;
}

/**
 * Creates a Stripe session with the BNPL-aware types, and if Stripe refuses that, once more with card only.
 * `create` receives the types to use (undefined means "leave it to Stripe").
 */
export async function createWithBnplFallback<T>(amountCents: number, create: (types: string[] | undefined) => Promise<T>, env: Record<string, string | undefined> = process.env): Promise<T> {
  const types = paymentMethodTypesFor(amountCents, env);
  try {
    return await create(types);
  } catch (err) {
    if (!types || types.length <= 1) throw err; // nothing optional was in the request, so a retry would fail the same way
    console.error("checkout with pay-later methods failed, retrying with card only", err instanceof Error ? err.message : err);
    return create(["card"]);
  }
}
