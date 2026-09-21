import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { AUDIT_DEFINITIONS, auditReportText, buildGrowthAudit, type AuditInput, type ProductFacts } from "@/lib/audit/growthAudit";
import type { AuditResult, Finding } from "@/lib/prospects/audit";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const facts: Record<string, ProductFacts> = {
  "starter-website": { slug: "starter-website", name: "Quick Business Website", priceCents: PRICE_CENTS["starter-website"], turnaround: "72 hours" },
  "nfc-cards": { slug: "nfc-cards", name: "NFC Cards", priceCents: PRICE_CENTS["nfc-cards"], turnaround: "5-7 business days" },
  "ugc-ad-special": { slug: "ugc-ad-special", name: "UGC Ad Special", priceCents: PRICE_CENTS["ugc-ad-special"], turnaround: "5-7 days" },
  "lead-engine": { slug: "lead-engine", name: "Lead Engine", priceCents: PRICE_CENTS["lead-engine"], turnaround: "2-3 weeks" },
  "strategy-session": { slug: "strategy-session", name: "Strategy Session", priceCents: PRICE_CENTS["strategy-session"], turnaround: "60 minutes" },
};

const input = (over: Partial<AuditInput> = {}): AuditInput => ({ businessName: "Joe's Cuts", website: "https://joescuts.example", email: "joe@joescuts.example", goal: "customers", channels: ["Google Business Profile", "Facebook or Instagram"], ...over });

const good = (key: string, label: string): Finding => ({ key, label, ok: true });
const bad = (key: string, label: string, detail?: string): Finding => ({ key, label, ok: false, detail });
const site = (findings: Finding[], over: Partial<AuditResult> = {}): AuditResult => ({ checkedAt: "2026-09-20T00:00:00Z", url: "https://joescuts.example/", finalUrl: "https://joescuts.example/", reachable: true, findings, problems: findings.filter((f) => f.ok === false).length, ...over });
const HEALTHY = site([good("https", "Loads securely (https)"), good("viewport", "Declares a mobile layout"), good("title", "Has a page title"), good("phone", "Shows a phone number"), good("tap_to_call", "Phone number is tap-to-call")]);

describe("growth audit: the three kinds of statement", () => {
  it("keeps observed facts, recommendations, and estimates apart, and defines each", () => {
    const r = buildGrowthAudit(input(), HEALTHY, facts);
    expect(Object.keys(r).sort()).toEqual(expect.arrayContaining(["observed", "recommended", "estimated"]));
    expect(AUDIT_DEFINITIONS.observed).toMatch(/directly from your public homepage/);
    expect(AUDIT_DEFINITIONS.estimated).toMatch(/not predictions of traffic, rankings, leads, or sales/);
    for (const i of r.observed.items) expect(["your website", "you told us"]).toContain(i.source);
  });

  it("only reports what was read from the page or told to us, and labels which", () => {
    const r = buildGrowthAudit(input(), HEALTHY, facts);
    const fromSite = r.observed.items.filter((i) => i.source === "your website").map((i) => i.label);
    expect(fromSite).toEqual(["Loads securely (https)", "Declares a mobile layout", "Has a page title", "Shows a phone number", "Phone number is tap-to-call"]);
    expect(r.observed.items.filter((i) => i.source === "you told us").map((i) => i.label)).toEqual(expect.arrayContaining(["Your goal", "Where customers find you today"]));
  });

  it("never predicts traffic, rankings, leads, or revenue, and never promises a result", () => {
    for (const i of [input(), input({ goal: "reviews" }), input({ goal: "automate", website: null })]) {
      const t = auditReportText(buildGrowthAudit(i, i.website ? HEALTHY : null, facts)).replace(AUDIT_DEFINITIONS.estimated, "");
      expect(t).not.toMatch(/guarantee|will (increase|grow|double|triple)|more (sales|revenue)|\d+%|per month in (leads|sales)|rank(s|ing)? (higher|first)/i);
      expect(t).not.toMatch(/[—–]/);
    }
  });

  it("gives every recommendation the facts or answers it rests on", () => {
    for (const i of [input(), input({ website: null, channels: [] }), input({ goal: "reviews", channels: [] }), input({ goal: "automate" })]) {
      const r = buildGrowthAudit(i, i.website ? HEALTHY : null, facts);
      expect(r.recommended.length).toBeGreaterThan(0);
      for (const rec of r.recommended) expect(rec.basedOn.length, rec.id).toBeGreaterThan(0);
    }
  });
});

