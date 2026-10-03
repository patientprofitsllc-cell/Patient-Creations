import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { FUNNEL_EVENTS } from "@/lib/analytics/funnel";
import { GA_DEFAULT_ID, GA_EVENT_FOR, GA_HOSTS, safeParams } from "@/lib/analytics/ga";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const dir = (d: string) => readdirSync(join(process.cwd(), d)).map((f) => `${d}/${f}`);
// Everything the new homepage is built from.
const FILES = ["app/page.tsx", "components/home/StickyCta.tsx", ...dir("components/home/experience"), ...dir("components/motion")];

describe("the homepage persuades honestly", () => {
  it("has no countdown, timer, or deadline", () => {
    for (const f of FILES) {
      const t = read(f);
      expect(t, f).not.toMatch(/setInterval|countdown|expires? in|ends? (today|tonight|soon)|offer ends|hurry/i);
    }
  });

  it("invents no scarcity, client counts, or results", () => {
    for (const f of FILES) {
      const t = read(f);
      expect(t, f).not.toMatch(/only \d+ (left|spots?)|spots? left|limited (time|spots)|selling fast|\d[\d,]*\+? (happy )?(clients|customers|businesses)|guarantee/i);
    }
  });

  it("writes no reviews of its own: quotes come only from the database", () => {
    for (const f of FILES) expect(read(f), f).not.toMatch(/testimonial:\s*["'`]|<blockquote>[^<{]/);
    expect(read("components/home/experience/Proof.tsx")).toContain("canPublish: true");
  });

  it("turns motion off for anyone who asks for less", () => {
    const css = read("app/globals.css");
    for (const cls of [".reveal", ".word-rise", ".text-shimmer", ".cta-primary", ".marquee-track"]) {
      const reduced = css.slice(css.lastIndexOf("prefers-reduced-motion"));
      expect(reduced, cls).toContain(cls);
    }
  });
});

describe("Google Analytics", () => {
  it("decides a GA4 event (or none) for every funnel event", () => {
    for (const e of FUNNEL_EVENTS) expect(GA_EVENT_FOR, e).toHaveProperty([e]);
    expect(GA_EVENT_FOR.checkout_started).toBe("begin_checkout");
    expect(GA_EVENT_FOR.audit_started).toBe("generate_lead");
  });

  it("never sends personal details", () => {
    const sent = safeParams({ product: "website-special", name: "A", email: "a@b.c", phone: "1", address: "x", city: "y", zip: "1", ip: "1.2.3.4", client_ip: "1", card_last4: "4242", token: "t", description: "ok", value: 10 });
    expect(Object.keys(sent).sort()).toEqual(["description", "product", "value"]);
  });

  it("uses the site's tag, runs only on the live domain, skips Do Not Track, and keeps Google's ad features off", () => {
    expect(GA_DEFAULT_ID).toMatch(/^G-[A-Z0-9]+$/);
    expect(GA_HOSTS).toEqual(["patientcreations.com", "www.patientcreations.com"]);
    const c = read("components/analytics/GoogleAnalytics.tsx");
    expect(c).toContain("indexOf(location.hostname)<0)return;");
    expect(c).toMatch(/if \(!\/\^G-\[A-Z0-9\]\+\$\/\.test\(GA_ID\)\) return null;/);
    expect(c).toContain("doNotTrack");
    expect(c).toContain("allow_google_signals:false");
    expect(c).toContain("allow_ad_personalization_signals:false");
  });

  it("is disclosed in the Privacy Policy", () => {
    const p = read("lib/legal/privacy.ts");
    expect(p).toContain("Google Analytics");
    expect(p).toContain("tools.google.com/dlpage/gaoptout");
  });
});
