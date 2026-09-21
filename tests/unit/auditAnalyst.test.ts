import { describe, expect, it } from "vitest";
import { extractSiteFacts, type SiteFacts } from "@/lib/audit/diagnosis";
import { buildBriefing, type BriefingInput } from "@/lib/audit/briefing";
import { buildGrowthAudit, type AuditInput } from "@/lib/audit/growthAudit";
import type { AuditResult, Finding } from "@/lib/prospects/audit";
import { AUDIT_FEE_CENTS, PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

const STRONG = `<html><head><title>Joe's Cuts | Barber in Atlanta</title><meta name="viewport" content="width=device-width"><meta name="description" content="A friendly barbershop in Atlanta, walk-ins welcome and appointments open."><script src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234567"></script><script type="application/ld+json">{}</script></head>
<body><nav><a href="/">Home</a><a href="/services">Services</a><a href="/prices">Prices</a><a href="/about">About</a><a href="/gallery">Gallery</a><a href="/blog">Blog</a><a href="/faq">FAQ</a><a href="/contact">Contact</a></nav>
<h1>The best fade in Atlanta</h1><p>${words(400)}</p>
<a class="btn" href="/book">Book now</a><a href="tel:+14045550142">(404) 555-0142</a><form action="/x"><input name="q"></form>
<a href="https://g.page/r/abc/review">Review us on Google</a><a href="https://www.facebook.com/joescuts">Facebook</a><a href="https://instagram.com/joescuts">Instagram</a>
<img src="a.jpg" alt="A haircut"><img src="b.jpg" alt="Shop"><footer>© 2026 Joe's Cuts. 12 Main Street, Atlanta</footer></body></html>`;

const WEAK = `<html><head><title>Joe</title></head><body><h1>Welcome</h1><p>Hello.</p><img src="a.jpg"><img src="b.jpg"><img src="c.jpg"><img src="d.jpg"><footer>© 2018 Joe</footer></body></html>`;

describe("what the analyst reads on a homepage", () => {
  it("finds the calls to action, contact details, forms, reviews, social links, tracking, and platform that are really there", () => {
    const f = extractSiteFacts(STRONG);
    expect(f.title).toBe("Joe's Cuts | Barber in Atlanta");
    expect(f.h1).toBe("The best fade in Atlanta");
    expect(f.ctaExamples).toContain("Book now");
    expect(f.phone).toMatch(/404/);
    expect(f.forms).toBe(1);
    expect(f.reviewLink).toBe(true);
    expect(f.social).toEqual(expect.arrayContaining(["facebook.com", "instagram.com"]));
    expect(f.analytics).toContain("Google Analytics");
    expect(f.navLinks).toBe(8);
    expect(f.words).toBeGreaterThan(390);
    expect(f.copyrightYear).toBe(2026);
    expect(f.structuredData).toBe(true);
    expect(f.imagesMissingAlt).toBe(0);
  });

  it("finds the gaps on a thin page, and invents nothing", () => {
    const f = extractSiteFacts(WEAK);
    expect(f.phone).toBeNull();
    expect(f.email).toBeNull();
    expect(f.forms).toBe(0);
    expect(f.ctaExamples).toEqual([]);
    expect(f.reviewLink).toBe(false);
    expect(f.social).toEqual([]);
    expect(f.analytics).toEqual([]);
    expect(f.bookingWidget).toBeNull();
    expect(f.images).toBe(4);
    expect(f.imagesMissingAlt).toBe(4);
    expect(f.copyrightYear).toBe(2018);
    expect(f.words).toBeLessThan(20);
  });

  it("recognizes booking tools and site builders by their own markers", () => {
    expect(extractSiteFacts(`<a href="https://calendly.com/joe">Book</a>`).bookingWidget).toBe("Calendly");
    expect(extractSiteFacts(`<img src="https://static.wixstatic.com/x.jpg">`).platform).toBe("Wix");
    expect(extractSiteFacts(`<link href="/wp-content/themes/a.css">`).platform).toBe("WordPress");
    expect(extractSiteFacts(`<p>plain page</p>`).platform).toBeNull();
  });
});

// ---- the briefing ----

const input = (over: Partial<AuditInput> = {}): AuditInput => ({ businessName: "Joe's Cuts", website: "https://joescuts.example", email: "joe@x.example", goal: "customers", channels: ["Google Business Profile"], industry: "Barber", city: "Atlanta, GA", ...over });
const f = (key: string, label: string, ok: boolean | null): Finding => ({ key, label, ok });
const okSet: Finding[] = [f("https", "Loads securely (https)", true), f("viewport", "Declares a mobile layout", true), f("title", "Has a page title", true), f("description", "Has a search description", true), f("phone", "Shows a phone number", true), f("tap_to_call", "Phone number is tap-to-call", true), f("size", "Page is a reasonable size", true)];
const site = (findings: Finding[], over: Partial<AuditResult> = {}): AuditResult => ({ checkedAt: "2026-09-21T00:00:00Z", url: "https://joescuts.example/", finalUrl: "https://joescuts.example/", reachable: true, findings, problems: findings.filter((x) => x.ok === false).length, ...over });
const facts = (over: Partial<SiteFacts> = {}): SiteFacts => ({ ...extractSiteFacts(STRONG), ...over });
const credit = { code: "AUDIT-ABCDEFGH", amountCents: AUDIT_FEE_CENTS, days: 30 };

function briefing(i: AuditInput, s: AuditResult | null, fa: SiteFacts | null, extra: Partial<BriefingInput> = {}) {
  const report = buildGrowthAudit(i, s, {});
  return buildBriefing({ input: i, report, site: s, facts: fa, credit, now: new Date("2026-09-21T12:00:00Z"), ...extra });
}

describe("the analyst's briefing: what they need, and what to offer", () => {
  it("tells someone with no website to start with the Quick Business Website, and says why", () => {
    const b = briefing(input({ website: null }), null, null);
    expect(b.primary.slug).toBe("starter-website");
    expect(b.primary.price).toBe(usd(PRICE_CENTS["starter-website"]));
    expect(b.needs[0]).toMatchObject({ id: "no-site", severity: "high", evidence: ["They gave no website address"] });
    expect(b.confidence).toBe("medium");
  });

  it("tells someone whose site fails the basics on a phone the same, with the evidence", () => {
    const s = site([f("https", "Loads securely (https)", false), f("viewport", "Declares a mobile layout", false), f("title", "Has a page title", true), f("phone", "Shows a phone number", true)]);
    const b = briefing(input(), s, facts({ navLinks: 3, words: 300 }));
    expect(b.primary.slug).toBe("starter-website");
    expect(b.needs.map((n) => n.id)).toEqual(expect.arrayContaining(["mobile", "secure"]));
    expect(b.needs.find((n) => n.id === "mobile")!.evidence).toEqual(["The page has no mobile layout setting"]);
  });

  it("points a bigger multi page site with real problems to the Cinematic AI Website, not the one page site", () => {
    const s = site([f("https", "Loads securely (https)", false), f("viewport", "Declares a mobile layout", false), f("title", "Has a page title", true)]);
    const b = briefing(input(), s, facts());
    expect(b.primary.slug).toBe("site");
    expect(b.primary.price).toMatch(/^from \$/);
  });

  it("points a working site with no clear next step to the Lead Engine", () => {
    const b = briefing(input(), site(okSet), facts({ ctaExamples: [], forms: 0, bookingWidget: null, phone: "(404) 555-0142", navLinks: 4 }));
    expect(b.needs.find((n) => n.id === "cta")).toBeTruthy();
    expect(b.primary.slug).toBe("lead-engine");
  });

  it("points a good site whose owner wants reviews, with no review path, to NFC cards", () => {
    const b = briefing(input({ goal: "reviews", channels: [] }), site(okSet), facts({ reviewLink: false, testimonialsMention: false, navLinks: 4 }));
    expect(b.primary.slug).toBe("nfc-cards");
    expect(b.needs.find((n) => n.id === "reviews")!.severity).toBe("high");
    expect(b.avoid.join(" ")).toMatch(/Do not promise reviews or ratings/);
  });

  it("points a healthy site whose owner wants customers and has no ads to a launch ad, and never to a new website", () => {
    const b = briefing(input({ channels: [] }), site(okSet), facts({ navLinks: 4 }));
    expect(b.primary.slug).toBe("ugc-ad-special");
    expect(b.avoid.join(" ")).toMatch(/Do not sell a new website/);
  });

  it("sends an automation goal to a conversation first, never to the largest builds", () => {
    const b = briefing(input({ goal: "automate" }), site(okSet), facts());
    expect(b.primary.slug).toBe("strategy-session");
    expect(b.avoid.join(" ")).not.toMatch(/Do not lead with AI Software/);
    const other = briefing(input({ goal: "customers", channels: [] }), site(okSet), facts({ navLinks: 4 }));
    expect(other.avoid.join(" ")).toMatch(/Do not lead with AI Software/);
  });

  it("is honest about a site it could not open: low confidence, no judgment of the site, and a note to look at it yourself", () => {
    const s = site([{ key: "unreachable", label: "Couldn't load the website", ok: null, detail: "unable to verify the first certificate" }], { reachable: false, error: "unable to verify the first certificate" });
    const b = briefing(input(), s, null);
    expect(b.confidence).toBe("low");
    expect(b.needs.some((n) => n.id === "no-site" || n.id === "mobile" || n.id === "cta")).toBe(false);
    expect(b.nextAction).toMatch(/Open their website yourself/);
    expect(b.primary.slug).not.toBe("starter-website");
  });

  it("is highly confident only when it really read the page", () => {
    expect(briefing(input(), site(okSet), facts()).confidence).toBe("high");
    expect(briefing(input(), site(okSet.slice(0, 3)), facts()).confidence).toBe("medium");
  });

  it("lists needs worst first, and every need carries its evidence", () => {
    const s = site([f("https", "Loads securely (https)", false), f("viewport", "Declares a mobile layout", false), f("title", "Has a page title", true), f("description", "Has a search description", false), f("phone", "Shows a phone number", false)]);
    const b = briefing(input(), s, facts({ phone: null, ctaExamples: [], forms: 0, reviewLink: false, social: [], analytics: [], words: 60, navLinks: 3 }));
    const order = b.needs.map((n) => ({ high: 0, medium: 1, low: 2 })[n.severity]);
    expect(order).toEqual([...order].sort((a, c) => a - c));
    for (const n of b.needs) expect(n.evidence.length, n.id).toBeGreaterThan(0);
  });

  it("drafts a message that names what was found, the offer, the credit code, and the price after the credit", () => {
    const b = briefing(input({ website: null }), null, null);
    const net = usd(PRICE_CENTS["starter-website"] - AUDIT_FEE_CENTS);
    expect(b.suggestedMessage).toContain("Hi Joe's Cuts");
    expect(b.suggestedMessage).toContain("Quick Business Website");
    expect(b.suggestedMessage).toContain("AUDIT-ABCDEFGH");
    expect(b.suggestedMessage).toContain(net);
    expect(b.talkingPoints.join(" ")).toContain(net);
    expect(b.objections.map((o) => o.objection)).toEqual(expect.arrayContaining(["That is more than I wanted to spend.", "Can you guarantee this will get me customers?"]));
  });

  it("promises nothing, stays out of dashes, and suggests a next step that is small before it is large", () => {
    const cases = [briefing(input({ website: null }), null, null), briefing(input({ goal: "reviews", channels: [] }), site(okSet), facts({ reviewLink: false, testimonialsMention: false })), briefing(input({ goal: "automate" }), site(okSet), facts())];
    for (const b of cases) {
      const text = JSON.stringify(b);
      expect(text).not.toMatch(/guaranteed to|will (increase|double|triple|grow)|more (sales|revenue)|rank higher/i);
      expect(b.suggestedMessage + b.summary + b.nextAction).not.toMatch(/[—–]/);
      expect(b.objections.find((o) => /guarantee/i.test(o.objection))!.answer).toMatch(/No, and nobody honestly can/);
    }
  });

  it("suggests a second product from the customer ladder, and never the same one", () => {
    const b = briefing(input({ website: null }), null, null);
    expect(b.secondary).not.toBeNull();
    expect(b.secondary!.slug).not.toBe(b.primary.slug);
  });
});

describe("where the analyst lives", () => {
  it("is built on payment and shown only to the owner, in the admin area", async () => {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    expect(read("lib/audit/paid.ts")).toContain("buildBriefing(");
    expect(read("app/admin/layout.tsx")).toContain("/admin/audits");
    expect(read("app/api/admin/audits/[id]/contacted/route.ts")).toContain("requireAdmin()");
    expect(read("app/admin/audits/[id]/page.tsx")).toContain("Ready-to-send message");
    // the customer-facing report page never loads the briefing
    expect(read("app/audit/report/[token]/page.tsx")).not.toContain("briefing");
    expect(read("app/api/audit/route.ts")).not.toContain("briefingJson");
  });
});
