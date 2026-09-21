import { describe, expect, it } from "vitest";
import { PARTNER, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import {
  ASSET_RULES,
  COMMISSION_LABEL,
  PARTNER_TYPES,
  approvalDecision,
  customerStatusLabel,
  decideCommission,
  isPartnerCode,
  isSelfReferral,
  newPartnerCode,
  newPartnerToken,
  normalizeEmail,
  partnerAssets,
  partnerCommissionCents,
  partnerLink,
  pendingReason,
  totalsOf,
  validateApplication,
} from "@/lib/partners/rules";
import { partnerTermsDoc } from "@/lib/legal/partnerTerms";

const NOW = new Date("2026-09-21T12:00:00Z");
const DAY = 86_400_000;
const ago = (n: number) => new Date(NOW.getTime() - n * DAY);
const ahead = (n: number) => new Date(NOW.getTime() + n * DAY);

const purchase = (over: Partial<Parameters<typeof decideCommission>[0]> = {}) =>
  decideCommission({ partnerStatus: "ACTIVE", partnerEmail: "pat@agency.example", partnerPercent: 10, buyerEmail: "sam@firm.example", grossCents: PRICE_CENTS.site, firstPaidAt: NOW, now: NOW, ...over });

describe("partner codes and links", () => {
  it("look like PC and six clear characters, never repeat, and can never be a customer's hex code", () => {
    const codes = new Set(Array.from({ length: 300 }, () => newPartnerCode()));
    expect(codes.size).toBe(300);
    for (const c of codes) {
      expect(c).toMatch(/^PC[A-HJKMNP-Z2-9]{6}$/);
      expect(isPartnerCode(c)).toBe(true);
    }
    for (const hex of ["1A2B3C4D", "FFFFFFFF", "00000000", "abcdef12"]) expect(isPartnerCode(hex)).toBe(false);
    expect(isPartnerCode("PC12")).toBe(false);
    expect(isPartnerCode(undefined)).toBe(false);
    expect(isPartnerCode("PCIOL010")).toBe(false);
  });

  it("gives every dashboard its own long private token", () => {
    const t = new Set(Array.from({ length: 100 }, () => newPartnerToken()));
    expect(t.size).toBe(100);
    for (const x of t) expect(x).toMatch(/^[a-f0-9]{48}$/);
  });

  it("builds the tracking link from the code", () => {
    expect(partnerLink("PCK7M2QX", "https://site.test/")).toBe("https://site.test/api/referrals/click?code=PCK7M2QX");
  });
});

describe("the application", () => {
  const good = { name: "Pat Agent", email: "  Pat@Agency.Example ", company: "Agent Co", type: "web-designer", website: "agency.example", about: "I build sites for local restaurants and would recommend you.", agree: true };

  it("is accepted and cleaned", () => {
    const r = validateApplication(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.clean).toMatchObject({ name: "Pat Agent", email: "pat@agency.example", type: "web-designer" });
  });

  it("names every partner type from the spec, plus one for everyone else", () => {
    expect(PARTNER_TYPES.map((t) => t.key)).toEqual(["marketing-agency", "web-designer", "seo-agency", "social-media-manager", "business-consultant", "photographer", "videographer", "accountant", "local-business-organization", "franchise-consultant", "other"]);
  });

  it("refuses what is missing or wrong, with a message a person can act on", () => {
    const bad = (over: Record<string, unknown>) => {
      const r = validateApplication({ ...good, ...over } as never);
      return r.ok ? null : r.error;
    };
    expect(bad({ name: "" })).toMatch(/name/i);
    expect(bad({ email: "nope" })).toMatch(/email/i);
    expect(bad({ type: "wizard" })).toMatch(/kind of partner/i);
    expect(bad({ about: "short" })).toMatch(/sentence or two/i);
    expect(bad({ about: "x".repeat(601) })).toMatch(/600/);
    expect(bad({ website: "not a site" })).toMatch(/website/i);
    expect(bad({ agree: false })).toMatch(/Partner Program Terms/);
    expect(bad({ agree: undefined })).toMatch(/Partner Program Terms/);
  });
});

describe("what a commission is", () => {
  it("is the percent of the gross, rounded to the cent, and never negative or over the whole", () => {
    expect(partnerCommissionCents(200_000, 10)).toBe(20_000);
    expect(partnerCommissionCents(33_333, 15)).toBe(5_000);
    expect(partnerCommissionCents(0, 10)).toBe(0);
    expect(partnerCommissionCents(-100, 10)).toBe(0);
    expect(partnerCommissionCents(1_000, 500)).toBe(1_000);
    expect(partnerCommissionCents(1_000, -5)).toBe(0);
    expect(partnerCommissionCents(NaN, 10)).toBe(0);
  });

  it("treats the same person in disguise as the same person", () => {
    expect(normalizeEmail("Pat.Agent+leads@Gmail.com")).toBe("patagent@gmail.com");
    expect(normalizeEmail("pat@googlemail.com")).toBe("pat@gmail.com");
    expect(normalizeEmail("a.b@firm.example")).toBe("a.b@firm.example");
    expect(isSelfReferral("pat@agency.example", "PAT@agency.example")).toBe(true);
    expect(isSelfReferral("pat@gmail.com", "p.a.t+shop@gmail.com")).toBe(true);
    expect(isSelfReferral("pat@agency.example", "sam@firm.example")).toBe(false);
  });
});

describe("whether a paid order earns a commission", () => {
  it("earns the agreed percent, held for the hold period, from an active partner", () => {
    const d = purchase();
    expect(d.state).toBe("PENDING");
    expect(d.commissionCents).toBe(Math.round(PRICE_CENTS.site * 0.1));
    expect(d.pendingUntil?.getTime()).toBe(NOW.getTime() + PARTNER.pendingDays * DAY);
    expect(d.reason).toBeNull();
  });

  it("uses the partner's own percent", () => {
    expect(purchase({ partnerPercent: 15 }).commissionCents).toBe(Math.round(PRICE_CENTS.site * 0.15));
  });

  it("is refused, with the reason recorded, for a partner who is not active", () => {
    for (const status of ["APPLIED", "PAUSED", "DECLINED"]) {
      const d = purchase({ partnerStatus: status });
      expect(d.state, status).toBe("REJECTED");
      expect(d.commissionCents).toBe(0);
      expect(d.reason).toMatch(/not active/);
    }
  });

  it("is refused when the partner is the buyer, even in disguise", () => {
    expect(purchase({ buyerEmail: "PAT@agency.example" }).state).toBe("REJECTED");
    expect(purchase({ partnerEmail: "pat@gmail.com", buyerEmail: "p.a.t+x@gmail.com" }).reason).toMatch(/same person/);
  });

  it("stops a year after the customer's first paid order, and not a day before", () => {
    expect(purchase({ firstPaidAt: ago(PARTNER.windowDays - 1) }).state).toBe("PENDING");
    expect(purchase({ firstPaidAt: ago(PARTNER.windowDays) }).state).toBe("PENDING");
    expect(purchase({ firstPaidAt: ago(PARTNER.windowDays + 1) }).state).toBe("REJECTED");
    expect(purchase({ firstPaidAt: ago(PARTNER.windowDays + 1) }).reason).toMatch(/more than a year/);
  });

  it("is refused when nothing was paid", () => {
    expect(purchase({ grossCents: 0 }).state).toBe("REJECTED");
  });
});

describe("when a pending commission may be approved", () => {
  const base = { pendingUntil: ago(1), orderStatus: "PAID", balanceDueCents: 0, now: NOW };

  it("approves only when the hold has passed AND the whole order is paid", () => {
    expect(approvalDecision(base)).toBe("approve");
    expect(approvalDecision({ ...base, pendingUntil: ahead(3) })).toBe("wait");
    expect(approvalDecision({ ...base, pendingUntil: NOW })).toBe("approve");
    expect(approvalDecision({ ...base, pendingUntil: null })).toBe("wait");
  });

  it("waits while a deposit order still owes its balance, however old the commission is", () => {
    expect(approvalDecision({ ...base, pendingUntil: ago(400), balanceDueCents: 500_000 })).toBe("wait");
  });

  it("voids the commission if the order was refunded, cancelled, or failed, and waits if it is not paid", () => {
    for (const s of ["REFUNDED", "CANCELLED", "FAILED"]) expect(approvalDecision({ ...base, orderStatus: s }), s).toBe("void");
    expect(approvalDecision({ ...base, orderStatus: "PENDING" })).toBe("wait");
  });

  it("tells a partner why one is still pending, in plain words", () => {
    expect(pendingReason({ pendingUntil: ago(1), balanceDueCents: 500_000, now: NOW })).toMatch(/finish paying/);
    expect(pendingReason({ pendingUntil: ahead(5), balanceDueCents: 0, now: NOW })).toMatch(/Held until .* in case of a refund/);
    expect(pendingReason({ pendingUntil: ago(1), balanceDueCents: 0, now: NOW })).toMatch(/Ready to be approved/);
  });
});

describe("what a partner sees", () => {
  it("adds up pending, approved, and paid, and leaves out voided and refused ones", () => {
    const t = totalsOf([
      { state: "PENDING", commissionCents: 100 },
      { state: "PENDING", commissionCents: 50 },
      { state: "APPROVED", commissionCents: 200 },
      { state: "PAID", commissionCents: 400 },
      { state: "REFUNDED", commissionCents: 999 },
      { state: "REJECTED", commissionCents: 999 },
    ]);
    expect(t).toEqual({ pendingCents: 150, approvedCents: 200, paidCents: 400 });
    for (const s of ["PENDING", "APPROVED", "PAID", "REFUNDED", "REJECTED"] as const) expect(COMMISSION_LABEL[s].length).toBeGreaterThan(3);
  });

  it("shows a customer as a plain status and never anything about their money", () => {
    expect(customerStatusLabel({ hasPaidOrder: false, balanceDueCents: 0, projectState: null })).toBe("Signed up, no order yet");
    expect(customerStatusLabel({ hasPaidOrder: true, balanceDueCents: 0, projectState: null })).toBe("Ordered");
    expect(customerStatusLabel({ hasPaidOrder: true, balanceDueCents: 0, projectState: "INTAKE_REQUIRED" })).toBe("Getting started");
    expect(customerStatusLabel({ hasPaidOrder: true, balanceDueCents: 0, projectState: "BUILD" })).toBe("In production");
    expect(customerStatusLabel({ hasPaidOrder: true, balanceDueCents: 1, projectState: "BUILD" })).toMatch(/final payment still due/);
    expect(customerStatusLabel({ hasPaidOrder: true, balanceDueCents: 0, projectState: "COMPLETED" })).toBe("Delivered");
  });
});

describe("the ready-made words for partners", () => {
  const link = "https://site.test/api/referrals/click?code=PCK7M2QX";
  const assets = partnerAssets(link);

  it("carry the partner's own link and a commission disclosure, every time", () => {
    expect(assets.length).toBeGreaterThanOrEqual(4);
    for (const a of assets.filter((x) => x.id !== "blurb")) expect(a.text, a.id).toMatch(/may earn a commission/i);
    for (const a of assets) expect(a.text, a.id).toContain(link);
  });

  it("promise no results, quote no earnings, and use prices from the price list", () => {
    for (const a of assets) {
      expect(a.text, a.id).not.toMatch(/guaranteed|guarantee[sd]? (you|results|more)|earn up to|make money/i);
      expect(a.text).not.toMatch(/[—–]/);
    }
    expect(assets.find((a) => a.id === "blurb")!.text).toContain(usd(PRICE_CENTS["nfc-cards"]));
    expect(assets.find((a) => a.id === "email")!.text).toContain(usd(PRICE_CENTS["starter-website"]));
  });

  it("come with rules that forbid promising results and unsolicited bulk messages", () => {
    const rules = ASSET_RULES.join(" ");
    expect(rules).toMatch(/may earn a commission/);
    expect(rules).toMatch(/results/);
    expect(rules).toMatch(/unsolicited bulk/);
  });
});

describe("the partner terms", () => {
  const text = [partnerTermsDoc.title, ...(partnerTermsDoc.summary ?? []), ...partnerTermsDoc.sections.flatMap((s) => [s.title, s.callout ?? "", ...s.body.flatMap((b) => (typeof b === "string" ? [b] : b.list))])].join("\n");

  it("state the real numbers from the program settings, so the page and the code cannot drift", () => {
    expect(text).toContain(`${PARTNER.defaultPercent}%`);
    expect(text).toContain(`${PARTNER.pendingDays} days`);
    expect(text).toContain(`${PARTNER.windowDays} days`);
    expect(text).toContain(usd(PARTNER.minPayoutCents));
  });

  it("promise no earnings, require disclosure, and keep the partner independent", () => {
    expect(text).toMatch(/DO NOT PROMISE YOU ANY EARNINGS/);
    expect(text).toMatch(/may earn a commission/);
    expect(text).toMatch(/independent/);
    expect(text).toMatch(/no authority to make promises for us/);
    expect(text).toMatch(/first one counts/);
    expect(text).toMatch(/whole order is paid/);
  });
});
