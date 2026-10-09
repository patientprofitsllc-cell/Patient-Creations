import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { homeValues, renderHome } from "@/lib/site/home/render";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const HOME = read("lib/site/home/home.html");

describe("the 3D homepage", () => {
  it("types no price: every amount is a slot filled from the live price list", () => {
    expect(HOME).not.toMatch(/\$\s?\d/);
    const page = renderHome(HOME, homeValues({}));
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
});
