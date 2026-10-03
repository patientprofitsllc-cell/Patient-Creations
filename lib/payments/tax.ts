// Sales tax through Stripe Tax. Every Stripe checkout the site starts asks Stripe to work out the tax from the buyer's
// billing address and add it on top of the price ("exclusive"), so the buyer covers it. Turning Stripe Tax on in the
// dashboard isn't enough by itself: each session has to ask for it, which is what withTax does.
//
// If Stripe refuses a taxed session (for example tax isn't fully set up in the dashboard yet), checkout still opens,
// without tax, and the owner is told, so a tax setting can never stop a sale. STRIPE_AUTOMATIC_TAX=off turns it off.

/** Stripe tax codes for lines that aren't the account's default (services). */
export const TAX_CODES = {
  /** Shipping charges. */
  shipping: "txcd_92010001",
  /** Physical goods, like Business Cards. */
  physical: "txcd_99999999",
} as const;

export const taxEnabled = (env: Record<string, string | undefined> = process.env) => (env.STRIPE_AUTOMATIC_TAX ?? "on").toLowerCase() !== "off";

type LineItem = { price_data?: Record<string, unknown>; [k: string]: unknown };
type SessionParams = { line_items?: LineItem[]; [k: string]: unknown };

/** The same session, asking Stripe to add tax on top of every price, from the buyer's billing address. */
export function withTax<P extends SessionParams>(params: P): P {
  return {
    ...params,
    line_items: params.line_items?.map((li) => (li.price_data ? { ...li, price_data: { ...li.price_data, tax_behavior: "exclusive" } } : li)),
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
  };
}

/** Creates a Checkout Session with tax; if Stripe refuses it, creates the same session without tax and reports why. */
export async function createTaxedSession<P extends SessionParams, T>(
  params: P,
  create: (p: P) => Promise<T>,
  onFallback: (reason: string) => Promise<void> | void = () => {},
  env: Record<string, string | undefined> = process.env,
): Promise<T> {
  if (!taxEnabled(env)) return create(params);
  try {
    return await create(withTax(params));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    // Only a refusal about tax is retried without it; anything else (a payment method, a bad amount) is not ours to absorb.
    if (!/tax/i.test(reason)) throw err;
    console.error("Stripe refused a taxed checkout, opening it without tax:", reason);
    await Promise.resolve(onFallback(reason)).catch(() => {});
    return create(params);
  }
}

/** What a paid session came to before tax: the amount our own records (audits, invoices) expect. */
export function preTaxCents(session: { amount_total?: number | null; total_details?: { amount_tax?: number | null } | null }) {
  return (session.amount_total ?? 0) - (session.total_details?.amount_tax ?? 0);
}

/** Tells the owner (dashboard note) that a checkout opened without tax, and why. */
export async function reportTaxFallback(reason: string) {
  const { notifyAdmin } = await import("@/lib/security/notify");
  await notifyAdmin(`A checkout opened without sales tax because Stripe refused the tax settings: ${reason.slice(0, 300)}. Check Stripe Tax (origin address and registrations) in the Stripe dashboard.`);
}
