import { afterEach, describe, expect, it, vi } from "vitest";
import { BNPL, PRICE_CENTS } from "@/lib/pricing/catalog";
import { bnplEnabled, bnplMethodsFor, bnplNotice, createWithBnplFallback, paymentMethodTypesFor } from "@/lib/payments/bnpl";

const ON = { BNPL_ENABLED: "true" };

afterEach(() => vi.restoreAllMocks());

describe("which pay-later methods fit an amount", () => {
  it("offers none below the floor, both from the floor up to Afterpay's limit, Klarna alone up to its limit, and none above", () => {
    expect(bnplMethodsFor(BNPL.minCents - 1)).toEqual([]);
    expect(bnplMethodsFor(BNPL.minCents)).toEqual(["klarna", "afterpay_clearpay"]);
    expect(bnplMethodsFor(BNPL.afterpayMaxCents)).toEqual(["klarna", "afterpay_clearpay"]);
    expect(bnplMethodsFor(BNPL.afterpayMaxCents + 1)).toEqual(["klarna"]);
    expect(bnplMethodsFor(BNPL.klarnaMaxCents)).toEqual(["klarna"]);
    expect(bnplMethodsFor(BNPL.klarnaMaxCents + 1)).toEqual([]);
  });

  it("never offers them on the small things: the audit, NFC cards, ads, and the quick add-ons", () => {
    for (const slug of ["nfc-cards", "ugc-ad-special", "cinematic-ad-special", "strategy-session", "custom-build", "brand-kit", "care-plan"] as const) {
      expect(bnplMethodsFor(PRICE_CENTS[slug]), slug).toEqual([]);
    }
    expect(bnplMethodsFor(1_900)).toEqual([]);
  });

  it("offers them on the sites, the bundle, the lead engine, and the AI builds, within each provider's limit", () => {
    expect(bnplMethodsFor(PRICE_CENTS["starter-website"])).toEqual(["klarna", "afterpay_clearpay"]);
    expect(bnplMethodsFor(PRICE_CENTS.site)).toEqual(["klarna", "afterpay_clearpay"]);
    expect(bnplMethodsFor(PRICE_CENTS["lead-engine"])).toEqual(["klarna", "afterpay_clearpay"]);
    expect(bnplMethodsFor(PRICE_CENTS.agents)).toEqual(["klarna"]);
    expect(bnplMethodsFor(PRICE_CENTS.saas)).toEqual(["klarna"]);
  });

  it("treats a bad amount as nothing to offer", () => {
    expect(bnplMethodsFor(NaN)).toEqual([]);
    expect(bnplMethodsFor(-5)).toEqual([]);
  });
});

describe("turning it on", () => {
  it("is off unless BNPL_ENABLED is exactly true", () => {
    expect(bnplEnabled({})).toBe(false);
    for (const v of ["", "1", "yes", "TRUE", "false", "True"]) expect(bnplEnabled({ BNPL_ENABLED: v }), v).toBe(false);
    expect(bnplEnabled(ON)).toBe(true);
  });

  it("changes nothing while off: no payment method types are sent, so checkout works as it does today", () => {
    expect(paymentMethodTypesFor(PRICE_CENTS.site, {})).toBeUndefined();
    expect(paymentMethodTypesFor(1_900, {})).toBeUndefined();
  });

  it("names card first, then the methods that fit, when on", () => {
    expect(paymentMethodTypesFor(PRICE_CENTS.site, ON)).toEqual(["card", "klarna", "afterpay_clearpay"]);
    expect(paymentMethodTypesFor(PRICE_CENTS.saas, ON)).toEqual(["card", "klarna"]);
  });

  it("names card alone for a small or huge amount, so a method enabled in Stripe cannot appear there", () => {
    expect(paymentMethodTypesFor(1_900, ON)).toEqual(["card"]);
    expect(paymentMethodTypesFor(3_000, ON)).toEqual(["card"]);
    expect(paymentMethodTypesFor(BNPL.klarnaMaxCents + 1, ON)).toEqual(["card"]);
  });
});

describe("what the customer is told", () => {
  it("is nothing when off or when nothing fits", () => {
    expect(bnplNotice(PRICE_CENTS.site, false)).toBeNull();
    expect(bnplNotice(3_000, true)).toBeNull();
  });

  it("names the methods that fit, says they check eligibility, and says they collect the installments", () => {
    const both = bnplNotice(PRICE_CENTS.site, true)!;
    expect(both).toMatch(/Klarna or Afterpay/);
    expect(both).toMatch(/check whether you qualify/);
    expect(both).toMatch(/they, not us, collect the installments/);
    expect(bnplNotice(PRICE_CENTS.saas, true)).toMatch(/Klarna\b/);
    expect(bnplNotice(PRICE_CENTS.saas, true)).not.toMatch(/Afterpay/);
  });
});

describe("if Stripe refuses the pay-later request", () => {
  it("retries once with card only, and the customer still gets a checkout", async () => {
    const calls: (string[] | undefined)[] = [];
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await createWithBnplFallback(
      PRICE_CENTS.site,
      async (types) => {
        calls.push(types);
        if (types && types.length > 1) throw new Error("The payment method type provided: klarna is invalid");
        return { url: "https://checkout.stripe.test/ok" };
      },
      ON,
    );
    expect(result.url).toBe("https://checkout.stripe.test/ok");
    expect(calls).toEqual([["card", "klarna", "afterpay_clearpay"], ["card"]]);
  });

  it("does not retry when nothing optional was requested, and does not hide a real failure", async () => {
    let n = 0;
    await expect(createWithBnplFallback(PRICE_CENTS.site, async () => { n++; throw new Error("card down"); }, {})).rejects.toThrow("card down");
    expect(n).toBe(1);
    n = 0;
    await expect(createWithBnplFallback(1_900, async () => { n++; throw new Error("card down"); }, ON)).rejects.toThrow("card down");
    expect(n).toBe(1);
  });

  it("gives up after the card-only retry fails too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let n = 0;
    await expect(createWithBnplFallback(PRICE_CENTS.site, async () => { n++; throw new Error("stripe down"); }, ON)).rejects.toThrow("stripe down");
    expect(n).toBe(2);
  });

  it("does not retry when the first try works", async () => {
    let n = 0;
    await createWithBnplFallback(PRICE_CENTS.site, async () => { n++; return 1; }, ON);
    expect(n).toBe(1);
  });
});
