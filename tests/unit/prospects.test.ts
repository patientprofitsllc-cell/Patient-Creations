import { describe, expect, it } from "vitest";
import { isBlockedAddress, normalizeWebUrl, safeFetchHtml } from "@/lib/prospects/net";
import { auditHtml, type AuditResult } from "@/lib/prospects/audit";
import { ADDRESS_PLACEHOLDER, draftOutreach, pickObservations } from "@/lib/prospects/outreach";
import { dedupeKeyFor, industrySlugFor, parseImport, splitCsvLine } from "@/lib/prospects/service";

describe("isBlockedAddress", () => {
  it("blocks loopback, private, link-local (cloud metadata), and reserved IPv4", () => {
    for (const a of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "198.18.0.1"]) {
      expect(isBlockedAddress(a), a).toBe(true);
    }
  });

  it("blocks private IPv6, and IPv4 hidden inside IPv6", () => {
    for (const a of ["::1", "::", "fc00::1", "fd12::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:10.0.0.5", "::ffff:169.254.169.254"]) {
      expect(isBlockedAddress(a), a).toBe(true);
    }
  });

  it("allows ordinary public addresses", () => {
    for (const a of ["93.184.216.34", "8.8.8.8", "172.32.0.1", "172.15.0.1", "2606:4700:4700::1111"]) {
      expect(isBlockedAddress(a), a).toBe(false);
    }
  });

  it("refuses anything that isn't an IP address", () => {
    expect(isBlockedAddress("localhost")).toBe(true);
    expect(isBlockedAddress("")).toBe(true);
  });
});

describe("normalizeWebUrl", () => {
  it("adds https and accepts ordinary addresses", () => {
    expect(normalizeWebUrl("example.com")?.toString()).toBe("https://example.com/");
    expect(normalizeWebUrl("http://example.com/path")?.protocol).toBe("http:");
  });

  it("rejects other schemes, credentials, odd ports, and non-addresses", () => {
    for (const bad of ["javascript:alert(1)", "file:///etc/passwd", "ftp://example.com", "https://user:pw@example.com", "https://example.com:8080", "localhost", "notaurl", "", "  "]) {
      expect(normalizeWebUrl(bad), bad).toBeNull();
    }
  });
});

describe("safeFetchHtml refuses internal targets before making any request", () => {
  it("blocks IP literals for loopback and metadata", async () => {
    await expect(safeFetchHtml("http://127.0.0.1/")).rejects.toThrow(/not a public website/);
    await expect(safeFetchHtml("http://169.254.169.254/latest/meta-data/")).rejects.toThrow(/not a public website/);
    await expect(safeFetchHtml("http://[::1]/")).rejects.toThrow();
  });

  it("blocks a name that resolves to loopback", async () => {
    await expect(safeFetchHtml("http://localtest.me/")).rejects.toThrow();
  });

  it("rejects things that aren't web addresses", async () => {
    await expect(safeFetchHtml("file:///etc/passwd")).rejects.toThrow(/website address/);
  });
});

const goodHtml = `<!doctype html><html><head><title>Ace Barbers</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Classic cuts and hot shaves in the heart of town."></head>
<body><h1>Ace Barbers</h1><p>${"We cut hair. ".repeat(40)}</p><a href="tel:5550101234">(555) 010-1234</a><footer>&copy; 2026 Ace Barbers</footer></body></html>`;
const weakHtml = `<html><head></head><body><p>Welcome</p><footer>Copyright 2018 Old Shop</footer></body></html>`;
const now = new Date("2026-09-18T12:00:00Z");
const byKey = (f: ReturnType<typeof auditHtml>, k: string) => f.find((x) => x.key === k);

describe("auditHtml", () => {
  it("passes a solid page on everything it checks", () => {
    const f = auditHtml(goodHtml, "https://acebarbers.com/", 5000, now);
    expect(f.filter((x) => x.ok === false)).toEqual([]);
  });

  it("flags only what is actually missing on a weak page", () => {
    const f = auditHtml(weakHtml, "http://oldshop.com/", 500, now);
    for (const k of ["https", "viewport", "title", "description", "phone", "tap_to_call", "stale_year", "content"]) {
      expect(byKey(f, k)?.ok, k).toBe(false);
    }
    expect(byKey(f, "stale_year")?.detail).toContain("2018");
  });

  it("recognizes a phone number written in text but says it isn't tap-to-call", () => {
    const f = auditHtml(`<html><head><meta name="viewport" content="width=device-width"><title>x</title></head><body>Call (555) 010-1234 today</body></html>`, "https://a.com/", 500, now);
    expect(byKey(f, "phone")?.ok).toBe(true);
    expect(byKey(f, "tap_to_call")?.ok).toBe(false);
  });

  it("flags a social page used as a website", () => {
    expect(byKey(auditHtml(goodHtml, "https://www.facebook.com/acebarbers", 5000, now), "social_only")?.ok).toBe(false);
    expect(byKey(auditHtml(goodHtml, "https://acebarbers.com/", 5000, now), "social_only")).toBeUndefined();
  });

  it("does not call a current footer year stale", () => {
    expect(byKey(auditHtml(goodHtml, "https://a.com/", 5000, now), "stale_year")?.ok).toBe(true);
  });
});

