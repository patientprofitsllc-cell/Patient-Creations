import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { AD_SPECIAL_BLURB, AD_SPECIAL_INCLUDES, BUNDLE_DESCRIPTION, BUNDLE_ITEMS, CINEMATIC_SPECIAL_DESCRIPTION, UGC_SPECIAL_DESCRIPTION } from "@/lib/site/adSpecials";

const all = () => [...Object.values(AD_SPECIAL_INCLUDES), ...Object.values(AD_SPECIAL_BLURB), CINEMATIC_SPECIAL_DESCRIPTION, UGC_SPECIAL_DESCRIPTION, BUNDLE_DESCRIPTION, ...BUNDLE_ITEMS].join("\n");

describe("ad specials", () => {
  it("say exactly what each ad includes", () => {
    expect(AD_SPECIAL_INCLUDES.cinematic).toMatch(/up to 30 seconds/);
    expect(AD_SPECIAL_INCLUDES.cinematic).toMatch(/wide and vertical/);
    expect(AD_SPECIAL_INCLUDES.ugc).toMatch(/AI presenter/);
    expect(AD_SPECIAL_INCLUDES.ugc).toMatch(/3 opening-hook variations/);
    expect(AD_SPECIAL_INCLUDES.ugc).toMatch(/vertical and square/);
  });

  it("are the same words on the card, in the product rows, and in the bundle", () => {
    expect(CINEMATIC_SPECIAL_DESCRIPTION).toContain(AD_SPECIAL_INCLUDES.cinematic);
    expect(UGC_SPECIAL_DESCRIPTION).toContain(AD_SPECIAL_INCLUDES.ugc);
    expect(BUNDLE_DESCRIPTION).toMatch(/2 UGC Ads \(each with 3 opening-hook variations\)/);
    expect(BUNDLE_ITEMS).toContain("2 UGC Ads (3 hook variations each)");
    const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
    for (const name of ["CINEMATIC_SPECIAL_DESCRIPTION", "UGC_SPECIAL_DESCRIPTION", "BUNDLE_DESCRIPTION"]) expect(seed, name).toContain(`description: ${name}`);
  });

  it("promise no results, name no tool vendors, and use no dashes as punctuation", () => {
    const t = all();
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/finds new customers|guarantee|proven|roi\b|\d+%/i);
    expect(t).not.toMatch(/runway|zeely|draftly|ulio|grok|zapier|viktor|daugh|avatarhype|gohighlevel|lovable|emergent|motionsites|sitedrop|freebeats|replysmart/i);
  });

  it("keep a product off the shelf when it promises something that is not built", () => {
    const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
    expect(seed).toMatch(/LEGACY_SLUGS = \[[^\]]*"monthly-optimization"/);
  });
});
