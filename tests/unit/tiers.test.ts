import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PRICE_CENTS, tierPriceCents, type PricedSlug } from "@/lib/pricing/catalog";
import { PRODUCT_SCOPES } from "@/lib/site/productScopes";

// Every product sold in tiers, read from the seed so a new tiered product can't skip these rules.
const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
// Each product entry in the seed, from its slug to the next one; the tiered ones say "tierable: true".
const TIERED = seed
  .split(/\n\s*slug: /)
  .slice(1)
  .filter((block) => /tierable: true/.test(block))
  .map((block) => /^"([a-z0-9-]+)"/.exec(block)![1]);

describe("tiers: a higher tier costs more only because it includes more", () => {
  it("finds the tiered products", () => {
    expect(TIERED).toEqual(expect.arrayContaining(["site", "saas", "agents", "ad", "rental-listing-film", "payments-setup", "lead-engine"]));
  });

  for (const slug of TIERED) {
    it(`${slug}: Core < Signature < Flagship, and each step lists what it adds`, () => {
      const core = PRICE_CENTS[slug as PricedSlug];
      const sig = tierPriceCents(slug, "Signature", core);
      const flag = tierPriceCents(slug, "Flagship", core);
      expect(core).toBeLessThan(sig);
      expect(sig).toBeLessThan(flag);

      const adds = PRODUCT_SCOPES[slug]?.tierAdds;
      expect(adds, `${slug} needs tierAdds in lib/site/productScopes.ts`).toBeTruthy();
      expect(adds!.Signature.length).toBeGreaterThan(0);
      // Flagship lists more than Signature, with no line repeated inside it.
      expect(adds!.Flagship.length).toBeGreaterThanOrEqual(adds!.Signature.length);
      expect(new Set(adds!.Flagship).size).toBe(adds!.Flagship.length);
      expect(adds!.Flagship.join("|")).not.toBe(adds!.Signature.join("|"));
    });
  }
});