describe("growth audit: what it recommends, and why", () => {
  it("suggests a website when there is none", () => {
    const r = buildGrowthAudit(input({ website: null }), null, facts);
    const w = r.recommended.find((x) => x.id === "website")!;
    expect(w.slug).toBe("starter-website");
    expect(w.basedOn).toContain("You did not give a website address");
    expect(r.observed.website.note).toMatch(/nothing to check/);
  });

  it("suggests a website when the address answered with an error, or is only a social page", () => {
    const down = buildGrowthAudit(input(), site([{ key: "unreachable", label: "The website didn't load properly", ok: false }], { reachable: false, error: "The site returned status 500" }), facts);
    expect(down.recommended.find((x) => x.id === "website")!.basedOn).toContain("The address you gave answered with an error");
    const social = buildGrowthAudit(input({ website: "https://facebook.com/joes" }), site([bad("social_only", "Uses a social media page as its website", "facebook.com")]), facts);
    expect(social.recommended.find((x) => x.id === "website")!.basedOn).toContain("Your website address is a social media page");
  });

  it("does not judge a site it simply could not open (a timeout, a certificate it could not verify, a blocked address)", () => {
    for (const error of ["unable to verify the first certificate", "The request timed out", "Blocked: that address is not a public website"]) {
      const r = buildGrowthAudit(input({ goal: "customers" }), site([{ key: "unreachable", label: "Couldn't load the website", ok: null, detail: error }], { reachable: false, error }), facts);
      expect(r.recommended.some((x) => x.id === "website"), error).toBe(false);
      expect(r.recommended.some((x) => x.id === "leads"), error).toBe(false);
      expect(r.observed.website.note, error).toMatch(/could not open that address from our side, so we did not judge your site/);
      expect(auditReportText(r), error).not.toMatch(/did not load/);
    }
  });

  it("suggests a rebuild when the page has real problems, and leaves a healthy site alone", () => {
    const weak = buildGrowthAudit(input(), site([bad("viewport", "Declares a mobile layout"), bad("https", "Loads securely (https)"), bad("title", "Has a page title"), good("phone", "Shows a phone number")]), facts);
    const basedOn = weak.recommended.find((x) => x.id === "website")!.basedOn;
    expect(basedOn).toEqual(expect.arrayContaining(["The page has no mobile layout setting", "The page does not load securely"]));
    expect(buildGrowthAudit(input(), HEALTHY, facts).recommended.some((x) => x.id === "website")).toBe(false);
  });

  it("suggests NFC review cards for a reviews goal or no Google Business Profile, with an honest description", () => {
    const r = buildGrowthAudit(input({ goal: "reviews", channels: [] }), HEALTHY, facts);
    const rev = r.recommended.find((x) => x.id === "reviews")!;
    expect(rev.slug).toBe("nfc-cards");
    expect(rev.basedOn).toEqual(["You told us reviews are your goal", "You did not list a Google Business Profile"]);
    expect(rev.why).toMatch(/does not raise ratings by itself/);
    expect(rev.why).toMatch(/never write or buy reviews/);
    expect(buildGrowthAudit(input({ goal: "website" }), HEALTHY, facts).recommended.some((x) => x.id === "reviews")).toBe(false);
  });

  it("suggests a launch ad when there is no social or paid channel, and the Lead Engine when the goal is customers and the site works", () => {
    const r = buildGrowthAudit(input({ channels: ["Word of mouth and referrals"] }), HEALTHY, facts);
    expect(r.recommended.find((x) => x.id === "launch-ad")!.basedOn).toContain("You did not list social media or paid ads as a way customers find you");
    expect(r.recommended.find((x) => x.id === "leads")!.slug).toBe("lead-engine");
    const noGoal = buildGrowthAudit(input({ goal: "website", channels: ["Paid ads", "Google Business Profile"] }), HEALTHY, facts);
    expect(noGoal.recommended.some((x) => x.id === "launch-ad" || x.id === "leads")).toBe(false);
  });

  it("points a missing phone number to the Lead Engine, and automation to a conversation rather than a large build", () => {
    const noPhone = buildGrowthAudit(input({ goal: "website" }), site([good("https", "Loads securely (https)"), bad("phone", "Shows a phone number", "No phone number found on the page")]), facts);
    expect(noPhone.recommended.find((x) => x.id === "leads")!.basedOn).toContain("No phone number was found on your page");
    const auto = buildGrowthAudit(input({ goal: "automate" }), HEALTHY, facts);
    expect(auto.recommended.find((x) => x.id === "automate")!.slug).toBe("strategy-session");
    expect(auto.recommended.some((x) => ["saas", "agents"].includes(x.slug))).toBe(false);
  });

  it("falls back to a conversation when nothing points anywhere, and never suggests more than four things", () => {
    const quiet = buildGrowthAudit(input({ goal: "website", channels: ["Google Business Profile", "Paid ads"] }), HEALTHY, facts);
    expect(quiet.recommended.map((x) => x.id)).toEqual(["talk"]);
    const busy = buildGrowthAudit(input({ goal: "customers", website: null, channels: [] }), null, facts);
    expect(busy.recommended.length).toBeLessThanOrEqual(4);
  });
});

