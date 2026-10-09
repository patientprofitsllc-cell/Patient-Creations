import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { JOURNEY, NEEDS, SUGGESTIONS } from "@/lib/journey/discovery";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const EXPERIENCE = ["OfferStack", "TrustRow", "Proof", "Sections", "Showcase", "ConceptSlides", "MoveTabs", "FindYourMove"].map((c) => `components/home/experience/${c}.tsx`);

describe("homepage: the ten-second test", () => {
  const home = read("app/classic/page.tsx");

  it("says what Patient Creations does in the headline, and what it helps with in the line under it", () => {
    expect(home).toContain('<WordRise text="Built to stand out." />');
    expect(home).toContain('<WordRise text="Made to move you forward."');
    expect(home).toContain("Cinematic websites. Content that gets noticed. AI that gets to work.");
  });

  it("opens with two buttons into the page (find your move, explore), and keeps checkout one tap away in the header and sticky bar", () => {
    const hero = home.slice(home.indexOf('id="hero"'), home.indexOf("</section>", home.indexOf('id="hero"')));
    const buttons = [...hero.matchAll(/<MagneticButton href=\{?"?([^"}\s]+)/g)].map((m) => m[1]);
    expect(buttons).toEqual(["#products", "#experience"]);
    expect(home).toContain("<FindYourMove />");
    expect(read("components/home/experience/FindYourMove.tsx")).toContain('id="products"');
    expect(read("components/home/experience/Showcase.tsx")).toContain('id="experience"');
    expect(read("components/shared/SiteHeader.tsx")).toContain("OFFER_CHECKOUT_HREF");
    expect(home).not.toMatch(/FREE GROWTH AUDIT/i);
  });

  it("explains the Growth Audit in two short points wherever it's offered", () => {
    for (const t of [home, read("components/home/experience/Sections.tsx")]) {
      expect(t).toContain("The Growth Audit helps you choose what to do first.");
      expect(t).toMatch(/credited toward your first order within \{(AUDIT_CREDIT_DAYS|creditDays)\} days/);
    }
  });

  it("keeps the next step in reach: a sticky button to the same checkout, hidden at the final call to action", () => {
    expect(home).toContain('id="hero"');
    expect(home).toContain('id="final-cta"');
    expect(home).toMatch(/<StickyCta label="Website Special" price=\{price\} href=\{OFFER_CHECKOUT_HREF\} \/>/);
  });

  it("shows only live prices: no dollar amount is typed into the homepage", () => {
    for (const f of ["app/classic/page.tsx", "components/home/StickyCta.tsx", ...EXPERIENCE]) expect(read(f), f).not.toMatch(/\$\s?\d/);
  });

  it("keeps the approved live hero and the strict tracking", () => {
    expect(home).toContain("<HeroBackdrop");
    expect(home).toContain('<TrackView event="landing_page_view" />');
  });

  it("runs in the concept site's order, with every price live and the answers one tap away", () => {
    const order = ["<Showcase", "<Marquee", "<TrustRow", "<BiggerPicture", "<Reimagined", "<FindYourMove", "<OfferStack prices={prices} />", "<IdeaToOnline", "topFaqs(", 'id="final-cta"'];
    const at = order.map((x) => home.indexOf(x));
    for (const [i, x] of order.entries()) expect(at[i], x).toBeGreaterThan(-1);
    expect([...at].sort((p, q) => p - q)).toEqual(at);
    expect(home).toContain('href="/faq"');
    for (const gone of ["<HomeTabs", "<OfferCard", "<SpecialsGrid", "<GrowthLadder"]) expect(home, gone).not.toContain(gone);
  });

  it("labels the sample designs as concepts and links each to its real sample page", () => {
    const s = read("components/home/experience/Sections.tsx");
    expect(s).toContain("Design concepts, not customer results.");
    for (const slug of ["barbers", "restaurants", "local-retail"]) expect(s).toContain(`/examples/${slug}`);
  });

  it("lets anyone pause the motion", () => {
    expect(home).toContain("<PauseMotion />");
    expect(read("app/globals.css")).toContain('html[data-motion="paused"]');
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
    expect(SUGGESTIONS.website[0].price).toBe(usd(PRICE_CENTS["website-special"]));
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
