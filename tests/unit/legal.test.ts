import { describe, expect, it } from "vitest";
import { LEGAL_PAGES, LEGAL_VERSION, POLICY, type LegalDoc } from "@/lib/legal/config";
import { termsDoc } from "@/lib/legal/terms";
import { privacyDoc } from "@/lib/legal/privacy";
import { refundsDoc } from "@/lib/legal/refunds";
import { acceptableUseDoc } from "@/lib/legal/acceptableUse";
import { ADD_ON_PITCH, addOnAvailable } from "@/lib/site/addOnPitch";

const docs: LegalDoc[] = [termsDoc, privacyDoc, refundsDoc, acceptableUseDoc];

const textOf = (d: LegalDoc) =>
  [d.title, d.description, ...(d.summary ?? []), ...d.sections.flatMap((s) => [s.title, s.callout ?? "", ...s.body.flatMap((b) => (typeof b === "string" ? [b] : b.list))])].join("\n");
const sectionByNumber = (d: LegalDoc, n: number) => d.sections.find((s) => s.title.startsWith(`${n}. `));

describe("every legal document", () => {
  it("has unique section ids and consecutively numbered titles", () => {
    for (const d of docs) {
      const ids = d.sections.map((s) => s.id);
      expect(new Set(ids).size, d.slug).toBe(ids.length);
      d.sections.forEach((s, i) => expect(s.title.startsWith(`${i + 1}. `), `${d.slug}: ${s.title}`).toBe(true));
    }
  });

  it("uses the company's name, never a personal name, and no dashes as punctuation", () => {
    for (const d of docs) {
      const t = textOf(d);
      expect(t, d.slug).toContain("Patient Profits LLC");
      expect(t, d.slug).not.toMatch(/Trenton/);
      expect(t, d.slug).not.toMatch(/[—–]/);
      expect(t, d.slug).not.toMatch(/undefined|\[object|null\b|\$\{/);
    }
  });

  it("is versioned and linked from a page that exists", () => {
    expect(LEGAL_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(LEGAL_PAGES.map((p) => p.href.slice(1)).sort()).toEqual(docs.map((d) => d.slug).sort());
  });
});

describe("Terms of Service", () => {
  const t = textOf(termsDoc);

  it("contains the protective clauses the business needs", () => {
    const required: [string, RegExp][] = [
      ["binding arbitration", /binding (individual )?arbitration/i],
      ["AAA rules", /American Arbitration Association/],
      ["Federal Arbitration Act", /Federal Arbitration Act/],
      ["class action waiver", /class action/i],
      ["jury waiver", /jury/i],
      ["arbitration opt-out", /opt out of (this )?arbitration/i],
      ["informal resolution first", /work in good faith to resolve it/i],
      ["time limit on claims", /barred/i],
      ["governing law", /laws of the State of Georgia/],
      ["all sales final", /ALL SALES ARE FINAL/],
      ["disclaimer of warranties", /AS IS/],
      ["limitation of liability cap", /GREATER OF THE AMOUNT YOU PAID/],
      ["consequential damages waiver", /CONSEQUENTIAL/],
      ["indemnification", /indemnify/i],
      ["protection for members and owners", /members, managers, owners/i],
      ["no personal liability", /no Company Party other than/i],
      ["customer content warranty", /own Your Materials or have all the rights/i],
      ["no guarantee of rankings or sales", /do not promise any position in search engines/i],
      ["accessibility not guaranteed", /accessibility standard or law/i],
      ["AI disclosure", /artificial intelligence/i],
      ["chargeback clause", /chargeback/i],
      ["automatic renewal disclosure", /renews automatically/i],
      ["subscription cancellation", /cancel at any time/i],
      ["electronic signature", /electronic signature/i],
      ["severability", /unenforceable/i],
      ["force majeure", /Force majeure/i],
      ["deemed acceptance", /may treat it as accepted/i],
      ["license ends on chargeback", /ends automatically if a payment/i],
      ["no returns on physical goods", /do not accept returns or exchanges of physical products/i],
      ["monthly ads plans defined", /MONTHLY ADS PLANS: A Monthly Ads plan is an optional monthly subscription/],
      ["ad plan items do not roll over or get refunded", /do not carry over, and are not refunded or credited if unused/],
      ["ad spend and results excluded", /does not include ad spend[\s\S]*any promise of sales, leads, followers, rankings, or any other result/],
      ["AI-generated ad content and platform labeling", /AI-generated people or voices to be labeled or disclosed/],
      ["ad plans renew automatically", /Monthly Ads plans renew automatically/],
    ];
    for (const [name, re] of required) expect(t, name).toMatch(re);
  });

  it("puts the arbitration warning in a highlighted notice near the top and in its own section", () => {
    expect(termsDoc.sections[0].callout).toMatch(/arbitration/i);
    expect(sectionByNumber(termsDoc, 27)?.callout).toMatch(/CLASS ACTION/);
  });

  it("states the opt-out and informal-resolution windows from the shared policy values", () => {
    expect(t).toContain(`within ${POLICY.arbitrationOptOutDays} days`);
    expect(t).toContain(`${POLICY.informalResolutionDays} days`);
    expect(t).toContain(`${POLICY.deemedAcceptanceDays} days`);
    expect(t).toContain(`up to ${POLICY.careUpdatesPerMonth} small updates`);
  });

  it("has section numbers that cross-references really point at", () => {
    expect(sectionByNumber(termsDoc, 7)?.id).toBe("ip");
    expect(sectionByNumber(termsDoc, 22)?.id).toBe("company-parties");
    expect(sectionByNumber(termsDoc, 23)?.id).toBe("disputes-card");
    expect(sectionByNumber(termsDoc, 25)?.id).toBe("governing-law");
    expect(sectionByNumber(termsDoc, 27)?.id).toBe("arbitration");
    // "Section N" mentions must all exist
    const max = termsDoc.sections.length;
    for (const m of t.matchAll(/Sections? (\d+)/g)) expect(Number(m[1]), m[0]).toBeLessThanOrEqual(max);
    // the opt-out points at the governing-law section, and the portfolio right at the IP section
    expect(t).toMatch(/courts described in Section 25/);
    expect(t).toMatch(/show the finished work as described in Section 7/);
  });
});

describe("Refund and Cancellation Policy", () => {
  const t = textOf(refundsDoc);

  it("says all sales are final, plainly and up front", () => {
    expect(refundsDoc.summary?.[0]).toMatch(/All sales are final/);
    expect(refundsDoc.sections[0].callout).toMatch(/ALL SALES ARE FINAL/);
  });

  it("covers services, physical goods, subscriptions, and chargebacks", () => {
    expect(t).toMatch(/Deposits and consultation fees are non-refundable/);
    expect(t).toMatch(/do not accept returns or exchanges/);
    expect(t).toContain(`within ${POLICY.defectClaimDays} days of delivery`);
    expect(t).toMatch(/cancel at any time/i);
    expect(t).toMatch(/Monthly Ads plan/);
    expect(t).toMatch(/not carried over, credited, or refunded/);
    expect(t).toMatch(/do not refund or prorate/i);
    expect(t).toMatch(/chargeback/i);
    expect(t).toMatch(/does not take away any right you have under a law that cannot be waived/);
  });

  it("points at Terms sections that match", () => {
    expect(t).toMatch(/Section 3 of the Terms/);
    expect(sectionByNumber(termsDoc, 3)?.id).toBe("orders");
    expect(t).toMatch(/Section 23 of the Terms/);
    expect(sectionByNumber(termsDoc, 23)?.id).toBe("disputes-card");
  });
});

describe("Privacy Policy", () => {
  const t = textOf(privacyDoc);

  it("describes what the site really does", () => {
    expect(t).toMatch(/do not sell your personal information/);
    expect(t).toMatch(/Stripe/);
    expect(t).toMatch(/one-way scrambled version of the password/);
    expect(t).toMatch(/do not use advertising or cross-site tracking cookies/);
    expect(t).toMatch(/random visitor identifier/);
    expect(t).toMatch(/do-not-contact list/);
    expect(t).toMatch(/publish on your website[\s\S]*public/i);
    expect(t).toMatch(/Children|children/);
    expect(t).toMatch(/access, correct, or delete/);
  });
});

describe("Acceptable Use Policy", () => {
  it("names what will not be built and what may be done about it", () => {
    const t = textOf(acceptableUseDoc);
    expect(t).toMatch(/fake reviews/);
    expect(t).toMatch(/infring/);
    expect(t).toMatch(/we do not give refunds/);
  });
});

describe("optional extras", () => {
  it("every pitch has a reason to add it, and never invents popularity or statistics", () => {
    for (const [slug, p] of Object.entries(ADD_ON_PITCH)) {
      expect(p.headline.length, slug).toBeGreaterThan(10);
      expect(p.why.length, slug).toBeGreaterThan(40);
      expect(p.bestFor, slug).toMatch(/^Best if/);
      const all = `${p.headline} ${p.why} ${p.bestFor} ${p.detail ?? ""}`;
      expect(all, slug).not.toMatch(/most popular|best.?selling|#1|\d+%|thousands|everyone (buys|adds)|customers (love|choose)|guarantee/i);
      expect(all, slug).not.toMatch(/[—–]/);
    }
  });

  it("covers the five extras the checkout offers", () => {
    expect(Object.keys(ADD_ON_PITCH).sort()).toEqual(["brand-kit", "extra-revision-package", "maintenance-3mo", "nfc-card-addon", "social-asset-pack"]);
  });

  it("does not promise monitoring, which does not exist", () => {
    expect(JSON.stringify(ADD_ON_PITCH)).not.toMatch(/monitor/i);
  });

  it("hides the social pack from the website product, since it has no hero visual", () => {
    expect(addOnAvailable("social-asset-pack", "starter-website")).toBe(false);
    expect(addOnAvailable("social-asset-pack", "ad")).toBe(true);
    expect(addOnAvailable("brand-kit", "starter-website")).toBe(true);
    expect(addOnAvailable("nfc-card-addon", "starter-website")).toBe(true);
  });
});
