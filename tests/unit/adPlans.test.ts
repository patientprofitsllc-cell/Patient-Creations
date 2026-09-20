import { describe, expect, it } from "vitest";
import {
  AD_AI_NOTE,
  AD_PLANS,
  AD_PLAN_SLUGS,
  AD_TIMING_NOTE,
  adTimingNoteFor,
  planDeliveryTarget,
  BRIEF_FIELDS,
  QUOTED_SEPARATELY,
  cleanBrief,
  getAdPlan,
  isAdPlanSlug,
  periodLabel,
  planDescription,
  planIncludes,
  planNotIncluded,
  perAdDollars,
  planQuota,
} from "@/lib/ads/plans";
import { buildAdPlanAlert } from "@/lib/alerts/ownerAlerts";
import { renderTemplate } from "@/lib/email/templates";

const [starter, growth, scale] = AD_PLANS;
const allCustomerText = () =>
  [
    ...AD_PLANS.flatMap((p) => [p.name, p.tagline, p.bestFor, planDescription(p), ...planIncludes(p), ...planNotIncluded(p)]),
    ...QUOTED_SEPARATELY,
    AD_TIMING_NOTE,
    AD_AI_NOTE,
    ...BRIEF_FIELDS.flatMap((f) => [f.label, f.hint]),
    renderTemplate("ads_plan_started", { planName: "Monthly Ads Growth", businessName: "Test", manageUrl: "https://x.test/m/abc" }).body,
  ].join("\n");