describe("growth audit: estimates and the bundle", () => {
  it("reads each price and delivery target from the live catalog facts, and falls back to the price list", () => {
    const r = buildGrowthAudit(input({ website: null, channels: [] }), null, { ...facts, "starter-website": { ...facts["starter-website"], priceCents: 31_500, turnaround: "3 days" } });
    expect(r.estimated.find((e) => e.title === "Quick Business Website")).toEqual({ title: "Quick Business Website", price: "$315", timing: "3 business days" });
    const noFacts = buildGrowthAudit(input({ website: null, channels: [] }), null, {});
    expect(noFacts.estimated[0].price).toBe(usd(PRICE_CENTS["starter-website"]));
    expect(noFacts.estimated[0].timing).toBeNull();
    expect(r.estimated.find((e) => e.title === "Strategy Session")).toBeUndefined();
  });

  it("shows the bundle only when it covers two or more of what was recommended, with a saving worked out from the price list", () => {
    const r = buildGrowthAudit(input({ website: null, goal: "reviews", channels: [] }), null, facts);
    expect(r.bundle).not.toBeNull();
    const parts = PRICE_CENTS["starter-website"] + 2 * PRICE_CENTS["cinematic-ad-special"] + 2 * PRICE_CENTS["ugc-ad-special"] + 3 * PRICE_CENTS["nfc-cards"];
    expect(r.bundle).toEqual({ title: "All-in-One Launch Bundle", price: usd(PRICE_CENTS["all-in-one-bundle"]), separately: usd(parts), saving: usd(parts - PRICE_CENTS["all-in-one-bundle"]) });
    expect(buildGrowthAudit(input({ goal: "automate", channels: ["Paid ads", "Google Business Profile"] }), HEALTHY, facts).bundle).toBeNull();
  });
});

describe("growth audit: the email and the endpoint", () => {
  it("writes all three sections into the email, in words a person can read", () => {
    const t = auditReportText(buildGrowthAudit(input({ website: null, channels: [] }), null, facts));
    expect(t).toMatch(/OBSERVED/);
    expect(t).toMatch(/RECOMMENDED/);
    expect(t).toMatch(/ESTIMATED/);
    expect(t).toMatch(/Based on:/);
    expect(t).toMatch(/cannot see your traffic/);
  });

  it("is defended: rate limits, a hidden bot field, required consent, safe website reading, and a paid unlock", () => {
    const route = readFileSync(join(process.cwd(), "app/api/audit/route.ts"), "utf8");
    expect(route).toContain("rateLimit(`audit:ip:");
    expect(route).toContain("rateLimit(`audit:email:");
    expect(route).toContain("company_url");
    expect(route).toContain("consent: z.literal(true)");
    expect(route).toContain("normalizeWebUrl(");
    expect(route).toContain("readSite(");
    expect(route).toContain('source: "growth-audit"');
    expect(route).toContain('trackFunnel("lead_submitted"');
    // the full report is never in the response: only a teaser and a way to pay
    expect(route).toContain("teaser: auditTeaser(report)");
    const response = route.slice(route.lastIndexOf("return NextResponse.json({"));
    expect(response).not.toMatch(/\n\s+report(:|,)/);
  });

  it("is a real page, in the sitemap, with the three labels explained", () => {
    const page = readFileSync(join(process.cwd(), "app/audit/page.tsx"), "utf8");
    expect(page).toContain("See what Patient Creations could improve in your business.");
    expect(readFileSync(join(process.cwd(), "app/sitemap.ts"), "utf8")).toContain("/audit");
    expect(readFileSync(join(process.cwd(), "components/audit/AuditReportView.tsx"), "utf8")).toContain("Get Your Patient Creations Growth Plan");
  });
});
