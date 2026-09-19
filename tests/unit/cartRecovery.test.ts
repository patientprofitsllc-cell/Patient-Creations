import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  OFFER_VALID_MS,
  VISIT_GAP_MS,
  countVisits,
  decideOffer,
  makeOfferToken,
  verifyOfferToken,
} from "@/lib/funnel/cartRecovery";
import { resolveDiscount } from "@/lib/payments/pricing";
import { renderTemplate } from "@/lib/email/templates";

const HOUR = 3_600_000;
const NOW = Date.UTC(2026, 8, 19, 12, 0, 0);
const VISITOR = "a1b2c3d4e5f60718293a4b5c";

describe("countVisits (the rule of 3)", () => {
  it("counts the current visit even before it has been recorded", () => {
    expect(countVisits([], NOW)).toBe(1);
  });

  it("does not count a page refresh as leaving and coming back", () => {
    const times = [NOW - 10 * 60_000, NOW - 5 * 60_000];
    expect(countVisits(times, NOW)).toBe(1);
  });

  it("counts visits separated by more than 30 minutes", () => {
    expect(countVisits([NOW - 3 * HOUR, NOW - HOUR], NOW)).toBe(3);
    expect(countVisits([NOW - 3 * HOUR, NOW - HOUR, NOW - 60_000], NOW)).toBe(3);
  });

  it("treats a gap of exactly 30 minutes as the same visit, and 31 minutes as a new one", () => {
    expect(countVisits([NOW - VISIT_GAP_MS, NOW], NOW)).toBe(1);
    expect(countVisits([NOW - VISIT_GAP_MS - 60_000, NOW], NOW)).toBe(2);
  });

  it("ignores input order", () => {
    expect(countVisits([NOW - HOUR, NOW - 5 * HOUR, NOW - 3 * HOUR], NOW)).toBe(4);
  });
});

describe("decideOffer", () => {
  it("makes no offer before the third visit", () => {
    expect(decideOffer({ visits: 1, used: false, now: NOW })).toEqual({ eligible: false, reason: "not_yet" });
    expect(decideOffer({ visits: 2, used: false, now: NOW })).toEqual({ eligible: false, reason: "not_yet" });
  });

  it("offers on the third visit, valid for 72 hours from now", () => {
    expect(decideOffer({ visits: 3, used: false, now: NOW })).toEqual({ eligible: true, isNew: true, expiresAt: NOW + OFFER_VALID_MS });
  });

  it("keeps showing the same offer, with the same end time, until it expires", () => {
    const issuedAt = NOW - 10 * HOUR;
    expect(decideOffer({ visits: 5, issuedAt, used: false, now: NOW })).toEqual({ eligible: true, isNew: false, expiresAt: issuedAt + OFFER_VALID_MS });
  });

  it("never re-offers after it expires, so it cannot be farmed by returning forever", () => {
    expect(decideOffer({ visits: 9, issuedAt: NOW - 73 * HOUR, used: false, now: NOW })).toEqual({ eligible: false, reason: "expired" });
  });

  it("never shows it again once used", () => {
    expect(decideOffer({ visits: 9, issuedAt: NOW - HOUR, used: true, now: NOW })).toEqual({ eligible: false, reason: "used" });
  });
});

describe("offer token", () => {
  const original = process.env.NEXTAUTH_SECRET;
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-for-offer-tokens";
  });
  afterEach(() => {
    process.env.NEXTAUTH_SECRET = original;
  });

  it("verifies for the visitor it was issued to, until it expires", () => {
    const token = makeOfferToken(VISITOR, NOW + HOUR)!;
    expect(verifyOfferToken(token, VISITOR, NOW)).toBe(true);
    expect(verifyOfferToken(token, VISITOR, NOW + 2 * HOUR)).toBe(false);
  });

  it("is refused for a different visitor", () => {
    const token = makeOfferToken(VISITOR, NOW + HOUR)!;
    expect(verifyOfferToken(token, "0000000000000000aaaa", NOW)).toBe(false);
  });

  it("is refused when the end time is edited to extend it", () => {
    const token = makeOfferToken(VISITOR, NOW + HOUR)!;
    const [, sig] = token.split(".");
    const extended = `${Math.floor((NOW + 500 * HOUR) / 1000)}.${sig}`;
    expect(verifyOfferToken(extended, VISITOR, NOW)).toBe(false);
  });

  it("is refused when made up, malformed, or signed with a different secret", () => {
    for (const bad of ["", "abc", "1.2.3", `${Math.floor((NOW + HOUR) / 1000)}.`, `${Math.floor((NOW + HOUR) / 1000)}.notasignature`, null, undefined, 42]) {
      expect(verifyOfferToken(bad, VISITOR, NOW), String(bad)).toBe(false);
    }
    const token = makeOfferToken(VISITOR, NOW + HOUR)!;
    process.env.NEXTAUTH_SECRET = "a-different-secret";
    expect(verifyOfferToken(token, VISITOR, NOW)).toBe(false);
  });

  it("cannot be issued at all when the server has no secret", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(makeOfferToken(VISITOR, NOW + HOUR)).toBeNull();
    expect(verifyOfferToken("123456789.abcd", VISITOR, NOW)).toBe(false);
  });
});

