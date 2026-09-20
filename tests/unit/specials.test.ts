import { describe, it, expect } from "vitest";
import { resolveNfcAddonPriceCents, priceNfcAddon, includedCardCount } from "@/lib/payments/nfcAddon";

describe("priceNfcAddon (card add-on quantity)", () => {
  // Cards are a flat $30 each: no volume special and no website special.
  const LIST = 3000;
  const website = { slug: "starter-website", category: "Websites" };
  const video = { slug: "ad", category: "Video" };
  const service = { slug: "site", category: "Websites" };

  it("charges $30 for one card on anything, including the Starter Website", () => {
    expect(priceNfcAddon(LIST, website, 30000, 1)).toEqual({ lines: [{ quantity: 1, priceCents: 3000 }], totalCents: 3000 });
    expect(priceNfcAddon(LIST, service, 200000, 1).totalCents).toBe(3000);
  });

  it("keeps the first card free on a $1,000+ cinematic video tier", () => {
    expect(priceNfcAddon(LIST, video, 125000, 1).totalCents).toBe(0);
    expect(priceNfcAddon(LIST, video, 125000, 4).totalCents).toBe(3 * 3000);
  });

  it("charges the same $30 for every card at any quantity, so a bigger order never costs less in total", () => {
    for (const qty of [2, 3, 9, 10, 25, 100]) {
      expect(priceNfcAddon(LIST, service, 200000, qty)).toEqual({ lines: [{ quantity: qty, priceCents: 3000 }], totalCents: qty * 3000 });
    }
  });

  it("never lets the bulk constant raise a price above the list price", () => {
    expect(priceNfcAddon(2000, service, 200000, 10).totalCents).toBe(10 * 2000);
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
  const DEFAULT = 3000;

  it("is the normal price on the Starter Website (there is no separate website price)", () => {
    expect(resolveNfcAddonPriceCents(DEFAULT, { slug: "starter-website", category: "Websites" }, 30000)).toBe(DEFAULT);
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

describe("includedCardCount", () => {
  it("says how many NFC cards ship in the price: 3 with the bundle, 5 with the Basic Package, none elsewhere", () => {
    expect(includedCardCount("all-in-one-bundle")).toBe(3);
    expect(includedCardCount("basic-package")).toBe(5);
    for (const slug of ["site", "starter-website", "ad", "rental-listing-film", "nfc-cards", "", null, undefined]) expect(includedCardCount(slug)).toBe(0);
  });
});
