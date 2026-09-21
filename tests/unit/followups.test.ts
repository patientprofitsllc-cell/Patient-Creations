import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DAY, FOLLOWUP_KINDS, FOLLOWUP_LABELS, HOUR, MIN_GAP_DAYS, TIMING, blockedReason, dueAt, isDue, nextAuditKind, type BlockInput, type FollowupKind } from "@/lib/followups/rules";
import { decodeEmailParam, maskEmail, unsubscribeToken, unsubscribeUrl, verifyUnsubscribeToken } from "@/lib/followups/optout";
import { renderTemplate } from "@/lib/email/templates";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const t0 = new Date("2026-09-01T12:00:00Z");
const after = (ms: number) => new Date(t0.getTime() + ms);

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-for-unsubscribe-links-0123456789";
});

describe("when each follow-up is due", () => {
  it("waits the right time after the moment that started it", () => {
    expect(isDue("audit_followup_1", t0, after(2 * DAY - 1))).toBe(false);
    expect(isDue("audit_followup_1", t0, after(2 * DAY))).toBe(true);
    expect(isDue("audit_followup_2", t0, after(5 * DAY))).toBe(false);
    expect(isDue("audit_followup_2", t0, after(6 * DAY))).toBe(true);
    expect(isDue("abandoned_checkout", t0, after(HOUR))).toBe(false);
    expect(isDue("abandoned_checkout", t0, after(2 * HOUR))).toBe(true);
    expect(isDue("checkin_7d", t0, after(6 * DAY))).toBe(false);
    expect(isDue("checkin_7d", t0, after(7 * DAY))).toBe(true);
    expect(isDue("recommend_30d", t0, after(29 * DAY))).toBe(false);
    expect(isDue("recommend_30d", t0, after(30 * DAY))).toBe(true);
  });

  it("expires, so nothing stale goes out: no check-in a month late, no reminder for a checkout from last week", () => {
    expect(isDue("abandoned_checkout", t0, after(3 * DAY + HOUR))).toBe(false);
    expect(isDue("checkin_7d", t0, after(22 * DAY))).toBe(false);
    expect(isDue("audit_followup_1", t0, after(15 * DAY))).toBe(false);
    expect(isDue("audit_followup_2", t0, after(22 * DAY))).toBe(false);
    expect(isDue("recommend_30d", t0, after(91 * DAY))).toBe(false);
    for (const k of FOLLOWUP_KINDS) expect(TIMING[k].expiresAfterMs, k).toBeGreaterThan(TIMING[k].afterMs);
  });

  it("works out the due moment", () => {
    expect(dueAt("checkin_7d", t0).getTime()).toBe(t0.getTime() + 7 * DAY);
  });

  it("sends an audit lead the first note, then the last note, then nothing", () => {
    expect(nextAuditKind({ first: false, second: false })).toBe("audit_followup_1");
    expect(nextAuditKind({ first: true, second: false })).toBe("audit_followup_2");
    expect(nextAuditKind({ first: true, second: true })).toBeNull();
  });

  it("has a plain label for every kind", () => {
    for (const k of FOLLOWUP_KINDS) expect(FOLLOWUP_LABELS[k].length, k).toBeGreaterThan(8);
  });
});

