import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { firstOffers, nextOffers, type LadderContext, type OfferId } from "@/lib/journey/ladder";
import { currentStepIndex } from "@/components/journey/PurchaseJourney";
import { FUNNEL_EVENTS } from "@/lib/analytics/funnel";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const ids = (ctx: Partial<LadderContext>) => nextOffers({ justBought: [], owned: [], statusPath: "/status/abc", ...ctx }).map((o) => o.id);
const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("the customer ladder", () => {
  it("offers a website buyer NFC cards, a launch ad, and website care, then monthly ads (three at most)", () => {
    expect(ids({ justBought: ["starter-website"], owned: ["starter-website"] })).toEqual<OfferId[]>(["nfc-cards", "launch-ad", "care-plan"]);
    expect(ids({ justBought: ["site"], owned: ["site"] })).toEqual<OfferId[]>(["nfc-cards", "launch-ad", "care-plan"]);
  });

  it("offers the launch bundle buyer monthly ads and website care", () => {
    expect(ids({ justBought: ["all-in-one-bundle"], owned: ["all-in-one-bundle"] })).toEqual<OfferId[]>(["monthly-ads", "care-plan", "lead-engine"]);
  });

  it("offers someone who bought ads the Lead Engine, and monthly ads", () => {
    expect(ids({ justBought: ["ugc-ad-special"], owned: ["ugc-ad-special"] })).toEqual<OfferId[]>(["lead-engine", "monthly-ads", "website"]);
    expect(ids({ justBought: ["cinematic-ad-special"], owned: ["cinematic-ad-special"] })).toContain("lead-engine");
  });

  it("offers a Monthly Ads subscriber the Lead Engine, and never the plan they already have", () => {
    const list = ids({ owned: ["starter-website"], hasAdsPlan: true, justBought: [] });
    expect(list).not.toContain("monthly-ads");
    expect(ids({ justBought: [], owned: [], hasAdsPlan: true })).toEqual<OfferId[]>(["lead-engine", "website"]);
  });

  it("offers a Lead Engine buyer AI follow-up, and AI buyers more agents or automation", () => {
    expect(ids({ justBought: ["lead-engine"], owned: ["lead-engine"] })[0]).toBe("ai-followup");
    expect(ids({ justBought: ["saas"], owned: ["saas"] })).toEqual<OfferId[]>(["more-agents"]);
    const agents = nextOffers({ justBought: ["agents"], owned: ["agents"] });
    expect(agents.map((o) => o.id)).toEqual(["more-agents"]);
    expect(agents[0].href).toBe("/checkout?product=automation-add-on");
    expect(nextOffers({ justBought: ["saas"], owned: ["saas"] })[0].href).toBe("/checkout?product=agents");
  });

  it("offers a card-only buyer a website, since cards need somewhere to point", () => {
    expect(ids({ justBought: ["nfc-google-review"], owned: ["nfc-google-review"] })).toEqual<OfferId[]>(["website", "launch-ad"]);
  });

  it("never offers anything the customer already owns or has just bought", () => {
    const list = ids({ justBought: ["starter-website"], owned: ["starter-website", "nfc-card-addon", "ugc-ad-special"], hasCarePlan: true });
    expect(list).not.toContain("nfc-cards");
    expect(list).not.toContain("launch-ad");
    expect(list).not.toContain("care-plan");
    expect(list).toEqual<OfferId[]>(["monthly-ads"]);
  });

  it("does not try to sell during a consultation, or when nothing is recognized", () => {
    expect(ids({ justBought: ["strategy-session"], owned: ["strategy-session"] })).toEqual([]);
    expect(ids({ justBought: ["custom-build"], owned: ["custom-build"] })).toEqual([]);
    expect(ids({ justBought: ["something-new"], owned: ["something-new"] })).toEqual([]);
  });

  it("skips website care when there is no project page to start it from", () => {
    expect(ids({ justBought: ["starter-website"], owned: ["starter-website"], statusPath: null })).not.toContain("care-plan");
  });

  it("looks back at what is owned when nothing was just bought, and never repeats an offer", () => {
    const list = ids({ justBought: [], owned: ["site"] });
    expect(list[0]).toBe("nfc-cards");
    expect(new Set(list).size).toBe(list.length);
    for (const ctx of [{ justBought: ["site"] }, { justBought: ["ugc-ad-special"] }, { justBought: ["all-in-one-bundle"] }]) expect(ids(ctx).length).toBeLessThanOrEqual(3);
  });

  it("reads every price from the price list, and promises no results", () => {
    const all = [...nextOffers({ justBought: ["starter-website"], owned: [] , statusPath: "/status/x"}), ...nextOffers({ justBought: ["lead-engine"], owned: [] }), ...nextOffers({ justBought: ["ugc-ad-special"], owned: [] }), ...firstOffers()];
    const byId = Object.fromEntries(all.map((o) => [o.id, o]));
    expect(byId["nfc-cards"].priceLabel).toBe(`${usd(PRICE_CENTS["nfc-card-addon"])} each`);
    expect(byId["launch-ad"].priceLabel).toBe(usd(PRICE_CENTS["ugc-ad-special"]));
    expect(byId["care-plan"].priceLabel).toBe(`${usd(PRICE_CENTS["care-plan"])} a month`);
    expect(byId["lead-engine"].priceLabel).toBe(`from ${usd(PRICE_CENTS["lead-engine"])}`);
    expect(byId["monthly-ads"].priceLabel).toBe(`from ${usd(PRICE_CENTS["ads-monthly-300"])} a month`);
    for (const o of all) {
      expect(`${o.title} ${o.why}`, o.id).not.toMatch(/guarantee|proven|more sales|more customers|double|triple|results/i);
      expect(o.why, o.id).not.toMatch(/[—–]/);
      expect(o.href, o.id).toMatch(/^\/(checkout\?product=[a-z0-9-]+|monthly-ads|status\/.+)$/);
    }
  });

  it("does not claim website monitoring, which does not exist", () => {
    const care = nextOffers({ justBought: ["site"], owned: [], statusPath: "/status/x" }).find((o) => o.id === "care-plan")!;
    expect(care.why).not.toMatch(/monitor/i);
    expect(care.why).toMatch(/once your website is live/);
  });

  it("gives someone with no purchases the first rung: website, cards, a launch ad", () => {
    expect(firstOffers().map((o) => o.id)).toEqual<OfferId[]>(["website", "nfc-cards", "launch-ad"]);
  });
});

describe("what happens next after paying", () => {
  it("puts a website buyer on the intake until it is finished, then on the build", () => {
    expect(currentStepIndex("website", true)).toBe(1);
    expect(currentStepIndex("website", false)).toBe(2);
    expect(currentStepIndex("project", false)).toBe(1);
    expect(currentStepIndex("cards", false)).toBe(1);
  });

  it("is on the confirmation page, and the next steps are counted", () => {
    const page = read("app/checkout/success/page.tsx");
    expect(page).toContain("<PurchaseJourney");
    expect(page).toContain("<NextStepCards");
    expect(page).toContain("nextOffers(");
    for (const e of ["upsell_view", "upsell_click"]) expect(FUNNEL_EVENTS as readonly string[]).toContain(e);
    expect(read("app/checkout/upsell/page.tsx")).toContain("nextOffers(");
  });
});
