import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { AGENT_BUNDLE_SLUGS, BUNDLES, EVERYTHING_CARE_MONTHS, PRICE_CENTS, SPECIAL_CARE_MONTHS, agentBundleSavingCents, agentBundleSeparatelyCents } from "@/lib/pricing/catalog";
import { PRODUCT_SCOPES } from "@/lib/site/productScopes";
import { PRICE_LIST_SLUGS } from "@/lib/site/priceList";
import { KICKOFF_SLUGS } from "@/lib/config/calendly";
import { includedCareMonths } from "@/lib/care/included";
import { includedCardCount } from "@/lib/payments/nfcAddon";
import { WEBSITE_SPECIAL_SLUGS } from "@/lib/site/offer";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("the AI Agent bundles", () => {
  it("are four, each priced below buying its parts one by one, and saving at least a tenth", () => {
    expect(AGENT_BUNDLE_SLUGS).toEqual(["agent-website-bundle", "agent-cinematic-bundle", "agent-lead-bundle", "everything-bundle"]);
    for (const slug of AGENT_BUNDLE_SLUGS) {
      const separately = agentBundleSeparatelyCents(slug);
      expect(PRICE_CENTS[slug], slug).toBeLessThan(separately);
      expect(agentBundleSavingCents(slug) / separately, slug).toBeGreaterThanOrEqual(0.1);
    }
  });

  it("add up from the price list: the parts cost what the plan says, and the savings follow", () => {
    expect(agentBundleSeparatelyCents("agent-website-bundle")).toBe(800_000);
    expect(agentBundleSeparatelyCents("agent-cinematic-bundle")).toBe(900_000);
    expect(agentBundleSeparatelyCents("agent-lead-bundle")).toBe(770_000);
    expect(agentBundleSeparatelyCents("everything-bundle")).toBe(1_508_000);
    expect(PRICE_CENTS["agent-website-bundle"]).toBe(720_000);
    expect(PRICE_CENTS["agent-cinematic-bundle"]).toBe(810_000);
    expect(PRICE_CENTS["agent-lead-bundle"]).toBe(690_000);
    expect(PRICE_CENTS["everything-bundle"]).toBe(1_280_000);
  });

  it("follow a changed price: savings are worked out from the parts, never typed", () => {
    const cheaperAgent = (s: keyof typeof PRICE_CENTS) => (s === "agents" ? 500_000 : PRICE_CENTS[s]);
    expect(agentBundleSeparatelyCents("agent-lead-bundle", cheaperAgent)).toBe(670_000);
  });

  it("are all in the seed, the price list, the scopes, and the kickoff list", () => {
    const seed = read("prisma/seed.ts");
    for (const slug of AGENT_BUNDLE_SLUGS) {
      expect(seed, slug).toContain(`slug: "${slug}"`);
      expect(seed, slug).toContain(`PRICE_CENTS["${slug}"]`);
      expect(PRODUCT_SCOPES[slug].includes.length, slug).toBeGreaterThanOrEqual(3);
      expect(PRODUCT_SCOPES[slug].notIncluded.length, slug).toBeGreaterThanOrEqual(3);
      expect(PRICE_LIST_SLUGS, slug).toContain(slug);
      expect(KICKOFF_SLUGS, slug).toContain(slug);
    }
  });

  it("carry the Website Special's care, the Everything bundle's year of care, and its cards", () => {
    expect(includedCareMonths(["agent-website-bundle"])).toBe(SPECIAL_CARE_MONTHS);
    expect(includedCareMonths(["agent-cinematic-bundle"])).toBe(0);
    expect(includedCareMonths(["everything-bundle"])).toBe(EVERYTHING_CARE_MONTHS);
    expect(includedCareMonths(["everything-bundle"], true)).toBe(0);
    expect(includedCardCount("everything-bundle")).toBe(5);
    expect(BUNDLES["everything-bundle"].find(([s]) => s === "care-plan")?.[1]).toBe(EVERYTHING_CARE_MONTHS);
  });

  it("start the website intake only where a Website Special is inside", () => {
    expect(WEBSITE_SPECIAL_SLUGS).toContain("agent-website-bundle");
    expect(WEBSITE_SPECIAL_SLUGS).not.toContain("agent-cinematic-bundle");
    expect(WEBSITE_SPECIAL_SLUGS).not.toContain("everything-bundle");
  });
});
