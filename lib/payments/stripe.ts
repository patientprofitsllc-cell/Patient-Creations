import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set — use the mock payment path instead");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
}

/**
 * Every webhook endpoint in Stripe has its own signing secret. Accept the
 * primary one (STRIPE_WEBHOOK_SECRET) plus an optional second one
 * (STRIPE_WEBHOOK_SECRET_2), and allow either to hold several secrets separated
 * by commas, so a new endpoint can be added without touching the existing one.
 */
export function webhookSecrets(env: Record<string, string | undefined> = process.env): string[] {
  return [env.STRIPE_WEBHOOK_SECRET, env.STRIPE_WEBHOOK_SECRET_2]
    .flatMap((v) => (v ?? "").split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

export function verifyWebhookSignature(rawBody: string, signature: string): Stripe.Event {
  const stripe = getStripe();
  const secrets = webhookSecrets();
  if (secrets.length === 0) throw new Error("STRIPE_WEBHOOK_SECRET is not set - cannot verify webhook");

  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
