import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import robots from "@/app/robots";
import { middleware, config as middlewareConfig } from "@/middleware";
import { NextRequest } from "next/server";
import { AI_TRAINING_BOTS, SITE_COPIERS, isBlockedAgent } from "@/lib/security/scrapers";
import { COPYRIGHT_NOTICE, LEGAL_PAGES, copyrightYears } from "@/lib/legal/config";
import { copyrightDoc } from "@/lib/legal/copyright";
import { termsDoc } from "@/lib/legal/terms";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const textOf = () => copyrightDoc.sections.flatMap((s) => [s.title, s.callout ?? "", ...s.body.flatMap((b) => (typeof b === "string" ? [b] : b.list))]).join("\n");

describe("copyright notice", () => {
  it("states ownership by the company, and reserves every kind of copying we care about", () => {
    const t = textOf();
    expect(copyrightDoc.sections[0].callout).toContain("Patient Profits LLC");
    expect(copyrightDoc.sections[0].callout).toContain("All rights reserved");
    expect(t).toMatch(/copies the look, layout, text, motion, or code/);
    expect(t).toMatch(/scrapers, crawlers, site copiers/);
    expect(t).toMatch(/train, fine tune, test, or feed an artificial intelligence/);
    expect(t).toMatch(/text and data mining/);
    expect(t).toMatch(/source maps/);
    expect(t).toMatch(/frame, embed, or hotlink/);
    expect(t).toMatch(/statutory damages/);
  });

  it("does not overclaim: it says ideas and facts are not ours, and third-party parts keep their own licenses", () => {
    const t = textOf();
    expect(t).toMatch(/do not claim ownership of general ideas, facts, or ordinary business practices/);
    expect(t).toMatch(/stay under their own licenses/);
  });

  it("is linked in the footer list, the sitemap, and the Terms", () => {
    expect(LEGAL_PAGES.map((p) => p.href)).toContain("/copyright");
    expect(read("app/sitemap.ts")).toContain(`"copyright"`);
    expect(existsSync(join(process.cwd(), "app/copyright/page.tsx"))).toBe(true);
    const terms = termsDoc.sections.flatMap((s) => s.body.flatMap((b) => (typeof b === "string" ? [b] : b.list))).join("\n");
    expect(terms).toMatch(/Copyright and Site Use Notice/);
    expect(read("lib/legal/acceptableUse.ts")).toMatch(/using them to train or feed an artificial intelligence model/);
  });

  it("leaves court open for stopping misuse, matching the arbitration exception in the Terms", () => {
    expect(textOf()).toMatch(/not limited to arbitration/);
    const arbitration = termsDoc.sections.find((s) => s.id === "arbitration")!.body.join("\n");
    expect(arbitration).toMatch(/go to court to stop the actual or threatened misuse of intellectual property/);
  });

  it("prints the right years without anyone editing it", () => {
    expect(copyrightYears(new Date("2026-06-01"))).toBe("2026");
    expect(copyrightYears(new Date("2027-02-01"))).toBe("2026-2027");
    expect(COPYRIGHT_NOTICE).toBe("© 2026 Patient Profits LLC. All rights reserved.");
    expect(read("components/shared/SiteFooter.tsx")).toMatch(/copyrightYears\(\)/);
  });
});

describe("repository license", () => {
  it("is proprietary: all rights reserved, no open-source license, private package", () => {
    const license = read("LICENSE");
    expect(license).toMatch(/All rights reserved/);
    expect(license).toMatch(/not open source/);
    expect(license).toMatch(/train or fine tune any\s+artificial intelligence/);
    expect(license).not.toMatch(/MIT License|Apache License|GNU General Public/i);
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.license).toBe("UNLICENSED");
    expect(pkg.private).toBe(true);
  });
});

