import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { transformHtml, transformCss, transformJs, unavailablePage } from "@/lib/site/showcaseTransform";
import { SHOWCASE_SITES } from "@/lib/site/showcaseSites";
import { UPSTREAM } from "@/lib/site/showcaseUpstream.mjs";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const fixture = read("tests/fixtures/franks-alley.html");
const host = UPSTREAM["franks-alley"];
const out = transformHtml(fixture, { slug: "franks-alley", host, siteUrl: "https://patientcreations.com" });

describe("showcase pages", () => {
  it("the fixture really is an upstream page", () => {
    expect(fixture.toLowerCase()).toContain("higgsfield");
    expect(fixture).toMatch(/<script/i);
  });

  it("keep the site's scripts (so animation and video work) but load them from our folder, and name nothing of the platform", () => {
    expect(out).toMatch(/<script[^>]*src="\/showcase\/franks-alley\/_js\/[\w.-]+\.js"/);
    expect(out).not.toMatch(/src="\/assets\//);
    expect(out.toLowerCase()).not.toContain("higgsfield");
    expect(out).not.toContain(host);
  });

  it("point assets and stylesheets at our own /showcase path, and add the top bar and noindex", () => {
    expect(out).not.toMatch(/(["'(=])\/assets\//);
    expect(out).toContain("/showcase/franks-alley/");
    expect(out).toMatch(/\/showcase\/franks-alley\/_css\/[\w.-]+\.css/);
    expect(out).toContain("data-pc-bar");
    expect(out).toContain("All examples");
    expect(out).toContain("noindex");
  });

  it("rewrites stylesheet font urls and scrubs platform names", () => {
    const css = transformCss("@font-face{src:url(/assets/a.woff2)} /* higgsfield */ .x{background:url('/assets/b.webp')}", "franks-alley");
    expect(css).toContain("/showcase/franks-alley/assets/a.woff2");
    expect(css).toContain("/showcase/franks-alley/assets/b.webp");
    expect(css.toLowerCase()).not.toContain("higgsfield");
  });

  it("adjusts the router script to run from a sub-path, and points its asset paths at our folder", () => {
    const js = 'x={parseLocation:1};const r=e?.createHref??(e=>e),c=e?.parseLocation??(()=>rn(`${t.location.pathname}${t.location.search}`,1));import("/assets/routes-AB.js");f("/assets/hero.mp4");u="https://' + host + '/a"';
    const out2 = transformJs(js, "franks-alley", host);
    expect(out2).toContain('t.location.pathname.startsWith("/showcase/franks-alley")');
    expect(out2).toContain('createHref??(e=>e.startsWith("/showcase/franks-alley")?e:"/showcase/franks-alley"+e)');
    expect(out2).toContain('"/showcase/franks-alley/_js/routes-AB.js"');
    expect(out2).toContain('"/showcase/franks-alley/assets/hero.mp4"');
    expect(out2).not.toContain(host);
    const loader = transformJs("mu=function(e){return`/`+e},", "franks-alley", host);
    expect(loader).toContain('"/showcase/franks-alley/_js/"+n');
    expect(loader).toContain('"/showcase/franks-alley/_css/"+n');
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

  it("list all seven sites, with the four restaurants on our own domain", () => {
    expect(SHOWCASE_SITES).toHaveLength(7);
    for (const s of SHOWCASE_SITES.filter((x) => !x.external)) {
      expect(s.href).toBe(`/showcase/${s.slug}`);
      expect(Object.keys(UPSTREAM)).toContain(s.slug);
    }
    expect(SHOWCASE_SITES.filter((x) => x.external).map((x) => new URL(x.href).hostname)).toEqual(["www.fitformelite.com", "www.otistheprophet.com", "www.gonaturalwithpriscillia.com"]);
  });

  it("only fetch from the allowlist, and stay out of search", () => {
    const route = read("app/showcase/[slug]/[[...path]]/route.ts");
    expect(route).toContain("hasOwnProperty");
    expect(route).toContain("noindex");
    expect(read("app/robots.ts")).toContain("/showcase");
    expect(read("app/sitemap.ts")).not.toContain("showcase");
  });
});
