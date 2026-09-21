import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

// One place that knows who has asked to stop. Every follow-up email carries a link that is signed for that one
// address, so nobody can unsubscribe someone else, and a link works without signing in.

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set, so unsubscribe links cannot be signed");
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(`unsubscribe:${normalizeEmail(email)}`).digest("hex").slice(0, 40);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!/^[a-f0-9]{40}$/.test(token)) return false;
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
export const decodeEmailParam = (p: string): string | null => {
  try {
    const e = Buffer.from(p, "base64url").toString("utf8");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120 ? normalizeEmail(e) : null;
  } catch {
    return null;
  }
};

export function unsubscribeUrl(email: string, base: string): string {
  return `${base.replace(/\/$/, "")}/unsubscribe?e=${b64(normalizeEmail(email))}&t=${unsubscribeToken(email)}`;
}

export async function isOptedOut(email: string): Promise<boolean> {
  return Boolean(await db.emailOptOut.findUnique({ where: { email: normalizeEmail(email) }, select: { id: true } }));
}

export async function optedOutSet(emails: string[]): Promise<Set<string>> {
  if (emails.length === 0) return new Set();
  const rows = await db.emailOptOut.findMany({ where: { email: { in: emails.map(normalizeEmail) } }, select: { email: true } });
  return new Set(rows.map((r) => r.email));
}

/** Records the request. Saying it twice is fine. */
export async function recordOptOut(email: string, reason = "unsubscribe link"): Promise<void> {
  const e = normalizeEmail(email);
  await db.emailOptOut.upsert({ where: { email: e }, update: {}, create: { email: e, reason } });
  // A prospect who opts out must never be contacted again from the prospect list either.
  await db.prospect.updateMany({ where: { email: e, status: { notIn: ["WON"] } }, data: { status: "DO_NOT_CONTACT" } });
}

/** A short form of an address for showing back to the person: j***@example.com. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}
