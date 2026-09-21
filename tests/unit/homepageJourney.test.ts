import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { JOURNEY, NEEDS, SUGGESTIONS } from "@/lib/journey/discovery";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("homepage: the ten-second test", () => {
  const home = read("app/page.tsx");

  it("says what Patient Creations does in the headline, and what it helps with in the line under it", () => {
    expect(home).toContain("Build Your Business. Get More Customers.");
    expect(home).toContain("Automate the Work.");
    expect(home).toContain("launch, market, generate leads, and automate operations with websites,");
  });

  it("puts the growth audit first and the services second, and keeps the website offer one tap away", () => {
    expect(home).toContain('href="/audit"');
    expect(home).toContain("GET MY GROWTH AUDIT");
    expect(home).not.toMatch(/FREE GROWTH AUDIT/i);
    expect(home).toContain("credited toward your first order");
    expect(home).toContain("EXPLORE SERVICES");
    expect(home).toContain("Just need a website?");
    expect(home).toContain("OFFER_CHECKOUT_HREF");
  });

  it("keeps the approved live hero and the strict tracking", () => {
    expect(home).toContain("<HeroBackdrop");
    expect(home).toContain('<TrackView event="landing_page_view" />');
  });

  it("shows the three-choice finder and the path from building to scaling", () => {
    expect(home).toContain("<ProductFinder />");
    expect(home).toContain("<BusinessJourney />");
  });
});

describe("the three-choice finder", () => {
  it("asks exactly three questions", () => {
    expect(NEEDS.map((n) => n.label)).toEqual(["I need a website", "I need more customers", "I want to automate my business"]);
  });

  it("recommends a few things for each answer, at prices from the price list, linking to real products", () => {
    for (const n of NEEDS) {
      const picks = SUGGESTIONS[n.id];
      expect(picks.length, n.id).toBeGreaterThanOrEqual(2);
      expect(picks.length, n.id).toBeLessThanOrEqual(3);
      for (const p of picks) {
        expect(p.href, p.title).toMatch(/^\/(checkout\?product=[a-z0-9-]+|monthly-ads)$/);
        expect(p.price, p.title).toMatch(/^(from )?\$[0-9,]+( a month)?$/);
        expect(p.why + p.title, p.title).not.toMatch(/guarantee|proven|more sales|results|[—–]/i);
        const slug = /product=([a-z0-9-]+)/.exec(p.href)?.[1];
        if (slug) expect(PRICE_CENTS, `${slug} must be priced in the catalog`).toHaveProperty([slug]);
      }
    }
    expect(SUGGESTIONS.website[0].price).toBe(usd(PRICE_CENTS["starter-website"]));
    expect(SUGGESTIONS.website[1].price).toBe(usd(PRICE_CENTS["all-in-one-bundle"]));
    expect(SUGGESTIONS.customers[0].price).toBe(usd(PRICE_CENTS["ugc-ad-special"]));
    expect(SUGGESTIONS.customers[1].price).toBe(`from ${usd(PRICE_CENTS["ads-monthly-300"])} a month`);
    expect(SUGGESTIONS.customers[2].price).toBe(`from ${usd(PRICE_CENTS["lead-engine"])}`);
  });

  it("sends the automation visitor to a conversation first, and does not put the largest builds forward alone", () => {
    expect(SUGGESTIONS.automate[0].title).toBe("Strategy Session");
    expect(SUGGESTIONS.automate.map((s) => s.title)).toContain("Multi Agent System");
  });
});

describe("the business path", () => {
  it("runs Build, Attract, Capture, Automate, Scale, in that order", () => {
    expect(JOURNEY.map((j) => `${j.n} ${j.stage}`)).toEqual(["01 Build", "02 Attract", "03 Capture", "04 Automate", "05 Scale"]);
  });

  it("only moves opacity and position, and respects a visitor's request for less motion", () => {
    const c = read("components/home/BusinessJourney.tsx");
    expect(c).toContain("motion-reduce:opacity-100");
    expect(c).toContain("motion-reduce:transition-none");
    expect(c).toContain("IntersectionObserver");
    expect(c).not.toMatch(/setInterval|requestAnimationFrame|autoplay/);
  });
});

describe("navigation", () => {
  it("links the free audit from the header", () => {
    expect(read("components/shared/SiteHeader.tsx")).toContain('"/audit"');
  });
});