describe("when a follow-up must NOT go out", () => {
  const ok = (over: Partial<BlockInput> = {}): BlockInput => ({ kind: "audit_followup_1", optedOut: false, alreadySent: false, lastFollowupAt: null, now: after(3 * DAY), hasAddress: true, ...over });

  it("allows one when nothing is in the way", () => {
    expect(blockedReason(ok())).toBeNull();
  });

  it("never goes to someone who opted out or is on the do-not-contact list", () => {
    expect(blockedReason(ok({ optedOut: true }))).toMatch(/asked not to get/);
    expect(blockedReason(ok({ doNotContact: true }))).toMatch(/do-not-contact/);
  });

  it("never sends the same one twice", () => {
    expect(blockedReason(ok({ alreadySent: true }))).toMatch(/already sent/);
  });

  it("is switched off until a business mailing address is set, because marketing email needs one by law", () => {
    expect(blockedReason(ok({ hasAddress: false }))).toMatch(/mailing address/);
    for (const k of FOLLOWUP_KINDS) expect(blockedReason(ok({ kind: k, hasAddress: false })), k).toMatch(/OUTREACH_MAILING_ADDRESS/);
  });

  it("does not nudge someone who already bought", () => {
    for (const k of ["audit_followup_1", "audit_followup_2", "abandoned_checkout"] as FollowupKind[]) expect(blockedReason(ok({ kind: k, purchased: true })), k).toMatch(/already bought/);
    expect(blockedReason(ok({ kind: "checkin_7d", purchased: true }))).toBeNull();
    expect(blockedReason(ok({ kind: "recommend_30d", purchased: true }))).toBeNull();
  });

  it("holds a second follow-up back for MIN_GAP_DAYS after the last one", () => {
    const now = after(10 * DAY);
    expect(blockedReason(ok({ now, lastFollowupAt: new Date(now.getTime() - DAY) }))).toMatch(/recently/);
    expect(blockedReason(ok({ now, lastFollowupAt: new Date(now.getTime() - MIN_GAP_DAYS * DAY) }))).toBeNull();
  });

  it("says which comes first when one must wait for another", () => {
    expect(blockedReason(ok({ kind: "audit_followup_2", waitingOn: "audit_followup_1" }))).toMatch(/Audit follow-up \(2 days\)/);
  });
});

describe("unsubscribe links", () => {
  it("are signed for one address, so they cannot be used on anyone else's", () => {
    const t = unsubscribeToken("Joe@Example.com");
    expect(t).toMatch(/^[a-f0-9]{40}$/);
    expect(unsubscribeToken("joe@example.com")).toBe(t); // case does not matter
    expect(verifyUnsubscribeToken("joe@example.com", t)).toBe(true);
    expect(verifyUnsubscribeToken("someone.else@example.com", t)).toBe(false);
    expect(verifyUnsubscribeToken("joe@example.com", "0".repeat(40))).toBe(false);
    expect(verifyUnsubscribeToken("joe@example.com", "short")).toBe(false);
    expect(verifyUnsubscribeToken("joe@example.com", "")).toBe(false);
  });

  it("carry the address in the link and can be read back", () => {
    const url = unsubscribeUrl("Joe@Example.com", "https://patientcreations.com/");
    expect(url).toMatch(/^https:\/\/patientcreations\.com\/unsubscribe\?e=[A-Za-z0-9_-]+&t=[a-f0-9]{40}$/);
    const e = new URL(url).searchParams.get("e")!;
    expect(decodeEmailParam(e)).toBe("joe@example.com");
    expect(verifyUnsubscribeToken(decodeEmailParam(e)!, new URL(url).searchParams.get("t")!)).toBe(true);
    expect(decodeEmailParam("not-base64-@@@")).toBeNull();
    expect(decodeEmailParam(Buffer.from("no-at-sign").toString("base64url"))).toBeNull();
  });

  it("show only a masked address back to the visitor", () => {
    expect(maskEmail("joe@example.com")).toBe("j***@example.com");
  });

  it("fail closed if the secret is missing, rather than signing with nothing", () => {
    const saved = process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(() => unsubscribeToken("a@b.co")).toThrow(/NEXTAUTH_SECRET/);
    process.env.NEXTAUTH_SECRET = saved;
  });
});

