import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import bcrypt from "bcryptjs";

// Setting up the owner account from a phone: off without the secret, never claimable by a stranger, and a reset also wipes
// the quick code and trusted devices.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ users: [] as Row[], settings: [] as { key: string; value: string }[], notes: [] as Row[], emails: [] as Row[] }));
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: async ({ where }: Row) => h.users.find((u) => u.email === where.email || u.id === where.id) ?? null,
      create: async ({ data }: Row) => { const u = { id: `u${h.users.length + 1}`, ...data }; h.users.push(u); return u; },
      update: async ({ where, data }: Row) => Object.assign(h.users.find((u) => u.id === where.id)!, data),
    },
    appSetting: {
      findUnique: async ({ where }: Row) => h.settings.find((s) => s.key === where.key) ?? null,
      findMany: async ({ where }: Row) => h.settings.filter((s) => s.key.startsWith(where.key.startsWith)),
      deleteMany: async ({ where }: Row) => { const k = where.key.in ?? []; h.settings = h.settings.filter((s) => !k.includes(s.key)); },
    },
    notification: { create: async ({ data }: Row) => void h.notes.push(data) },
  },
}));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void h.emails.push({ to, template, payload }) }));

import { PASSWORD_MIN, checkSetupKey, claimOwner, isEmail, setupEnabled, validateOwnerPassword } from "@/lib/security/ownerSetup";
import { POST } from "@/app/api/owner-setup/route";
import { NextRequest } from "next/server";

const KEY = "k".repeat(24);
beforeEach(() => {
  h.users = []; h.settings = []; h.notes = []; h.emails = [];
  delete process.env.OWNER_SETUP_KEY;
});
const post = (body: unknown, ip = "9.9.9.9") => POST(new NextRequest("http://x/api/owner-setup", { method: "POST", headers: { "x-forwarded-for": ip }, body: JSON.stringify(body) }));

describe("the setup key", () => {
  it("is off unless a long enough key is set, and only the exact key opens it", () => {
    expect(setupEnabled({})).toBe(false);
    expect(setupEnabled({ OWNER_SETUP_KEY: "short" })).toBe(false);
    expect(setupEnabled({ OWNER_SETUP_KEY: KEY })).toBe(true);
    expect(checkSetupKey(KEY, { OWNER_SETUP_KEY: KEY })).toBe(true);
    expect(checkSetupKey(KEY + "x", { OWNER_SETUP_KEY: KEY })).toBe(false);
    expect(checkSetupKey("", { OWNER_SETUP_KEY: KEY })).toBe(false);
    expect(checkSetupKey(KEY, {})).toBe(false);
    expect(checkSetupKey(undefined, { OWNER_SETUP_KEY: KEY })).toBe(false);
  });

  it("compares in constant time and checks passwords and emails", () => {
    expect(readFileSync("lib/security/ownerSetup.ts", "utf8")).toContain("timingSafeEqual");
    expect(validateOwnerPassword("short")).toMatch(/at least/);
    expect(validateOwnerPassword("change-me-now")).toMatch(/starter/); // 13 characters, so only the starter-password rule can refuse it
    expect(PASSWORD_MIN).toBe(12);
    expect(validateOwnerPassword("a-long-real-password")).toBeNull();
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("nope")).toBe(false);
  });
});

describe("creating and resetting the owner", () => {
  it("creates an admin whose password is stored only as a hash, and tells the owner", async () => {
    expect(await claimOwner({ email: " Owner@X.test ", password: "a-long-real-password" })).toBe("created");
    expect(h.users[0]).toMatchObject({ email: "owner@x.test", role: "ADMIN" });
    expect(h.users[0].passwordHash).not.toContain("a-long-real-password");
    expect(await bcrypt.compare("a-long-real-password", h.users[0].passwordHash)).toBe(true);
    expect(h.notes[0].title).toBe("System Exception");
    expect(h.emails[0]).toMatchObject({ template: "owner_security_alert" });
  });

  it("resets an existing owner's password and wipes the quick code and trusted devices", async () => {
    await claimOwner({ email: "owner@x.test", password: "a-long-real-password" });
    const id = h.users[0].id;
    h.settings.push({ key: `owner_pin:${id}`, value: "hash" }, { key: `owner_pin_len:${id}`, value: "9" }, { key: "owner_device:abc", value: JSON.stringify({ userId: id, at: new Date().toISOString() }) });
    expect(await claimOwner({ email: "owner@x.test", password: "another-long-password" })).toBe("reset");
    expect(h.users).toHaveLength(1);
    expect(await bcrypt.compare("another-long-password", h.users[0].passwordHash)).toBe(true);
    expect(h.settings.filter((s) => s.key.startsWith("owner_"))).toEqual([]);
  });

  it("never turns a customer's account into the owner's", async () => {
    h.users.push({ id: "c1", email: "customer@x.test", role: "CUSTOMER", passwordHash: "x" });
    await expect(claimOwner({ email: "customer@x.test", password: "a-long-real-password" })).rejects.toThrow(/customer/);
    expect(h.users[0].role).toBe("CUSTOMER");
  });
});

describe("the setup route", () => {
  it("is off with no key", async () => {
    expect((await post({ key: KEY, email: "a@b.co", password: "a-long-real-password", confirm: "a-long-real-password" })).status).toBe(404);
  });

  it("refuses a wrong key, bad input and mismatched passwords, and creates nothing", async () => {
    process.env.OWNER_SETUP_KEY = KEY;
    const ok = { key: KEY, email: "a@b.co", password: "a-long-real-password", confirm: "a-long-real-password" };
    expect((await post({ ...ok, key: "wrong" }, "1.1.1.1")).status).toBe(403);
    expect((await post({ ...ok, email: "nope" }, "1.1.1.2")).status).toBe(400);
    expect((await post({ ...ok, password: "short", confirm: "short" }, "1.1.1.3")).status).toBe(400);
    expect((await post({ ...ok, confirm: "different-password-1" }, "1.1.1.4")).status).toBe(400);
    expect(h.users).toHaveLength(0);
  });

  it("creates the owner with the right key, and slows down anyone guessing", async () => {
    process.env.OWNER_SETUP_KEY = KEY;
    const res = await post({ key: KEY, email: "a@b.co", password: "a-long-real-password", confirm: "a-long-real-password" }, "2.2.2.2");
    expect(res.status).toBe(200);
    expect((await res.json()).result).toBe("created");
    for (let i = 0; i < 5; i++) await post({ key: "wrong" }, "3.3.3.3");
    expect((await post({ key: "wrong" }, "3.3.3.3")).status).toBe(429);
  });
});

describe("signing in", () => {
  it("sends the owner to the dashboard and customers to their portal", () => {
    const src = readFileSync("app/auth/login/page.tsx", "utf8");
    expect(src).toContain('=== "ADMIN" ? "/admin/dashboard" : "/portal/dashboard"');
  });
});
