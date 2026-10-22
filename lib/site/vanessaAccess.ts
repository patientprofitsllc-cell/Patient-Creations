import { createHmac, timingSafeEqual } from "crypto";

// A private link to talk with Vanessa. It is signed with the site's secret and expires, so it cannot be guessed, edited or
// reused forever: "form" links are given to people the qualifying form says are serious (two hours); "owner" links are ones
// the owner makes by hand to send to a customer (days, see scripts/vanessa-link.ts). Nothing is stored: the link carries
// its own proof.

export type VanessaSource = "form" | "owner";

const VERSION = "v1";

function secret(): string | null {
  return process.env.NEXTAUTH_SECRET || null;
}

const sign = (body: string, key: string) => createHmac("sha256", key).update(body).digest("base64url").slice(0, 27);

export function signVanessaToken(source: VanessaSource, ttlSeconds: number, nowMs = Date.now()): string {
  const key = secret();
  if (!key) throw new Error("NEXTAUTH_SECRET is not set, so Vanessa links cannot be signed");
  const exp = Math.floor(nowMs / 1000) + Math.max(60, Math.floor(ttlSeconds));
  const body = `${VERSION}.${source}.${exp}`;
  return `${body}.${sign(body, key)}`;
}

export function verifyVanessaToken(token: string | null | undefined, nowMs = Date.now()): { ok: boolean; source?: VanessaSource } {
  const key = secret();
  if (!key || !token || token.length > 120) return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 4) return { ok: false };
  const [version, source, expRaw, sig] = parts;
  if (version !== VERSION || (source !== "form" && source !== "owner") || !/^\d{9,12}$/.test(expRaw)) return { ok: false };
  const expected = Buffer.from(sign(`${version}.${source}.${expRaw}`, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false };
  if (Number(expRaw) * 1000 < nowMs) return { ok: false };
  return { ok: true, source };
}

export const vanessaUrl = (base: string, token: string) => `${base.replace(/\/$/, "")}/vanessa?k=${encodeURIComponent(token)}`;
