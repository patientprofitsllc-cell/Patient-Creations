import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { anonymize, transformHtml, transformCss, transformJs, unavailablePage } from "@/lib/site/showcaseTransform";
import { SHOWCASE_SITES } from "@/lib/site/showcaseSites";
import robots from "@/app/robots";
import { GENERIC_NAME, LITERALS, NAMES, UPSTREAM } from "@/lib/site/showcaseUpstream.mjs";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const fixture = read("tests/fixtures/restaurant-page.html");
const host = UPSTREAM["restaurant-1"];
const out = transformHtml(fixture, { slug: "restaurant-1", host, siteUrl: "https://patientcreations.com", names: NAMES["restaurant-1"], generic: GENERIC_NAME });

describe("showcase pages", () => {
  it("the fixture really is an upstream page", () => {
    expect(fixture.toLowerCase()).toContain("higgsfield");
    expect(fixture).toMatch(/<script/i);
  });

  it("keep the site's scripts (so animation and video work) but load them from our folder, and name nothing of the platform", () => {
    expect(out).toMatch(/<script[^>]*src="\/showcase\/restaurant-1\/_js\/[\w.-]+\.js"/);
    expect(out).not.toMatch(/src="\/assets\//);
    expect(out.toLowerCase()).not.toContain("higgsfield");
    expect(out).not.toContain(host);
  });

  it("point assets and stylesheets at our own /showcase path, and add the top bar and noindex", () => {
    expect(out).not.toMatch(/(["'(=])\/assets\//);
    expect(out).toContain("/showcase/restaurant-1/");
    expect(out).toMatch(/\/showcase\/restaurant-1\/_css\/[\w.-]+\.css/);
    expect(out).toContain("data-pc-bar");
    expect(out).toContain("All examples");
    expect(out).toContain("noindex");
  });

  it("rewrites stylesheet font urls and scrubs platform names", () => {
    const css = transformCss("@font-face{src:url(/assets/a.woff2)} /* higgsfield */ .x{background:url('/assets/b.webp')}", "restaurant-1");
    expect(css).toContain("/showcase/restaurant-1/assets/a.woff2");
    expect(css).toContain("/showcase/restaurant-1/assets/b.webp");
    expect(css.toLowerCase()).not.toContain("higgsfield");
  });

  it("adjusts the router script to run from a sub-path, and points its asset paths at our folder", () => {
    const js = 'x={parseLocation:1};const r=e?.createHref??(e=>e),c=e?.parseLocation??(()=>rn(`${t.location.pathname}${t.location.search}`,1));import("/assets/routes-AB.js");f("/assets/hero.mp4");g(`/assets/styles-AB.css`);u="https://' + host + '/a"';
    const out2 = transformJs(js, "restaurant-1", host);
    expect(out2).toContain('t.location.pathname.startsWith("/showcase/restaurant-1")');
    expect(out2).toContain('createHref??(e=>e.startsWith("/showcase/restaurant-1")?e:"/showcase/restaurant-1"+e)');
    expect(out2).toContain('"/showcase/restaurant-1/_js/routes-AB.js"');
    expect(out2).toContain('"/showcase/restaurant-1/assets/hero.mp4"');
    expect(out2).toContain("`/showcase/restaurant-1/_css/styles-AB.css`");
    expect(out2).not.toContain(host);
    const loader = transformJs("mu=function(e){return`/`+e},", "restaurant-1", host);
    expect(loader).toContain('"/showcase/restaurant-1/_js/"+n');
    expect(loader).toContain('"/showcase/restaurant-1/_css/"+n');
    expect(loader).not.toContain("return`/`+");
  });

  it("a friendly page when the source is down", () => {
    expect(unavailablePage()).toMatch(/temporarily unavailable/i);
  });
});

describe("the examples page and its route", () => {
  it("never expose the source addresses in browser-facing code", () => {
    const shipped = [read("app/examples/page.tsx"), read("components/examples/ClientSites.tsx"), JSON.stringify(SHOWCASE_SITES)].join("\n");
    expect(shipped.toLowerCase()).not.toContain("higgsfield");
  });

  it("list four example sites with no business names, all on our own domain", () => {
    expect(SHOWCASE_SITES).toHaveLength(4);
    const cards = JSON.stringify(SHOWCASE_SITES) + read("components/examples/ClientSites.tsx") + read("app/examples/page.tsx");
    for (const s of SHOWCASE_SITES) {
      expect(s.href).toBe(`/showcase/${s.slug}`);
      expect(Object.keys(UPSTREAM)).toContain(s.slug);
    }
    for (const names of Object.values(NAMES)) for (const n of names) expect(cards.toLowerCase(), n).not.toContain(n.toLowerCase());
    expect(cards).not.toMatch(/fitform|otistheprophet|gonatural|priscill/i);
  });

  it("replaces the business name in the page text (every spelling and the upper-case form) and in the script data", () => {
    expect(out).not.toMatch(/Frank|FRANK/);
    expect(out).toContain(GENERIC_NAME);
    expect(out).toContain(GENERIC_NAME.toUpperCase());
    const js = transformJs('t="Frank\'s Alley";u="Frank&#x27;s Alley"', "restaurant-1", host, NAMES["restaurant-1"], GENERIC_NAME);
    expect(js).not.toMatch(/Frank/);
    const split = anonymize("<h1>FRANK’S<br/>ALLEY</h1>", NAMES["restaurant-1"], GENERIC_NAME);
    expect(split).not.toMatch(/FRANK|ALLEY/);
  });

  it("replaces a name the script renders in separate pieces, but not longer text that contains the word", () => {
    const js = transformJs('a=["Kickin",jsx("br"),"Bites"];b="Kickin Chicken Fries"', "restaurant-4", host, NAMES["restaurant-4"], GENERIC_NAME, LITERALS["restaurant-4"]);
    expect(js).toContain(`["${GENERIC_NAME}",jsx("br"),""]`);
    expect(js).toContain('"Kickin Chicken Fries"');
  });

  it("replaces the name inside map links", () => {
    const t = anonymize("destination=Frank%27s+Alley+1246+Broadway&q=Kickin%20Bites", ["Frank's Alley", "Kickin Bites"], GENERIC_NAME);
    expect(t).not.toMatch(/Frank|Kickin|Alley/);
    expect(t).toContain("Your+Restaurant+1246+Broadway");
  });

  it("replaces the business's own phone numbers and email addresses with placeholders", () => {
    const t = anonymize('<a href="tel:+17065051206">(706) 505-1206</a> <a href="mailto:info@kickinbites.com">info@kickinbites.com</a>');
    expect(t).not.toMatch(/706|505|kickinbites/);
    expect(t).toContain("hello@example.com");
  });

  it("only fetch from the allowlist, and stay out of search", () => {
    const route = read("app/showcase/[slug]/[[...path]]/route.ts");
    expect(route).toContain("hasOwnProperty");
    expect(route).toContain("noindex");
    expect(read("app/sitemap.ts")).not.toContain("showcase");
    expect(read("app/sitemap.ts")).not.toContain("showcase");
  });

  it("keep linked utility pages crawlable but noindex, so Search Console does not report them as blocked by robots.txt", () => {
    const rules = JSON.stringify(robots().rules);
    for (const p of ["/cart", "/showcase", "/owner-setup"]) expect(rules, p).not.toContain(`"${p}"`);
    const config = read("next.config.mjs");
    expect(config).toContain('source: "/showcase/:path*"');
    expect(read("app/cart/page.tsx")).toContain("index: false");
    expect(read("app/owner-setup/page.tsx")).toContain("index: false");
  });

  it("give every public page in the sitemap its own canonical address", () => {
    for (const slug of ["agents", "services", "gallery", "guided-app-tour"]) {
      const src = read(`app/${slug}/page.tsx`);
      expect(src, slug).toContain(`canonical: "/${slug}"`);
    }
  });
});