describe("blocking known copiers and AI training crawlers", () => {
  it("recognizes them by user agent, in any letter case", () => {
    expect(isBlockedAgent("Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)")).toBe(true);
    expect(isBlockedAgent("Mozilla/5.0 (compatible; ClaudeBot/1.0)")).toBe(true);
    expect(isBlockedAgent("CCBot/2.0 (https://commoncrawl.org/faq/)")).toBe(true);
    expect(isBlockedAgent("Mozilla/4.5 (compatible; HTTrack 3.0x; Windows 98)")).toBe(true);
    expect(isBlockedAgent("httrack")).toBe(true);
    expect(isBlockedAgent("Scrapy/2.11 (+https://scrapy.org)")).toBe(true);
  });

  it("never blocks ordinary browsers, search engines, payment or email services, or a missing user agent", () => {
    const fine = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36 Edg/126.0",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
      "curl/8.4.0",
      "Twilio",
      "Resend",
      "",
    ];
    for (const ua of fine) expect(isBlockedAgent(ua), ua).toBe(false);
    expect(isBlockedAgent(null)).toBe(false);
    expect(isBlockedAgent(undefined)).toBe(false);
  });

  it("answers a blocked visitor with 403 and the reason, and lets everyone else through", async () => {
    const blocked = middleware(new NextRequest("https://patientcreations.com/services", { headers: { "user-agent": "Mozilla/5.0 (compatible; GPTBot/1.1)" } }));
    expect(blocked.status).toBe(403);
    expect(await blocked.text()).toMatch(/not permitted/);
    const ok = middleware(new NextRequest("https://patientcreations.com/services", { headers: { "user-agent": "Mozilla/5.0 Chrome/126.0" } }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps robots.txt, the sitemap, the notice, and static files reachable for a blocked visitor", () => {
    const matcher = new RegExp(`^${middlewareConfig.matcher[0]}$`);
    for (const path of ["/services", "/", "/checkout", "/api/webhooks/stripe"]) expect(matcher.test(path), path).toBe(true);
    for (const path of ["/robots.txt", "/sitemap.xml", "/copyright", "/.well-known/tdmrep.json", "/_next/static/chunks/app.js", "/assets/hero/hero-poster.jpg"]) expect(matcher.test(path), path).toBe(false);
  });
});

describe("robots.txt", () => {
  const rules = () => {
    const r = robots().rules;
    return Array.isArray(r) ? r : [r];
  };

  it("refuses every listed AI training crawler on every path", () => {
    const rule = rules().find((r) => Array.isArray(r.userAgent) && r.userAgent.includes("GPTBot"))!;
    expect(rule.disallow).toBe("/");
    for (const bot of AI_TRAINING_BOTS) expect(rule.userAgent, bot).toContain(bot);
  });

  it("still lets ordinary search engines in and keeps private areas out", () => {
    const rule = rules().find((r) => r.userAgent === "*")!;
    expect(rule.allow).toBe("/");
    for (const p of ["/admin", "/portal", "/api", "/checkout"]) expect(rule.disallow, p).toContain(p);
  });

  it("does not list a search engine as blocked", () => {
    for (const name of [...AI_TRAINING_BOTS, ...SITE_COPIERS]) expect(name, name).not.toMatch(/googlebot$|bingbot|slurp|duckduckbot|baiduspider/i);
  });
});

describe("headers and source maps", () => {
  it("send the content reservation, refuse framing by other sites, and never ship source maps", async () => {
    const mod = await import("../../next.config.mjs");
    const cfg = mod.default as { productionBrowserSourceMaps: boolean; poweredByHeader: boolean; headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]> };
    expect(cfg.productionBrowserSourceMaps).toBe(false);
    expect(cfg.poweredByHeader).toBe(false);
    const all = await cfg.headers();
    expect(all[0].source).toBe("/:path*");
    const h = Object.fromEntries(all[0].headers.map((x) => [x.key, x.value]));
    expect(h["X-Robots-Tag"]).toBe("noai, noimageai");
    expect(h["tdm-reservation"]).toBe("1");
    expect(h["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(h["Content-Security-Policy"]).toBe("frame-ancestors 'self'");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("publishes the machine-readable text and data mining reservation", () => {
    const tdm = JSON.parse(read("public/.well-known/tdmrep.json"));
    expect(tdm[0]["tdm-reservation"]).toBe(1);
    expect(tdm[0]["tdm-policy"]).toBe("https://patientcreations.com/copyright");
  });
});
