import { describe, it, expect } from "vitest";
import { computeCommissionCents, COMMISSION_RATE } from "@/lib/referrals/fraud";

describe("computeCommissionCents", () => {
  it("computes 10% of the order total", () => {
    expect(COMMISSION_RATE).toBe(0.1);
    expect(computeCommissionCents(250000)).toBe(25000);
  });

  it("rounds to the nearest cent", () => {
    expect(computeCommissionCents(999)).toBe(100);
  });

  it("returns 0 for a 0 order total", () => {
    expect(computeCommissionCents(0)).toBe(0);
  });
});