describe("the follow-up emails", () => {
  const footer = "Patient Profits LLC\n1 Test St, Atlanta, GA 30303\nDo not want these emails? Stop them here: https://x.test/unsubscribe?e=a&t=b";
  const render = (k: FollowupKind, p: Record<string, unknown> = {}) => renderTemplate(k, { name: "Joe", business: "Joe's Cuts", project: "Joe's Cuts site", product: "the Quick Business Website", link: "https://x.test/checkout?product=starter-website", offers: "- NFC cards ($30 each): why\n  https://x.test/checkout?product=nfc-cards", footer, ...p });

  it("each say who they are for, carry the footer with the address and the stop link, and read like a person", () => {
    for (const k of FOLLOWUP_KINDS) {
      const m = render(k);
      expect(m.subject.length, k).toBeGreaterThan(10);
      expect(m.body, k).toContain("Hi Joe");
      expect(m.body, k).toContain("1 Test St, Atlanta, GA 30303");
      expect(m.body, k).toContain("Stop them here: https://x.test/unsubscribe");
      expect(m.body + m.subject, k).not.toMatch(/[—–]/);
      expect(m.body + m.subject, k).not.toMatch(/guarantee|act now|limited time|last chance|only \d+ left|urgent|hurry/i);
    }
  });

  it("do not invent a discount, and never promise a result", () => {
    for (const k of FOLLOWUP_KINDS) expect(render(k).body, k).not.toMatch(/\d+% off|discount|coupon|free/i);
  });

  it("read every price from the price list", () => {
    expect(render("audit_followup_1").body).toContain(usd(PRICE_CENTS["strategy-session"]));
  });

  it("name the product, link back to it, and invite a reply in the reminder for an unfinished checkout", () => {
    const m = render("abandoned_checkout");
    expect(m.body).toContain("the Quick Business Website");
    expect(m.body).toContain("https://x.test/checkout?product=starter-website");
    expect(m.body).toMatch(/reply to this email/i);
  });

  it("list what fits next in the 30 day email, and ask for nothing in the 7 day check-in", () => {
    expect(render("recommend_30d").body).toContain("- NFC cards");
    const c = render("checkin_7d");
    expect(c.body).toMatch(/How is it going|how is it going/i);
    expect(c.body).not.toMatch(/checkout|\$[0-9]/);
  });

  it("leave the footer off when there is none (for the emails that are not follow-ups)", () => {
    expect(render("audit_followup_1", { footer: undefined }).body).not.toContain("Stop them here");
  });

  it("puts the Website Care offer in the your-website-is-live email, priced from the list, and not when there is no project page", () => {
    const live = renderTemplate("website_live", { projectName: "Joe's Cuts", liveUrl: "https://joescuts.example", statusUrl: "https://x.test/status/abc" });
    expect(live.body).toContain(`Website Care is ${usd(PRICE_CENTS["care-plan"])} a month`);
    expect(live.body).toMatch(/cancel any time/);
    expect(live.body).not.toMatch(/monitor/i);
    expect(renderTemplate("website_live", { projectName: "Joe's Cuts" }).body).not.toContain("Website Care");
  });
});

describe("the queue, the pages, and the secured trigger", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("is admin only, and only a person sending (or the secured trigger) ever sends", () => {
    const api = read("app/api/admin/followups/route.ts");
    expect(api).toContain("requireAdmin()");
    expect(read("app/admin/layout.tsx")).toContain("/admin/followups");
    expect(read("lib/followups/service.ts")).toContain("listFollowups(now)");
  });

  it("stays a 404 unless a long secret is set, and compares the secret without leaking timing", () => {
    const cron = read("app/api/cron/followups/route.ts");
    expect(cron).toContain("secret.length < 24");
    expect(cron).toContain("timingSafeEqual");
    expect(cron).toContain("status: 404");
    expect(cron).toMatch(/sendAllDue\(\)/);
  });

  it("checks the ledger before sending and records through the email log the site already keeps", () => {
    const svc = read("lib/followups/service.ts");
    expect(svc).toContain("emailEvent.findMany");
    expect(svc).toContain("optedOutSet(");
    expect(svc).toContain("sendEmail(item.email, item.kind");
    expect(svc).toContain("seen.has(item.email)"); // one per person per run
    expect(svc).toContain("if (!item) return");
  });

  it("makes the unsubscribe link work without signing in, rate limited, and one way", () => {
    const route = read("app/api/unsubscribe/route.ts");
    expect(route).toContain("rateLimit(`unsub:");
    expect(route).toContain("verifyUnsubscribeToken(");
    expect(route).toContain("recordOptOut(");
    expect(read("app/unsubscribe/page.tsx")).toContain("index: false");
    expect(read("app/robots.ts")).toContain("/unsubscribe");
  });

  it("puts an opted-out prospect on the do-not-contact list too", () => {
    expect(read("lib/followups/optout.ts")).toContain('status: "DO_NOT_CONTACT"');
  });
});
