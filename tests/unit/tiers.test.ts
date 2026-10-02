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

import { scopeForTier } from "@/lib/site/productScopes";

describe("what each tier includes, as checkout shows it when a tier is picked", () => {
  for (const slug of TIERED) {
    const scope = PRODUCT_SCOPES[slug]!;

    it(`${slug}: every line a tier replaces really exists, so an upgrade never leaves the old line showing`, () => {
      const all = [...scope.includes, ...scope.notIncluded, ...scope.tierAdds!.Signature, ...scope.tierAdds!.Flagship];
      for (const [line, starts] of Object.entries(scope.supersedes ?? {})) {
        expect([...scope.tierAdds!.Signature, ...scope.tierAdds!.Flagship], `${slug}: "${line}" is not a tier line`).toContain(line);
        for (const start of starts) expect(all.some((l) => l !== line && l.startsWith(start)), `${slug}: nothing starts with "${start}"`).toBe(true);
      }
    });

    it(`${slug}: each tier keeps everything below it (or its upgrade), with no line twice`, () => {
      const core = scopeForTier(scope, "Core");
      const sig = scopeForTier(scope, "Signature");
      const flag = scopeForTier(scope, "Flagship");
      expect(core.includes).toEqual(scope.includes);
      for (const t of [sig, flag]) expect(new Set(t.includes).size, slug).toBe(t.includes.length);
      // Every line of the tier below is still there, or replaced by the line that upgrades it.
      const kept = (line: string, tier: string[]) =>
        tier.includes(line) || Object.entries(scope.supersedes ?? {}).some(([up, starts]) => tier.includes(up) && starts.some((s) => line.startsWith(s)));
      for (const l of core.includes) expect(kept(l, sig.includes), `${slug} Signature lost "${l}"`).toBe(true);
      for (const l of sig.includes) expect(kept(l, flag.includes), `${slug} Flagship lost "${l}"`).toBe(true);
    });
  }

  it("shows the upgraded line in place of the old one, and drops a not-included line a tier now covers", () => {
    const site = scopeForTier(PRODUCT_SCOPES.site, "Flagship").includes;
    expect(site[0]).toBe("Up to 12 pages");
    expect(site.some((l) => /^Up to (5|8) pages/.test(l))).toBe(false);
    expect(site).toContain("A gallery, blog, or portfolio section");
    const saas = scopeForTier(PRODUCT_SCOPES.saas, "Signature");
    expect(saas.includes).toContain("Up to 15 screens");
    expect(saas.notIncluded.some((l) => l.startsWith("Integrations beyond payments"))).toBe(false);
    const agents = scopeForTier(PRODUCT_SCOPES.agents, "Flagship");
    expect(agents.notIncluded.some((l) => l.startsWith("More than one business process"))).toBe(false);
    expect(agents.includes.some((l) => l.startsWith("Up to 3 AI agents") || l.startsWith("Up to 5 agents"))).toBe(false);
  });

  it("puts the tier-aware list in the checkout's tier picker", () => {
    const form = readFileSync(join(process.cwd(), "components/checkout/CheckoutForm.tsx"), "utf8");
    expect(form).toMatch(/<ScopePanel slug=\{primaryProduct\.slug\} tier=\{tierName\}/);
  });
});
