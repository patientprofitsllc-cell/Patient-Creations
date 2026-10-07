import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

// The owner's PIN sign-in: only on trusted devices, only for the admin, stored only as hashes, and locked after 5 misses.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ settings: [] as { key: string; value: string }[], users: [] as Row[], session: null as Row | null }));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => {
  const match = (key: string, where: Row) => {
    if (typeof where.key === "string") return key === where.key;
    if (where.key?.in) return where.key.in.includes(key);
    if (where.key?.startsWith) return key.startsWith(where.key.startsWith);
    return false;
  };
  return {
    db: {
      appSetting: {
        findUnique: async ({ where }: Row) => h.settings.find((s) => s.key === where.key) ?? null,
        findMany: async ({ where }: Row) => h.settings.filter((s) => match(s.key, where)),
        upsert: async ({ where, create, update }: Row) => {
          const s = h.settings.find((x) => x.key === where.key);
          if (s) Object.assign(s, update);
          else h.settings.push({ ...create });
        },
        deleteMany: async ({ where }: Row) => {
          h.settings = h.settings.filter((s) => !match(s.key, where));
        },
      },
      user: {
        findUnique: async ({ where }: Row) => h.users.find((u) => u.id === where.id || u.email === where.email) ?? null,
        update: async ({ where, data }: Row) => Object.assign(h.users.find((u) => u.id === where.id)!, data),
      },
    },
  };
});

import { MAX_FAILS, checkPin, pinLength, failures, findUserByDevice, forgetDevices, hashToken, readCookie, resetFailures, setPin, trustDevice, usesDefaultPassword, validatePin } from "@/lib/security/ownerPin";

beforeEach(async () => {
  h.settings = [];
  h.users = [
    { id: "owner", email: "owner@x.test", name: "Owner", role: "ADMIN", passwordHash: await bcrypt.hash("a-long-real-password", 4) },
    { id: "client", email: "client@x.test", name: "Client", role: "CUSTOMER", passwordHash: "x" },
  ];
  h.session = null;
});

describe("choosing a PIN", () => {
  it("takes 4 to 9 digits and refuses the ones people guess first", () => {
    expect(validatePin("4071")).toBeNull();
    expect(validatePin("481920375")).toBeNull();
    for (const bad of ["123", "1234567890", "12a4", "", 1234, null, "12 34"]) expect(validatePin(bad), String(bad)).not.toBeNull();
    for (const easy of ["123456", "987654321", "111111111"]) expect(validatePin(easy), easy).toMatch(/too easy/);
    for (const easy of ["0000", "7777", "1234", "4321", "2580", "1212", "6969"]) expect(validatePin(easy), easy).toMatch(/too easy/);
  });

  it("stores only hashes: never the PIN or the device token itself", async () => {
    await setPin("owner", "4071");
    const token = await trustDevice("owner");
    const stored = JSON.stringify(h.settings);
    expect(stored).not.toContain("4071");
    expect(stored).not.toContain(token);
    expect(stored).toContain(hashToken(token));
  });
});