describe("the discount itself", () => {
  it("is 5% with a verified offer", async () => {
    expect(await resolveDiscount(undefined, 30000, { recoveryOffer: true })).toEqual({ discountCents: 1500, couponApplied: "COMEBACK5" });
  });

  it("cannot be claimed by typing the code, since it is not a public coupon", async () => {
    expect((await resolveDiscount("COMEBACK5", 30000)).discountCents).toBe(0);
    expect((await resolveDiscount("comeback5", 30000, {})).discountCents).toBe(0);
  });

  it("does not stack with a coupon: the customer gets whichever saves more", async () => {
    expect(await resolveDiscount("LAUNCH10", 30000, { recoveryOffer: true })).toEqual({ discountCents: 3000, couponApplied: "LAUNCH10" });
  });

  it("leaves ordinary coupons alone", async () => {
    expect(await resolveDiscount("LAUNCH10", 30000)).toEqual({ discountCents: 3000, couponApplied: "LAUNCH10" });
    expect(await resolveDiscount("NOPE", 30000)).toEqual({ discountCents: 0, couponApplied: undefined });
  });
});

describe("thank-you emails", () => {
  it("thank the customer, say what happens next, and give one useful tip", () => {
    const withIntake = renderTemplate("purchase_confirmation", { projectName: "Joe's Cuts", intakeUrl: "https://x.test/intake/abc", statusUrl: "https://x.test/status/abc" });
    expect(withIntake.subject).toMatch(/^Thank you/);
    expect(withIntake.body).toMatch(/Thank you for choosing Patient Creations/);
    expect(withIntake.body).toContain("https://x.test/intake/abc");
    expect(withIntake.body).toMatch(/What happens next/);
    expect(withIntake.body).toMatch(/specific answers/i);
    expect(withIntake.body).toMatch(/72-hour target/);

    const other = renderTemplate("purchase_confirmation", { projectName: "Ad", statusUrl: "https://x.test/status/abc" });
    expect(other.body).toMatch(/Thank you for choosing Patient Creations/);
  });

  it("thanks a manual-payment customer straight away and says what comes next", () => {
    const m = renderTemplate("order_received", { summary: "Quick Business Website", paymentLabel: "Zelle", intakeUrl: "https://x.test/intake/abc" });
    expect(m.subject).toMatch(/Thank you/);
    expect(m.body).toContain("Quick Business Website");
    expect(m.body).toMatch(/Zelle instructions/);
    expect(m.body).toContain("https://x.test/intake/abc");
    const plain = renderTemplate("order_received", { summary: "Ad", paymentLabel: "Zelle" });
    expect(plain.body).not.toContain("intake");
  });

  it("uses no dashes as punctuation and promises no invented results", () => {
    const all = [
      renderTemplate("purchase_confirmation", { projectName: "X", intakeUrl: "u", statusUrl: "s" }),
      renderTemplate("purchase_confirmation", { projectName: "X" }),
      renderTemplate("order_received", { summary: "X", paymentLabel: "Zelle", intakeUrl: "u" }),
    ];
    for (const m of all) {
      expect(m.subject + m.body).not.toMatch(/[—–]/);
      expect(m.subject + m.body).not.toMatch(/guarantee|\d+%|rank/i);
    }
  });
});
