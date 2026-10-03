import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { TAX_CODES, createTaxedSession, preTaxCents, taxEnabled, withTax } from "@/lib/payments/tax";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("sales tax through Stripe Tax", () => {
  it("asks Stripe to add tax on top of every price, from the buyer's billing address", () => {
    const p = withTax({ mode: "payment", line_items: [{ price_data: { currency: "usd", unit_amount: 100 }, quantity: 1 }] }) as Record<string, any>;
    expect(p.automatic_tax).toEqual({ enabled: true });
    expect(p.billing_address_collection).toBe("required");
    expect((p.line_items![0].price_data as Record<string, unknown>).tax_behavior).toBe("exclusive");
  });

  it("never stops a sale: if Stripe refuses tax, the same checkout opens without it and the owner is told", async () => {
    const calls: Record<string, unknown>[] = [];
    const reasons: string[] = [];
    const out = await createTaxedSession(
      { mode: "payment", line_items: [] } as Record<string, any>,
      async (p) => {
        calls.push(p);
        if (p.automatic_tax) throw new Error("Stripe Tax has not been activated");
        return "session";
      },
      (r) => void reasons.push(r),
      {},
    );
    expect(out).toBe("session");
    expect(calls.map((c) => Boolean(c.automatic_tax))).toEqual([true, false]);
    expect(reasons[0]).toContain("not been activated");
  });

  it("doesn't swallow errors that have nothing to do with tax", async () => {
    await expect(
      createTaxedSession({ line_items: [] } as Record<string, any>, async () => { throw new Error("klarna is not available"); }, () => {}, {}),
    ).rejects.toThrow("klarna");
  });

  it("is on unless STRIPE_AUTOMATIC_TAX=off", () => {
    expect(taxEnabled({})).toBe(true);
    expect(taxEnabled({ STRIPE_AUTOMATIC_TAX: "off" })).toBe(false);
  });

  it("checks payments against the price before tax, so taxed audits and invoices still count as paid", () => {
    expect(preTaxCents({ amount_total: 2_150, total_details: { amount_tax: 150 } })).toBe(2_000);
    expect(preTaxCents({ amount_total: 2_000 })).toBe(2_000);
    for (const f of ["lib/audit/paid.ts", "lib/payments/invoices.ts"]) {
      expect(read(f), f).not.toContain("amount_total !==");
      expect(read(f), f).toContain("preTaxCents(s) !==");
    }
  });

  it("is used by every Stripe checkout the site starts, with cards and shipping coded correctly", () => {
    for (const f of ["app/api/checkout/route.ts", "app/api/care/checkout/route.ts", "app/api/ads/checkout/route.ts", "lib/audit/paid.ts", "lib/payments/invoices.ts"]) {
      expect(read(f), f).toContain("createTaxedSession(");
      expect(read(f), f).not.toMatch(/=> stripe\.checkout\.sessions\.create\(\{|getStripe\(\)\.checkout\.sessions\.create\(\{/);
    }
    const main = read("app/api/checkout/route.ts");
    expect(main).toContain("tax_code: TAX_CODES.shipping");
    expect(main).toContain("tax_code: TAX_CODES.physical");
    expect(TAX_CODES.shipping).toBe("txcd_92010001");
  });
});
