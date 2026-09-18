import { describe, it, expect } from "vitest";
import { resolveNfcAddonPriceCents } from "@/lib/payments/nfcAddon";
import { supportsQuantity, AD_SPECIAL_CATEGORY } from "@/lib/payments/quantityProducts";
import { businessDays } from "@/lib/payments/deliveryWindow";

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
