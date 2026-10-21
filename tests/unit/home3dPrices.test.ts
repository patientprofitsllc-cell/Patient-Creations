import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homeValues } from "@/lib/site/home/render";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

// The 3D homepage scene is a prebuilt script. Its prices must come from the live rows (window.PC_PRICES, written by
// app/route.ts), never from numbers baked into the script, or the homepage shows old prices after a price change.
describe("the 3D homepage scene", () => {
  const file = /\/assets\/experience\/(app\.[0-9a-f]+\.js)/.exec(read("lib/site/home/home.html"))![1];
  const js = read(`public/assets/experience/${file}`);

  it("loads a script that exists", () => {
    expect(existsSync(join(process.cwd(), "public/assets/experience", file))).toBe(true);
  });

  it("quotes no price of its own except as a fallback behind the live price", () => {
    const priced = [...js.matchAll(/"[^"\n]{0,200}\$[0-9][^"\n]{0,200}"/g)].map((m) => m[0]);
    for (const p of priced) expect(p, p).toMatch(/^"\$[0-9][0-9,]*"$/);
    for (const key of ["website-special", "ugc-ad-special", "cinematic-ad-special", "ads-monthly-300", "bundle-savings"]) {
      expect(js, key).toContain(`(window.PC_PRICES||{})["${key}"]`);
      expect(homeValues({})[key], key).toBeTruthy();
    }
  });

  it("is given the live prices by the homepage route", () => {
    expect(read("app/route.ts")).toContain("window.PC_PRICES=");
  });
});