describe("signing in with the PIN", () => {
  const ready = async () => {
    await setPin("owner", "4071");
    return trustDevice("owner");
  };

  it("works with a longer code too, and remembers its length for the keypad (never the code itself)", async () => {
    await setPin("owner", "481920375");
    const token = await trustDevice("owner");
    expect(await pinLength("owner")).toBe(9);
    expect(JSON.stringify(h.settings)).not.toContain("481920375");
    expect((await checkPin(token, "481920375")).ok).toBe(true);
    expect(await checkPin(token, "48192037")).toMatchObject({ ok: false, reason: "wrong" });
  });

  it("lets the owner in with the right PIN on a trusted device", async () => {
    const token = await ready();
    const r = await checkPin(token, "4071");
    expect(r).toEqual({ ok: true, user: { id: "owner", email: "owner@x.test", name: "Owner", role: "ADMIN" } });
  });

  it("refuses a device that was never trusted, or has no cookie, even with the right PIN", async () => {
    await ready();
    expect(await checkPin(null, "4071")).toMatchObject({ ok: false, reason: "no_device" });
    expect(await checkPin("f".repeat(64), "4071")).toMatchObject({ ok: false, reason: "no_device" });
    expect(await checkPin("not-a-token", "4071")).toMatchObject({ ok: false, reason: "no_device" });
  });

  it("refuses anyone who isn't the admin", async () => {
    await setPin("client", "4071");
    const token = await trustDevice("client");
    expect(await checkPin(token, "4071")).toMatchObject({ ok: false, reason: "not_admin" });
  });

  it("locks after exactly 5 wrong PINs, alerts once, and even the right PIN then fails until a password sign-in", async () => {
    const token = await ready();
    const alerts: string[] = [];
    const onLocked = async (email: string) => void alerts.push(email);
    for (let i = 1; i < MAX_FAILS; i++) expect(await checkPin(token, "9999", onLocked)).toMatchObject({ ok: false, reason: "wrong", failures: i });
    expect(await checkPin(token, "9999", onLocked)).toMatchObject({ ok: false, reason: "locked" });
    expect(await checkPin(token, "4071", onLocked)).toMatchObject({ ok: false, reason: "locked" });
    expect(await checkPin(token, "9999", onLocked)).toMatchObject({ ok: false, reason: "locked" });
    expect(alerts).toEqual(["owner@x.test"]);
    await resetFailures("owner"); // what a password sign-in does
    expect((await checkPin(token, "4071")).ok).toBe(true);
  });

  it("clears the miss count after a right PIN", async () => {
    const token = await ready();
    await checkPin(token, "9999");
    await checkPin(token, "4071");
    expect(await failures("owner")).toBe(0);
  });

  it("forgets every device on request, so a lost phone can't use the PIN", async () => {
    const token = await ready();
    await forgetDevices("owner");
    expect(await findUserByDevice(token)).toBeNull();
  });

  it("reads the device cookie from a raw Cookie header", () => {
    expect(readCookie("a=1; pc_owner_device=abc; b=2", "pc_owner_device")).toBe("abc");
    expect(readCookie(undefined, "pc_owner_device")).toBeNull();
  });
});

describe("the owner's password", () => {
  it("spots the starter password", async () => {
    expect(await usesDefaultPassword(await bcrypt.hash("change-me-now", 4))).toBe(true);
    expect(await usesDefaultPassword(h.users[0].passwordHash)).toBe(false);
  });

  it("trusts a second device with just the password, and only once a code exists", async () => {
    h.session = { user: { id: "owner", role: "ADMIN" } };
    const { POST } = await import("@/app/api/admin/security/devices/route");
    const req = (body: unknown) => new Request("http://x/api", { method: "POST", body: JSON.stringify(body) }) as never;
    expect((await POST(req({ password: "a-long-real-password" }))).status).toBe(409);
    await setPin("owner", "481920375");
    expect((await POST(req({ password: "wrong" }))).status).toBe(400);
    const ok = await POST(req({ password: "a-long-real-password" }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toMatch(/pc_owner_device=[0-9a-f]{64}/);
    h.session = { user: { id: "client", role: "CUSTOMER" } };
    expect((await POST(req({ password: "x" }))).status).toBe(403);
  });

  it("keeps the owner signed in for 90 days", async () => {
    const { readFileSync } = await import("fs");
    expect(readFileSync("lib/security/authOptions.ts", "utf8")).toContain("maxAge: 60 * 60 * 24 * 90");
  });

  it("the security routes need the current password before changing anything", async () => {
    h.session = { user: { id: "owner", role: "ADMIN" } };
    const { POST } = await import("@/app/api/admin/security/pin/route");
    const req = (body: unknown) => new Request("http://x/api", { method: "POST", body: JSON.stringify(body) }) as never;
    expect((await POST(req({ password: "wrong", pin: "4071", confirm: "4071" }))).status).toBe(400);
    const ok = await POST(req({ password: "a-long-real-password", pin: "4071", confirm: "4071" }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toMatch(/pc_owner_device=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Lax/);
    h.session = { user: { id: "client", role: "CUSTOMER" } };
    // requireAdmin reads the role from the session, so a client is turned away before anything else.
    expect((await POST(req({ password: "x", pin: "4071", confirm: "4071" }))).status).toBe(403);
  });
});