describe("Monthly Ads plans", () => {
  it("are the three plans at 300, 500 and 1000 dollars a month", () => {
    expect(AD_PLANS.map((p) => p.fallbackPriceCents)).toEqual([30000, 50000, 100000]);
    expect(AD_PLANS.map((p) => p.slug)).toEqual([...AD_PLAN_SLUGS]);
    expect(isAdPlanSlug("ads-monthly-500")).toBe(true);
    expect(isAdPlanSlug("care-plan")).toBe(false);
    expect(getAdPlan("ads-monthly-1000")?.name).toBe("Monthly Ads Scale");
  });

  it("give more for more money, and every higher plan includes everything the lower one does", () => {
    for (const [lo, hi] of [[starter, growth], [growth, scale]] as const) {
      for (const k of Object.keys(lo.counts) as (keyof typeof lo.counts)[]) {
        const a = lo.counts[k];
        const b = hi.counts[k];
        if (typeof a === "number") expect(b, k).toBeGreaterThanOrEqual(a);
        else expect(Number(b), k).toBeGreaterThanOrEqual(Number(a));
      }
      expect(planQuota(hi).items).toBeGreaterThan(planQuota(lo).items);
    }
  });

  it("state exactly what is delivered, with the right counts and correct singular and plural", () => {
    expect(planIncludes(starter)[0]).toMatch(/^10 short video ads/);
    expect(planIncludes(growth)[0]).toMatch(/^20 short video ads/);
    expect(planIncludes(scale)[0]).toMatch(/^40 short video ads/);
    expect(planIncludes(growth).join("\n")).toMatch(/1 cinematic showcase video \(up to 30 seconds/);
    expect(planIncludes(scale).join("\n")).toMatch(/3 cinematic showcase videos \(up to 30 seconds/);
    expect(planIncludes(scale).join("\n")).toMatch(/1 quick 3D product visual/);
    expect(planIncludes(scale).join("\n")).toMatch(/1 one-page landing page/);
    expect(planIncludes(scale).join("\n")).toMatch(/One 30-minute planning call/);
    expect(planIncludes(starter).join("\n")).not.toMatch(/cinematic|3D|landing|planning call/);
    expect(planIncludes(starter).join("\n")).toMatch(/1 revision round on/);
    expect(planIncludes(growth).join("\n")).toMatch(/2 revision rounds on/);
  });

  it("get cheaper per short ad as the plan grows, and the arithmetic is exact", () => {
    expect(AD_PLANS.map((p) => perAdDollars(p.fallbackPriceCents, p))).toEqual([30, 25, 25]);
    expect(perAdDollars(starter.fallbackPriceCents, starter)).toBeGreaterThan(perAdDollars(growth.fallbackPriceCents, growth));
    expect(perAdDollars(growth.fallbackPriceCents, growth)).toBeGreaterThanOrEqual(perAdDollars(scale.fallbackPriceCents, scale));
    expect(AD_PLANS.map((p) => planQuota(p).items)).toEqual([10, 21, 45]);
  });

  it("cap creator-style ads at part of the short ads, never more than all of them", () => {
    for (const p of AD_PLANS) expect(p.counts.creatorStyleUpTo).toBeLessThanOrEqual(p.counts.shortAds);
  });

  it("always say what is not included, including ad spend and any promise of results", () => {
    for (const p of AD_PLANS) {
      const t = planNotIncluded(p).join("\n");
      expect(t, p.slug).toMatch(/Ad spend/);
      expect(t, p.slug).toMatch(/promise of sales, leads, or results/);
      expect(t, p.slug).toMatch(/AI-generated/);
      expect(t, p.slug).toMatch(/Music rights/);
      expect(t, p.slug).toMatch(/Carrying unused/);
    }
    expect(planNotIncluded(starter).join("\n")).toMatch(/Cinematic showcase videos \(on the Growth and Scale plans\)/);
    expect(planNotIncluded(growth).join("\n")).toMatch(/3D product visuals/);
    expect(planNotIncluded(scale).join("\n")).not.toMatch(/on the Scale plan/);
  });

  it("build the product description from the same counts", () => {
    const d = planDescription(growth);
    expect(d).toMatch(/Each month: 20 short video ads \(up to 15 seconds each\)/);
    expect(d).not.toMatch(/a month/);
    expect(d).toMatch(/Renews monthly until canceled\.$/);
  });

  it("promise no results and invent nothing: no guarantees, statistics, popularity, or dashes", () => {
    const t = allCustomerText();
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/\d+%/);
    expect(t).not.toMatch(/most popular|best.?selling|#1|thousands|customers love|proven|roi\b|roas\b|10x|double your/i);
    // "guarantee" may appear only to deny one
    for (const m of t.matchAll(/guarantee/gi)) expect(t.slice(Math.max(0, m.index! - 12), m.index!)).toMatch(/not a $/);
  });

  it("never name the vendors behind the tools in customer-facing text", () => {
    expect(allCustomerText()).not.toMatch(/runway|zeely|draftly|ulio|grok|x\.ai|zapier|viktor|daugh|avatarhype|gohighlevel|lovable|emergent|motionsites|sitedrop|freebeats|replysmart|lindy|relevance ai|higgsfield|midjourney|cuty|vidu|vadoo|vidnoz|pixai|goenhance|dreamina/i);
  });

  it("offer the extra services only as quoted separately, never as included", () => {
    for (const p of AD_PLANS) {
      const inc = planIncludes(p).join("\n");
      for (const q of QUOTED_SEPARATELY) expect(inc.toLowerCase(), q).not.toContain(q.toLowerCase());
    }
    expect(QUOTED_SEPARATELY.join("\n")).toMatch(/AI receptionist/);
  });
});

describe("monthly brief", () => {
  it("needs something to promote, keeps only known fields, trims, and limits length", () => {
    expect(cleanBrief(null)).toBeNull();
    expect(cleanBrief("nope")).toBeNull();
    expect(cleanBrief({ offer: "  " })).toBeNull();
    expect(cleanBrief({ offer: "hey" })).toBeNull();
    const b = cleanBrief({ offer: "  Summer haircut special, $25  ", audience: "x".repeat(5000), evil: "<script>", goal: 42 });
    expect(b?.offer).toBe("Summer haircut special, $25");
    expect(b?.audience.length).toBe(400);
    expect(b?.goal).toBe("");
    expect(Object.keys(b ?? {}).sort()).toEqual(BRIEF_FIELDS.map((f) => f.key).sort());
  });
});

describe("delivery periods", () => {
  it("count the month in Eastern time", () => {
    expect(periodLabel(new Date("2026-10-15T12:00:00Z"))).toBe("2026-10");
    expect(periodLabel(new Date("2026-10-01T03:00:00Z"))).toBe("2026-09"); // still Sept 30 evening in New York
    expect(periodLabel(new Date("2026-10-01T05:00:00Z"))).toBe("2026-10");
  });
});

describe("new plan alert and thank-you email", () => {
  it("alert is one plain-ASCII line with the plan, price, business and where to look", () => {
    const a = buildAdPlanAlert({ planName: "Monthly Ads Growth", priceCents: 50000, businessName: "Café ☃ Joe's", adminUrl: "https://patientcreations.com/admin/ads" });
    expect(a.sms).toContain("NEW MONTHLY ADS PLAN");
    expect(a.sms).toContain("$500.00/mo");
    expect(a.sms).toContain("https://patientcreations.com/admin/ads");
    expect(a.sms).toMatch(/^[\x20-\x7E]+$/);
    expect(a.sms.length).toBeLessThanOrEqual(320);
    expect(a.body).toContain("$500.00 a month");
  });

  it("email thanks the customer and points to the private plan page", () => {
    const m = renderTemplate("ads_plan_started", { planName: "Monthly Ads Starter", businessName: "Joe's Cuts", manageUrl: "https://x.test/monthly-ads/manage/abc", deliveryTarget: planDeliveryTarget(starter) });
    expect(m.subject).toMatch(/^Thank you/);
    expect(m.body).toContain("Monthly Ads Starter");
    expect(m.body).toContain("https://x.test/monthly-ads/manage/abc");
    expect(m.body).toMatch(/brief/);
    expect(m.body).toMatch(/7 business days/);
  });

  it("takes longer as a plan includes more, and every place says the same number", () => {
    expect(AD_PLANS.map((p) => p.deliveryBusinessDays)).toEqual([7, 10, 14]);
    expect(planDeliveryTarget(scale)).toBe("about 14 business days");
    expect(adTimingNoteFor(growth)).toContain("about 10 business days");
    expect(AD_TIMING_NOTE).toContain("about 7, 10, 14 business days");
    const scaleEmail = renderTemplate("ads_plan_started", { planName: scale.name, businessName: "X", manageUrl: "https://x.test/m/a", deliveryTarget: planDeliveryTarget(scale) });
    expect(scaleEmail.body).toContain("about 14 business days");
  });
});
