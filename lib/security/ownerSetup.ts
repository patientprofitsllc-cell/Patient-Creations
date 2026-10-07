// Creating (or resetting) the owner account without a computer. The account used to exist only if someone ran the seed
// command by hand against the live database, so a fresh deploy could have no owner at all. This lets whoever controls the
// site's Netlify settings set it up from a phone: they put a long secret in OWNER_SETUP_KEY, enter it on /owner-setup, and
// pick an email and password. With no key set the whole thing is off, so a stranger can't claim the account.
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { sendEmail } from "@/lib/email/provider";
import { notifyAdmin } from "@/lib/security/notify";
import { clearPin, forgetDevices } from "@/lib/security/ownerPin";

export const SETUP_KEY_MIN = 16;
export const PASSWORD_MIN = 12;
type Env = Record<string, string | undefined>;

/** On only when a long enough key has been set in the server's environment. */
export const setupEnabled = (env: Env = process.env) => (env.OWNER_SETUP_KEY ?? "").trim().length >= SETUP_KEY_MIN;

const digest = (s: string) => createHash("sha256").update(s).digest();

/** True only for the exact key, compared in constant time (both sides hashed first, so lengths never leak). */
export function checkSetupKey(input: unknown, env: Env = process.env): boolean {
  if (!setupEnabled(env) || typeof input !== "string") return false;
  return timingSafeEqual(digest(input.trim()), digest((env.OWNER_SETUP_KEY ?? "").trim()));
}

/** null if the password is acceptable, otherwise why not. */
export function validateOwnerPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (/^change-me-now$/i.test(password)) return "Pick a password that isn't the starter one.";
  return null;
}

export const isEmail = (v: unknown): v is string => typeof v === "string" && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Creates the owner account, or, if an owner with this email exists, gives it a new password. A reset also clears the
 * quick code and every trusted device, in case the old password was the problem. Tells the owner either way.
 */
export async function claimOwner(input: { email: string; password: string }, ip = "unknown"): Promise<"created" | "reset"> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const existing = await db.user.findUnique({ where: { email } });
  let result: "created" | "reset";
  if (existing) {
    if (existing.role !== "ADMIN") throw new Error("That email belongs to a customer account. Use a different email for the owner.");
    await db.user.update({ where: { id: existing.id }, data: { passwordHash } });
    await clearPin(existing.id);
    await forgetDevices(existing.id);
    result = "reset";
  } else {
    await db.user.create({ data: { email, name: "Patient Profits LLC", passwordHash, role: "ADMIN" } });
    result = "created";
  }
  const subject = result === "created" ? "Owner account created" : "Owner password reset";
  const body = `The owner account ${email} was ${result === "created" ? "created" : "given a new password"} through the owner setup page (internet address ${ip}).${result === "reset" ? " Its quick code and trusted devices were cleared." : ""}\n\nIf this wasn't you, remove OWNER_SETUP_KEY from your Netlify settings now.`;
  await notifyAdmin(`${subject}: ${body}`).catch(() => {});
  await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_security_alert", { subject, body }).catch(() => {});
  return result;
}
