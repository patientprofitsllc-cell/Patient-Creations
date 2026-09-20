import { describe, it, expect } from "vitest";
import {
  computeRushFeeCents,
  loadMultiplier,
  DELIVERY_SPEEDS,
  parseTurnaroundMaxDays,
  parseTurnaroundRangeDays,
  getApplicableSpeeds,
} from "@/lib/payments/deliverySpeed";

describe("DELIVERY_SPEEDS", () => {
  it("matches the requested day windows and surcharge tiers", () => {
    expect(DELIVERY_SPEEDS).toEqual([
      { key: "standard", label: "Standard", days: "1-2 weeks", surchargePct: 0 },
      { key: "priority", label: "Priority", days: "6-7 days", surchargePct: 15 },
      { key: "express", label: "Express", days: "4-5 days", surchargePct: 30 },
      { key: "immediate", label: "Immediate", days: "3-4 days", surchargePct: 50 },
    ]);
  });
});

describe("loadMultiplier", () => {
  it("is 1x with an empty queue", () => {
    expect(loadMultiplier(0)).toBe(1);
  });

  it("scales up 3% per active build", () => {
    expect(loadMultiplier(1)).toBeCloseTo(1.03);
    expect(loadMultiplier(5)).toBeCloseTo(1.15);
  });

  it("caps at +30% for a heavily loaded queue", () => {
    expect(loadMultiplier(10)).toBeCloseTo(1.3);
    expect(loadMultiplier(50)).toBeCloseTo(1.3);
  });
});

describe("computeRushFeeCents", () => {
  it("is always free for standard, regardless of price or load", () => {
    expect(computeRushFeeCents(600000, "standard", 0)).toBe(0);
    expect(computeRushFeeCents(600000, "standard", 20)).toBe(0);
  });

  it("matches the exact figures verified in the checkout UI ($6,000 build, 1 active project)", () => {
    expect(computeRushFeeCents(600000, "priority", 1)).toBe(92700);
    expect(computeRushFeeCents(600000, "express", 1)).toBe(185400);
    expect(computeRushFeeCents(600000, "immediate", 1)).toBe(309000);
  });

  it("rises with queue load for the same speed and price", () => {
    const quiet = computeRushFeeCents(200000, "express", 0);
    const busy = computeRushFeeCents(200000, "express", 10);
    expect(busy).toBeGreaterThan(quiet);
  });

  it("falls back to the standard (zero-fee) speed for an unrecognized key", () => {
    expect(computeRushFeeCents(200000, "warp-speed", 0)).toBe(0);
  });
});

describe("parseTurnaroundMaxDays", () => {
  it("reads the high end of a day range", () => {
    expect(parseTurnaroundMaxDays("3-5 days")).toBe(5);
    expect(parseTurnaroundMaxDays("5-7 days")).toBe(7);
  });

  it("converts weeks to days", () => {
    expect(parseTurnaroundMaxDays("2-3 weeks")).toBe(21);
    expect(parseTurnaroundMaxDays("5-10 weeks")).toBe(70);
  });

  it("treats a call/meeting duration or scoped work as not rush-applicable", () => {
    expect(parseTurnaroundMaxDays("60 minutes")).toBeNull();
    expect(parseTurnaroundMaxDays("scoped on the call")).toBeNull();
    expect(parseTurnaroundMaxDays(null)).toBeNull();
    expect(parseTurnaroundMaxDays(undefined)).toBeNull();
  });
});

describe("getApplicableSpeeds", () => {
  it("never offers a rush tier that is the same speed or slower than a product's own turnaround", () => {
    // 3-5 days: Priority (7d) and Express (5d) are not faster, and Immediate (4d) lands inside the
    // normal window rather than ahead of it, so nothing is offered beyond Standard.
    expect(getApplicableSpeeds("3-5 days").map((s) => s.key)).toEqual(["standard"]);
    expect(getApplicableSpeeds("3-6 days").map((s) => s.key)).toEqual(["standard"]);
  });

  it("offers no rush on a multi-week build, since a 3 to 7 day promise on a 2-3 week build could not be kept", () => {
    for (const t of ["2-3 weeks", "4-8 weeks", "5-10 weeks"]) expect(getApplicableSpeeds(t).map((s) => s.key), t).toEqual(["standard"]);
  });

  it("offers a rush only when it cuts the worst-case time by at most half", () => {
    expect(getApplicableSpeeds("1-2 weeks").map((s) => s.key)).toEqual(["standard", "priority"]); // 14 days: 7 is half
    expect(getApplicableSpeeds("72 hours").map((s) => s.key)).toEqual(["standard"]);
  });

  it("gives the fastest and slowest a range can be", () => {
    expect(parseTurnaroundRangeDays("1-2 weeks")).toEqual({ min: 7, max: 14 });
    expect(parseTurnaroundRangeDays("5-7 business days")).toEqual({ min: 5, max: 7 });
    expect(parseTurnaroundRangeDays("72 hours")).toEqual({ min: 3, max: 3 });
    expect(parseTurnaroundRangeDays("60 minutes")).toBeNull();
  });

  it("reads hours as days, rounded up", () => {
    expect(parseTurnaroundMaxDays("72 hours")).toBe(3);
    expect(parseTurnaroundMaxDays("36 hours")).toBe(2);
  });

  it("offers only the tiers strictly faster than a mid-range turnaround", () => {
    // Rental Listing Film: 5-7 days. Priority is 7d (no faster, excluded); Express (5d) and Immediate (4d) are done by day 5.
    const speeds = getApplicableSpeeds("5-7 days").map((s) => s.key);
    expect(speeds).toEqual(["standard", "express", "immediate"]);
  });

  it("offers no rush tiers for a call/scoped-work estimate", () => {
    expect(getApplicableSpeeds("60 minutes").map((s) => s.key)).toEqual(["standard"]);
    expect(getApplicableSpeeds("scoped on the call").map((s) => s.key)).toEqual(["standard"]);
  });
});
