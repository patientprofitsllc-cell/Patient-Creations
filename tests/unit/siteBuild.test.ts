import { describe, expect, it } from "vitest";
import { buildSiteConfig, contrast, patchSite, safeUrl, splitList, splitLines, type IntakeFacts } from "@/lib/site/build/config";
import { claimViolations, cleanDashes, factsText } from "@/lib/site/build/copy";
import { esc, renderHtml } from "@/lib/site/build/renderHtml";
import { runSiteQa } from "@/lib/site/build/qa";

const facts: IntakeFacts = {
  businessName: "Green Edge Lawn Care",
  businessType: "Landscaping",
  phone: "(555) 010-4477",
  description: "We mow, edge, and design lawns for homes in the Tri-City area.",
  address: "42 Oak Road, Tri-City",
  hours: "Mon to Sat 7am to 5pm",
  services: "Lawn mowing\nHedge trimming\nMulch and garden beds",
  pricing: "Mowing from $45\nCleanup $1,000 and up",
  bookingUrl: "",
  socialUrls: "instagram.com/greenedge\njavascript:alert(1)",
  colors: "#2f855a",
  fontStyle: "Friendly",
  goal: "CALL",
};

describe("buildSiteConfig", () => {
  it("styles by business type and uses only the customer's facts", () => {
    const site = buildSiteConfig(facts);
    expect(site.industrySlug).toBe("landscaping");
    expect(site.businessName).toBe("Green Edge Lawn Care");
    expect(site.services.map((s) => s.name)).toEqual(["Lawn mowing", "Hedge trimming", "Mulch and garden beds"]);
    expect(site.about).toContain("Tri-City");
    expect(site.ctaKind).toBe("call");
    expect(site.ctaHref).toBe("tel:5550104477");
  });

  it("keeps amounts with commas whole and splits single-line lists on commas", () => {
    expect(buildSiteConfig(facts).pricing).toEqual(["Mowing from $45", "Cleanup $1,000 and up"]);
    expect(splitLines("a, b\nc")).toEqual(["a, b", "c"]);
    expect(splitList("Mowing, Trimming, Mulch")).toEqual(["Mowing", "Trimming", "Mulch"]);
    expect(splitList("Cut, color\nBeard")).toEqual(["Cut, color", "Beard"]);
  });

  it("falls back to calling when the button needs a link or address that wasn't given", () => {
    expect(buildSiteConfig({ ...facts, goal: "BOOK", bookingUrl: "" }).ctaKind).toBe("call");
    expect(buildSiteConfig({ ...facts, goal: "VISIT", address: "" }).ctaKind).toBe("call");
    const book = buildSiteConfig({ ...facts, goal: "BOOK", bookingUrl: "calendly.com/green-edge" });
    expect(book.ctaKind).toBe("book");
    expect(book.ctaHref).toBe("https://calendly.com/green-edge");
  });

  it("drops non-web links and unreadable brand colors", () => {
    const site = buildSiteConfig(facts);
    expect(site.socials.map((s) => s.label)).toEqual(["Instagram"]);
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html,x")).toBeUndefined();
    expect(safeUrl("notaurl")).toBeUndefined();
    expect(site.tokens.accent).toBe("#2f855a");
    // A color the same as the template background would vanish, so it's ignored.
    const bg = site.tokens.bg;
    const same = buildSiteConfig({ ...facts, colors: bg });
    expect(same.tokens.accent).not.toBe(bg);
    expect(contrast(same.tokens.accent, same.tokens.bg)).toBeGreaterThanOrEqual(3);
  });

  it("leaves out services the customer never listed instead of inventing them", () => {
    expect(buildSiteConfig({ ...facts, services: "", pricing: "" }).services).toEqual([]);
  });
});

