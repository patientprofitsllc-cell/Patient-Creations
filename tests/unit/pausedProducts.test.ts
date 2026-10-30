import { describe, expect, it, vi } from "vitest";

// The AI builds are paused while the owner is away: listed nowhere as buyable, refused at checkout even if the catalog
// sync failed, and still visible as "book a call" so visitors know they exist.
type Row = Record<string, any>;
const S = vi.hoisted(() => {
  // These tests are about the pause switched on; the module-level finder list reads the switch when it loads.
  process.env.NEXT_PUBLIC_PAUSE_AI_BUILDS = "true";
  return { products: [] as Row[] };
});
vi.mock("@/lib/db", () => ({
  db: { product: { findMany: async ({ where }: Row) => S.products.filter((p) => where.id.in.includes(p.id) && (!where.active || p.active)) } },
}));

import { readFileSync } from "fs";
import { join } from "path";
import { PAUSED_HREF, PAUSED_SLUGS, isPaused, pauseOn } from "@/lib/pricing/paused";
import { AGENT_BUNDLE_SLUGS, PRICE_CENTS } from "@/lib/pricing/catalog";
import { isCartable } from "@/lib/cart/store";
import { SUGGESTIONS } from "@/lib/journey/discovery";
import { homeBlocks } from "@/lib/site/home/render";
import { priceOrder } from "@/lib/payments/pricing";

describe("the pause switch", () => {
  it("is off unless NEXT_PUBLIC_PAUSE_AI_BUILDS is exactly true, and then nothing is paused", () => {
    for (const v of [undefined, "", "false", "1", "TRUE", "yes"]) {
      if (v === undefined) delete process.env.NEXT_PUBLIC_PAUSE_AI_BUILDS;
      else process.env.NEXT_PUBLIC_PAUSE_AI_BUILDS = v;
      expect(pauseOn(), String(v)).toBe(false);
      for (const s of PAUSED_SLUGS) expect(isPaused(s), s).toBe(false);
      expect(isCartable("agents")).toBe(true);
      const card = homeBlocks({ reviews: [], faqs: [], industries: [], agentBundlesFrom: "$6,900" })["agent-bundles"]!;
      expect(card).toContain("/pricing#bundles");
      expect(card).toContain("$6,900");
      expect(card).not.toMatch(/paused/i);
    }
    process.env.NEXT_PUBLIC_PAUSE_AI_BUILDS = "true";
  });
});

describe("paused AI builds (switch on)", () => {
  it("are exactly the AI agent and software builds, all of them real products", () => {
    expect([...PAUSED_SLUGS].sort()).toEqual(["agent-cinematic-bundle", "agent-lead-bundle", "agent-website-bundle", "agents", "everything-bundle", "saas"]);
    for (const s of PAUSED_SLUGS) expect(PRICE_CENTS, s).toHaveProperty([s]);
    for (const s of ["website-special", "lead-engine", "payments-setup", "automation-add-on", "strategy-session"]) expect(isPaused(s), s).toBe(false);
  });

  it("are turned off by the catalog sync, both for existing rows and new ones", () => {
    const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
    const sync = seed.slice(seed.indexOf("export async function syncCatalog"));
    expect(sync.match(/active: !isPaused\(s\.slug\)/g)).toHaveLength(2);
  });

  it("are refused at checkout even if the database still says they are on sale", async () => {
    S.products = [{ id: "x1", slug: "agents", name: "AI Agent System", active: true, priceCents: PRICE_CENTS.agents }];
    await expect(priceOrder(["x1"])).rejects.toThrow(/AI Agent System is not taking new orders right now/);
  });

  it("cannot be put in the cart", () => {
    for (const s of PAUSED_SLUGS) expect(isCartable(s), s).toBe(false);
  });

  it("still show in the finder and on the homepage, but book a call instead of opening checkout", () => {
    const automate = SUGGESTIONS.automate.filter((s) => s.href === PAUSED_HREF).map((s) => s.title);
    expect(automate).toEqual(["Multi Agent System", "AI Software"]);
    const card = homeBlocks({ reviews: [], faqs: [], industries: [], agentBundlesFrom: "$6,900" })["agent-bundles"]!;
    expect(card).toContain(PAUSED_HREF);
    expect(card).toMatch(/paused/i);
    expect(card).not.toMatch(/\/pricing#bundles|\$6,900/);
    expect(AGENT_BUNDLE_SLUGS.every(isPaused)).toBe(true);
  });
});
