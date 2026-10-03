// The owner's quick sign-in: a 4 to 9 digit code that works only on a device the owner has already signed in on with email
// and password (like unlocking a phone). A stranger's device can't use it at all, five wrong PINs lock it until the next
// password sign-in, and the owner is alerted. Only hashes are stored: the PIN as bcrypt, the device token as SHA-256.
// Everything lives in AppSetting, so no migration is needed.
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const DEVICE_COOKIE = "pc_owner_device";
export const DEVICE_DAYS = 180;
export const MAX_FAILS = 5;
export const MAX_DEVICES = 5;
/** The password the seed creates. The Security page nags until it's changed. */
export const SEED_PASSWORD = "change-me-now";

const pinKey = (userId: string) => `owner_pin:${userId}`;
const lenKey = (userId: string) => `owner_pin_len:${userId}`;
export const PIN_MIN = 4;
export const PIN_MAX = 9;
const failKey = (userId: string) => `owner_pin_fails:${userId}`;
const deviceKey = (tokenHash: string) => `owner_device:${tokenHash}`;

/** The PINs people pick most often (and so get guessed first). */
const COMMON = new Set(["1234", "4321", "1212", "2580", "0123", "1004", "2000", "6969", "1122", "1313", "2468", "1357", "9876", "0987", "123456", "654321", "1234567", "12345678", "123456789", "987654321", "123123", "112233"]);

/** null if the PIN is acceptable, otherwise why not. */
export function validatePin(pin: unknown): string | null {
  if (typeof pin !== "string" || !new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin)) return `Use ${PIN_MIN} to ${PIN_MAX} digits.`;
  if (/^(\d)\1+$/.test(pin) || COMMON.has(pin)) return "That PIN is too easy to guess. Pick another.";
  return null;
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Reads one cookie from a raw Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | null {
  for (const part of (header ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function getSetting(key: string) {
  return (await db.appSetting.findUnique({ where: { key } }))?.value ?? null;
}
async function setSetting(key: string, value: string) {
  await db.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function hasPin(userId: string) {
  return (await getSetting(pinKey(userId))) !== null;
}

/** How many digits the owner's code has (4 to 9), so the keypad can show that many dots. */
export async function pinLength(userId: string) {
  const n = Number(await getSetting(lenKey(userId)));
  return n >= PIN_MIN && n <= PIN_MAX ? n : PIN_MIN;
}

export async function setPin(userId: string, pin: string) {
  const problem = validatePin(pin);
  if (problem) throw new Error(problem);
  await setSetting(pinKey(userId), await bcrypt.hash(pin, 10));
  await setSetting(lenKey(userId), String(pin.length)); // only so the keypad knows how many dots to show; the code itself is never stored
  await resetFailures(userId);
}

export async function clearPin(userId: string) {
  await db.appSetting.deleteMany({ where: { key: { in: [pinKey(userId), lenKey(userId), failKey(userId)] } } });
}

export async function failures(userId: string) {
  return Number(await getSetting(failKey(userId))) || 0;
}
export async function resetFailures(userId: string) {
  await db.appSetting.deleteMany({ where: { key: failKey(userId) } });
}
/** Counts one wrong PIN and returns the new total. */
export async function recordFailure(userId: string) {
  const n = (await failures(userId)) + 1;
  await setSetting(failKey(userId), String(n));
  return n;
}

/** Trusts this device: returns the raw token for the cookie. Only its hash is stored. Keeps the newest few devices. */
export async function trustDevice(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await setSetting(deviceKey(hashToken(token)), JSON.stringify({ userId, at: new Date().toISOString() }));
  const mine = (await db.appSetting.findMany({ where: { key: { startsWith: "owner_device:" } } }))
    .map((r) => ({ key: r.key, ...(JSON.parse(r.value) as { userId: string; at: string }) }))
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.at.localeCompare(a.at));
  const old = mine.slice(MAX_DEVICES).map((d) => d.key);
  if (old.length) await db.appSetting.deleteMany({ where: { key: { in: old } } });
  return token;
}

/** The user this device token was trusted for, if any. */
export async function findUserByDevice(token: string | null | undefined): Promise<string | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const raw = await getSetting(deviceKey(hashToken(token)));
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as { userId?: string; at?: string };
    if (!d.userId || !d.at) return null;
    if (Date.now() - Date.parse(d.at) > DEVICE_DAYS * 86_400_000) return null;
    return d.userId;
  } catch {
    return null;
  }
}

export async function forgetDevices(userId: string) {
  const rows = await db.appSetting.findMany({ where: { key: { startsWith: "owner_device:" } } });
  const mine = rows.filter((r) => {
    try {
      return (JSON.parse(r.value) as { userId?: string }).userId === userId;
    } catch {
      return false;
    }
  });
  if (mine.length) await db.appSetting.deleteMany({ where: { key: { in: mine.map((r) => r.key) } } });
}

export type PinResult =
  | { ok: true; user: { id: string; email: string; name: string | null; role: string } }
  | { ok: false; reason: "no_device" | "not_admin" | "no_pin" | "locked" | "wrong"; failures?: number };

/**
 * The whole PIN check. The device must be trusted, its user an admin with a PIN set, and PIN sign-in not locked. A wrong
 * PIN counts toward the lock, and `onLocked` runs once, on the failure that locks it.
 */
export async function checkPin(deviceToken: string | null | undefined, pin: unknown, onLocked?: (email: string) => Promise<void>): Promise<PinResult> {
  const userId = await findUserByDevice(deviceToken);
  if (!userId) return { ok: false, reason: "no_device" };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return { ok: false, reason: "not_admin" };
  const hash = await getSetting(pinKey(userId));
  if (!hash) return { ok: false, reason: "no_pin" };
  if ((await failures(userId)) >= MAX_FAILS) return { ok: false, reason: "locked", failures: MAX_FAILS };

  const good = typeof pin === "string" && new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin) && (await bcrypt.compare(pin, hash));
  if (!good) {
    const n = await recordFailure(userId);
    if (n === MAX_FAILS && onLocked) await onLocked(user.email).catch(() => {});
    return { ok: false, reason: n >= MAX_FAILS ? "locked" : "wrong", failures: n };
  }
  await resetFailures(userId);
  return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

/** True while the account still uses the seed password. */
export async function usesDefaultPassword(passwordHash: string) {
  return bcrypt.compare(SEED_PASSWORD, passwordHash);
}

/** Set-Cookie value for the trusted-device cookie (or for clearing it). */
export function deviceCookie(token: string | null) {
  const base = `${DEVICE_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  return token ? `${base}; Max-Age=${DEVICE_DAYS * 86_400}` : `${base}; Max-Age=0`;
}
