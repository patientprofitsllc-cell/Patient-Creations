import { describe, it, expect } from "vitest";
import { resolveNfcAddonPriceCents, priceNfcAddon } from "@/lib/payments/nfcAddon";

describe("priceNfcAddon (card add-on quantity)", () => {
  // The add-on lists at $55 a card. Add 10 or more and every card is $50.
  const LIST = 5500;
  const website = { slug: "starter-website", category: "Websites" };
  const video = { slug: "ad", category: "Video" };
  const service = { slug: "site", category: "Websites" };

  it("prices one card at the existing offer for its bundle", () => {
    expect(priceNfcAddon(LIST, website, 30000, 1)).toEqual({ lines: [{ quantity: 1, priceCents: 4500 }], totalCents: 4500 });
    expect(priceNfcAddon(LIST, video, 125000, 1).totalCents).toBe(0);
    expect(priceNfcAddon(LIST, service, 200000, 1).totalCents).toBe(5500);
  });

  it("charges $55 for every card under 10", () => {
    expect(priceNfcAddon(LIST, service, 200000, 3)).toEqual({ lines: [{ quantity: 3, priceCents: 5500 }], totalCents: 16500 });
    expect(priceNfcAddon(LIST, service, 200000, 9).totalCents).toBe(9 * 5500);
  });

  it("drops every card to $50 at 10 or more", () => {
    expect(priceNfcAddon(LIST, service, 200000, 10)).toEqual({ lines: [{ quantity: 10, priceCents: 5000 }], totalCents: 50000 });
    expect(priceNfcAddon(LIST, service, 200000, 25).totalCents).toBe(25 * 5000);
  });

  it("never makes a bigger order cost less in total, but lowers the price per card at 10", () => {
    const nine = priceNfcAddon(LIST, service, 200000, 9).totalCents;
    const ten = priceNfcAddon(LIST, service, 200000, 10).totalCents;
    expect(ten).toBeGreaterThan(nine); // one more card for $5 more, so 10 is a natural step up from 9
    expect(ten / 10).toBeLessThan(nine / 9); // and every card is cheaper
  });

  it("gives the website $45 / video free offer to the FIRST card only", () => {
    expect(priceNfcAddon(LIST, website, 30000, 3)).toEqual({
      lines: [
        { quantity: 1, priceCents: 4500 },
        { quantity: 2, priceCents: 5500 },
      ],
      totalCents: 4500 + 2 * 5500,
    });
    expect(priceNfcAddon(LIST, video, 125000, 4).totalCents).toBe(3 * 5500);
  });

  it("keeps the cheaper first-card offer when the bulk price kicks in", () => {
    expect(priceNfcAddon(LIST, website, 30000, 10).totalCents).toBe(4500 + 9 * 5000);
    expect(priceNfcAddon(LIST, video, 125000, 10).totalCents).toBe(9 * 5000);
  });
});
import { supportsQuantity, AD_SPECIAL_CATEGORY } from "@/lib/payments/quantityProducts";
import { businessDays, deliveryLine } from "@/lib/payments/deliveryWindow";

describe("deliveryLine", () => {
  it("labels day and week windows as a delivery, in business days", () => {
    expect(deliveryLine("3-5 days")).toBe("Delivery: 3-5 business days");
    expect(deliveryLine("2-3 weeks")).toBe("Delivery: 2-3 weeks");
    expect(deliveryLine("5-7 business days")).toBe("Delivery: 5-7 business days");
  });

  it("labels sessions and scoped-on-a-call items as a timeline", () => {
    expect(deliveryLine("60 minutes")).toBe("Timeline: 60 minutes");
    expect(deliveryLine("scoped on the call")).toBe("Timeline: scoped on the call");
  });

  it("returns null when there's no turnaround", () => {
    expect(deliveryLine(null)).toBeNull();
    expect(deliveryLine(undefined)).toBeNull();
  });
});

describe("businessDays", () => {
  it("adds 'business' to day windows", () => {
    expect(businessDays("3-5 days")).toBe("3-5 business days");
    expect(businessDays("6-7 days")).toBe("6-7 business days");
    expect(businessDays("1 day")).toBe("1 business day");
  });

  it("leaves windows that already say business days, weeks, and minutes alone", () => {
    expect(businessDays("5-7 business days")).toBe("5-7 business days");
    expect(businessDays("2-3 weeks")).toBe("2-3 weeks");
    expect(businessDays("60 minutes")).toBe("60 minutes");
  });
});

describe("resolveNfcAddonPriceCents", () => {
  const DEFAULT = 7500;

  it("is $45 on the Starter Website", () => {
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "starter-website", category: "Websites" }, 30000)).toBe(4500);
  });

  it("is free on a $1,000+ cinematic video tier", () => {
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "ad", category: "Video" }, 125000)).toBe(0);
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "ad", category: "Video" }, 100000)).toBe(0);
  });

  it("keeps the default price on a video tier under $1,000", () => {
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "ad", category: "Video" }, 80000)).toBe(DEFAULT);
  });

  it("keeps the default price on everything else", () => {
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "site", category: "Websites" }, 200000)).toBe(DEFAULT);
  });
});

describe("supportsQuantity", () => {
  it("is true for merch and the ad special", () => {
    expect(supportsQuantity("Merch")).toBe(true);
    expect(supportsQuantity(AD_SPECIAL_CATEGORY)).toBe(true);
  });

  it("is false for regular service builds and the bundle", () => {
    expect(supportsQuantity("Websites")).toBe(false);
    expect(supportsQuantity("Video")).toBe(false);
    expect(supportsQuantity("Bundle")).toBe(false);
  });
});
