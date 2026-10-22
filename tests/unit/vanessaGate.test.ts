import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isSerious } from "@/lib/site/fitQualifier";
import { signVanessaToken, verifyVanessaToken } from "@/lib/site/vanessaAccess";

describe("who gets to talk to the AI", () => {
  const ok = { need: "website", budget: "500-2000", timeline: "now" } as const;

  it("lets ready, funded visitors through", () => {
    expect(isSerious(ok)).toBe(true);
    expect(isSerious({ need: "automation", budget: "5000plus", timeline: "soon" })).toBe(true);
    expect(isSerious({ need: "unsure", budget: "unsure", timeline: "soon" })).toBe(true);
  });

  it("keeps browsers, tiny budgets and card-only buyers away from the paid conversation", () => {
    expect(isSerious({ ...ok, timeline: "exploring" })).toBe(false);
    expect(isSerious({ ...ok, budget: "lt500" })).toBe(false);
    expect(isSerious({ ...ok, need: "cards" })).toBe(false);
  });
});

describe("the private Vanessa link", () => {
  const before = process.env.NEXTAUTH_SECRET;
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-for-vanessa-links";
  });
  afterEach(() => {
    if (before === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = before;
  });

  it("opens for a fresh signed link and says where it came from", () => {
    expect(verifyVanessaToken(signVanessaToken("form", 3600))).toEqual({ ok: true, source: "form" });
    expect(verifyVanessaToken(signVanessaToken("owner", 86400))).toEqual({ ok: true, source: "owner" });
  });

  it("expires", () => {
    const t = signVanessaToken("form", 3600, Date.now());
    expect(verifyVanessaToken(t, Date.now() + 3601 * 1000).ok).toBe(false);
  });

  it("rejects missing, edited and foreign links", () => {
    const t = signVanessaToken("form", 3600);
    const parts = t.split(".");
    expect(verifyVanessaToken(null).ok).toBe(false);
    expect(verifyVanessaToken("").ok).toBe(false);
    expect(verifyVanessaToken("v1.owner.9999999999.AAAAAAAAAAAAAAAAAAAAAAAAAAA").ok).toBe(false);
    expect(verifyVanessaToken([parts[0], "owner", parts[2], parts[3]].join(".")).ok).toBe(false); // source swapped
    expect(verifyVanessaToken([parts[0], parts[1], String(Number(parts[2]) + 99999), parts[3]].join(".")).ok).toBe(false); // expiry stretched
    process.env.NEXTAUTH_SECRET = "a-different-secret";
    expect(verifyVanessaToken(t).ok).toBe(false);
  });

  it("never opens when the site has no secret", () => {
    const t = signVanessaToken("form", 3600);
    delete process.env.NEXTAUTH_SECRET;
    expect(verifyVanessaToken(t).ok).toBe(false);
    expect(() => signVanessaToken("form", 3600)).toThrow();
  });
});