describe("renderHtml", () => {
  it("escapes customer text so it can't inject markup", () => {
    const site = buildSiteConfig({ ...facts, businessName: 'Evil <script>alert(1)</script> "Lawns"', description: "x <img src=x onerror=alert(1)> y is long enough to pass" });
    const html = renderHtml(site);
    expect(html).not.toContain("<script>alert(1)");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(esc(`a&b<c>"d"'e'`)).toBe("a&amp;b&lt;c&gt;&quot;d&quot;&#39;e&#39;");
  });

  it("keeps a </script> in the name from breaking out of the structured-data block", () => {
    const html = renderHtml(buildSiteConfig({ ...facts, businessName: "A</script><b>x" }));
    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
    expect(ld).not.toContain("</script>");
    expect(JSON.parse(ld).name).toBe("A</script><b>x");
  });

  it("only emits safe link schemes and no scripts besides structured data", () => {
    const html = renderHtml(buildSiteConfig(facts));
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs.every((h) => /^(https?:\/\/|tel:|sms:)/.test(h))).toBe(true);
    expect(html.match(/<script/g)?.length).toBe(1);
    expect(html).toContain('<meta name="viewport"');
  });
});

describe("runSiteQa", () => {
  it("passes a complete, honest build", () => {
    const site = buildSiteConfig(facts);
    const qa = runSiteQa(site, renderHtml(site));
    expect(qa.errors).toEqual([]);
    expect(qa.passed).toBe(true);
  });

  it("warns, but still passes, when the customer skipped optional details", () => {
    const site = buildSiteConfig({ ...facts, services: "", hours: "", address: "", pricing: "" });
    const qa = runSiteQa(site, renderHtml(site));
    expect(qa.passed).toBe(true);
    expect(qa.warnings.length).toBeGreaterThanOrEqual(3);
  });

  it("blocks a page that carries sample-template text", () => {
    const site = buildSiteConfig({ ...facts, description: "Visit Sample Barbershop at 123 Main Street, Your City for a great time today." });
    const qa = runSiteQa(site, renderHtml(site));
    expect(qa.passed).toBe(false);
    expect(qa.errors.join(" ")).toMatch(/sample-design text/i);
  });

  it("blocks unreadable text and a broken main button", () => {
    const site = buildSiteConfig(facts);
    const bad = { ...site, tokens: { ...site.tokens, text: "#222222", bg: "#1b1b1b" }, ctaHref: "tel:" };
    const qa = runSiteQa(bad, renderHtml(bad));
    expect(qa.passed).toBe(false);
    expect(qa.errors.join(" ")).toMatch(/Body text/);
    expect(qa.errors.join(" ")).toMatch(/Main button/);
  });
});

describe("claimViolations", () => {
  const source = factsText(facts);

  it("allows wording built from the customer's own facts", () => {
    expect(claimViolations("Lawn care for homes in the Tri-City area", source)).toEqual([]);
  });

  it("flags invented claims and numbers", () => {
    expect(claimViolations("The best award-winning lawn care", source)).toEqual(expect.arrayContaining(["best", "award-winning"]));
    expect(claimViolations("Serving Tri-City for 25 years", source)).toContain("25");
    expect(claimViolations("Fully licensed and insured", source)).toEqual(expect.arrayContaining(["licensed", "insured"]));
  });

  it("allows a claim the customer made themselves", () => {
    const own = factsText({ ...facts, description: "We are licensed and insured, with 20 years of experience." });
    expect(claimViolations("Licensed and insured with 20 years of experience", own)).toEqual([]);
  });

  it("does not let a stray digit match hide an invented number", () => {
    // The address contains "42"; "4" must not be treated as known.
    expect(claimViolations("Rated #4", source)).toContain("4");
  });

  it("removes dashes used as punctuation", () => {
    expect(cleanDashes("Fresh cuts — clean lines")).toBe("Fresh cuts, clean lines");
  });
});

describe("patchSite", () => {
  const site = buildSiteConfig(facts);

  it("updates the phone and the call button together", () => {
    const next = patchSite(site, { phone: "(555) 010-9999" });
    expect(next.phone).toBe("(555) 010-9999");
    expect(next.ctaHref).toBe("tel:5550109999");
  });

  it("ignores an accent color that can't be read on the background", () => {
    const next = patchSite(site, { accent: site.tokens.bg });
    expect(next.tokens.accent).toBe(site.tokens.accent);
    expect(patchSite(site, { accent: "#8a1c1c" }).tokens.accent).toBe("#8a1c1c");
  });

  it("replaces the service list and drops old blurbs", () => {
    const next = patchSite(site, { services: ["Mowing", "Leaf removal"] });
    expect(next.services).toEqual([{ name: "Mowing" }, { name: "Leaf removal" }]);
  });
});
