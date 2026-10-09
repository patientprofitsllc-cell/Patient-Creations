import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { CONCEPTS, SHOW_EXAMPLES, getConcept } from "@/lib/site/concepts";
import { getIndustry } from "@/lib/site/industries";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

// /examples shows professional concepts only, says plainly they're invented, and disappears if the set isn't complete.
describe("website design concepts", () => {
  it("are a full set, each with a hero and two photographs, served from the image host Next is allowed to optimise", () => {
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(3);
    expect(SHOW_EXAMPLES).toBe(true);
    const config = read("next.config.mjs");
    for (const c of CONCEPTS) {
      for (const im of [c.hero, ...c.gallery]) {
        const url = new URL(im.src);
        expect(config, c.slug).toContain(url.hostname);
        expect(im.alt.length, c.slug).toBeGreaterThan(10);
        expect(im.width * im.height, c.slug).toBeGreaterThan(0);
      }
      expect(c.offers.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("pair with a real industry page and with the homepage cards", () => {
    const home = read("components/home/experience/Sections.tsx");
    for (const c of CONCEPTS) {
      expect(getIndustry(c.slug), c.slug).toBeTruthy();
      expect(home).toContain(`/examples/${c.slug}`);
      expect(getConcept(c.slug)).toBe(c);
    }
  });

  it("claim nothing: no reviews, ratings, results, fake phone numbers or prices, and they say they're invented", () => {
    const text = JSON.stringify(CONCEPTS);
    expect(text).not.toMatch(/★|stars?\b|review|rated|testimonial|customers? (say|love)|\b\d+\+? (clients|customers)|555-|\$\d/i);
    expect(read("components/concepts/ConceptSite.tsx")).toContain("is an invented business");
    expect(read("app/examples/[industry]/page.tsx")).toContain("An invented business");
    expect(read("app/examples/page.tsx")).toContain("not customer sites");
  });

  it("hide themselves (page, nav, sitemap, homepage link) unless the set is complete, and retire the old samples to their industry page", () => {
    expect(read("app/examples/page.tsx")).toContain('if (!SHOW_EXAMPLES) redirect("/pricing")');
    expect(read("app/examples/[industry]/page.tsx")).toContain("redirect(`/websites/${params.industry}`)");
    expect(read("components/shared/SiteHeader.tsx")).toContain('SHOW_EXAMPLES || n.href !== "/examples"');
    expect(read("app/sitemap.ts")).toContain("SHOW_EXAMPLES ? CONCEPTS : []");
    expect(read("app/classic/page.tsx")).toContain("<Reimagined showConcepts={SHOW_EXAMPLES} />");
  });
});