const auditWith = (overrides: Record<string, boolean | null>): AuditResult => ({
  checkedAt: now.toISOString(),
  url: "https://x.com/",
  reachable: true,
  problems: 0,
  findings: Object.entries(overrides).map(([key, ok]) => ({ key, label: key, ok })),
});

describe("outreach drafts", () => {
  const opts = { priceCents: 30000, mailingAddress: "1 Main St, Columbus GA 31901" };

  it("mentions only real findings, at most two, most persuasive first", () => {
    const audit = auditWith({ no_website: null, https: false, viewport: false, tap_to_call: false, content: true });
    expect(pickObservations(audit, "Ace")).toHaveLength(2);
    expect(pickObservations(audit, "Ace")[0]).toMatch(/secure padlock/);
    expect(pickObservations(auditWith({ https: true, viewport: true }), "Ace")).toEqual([]);
    expect(pickObservations(null, "Ace")).toEqual([]);
  });

  it("never mentions a problem that wasn't found or couldn't be checked", () => {
    const d = draftOutreach({ businessName: "Ace Barbers", audit: auditWith({ https: true, viewport: null }) }, opts);
    expect(d.email).not.toMatch(/padlock|phones/);
  });

  it("uses the live price and the honest 72-hour target, and carries an opt-out and address", () => {
    const d = draftOutreach({ businessName: "Ace Barbers", industrySlug: "barbers", audit: auditWith({ viewport: false }) }, opts);
    expect(d.email).toContain("$300");
    expect(d.email).toMatch(/target is to have it ready in 72 hours/);
    expect(d.email).toContain('reply "no"');
    expect(d.email).toContain("1 Main St, Columbus GA 31901");
    expect(d.email).toContain("/websites/barbers");
    expect(draftOutreach({ businessName: "Ace", audit: null }, { priceCents: 45000 }).email).toContain("$450");
  });

  it("makes no guarantees and no ranking or invented claims, and no dashes", () => {
    const d = draftOutreach({ businessName: "Ace Barbers", audit: auditWith({ https: false, viewport: false }) }, opts);
    const all = [d.email, d.dm, d.followUp1, d.followUp2].join("\n").toLowerCase();
    expect(all).not.toMatch(/guarantee|rank|#1|google first|top of google|award|testimonial|reviews/);
    expect(all).not.toMatch(/[—–]/);
  });

  it("is signed by the company, not a person", () => {
    const d = draftOutreach({ businessName: "Ace", audit: null }, opts);
    expect(d.email).toContain("Patient Profits LLC");
    expect(d.email).not.toContain("Trenton");
  });

  it("warns when the mailing address is missing and shows a marker instead of inventing one", () => {
    const d = draftOutreach({ businessName: "Ace", audit: null }, { priceCents: 30000 });
    expect(d.email).toContain(ADDRESS_PLACEHOLDER);
    expect(d.warnings.join(" ")).toMatch(/CAN-SPAM/);
  });

  it("says plainly when the check found nothing specific", () => {
    const d = draftOutreach({ businessName: "Ace", audit: auditWith({ https: true }) }, opts);
    expect(d.warnings.join(" ")).toMatch(/nothing specific/);
    expect(d.email).toMatch(/came across Ace/);
  });
});

describe("import parsing and dedupe", () => {
  it("splits CSV lines honoring quotes", () => {
    expect(splitCsvLine('Ace Barbers, barbers, "Columbus, GA", 555-0101,,ace.com')).toEqual(["Ace Barbers", "barbers", "Columbus, GA", "555-0101", "", "ace.com"]);
    expect(splitCsvLine('"He said ""hi""",x')).toEqual(['He said "hi"', "x"]);
  });

  it("reads rows, skips a header, and reports bad lines instead of guessing", () => {
    const { rows, errors } = parseImport(
      ["Name,Industry,City,Phone,Email,Website", "Ace Barbers,barbers,Columbus,555-0101,ace@example.com,ace.com", ",barbers,x,,,", "Bad Email Co,salons,y,,not-an-email,", "Bad Site Co,salons,y,,,javascript:alert(1)"].join("\n"),
    );
    expect(rows.map((r) => r.businessName)).toEqual(["Ace Barbers"]);
    expect(errors).toHaveLength(3);
    expect(errors.join(" ")).toMatch(/no business name/);
    expect(errors.join(" ")).toMatch(/isn't a valid email/);
    expect(errors.join(" ")).toMatch(/isn't a valid website/);
  });

  it("gives the same identity to the same business however the website is written", () => {
    const a = dedupeKeyFor({ businessName: "Ace", city: "X", website: "https://www.Ace.com/about" });
    const b = dedupeKeyFor({ businessName: "Ace Barbers", city: "Y", website: "ace.com" });
    expect(a).toBe("ace.com");
    expect(b).toBe("ace.com");
  });

  it("falls back to name and city when there is no website", () => {
    expect(dedupeKeyFor({ businessName: "  Ace   Barbers ", city: " Columbus ", website: "" })).toBe("ace barbers|columbus");
  });

  it("maps industry names and slugs to the site's industries", () => {
    expect(industrySlugFor("Barbershops")).toBe("barbers");
    expect(industrySlugFor("barbershop")).toBe("barbers");
    expect(industrySlugFor("pressure-washing")).toBe("pressure-washing");
    expect(industrySlugFor("spaceships")).toBeNull();
    expect(industrySlugFor("")).toBeNull();
  });
});
