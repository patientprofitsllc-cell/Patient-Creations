import Stripe from "stripe";
import { afterEach, describe, expect, it } from "vitest";
import { verifyWebhookSignature, webhookSecrets } from "@/lib/payments/stripe";

const saved = { key: process.env.STRIPE_SECRET_KEY, a: process.env.STRIPE_WEBHOOK_SECRET, b: process.env.STRIPE_WEBHOOK_SECRET_2 };
afterEach(() => {
  for (const [k, v] of [["STRIPE_SECRET_KEY", saved.key], ["STRIPE_WEBHOOK_SECRET", saved.a], ["STRIPE_WEBHOOK_SECRET_2", saved.b]] as const) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const payload = JSON.stringify({ id: "evt_1", object: "event", type: "invoice.paid", data: { object: {} } });
const sign = (secret: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret });

describe("webhookSecrets", () => {
  it("collects the primary, the second, and comma-separated lists, ignoring blanks", () => {
    expect(webhookSecrets({ STRIPE_WEBHOOK_SECRET: "a", STRIPE_WEBHOOK_SECRET_2: "b" })).toEqual(["a", "b"]);
    expect(webhookSecrets({ STRIPE_WEBHOOK_SECRET: " a , b ,, " })).toEqual(["a", "b"]);
    expect(webhookSecrets({})).toEqual([]);
  });
});

describe("verifyWebhookSignature with more than one endpoint secret", () => {
  it("accepts events signed with either endpoint's secret", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_old";
    process.env.STRIPE_WEBHOOK_SECRET_2 = "whsec_new";
    expect(verifyWebhookSignature(payload, sign("whsec_old")).id).toBe("evt_1");
    expect(verifyWebhookSignature(payload, sign("whsec_new")).id).toBe("evt_1");
  });

  it("still rejects a signature from any other secret", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_old";
    process.env.STRIPE_WEBHOOK_SECRET_2 = "whsec_new";
    expect(() => verifyWebhookSignature(payload, sign("whsec_attacker"))).toThrow();
  });

  it("rejects a tampered body even with a valid secret", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_old";
    delete process.env.STRIPE_WEBHOOK_SECRET_2;
    const header = sign("whsec_old");
    expect(() => verifyWebhookSignature(payload.replace("invoice.paid", "invoice.voided"), header)).toThrow();
  });

  it("fails closed when no secret is configured", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET_2;
    expect(() => verifyWebhookSignature(payload, sign("whsec_old"))).toThrow(/not set/);
  });
});
