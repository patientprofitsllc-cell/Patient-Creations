import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PRODUCT_SCOPES, SCOPED_SLUGS, scopeFor } from "@/lib/site/productScopes";
import { PRICE_CENTS, tierPriceCents } from "@/lib/pricing/catalog";
import { includedCardCount } from "@/lib/payments/nfcAddon";
import { parseTurnaroundMaxDays } from "@/lib/payments/deliverySpeed";
import { MARKET_ROWS, compareRows, standing, standingText, totalsOf } from "@/lib/site/marketComparison";

const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
const productBlock = (slug: string) => {
  const i = seed.indexOf(`slug: "${slug}"`);
  if (i < 0) throw new Error(`no ${slug} in the seed`);
  return seed.slice(i, seed.indexOf("},", i));
};

describe("product scopes", () => {
  const all = () => SCOPED_SLUGS.flatMap((s) => [PRODUCT_SCOPES[s].summary, ...PRODUCT_SCOPES[s].includes, ...PRODUCT_SCOPES[s].notIncluded, ...(PRODUCT_SCOPES[s].tierAdds ? [...PRODUCT_SCOPES[s].tierAdds!.Signature, ...PRODUCT_SCOPES[s].tierAdds!.Flagship] : [])]).join("\n");

  it("are written for every build the market review called undefined", () => {
    for (const slug of ["site", "saas", "agents", "payments-setup", "lead-engine", "automation-add-on", "rental-listing-film", "basic-package"]) expect(scopeFor(slug), slug).toBeTruthy();
  });

  it("say what is included, and what is not, for every one", () => {
    for (const slug of SCOPED_SLUGS) {
      expect(PRODUCT_SCOPES[slug].includes.length, slug).toBeGreaterThanOrEqual(3);
      expect(PRODUCT_SCOPES[slug].notIncluded.length, slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("state the same number of revision rounds as the product row", () => {
    for (const slug of SCOPED_SLUGS) {
      const m = /revisionLimit: (\d+)/.exec(productBlock(slug));
      const n = Number(m?.[1]);
      const line = PRODUCT_SCOPES[slug].includes.find((i) => /revision round/.test(i));
      expect(line, `${slug} states its revision rounds`).toBeTruthy();
      expect(line, slug).toMatch(new RegExp(`^${n} revision round`));
    }
  });

  it("are the descriptions used in the product rows, so cards and the database agree", () => {
    for (const slug of SCOPED_SLUGS) expect(productBlock(slug), slug).toContain(`PRODUCT_SCOPES${/^[a-z]+$/.test(slug) ? "." + slug : `["${slug}"]`}.summary`);
  });

  it("are honest that the tours are AI-made and not filmed", () => {
    expect(PRODUCT_SCOPES["basic-package"].includes.join(" ")).toMatch(/Made with AI/);
    expect(PRODUCT_SCOPES["basic-package"].includes.join(" ")).toMatch(/not filmed by a real drone/);
    expect(PRODUCT_SCOPES["rental-listing-film"].includes.join(" ")).toMatch(/Made with AI/);
    expect(PRODUCT_SCOPES["basic-package"].notIncluded.join(" ")).toMatch(/real drone footage/);
  });

  it("promise no results, name no tool vendors, and use no dashes as punctuation", () => {
    const t = all();
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/finds new customers|guarantee(?!d)|proven|roi\b|\d+%/i);
    expect(t).not.toMatch(/runway|zeely|draftly|ulio|grok|zapier|viktor|daugh|avatarhype|gohighlevel|lovable|emergent|motionsites|sitedrop|freebeats|replysmart/i);
  });

  it("exclude the things nobody can promise: results, ad spend, and third-party usage costs", () => {
    expect(PRODUCT_SCOPES["lead-engine"].notIncluded.join(" ")).toMatch(/Ad spend/);
    expect(PRODUCT_SCOPES["lead-engine"].notIncluded.join(" ")).toMatch(/Any promise of how many leads/);
    expect(PRODUCT_SCOPES.saas.notIncluded.join(" ")).toMatch(/Usage costs charged by your hosting, payment, or AI providers/);
    expect(PRODUCT_SCOPES.agents.notIncluded.join(" ")).toMatch(/Any promise of time saved or results/);
    expect(PRODUCT_SCOPES["payments-setup"].notIncluded.join(" ")).toMatch(/Stripe's own fees/);
  });
});

describe("catalog prices", () => {
  it("AI Software / App starts at $10,000, with $15,000 and $25,000 tiers, all from the price list", () => {
    expect(productBlock("saas")).toContain('PRICE_CENTS["saas"]');
    expect(PRICE_CENTS.saas).toBe(1000000);
    expect(tierPriceCents("saas", "Signature", PRICE_CENTS.saas)).toBe(1500000);
    expect(tierPriceCents("saas", "Flagship", PRICE_CENTS.saas)).toBe(2500000);
  });

  it("NFC cards are a flat $30 with no setup fee, on every card product and the add-on", () => {
    for (const slug of ["nfc-cards", "nfc-wifi", "nfc-custom-menu", "nfc-youtube", "nfc-whatsapp", "nfc-instagram", "nfc-tiktok", "nfc-google-review"]) {
      const b = productBlock(slug);
      expect(b, slug).toContain('PRICE_CENTS["' + slug + '"]');
      expect(PRICE_CENTS[slug as keyof typeof PRICE_CENTS], slug).toBe(3000);
      expect(b, slug).toContain("setupFeeCents: 0");
    }
    expect(productBlock("nfc-card-addon")).toContain('PRICE_CENTS["nfc-card-addon"]');
    expect(PRICE_CENTS["nfc-card-addon"]).toBe(3000);
  });

  it("per-ad specials are priced by value and the bundle is cheaper than buying its parts", () => {
    const cents = (slug: string) => PRICE_CENTS[slug as keyof typeof PRICE_CENTS];
    const cin = cents("cinematic-ad-special");
    const ugc = cents("ugc-ad-special");
    expect([cin, ugc]).toEqual([24900, 9900]);
    const separately = cents("starter-website") + 2 * cin + 2 * ugc + 3 * cents("nfc-cards");
    const bundle = cents("all-in-one-bundle");
    expect(bundle).toBe(89900);
    expect(bundle).toBeLessThan(separately);
    expect((separately - bundle) / separately).toBeGreaterThanOrEqual(0.15);
  });
});

describe("delivery times", () => {
  const turnaround = (slug: string) => /turnaround: "([^"]*)"/.exec(productBlock(slug))?.[1];

  it("says the Quick Business Website is 72 hours everywhere, as hours and not as business days", () => {
    expect(turnaround("starter-website")).toBe("72 hours");
    const offer = readFileSync(join(process.cwd(), "lib/site/offer.ts"), "utf8");
    expect(offer).toMatch(/72-hour target/);
  });

  it("gives the Basic Package 2 revision rounds and a delivery time that fits three videos", () => {
    expect(productBlock("basic-package")).toContain("revisionLimit: 2");
    expect(turnaround("basic-package")).toBe("1-2 weeks");
    expect(PRODUCT_SCOPES["basic-package"].includes.join(" ")).toMatch(/ship separately, usually 5 to 7 business days/);
  });

  it("keeps a bigger build from being quoted a shorter time than a smaller one that is part of it", () => {
    const days = (slug: string) => parseTurnaroundMaxDays(turnaround(slug))!;
    expect(days("site")).toBeGreaterThan(days("starter-website"));
    expect(days("all-in-one-bundle")).toBeGreaterThan(days("cinematic-ad-special"));
    expect(days("saas")).toBeGreaterThan(days("site"));
    expect(days("agents")).toBeGreaterThanOrEqual(days("saas"));
    expect(days("basic-package")).toBeGreaterThan(days("rental-listing-film"));
  });
});

describe("Basic Package", () => {
  it("stays at $1,000 and promises 3 videos and 5 NFC cards, matching what checkout and the card questionnaire use", () => {
    const b = productBlock("basic-package");
    expect(productBlock("basic-package")).toContain('PRICE_CENTS["basic-package"]');
    expect(PRICE_CENTS["basic-package"]).toBe(100000);
    const scope = PRODUCT_SCOPES["basic-package"];
    expect(scope.summary).toMatch(/Three drone-style videos/);
    expect(scope.summary).toMatch(/5 NFC cards/);
    expect(scope.includes.join(" ")).toMatch(/^3 drone-style videos/);
    expect(scope.includes.join(" ")).toMatch(/5 NFC cards of your choice/);
    expect(includedCardCount("basic-package")).toBe(5);
  });

  it("does not sell the card add-on on top of the cards it already includes", () => {
    const pricing = readFileSync(join(process.cwd(), "lib/payments/pricing.ts"), "utf8");
    expect(pricing).toContain("includedCardCount(primaryProduct.slug) > 0 && products.some");
    const intake = readFileSync(join(process.cwd(), "app/api/checkout/nfc-intake/route.ts"), "utf8");
    expect(intake).toContain("includedCardCount(primaryItem?.product.slug) > 0");
  });
});

describe("market comparison", () => {
  it("says where a price is: below, at the low end, within, or above the range", () => {
    expect(standing(1000000, 1500000, 10000000)).toEqual({ position: "below", percentBelowFloor: 33 });
    expect(standing(200000, 200000, 800000).position).toBe("low-end");
    expect(standing(500000, 200000, 800000).position).toBe("within");
    expect(standing(900000, 200000, 800000).position).toBe("above");
  });

  it("never claims 'below' unless the price really is below the floor", () => {
    expect(standingText(standing(200000, 200000, 800000))).toBe("At the low end of the range");
    expect(standingText(standing(50000, 100000, 500000))).toBe("50% below the low end of the range");
    expect(standingText(standing(600000, 200000, 1200000))).toBe("Within the range");
  });

  it("uses the live product price and name, sorted lowest first", () => {
    const rows = compareRows([
      { slug: "saas", name: "AI Software / App", priceCents: 1000000 },
      { slug: "site", name: "Cinematic AI Website", priceCents: 200000 },
    ]);
    expect(rows[0].slug).toBe("ad"); // no live row, so it fell back to its stored price
    const saas = rows.find((r) => r.slug === "saas")!;
    expect(saas.youCents).toBe(1000000);
    expect(saas.standing.position).toBe("below");
  });

  it("adds up from the rows, so no total is typed in", () => {
    const rows = compareRows([]);
    const t = totalsOf(rows);
    expect(t.youCents).toBe(rows.reduce((s, r) => s + r.youCents, 0));
    expect(t.floorCents).toBeLessThan(t.ceilingCents);
  });

  it("has a source link for every range, and every range makes sense", () => {
    for (const r of MARKET_ROWS) {
      expect(r.source.url, r.slug).toMatch(/^https:\/\//);
      expect(r.loCents, r.slug).toBeLessThan(r.hiCents);
    }
  });

  it("the services page no longer carries hard-coded savings claims", () => {
    const page = readFileSync(join(process.cwd(), "app/services/page.tsx"), "utf8");
    expect(page).not.toMatch(/198,000|\$36k|\$178k|40.60%|Faster to ship|~49%/);
    expect(page).not.toMatch(/at or below the low end/);
    const home = readFileSync(join(process.cwd(), "components/home/SpecialsGrid.tsx"), "utf8");
    expect(home).not.toMatch(/STARTER_WAS_CENTS|SITE_WAS_CENTS/);
  });
});

describe("catalog stays simple", () => {
  const REMOVED = ["monthly-optimization"];

  it("keeps the unbuilt monthly retainer off the shelf, with its row so old orders stay intact", () => {
    const legacy = /const LEGACY_SLUGS = \[([\s\S]*?)\];/.exec(seed)?.[1] ?? "";
    for (const slug of REMOVED) {
      expect(legacy, slug).toContain(`"${slug}"`);
      expect(seed, slug).not.toContain(`slug: "${slug}"`);
    }
  });

  it("has no trace of the 3-Month Maintenance extra, which nobody ever bought and was deleted", () => {
    expect(seed).not.toMatch(/maintenance-3mo/);
    for (const f of ["lib/legal/terms.ts", "lib/legal/refunds.ts", "lib/site/addOnPitch.ts"]) expect(readFileSync(join(process.cwd(), f), "utf8"), f).not.toMatch(/3-Month Maintenance|maintenance-3mo/i);
  });

  it("keeps the consultations, both video tours, the ad product, and the site upkeep plan on sale", () => {
    for (const slug of ["strategy-session", "custom-build", "basic-package", "rental-listing-film", "ad", "care-plan"]) expect(seed, slug).toContain(`slug: "${slug}"`);
  });

  it("does not point the homepage or the specials at a product that is no longer sold", () => {
    const home = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    expect(/const FEATURED_SLUGS = \[([^\]]*)\]/.exec(home)?.[1]).not.toMatch(/monthly-optimization/);
    const specials = readFileSync(join(process.cwd(), "components/home/SpecialsGrid.tsx"), "utf8");
    expect(/const SLUGS = \[([\s\S]*?)\];/.exec(specials)?.[1]).not.toMatch(/monthly-optimization/);
  });

  it("has no crossed-out invented price anywhere on the homepage", () => {
    const home = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    expect(home).not.toMatch(/OFFER_WAS_CENTS|wasCents=/);
  });

  it("shows one card front door on /services, with the single-design cards still buyable by link", () => {
    const page = readFileSync(join(process.cwd(), "app/services/page.tsx"), "utf8");
    expect(page).toMatch(/CARD_DESIGN_SLUGS\.includes\(p\.slug\)/);
    for (const slug of ["nfc-cards", "nfc-tiktok", "nfc-google-review"]) expect(seed, slug).toContain(`slug: "${slug}"`);
  });

  it("does not open a checkout for a product that has been taken off the shelf", () => {
    const page = readFileSync(join(process.cwd(), "app/checkout/page.tsx"), "utf8");
    expect(page).toMatch(/!primaryProduct.active/);
  });

  it("compares only products that are still sold", () => {
    for (const r of MARKET_ROWS) expect(REMOVED, r.slug).not.toContain(r.slug);
  });
});
