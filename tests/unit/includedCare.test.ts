import { describe, expect, it } from "vitest";
import { includedCareEnds, includedCareMonths } from "@/lib/care/included";
import { PRICE_CENTS, SPECIAL_CARE_MONTHS, usd } from "@/lib/pricing/catalog";
import { renderTemplate } from "@/lib/email/templates";

describe("Website Care that comes with an order", () => {
  it("comes with the Website Special and the bundle, and nothing else", () => {
    expect(includedCareMonths(["website-special"])).toBe(SPECIAL_CARE_MONTHS);
    expect(includedCareMonths(["all-in-one-bundle", "nfc-card-addon"])).toBe(SPECIAL_CARE_MONTHS);
    for (const slug of ["site", "lead-engine", "ugc-ad-special", "nfc-cards"]) expect(includedCareMonths([slug]), slug).toBe(0);
  });

  it("is only for the project's first care plan, so cancelling and restarting doesn't give more free months", () => {
    expect(includedCareMonths(["website-special"], true)).toBe(0);
  });

  it("ends that many calendar months after it starts", () => {
    expect(includedCareEnds(new Date(2026, 9, 2), 3)).toEqual(new Date(2027, 0, 2));
  });

  it("is what the launch email says, and other customers get the plain offer", () => {
    const withCare = renderTemplate("website_live", { projectName: "Joe's", liveUrl: "https://joe.test", statusUrl: "https://x/status/t", freeCareMonths: 3 });
    expect(withCare.body).toContain("Your order includes 3 months of Website Care");
    expect(withCare.body).toContain(`then it's ${usd(PRICE_CENTS["care-plan"])} a month`);
    const plain = renderTemplate("website_live", { projectName: "Joe's", liveUrl: "https://joe.test", statusUrl: "https://x/status/t", freeCareMonths: 0 });
    expect(plain.body).toContain(`Website Care is ${usd(PRICE_CENTS["care-plan"])} a month`);
    expect(plain.body).not.toContain("includes 3 months");
  });
});
