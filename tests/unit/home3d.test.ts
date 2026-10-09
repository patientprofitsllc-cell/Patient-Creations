import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { CONTACT_PHONE_DIGITS } from "@/lib/config/site";
import { topFaqs } from "@/lib/site/faq";
import { INDUSTRIES } from "@/lib/site/industries";
import { homeBlocks, homeValues, renderHome } from "@/lib/site/home/render";
import { HOME_TRACK_SCRIPT } from "@/lib/site/home/track";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const HOME = read("lib/site/home/home.html");
const industries = INDUSTRIES.map(({ slug, name }) => ({ slug, name }));
const blocks = (reviews: Parameters<typeof homeBlocks>[0]["reviews"] = []) => homeBlocks({ reviews, faqs: topFaqs({ bnpl: false }), industries });

describe("the 3D homepage", () => {
  it("types no price: every amount is a slot filled from the live price list", () => {
    expect(HOME).not.toMatch(/\$\s?\d/);
    const page = renderHome(HOME, homeValues({}), blocks());
    expect(page).not.toMatch(/\{\{[a-z-]+\}\}/);
    expect(page).toContain(`<span data-live="nfc-cards">${usd(PRICE_CENTS["nfc-cards"])}</span>`);
    expect(page).toContain(`<span data-live="website-special">${usd(PRICE_CENTS["website-special"])}</span>`);
  });

  it("follows a changed price, and its bundle saving is the real difference", () => {
    const v = homeValues({ "website-special": 150_000 });
    expect(v["website-special"]).toBe("$1,500");
    expect(v["bundle-separately"]).toBe("$3,312");
    expect(v["bundle-savings"]).toBe("$813");
  });

  it("refuses to serve a page with an unfilled slot", () => {
    expect(() => renderHome("<p>{{mystery}}</p>", homeValues({}))).toThrow(/mystery/);
  });

  it("loads only files that are in public/, and links to the rest of the site on the same host", () => {
    const assets = [...HOME.matchAll(/(?:src|href)="(\/assets\/experience\/[^"]+)"/g)].map((m) => m[1]);
    expect(assets.length).toBeGreaterThan(5);
    for (const a of assets) expect(existsSync(join(process.cwd(), "public", a)), a).toBe(true);
    const css = [...HOME.matchAll(/href="(\/assets\/experience\/styles\.[^"]+)"/g)].map((m) => m[1]);
    for (const f of read(`public${css[0]}`).match(/\/assets\/experience\/[^)"']+/g) ?? []) expect(existsSync(join(process.cwd(), "public", f)), f).toBe(true);
    expect(HOME).not.toMatch(/href="https:\/\/patientcreations\.com\/[a-z]/);
    for (const href of ["/checkout?product=nfc-cards", "/checkout?product=website-special", "/checkout?product=ugc-ad-special", "/checkout?product=all-in-one-bundle", "/pricing", "/audit"]) {
      expect(HOME).toContain(`href="${href}"`);
    }
  });

  it("is indexed as the homepage, while the old homepage at /classic is not", () => {
    expect(HOME).toContain('<link rel="canonical" href="https://patientcreations.com/" />');
    expect(read("app/classic/page.tsx")).toContain("robots: { index: false, follow: true }");
  });

  it("fills every block: the FAQ with its search markup, contact, and links to every industry page", () => {
    const page = renderHome(HOME, homeValues({}), blocks());
    expect(page).not.toMatch(/<!--\{\{[a-z-]+\}\}-->/);
    expect(page).toContain('"@type":"FAQPage"');
    expect((page.match(/<details>/g) ?? []).length).toBe(topFaqs({ bnpl: false }).length);
    expect(page).toContain(`href="tel:${CONTACT_PHONE_DIGITS}"`);
    for (const i of INDUSTRIES) expect(page).toContain(`href="/websites/${i.slug}"`);
    expect(() => renderHome("<!--{{mystery}}-->", {}, {})).toThrow(/mystery/);
  });

  it("shows reviews only when a real one exists, 4 stars and up, escaped, and never reads review text as a slot", () => {
    expect(blocks().proof).toBe("");
    const b = blocks([
      { rating: 5, testimonial: "Great <b>work</b> & fast {{nfc-cards}}", text: null },
      { rating: 3, testimonial: "Fine", text: null },
      { rating: 4, testimonial: "  ", text: null },
    ]);
    expect(b.proof).toContain("Great &lt;b&gt;work&lt;/b&gt; &amp; fast {{nfc-cards}}");
    expect(b.proof).not.toContain("Fine");
    expect((b.proof.match(/<figure>/g) ?? []).length).toBe(1);
    expect(b.proof).toContain("good or bad"); // the reward disclosure stays with the reviews
    const page = renderHome(`<!--{{proof}}-->{{nfc-cards}}`, homeValues({}), b);
    expect(page).toContain("fast {{nfc-cards}}");
    expect(page.endsWith(usd(PRICE_CENTS["nfc-cards"]))).toBe(true);
  });

  it("tracks the visit by the same rules as the rest of the site", () => {
    const attribution = read("lib/analytics/attribution.ts");
    expect(attribution).toContain('const KEY = "pc_attr"');
    expect(HOME_TRACK_SCRIPT).toContain('K="pc_attr"');
    expect(attribution).toContain("/^[A-Za-z0-9_-]{3,40}$/");
    expect(HOME_TRACK_SCRIPT).toContain("/^[A-Za-z0-9_-]{3,40}$/");
    expect(HOME_TRACK_SCRIPT).toContain('event:"landing_page_view"');
    expect(HOME_TRACK_SCRIPT).toContain('fetch("/api/track"');
    const route = read("app/route.ts");
    expect(route).toContain("HOME_TRACK_SCRIPT");
  });
});
