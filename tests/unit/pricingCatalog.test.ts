import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { FREE_FIRST_CARD_VIDEO_MIN_CENTS, PRICE_CENTS, TIER_MULTIPLIERS, TIER_PRICE_OVERRIDES, priceOf, tierPriceCents, usd } from "@/lib/pricing/catalog";

const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), "utf8");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(root, rel)).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      sourceFiles(rel, out);
    } else if (/\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

/** Drops comments, so a price in an explanatory comment does not count as a price on screen. */
function withoutComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((l) => l.replace(/(^|[^:"'`])\/\/.*$/, "$1"))
    .join("\n");
}

describe("the one price list", () => {
  it("formats prices the same way everywhere", () => {
    expect(usd(30_000)).toBe("$300");
    expect(usd(170_000)).toBe("$1,700");
    expect(usd(24_900)).toBe("$249");
    expect(usd(1_000_000)).toBe("$10,000");
    expect(usd(7_900)).toBe("$79");
    expect(usd(1_495)).toBe("$14.95");
  });

  it("holds the prices the business sells at", () => {
    expect(priceOf("nfc-cards")).toBe(3_000);
    expect(priceOf("starter-website")).toBe(30_000);
    expect(priceOf("ugc-ad-special")).toBe(9_900);
    expect(priceOf("cinematic-ad-special")).toBe(24_900);
    expect(priceOf("all-in-one-bundle")).toBe(89_900);
    expect(priceOf("care-plan")).toBe(7_900);
    expect([priceOf("ads-monthly-300"), priceOf("ads-monthly-500"), priceOf("ads-monthly-1000")]).toEqual([30_000, 50_000, 100_000]);
    expect(priceOf("lead-engine")).toBe(170_000);
    expect(priceOf("agents")).toBe(600_000);
    expect(priceOf("saas")).toBe(1_000_000);
  });

  it("gives every tiered product a ladder that only goes up: Core, then Signature, then Flagship", () => {
    for (const slug of ["site", "saas", "agents", "lead-engine", "ad", "rental-listing-film", "payments-setup"] as const) {
      const base = PRICE_CENTS[slug];
      const sig = tierPriceCents(slug, "Signature", base);
      const flag = tierPriceCents(slug, "Flagship", base);
      expect(base, slug).toBeLessThan(sig);
      expect(sig, slug).toBeLessThan(flag);
    }
  });

  it("sets the founder's target tiers: AI Software 10,000 / 15,000 / 25,000 and Lead Engine 1,700 / 2,500 / 4,250", () => {
    const tiers = (slug: keyof typeof PRICE_CENTS) => [PRICE_CENTS[slug], tierPriceCents(slug, "Signature", PRICE_CENTS[slug]), tierPriceCents(slug, "Flagship", PRICE_CENTS[slug])];
    expect(tiers("saas")).toEqual([1_000_000, 1_500_000, 2_500_000]);
    expect(tiers("lead-engine")).toEqual([170_000, 250_000, 425_000]);
    expect(tiers("agents")).toEqual([600_000, 960_000, 1_500_000]);
    expect(tiers("site")).toEqual([200_000, 320_000, 500_000]);
  });

  it("uses the multiplier for every tier that is not set by hand, and only overrides where the catalog says so", () => {
    expect(TIER_MULTIPLIERS).toEqual({ Signature: 1.6, Flagship: 2.5 });
    expect(Object.keys(TIER_PRICE_OVERRIDES).sort()).toEqual(["lead-engine", "saas"]);
    expect(tierPriceCents("nothing-special", "Signature", 100_000)).toBe(160_000);
  });

  it("makes the launch bundle cheaper than buying its parts one by one, so its saving is real", () => {
    const parts = PRICE_CENTS["starter-website"] + 2 * PRICE_CENTS["cinematic-ad-special"] + 2 * PRICE_CENTS["ugc-ad-special"] + 3 * PRICE_CENTS["nfc-cards"];
    expect(PRICE_CENTS["all-in-one-bundle"]).toBeLessThan(parts);
  });

  it("charges the same for a card on its own, on any design, and added to an order", () => {
    const cards = Object.entries(PRICE_CENTS).filter(([k]) => k.startsWith("nfc-"));
    expect(cards.length).toBe(9);
    for (const [k, v] of cards) expect(v, k).toBe(3_000);
    expect(FREE_FIRST_CARD_VIDEO_MIN_CENTS).toBe(100_000);
  });

  it("puts the Monthly Ads plans on a rising ladder", () => {
    expect(priceOf("ads-monthly-300")).toBeLessThan(priceOf("ads-monthly-500"));
    expect(priceOf("ads-monthly-500")).toBeLessThan(priceOf("ads-monthly-1000"));
  });
});

describe("no other price anywhere", () => {
  it("has no dollar amount typed into any page, component, or library file (prices come from the list)", () => {
    const allowed: RegExp[] = [/\$0\b/, /"business \$1"/]; // the "$0" end of a price bar, and a regex replacement
    const offenders: string[] = [];
    for (const dir of ["app", "components", "lib"]) {
      for (const file of sourceFiles(dir)) {
        // The legal pages state amounts of their own; the catalog is the list; and marketComparison quotes what other
        // companies charge (cited benchmarks), which are not our prices.
        if (file.startsWith("lib/legal/") || file === "lib/pricing/catalog.ts" || file === "lib/site/marketComparison.ts") continue;
        const clean = withoutComments(read(file));
        clean.split("\n").forEach((line, i) => {
          if (!/\$[0-9]/.test(line)) return;
          if (allowed.some((a) => a.test(line) && !/\$[1-9][0-9]/.test(line.replace(/"business \$1"/, "")))) return;
          offenders.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
        });
      }
    }
    expect(offenders, `typed prices found:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("has no price number typed into the seed: every row's price is read from the list", () => {
    const seed = withoutComments(read("prisma/seed.ts"));
    expect(seed).not.toMatch(/(baseCents|priceCents): [0-9]/);
    expect(seed).not.toMatch(/tierPrice\(/);
    expect(seed).toContain("tierPriceCents(");
  });

  it("has no price number typed into a fallback: each one reads the list", () => {
    for (const [file, needle] of [
      ["lib/ads/plans.ts", 'PRICE_CENTS["ads-monthly-300"]'],
      ["lib/site/carePlan.ts", 'PRICE_CENTS["care-plan"]'],
      ["lib/site/offerData.ts", 'PRICE_CENTS["starter-website"]'],
      ["lib/payments/nfcAddon.ts", 'PRICE_CENTS["nfc-card-addon"]'],
      ["lib/site/marketComparison.ts", "PRICE_CENTS.saas"],
    ] as const) {
      expect(read(file), file).toContain(needle);
    }
    expect(withoutComments(read("lib/ads/plans.ts"))).not.toMatch(/fallbackPriceCents: [0-9]/);
    expect(withoutComments(read("lib/site/marketComparison.ts"))).not.toMatch(/fallbackYouCents: [0-9]/);
  });

  it("no longer says the NFC cards have a separate setup fee (they do not)", () => {
    expect(read("components/home/NfcShowcase.tsx")).not.toMatch(/setup\s+fee/i);
  });

  it("has a price for every product the seed sells", () => {
    const seed = read("prisma/seed.ts");
    const slugs = [...seed.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(25);
    for (const slug of slugs) {
      if (slug === "p.slug") continue;
      expect(PRICE_CENTS, `${slug} has no price in lib/pricing/catalog.ts`).toHaveProperty([slug]);
    }
  });
});
