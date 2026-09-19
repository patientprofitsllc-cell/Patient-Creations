import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

/**
 * The Cart Recovery Agent: a plain rules engine (no AI, so no AI cost).
 *
 * The rule of 3: a visitor who opens checkout with something in their cart and
 * leaves without ordering, twice, is offered 5% off when they come back for the
 * third visit. The offer is real (enforced on the server at checkout), single
 * use, and expires 72 hours after it is first shown. It is never shown to
 * someone who has already ordered or already used it.
 */
export const OFFER_PERCENT = 5;
export const OFFER_VISIT_THRESHOLD = 3;
export const VISIT_GAP_MS = 30 * 60_000;
export const OFFER_VALID_MS = 72 * 3_600_000;
/** Recorded on an order that used the offer. Cannot be typed in as a coupon. */
export const RECOVERY_COUPON = "COMEBACK5";

const VISITOR_RE = /^[a-f0-9]{8,32}$/;
export const isVisitorId = (v: unknown): v is string => typeof v === "string" && VISITOR_RE.test(v);

/**
 * How many separate visits to checkout this visitor has made, counting the one
 * happening now. Checkout views less than 30 minutes apart are one visit, so a
 * page refresh does not count as leaving and coming back.
 */
export function countVisits(checkoutViewTimes: number[], now: number, gapMs = VISIT_GAP_MS): number {
  const sorted = [...checkoutViewTimes].sort((a, b) => a - b);
  let visits = 0;
  let last = -Infinity;
  for (const t of sorted) {
    if (t - last > gapMs) visits++;
    last = t;
  }
  // The current view may not have been recorded yet; if the newest one is old, this is a new visit.
  if (now - last > gapMs) visits++;
  return visits;
}

export type OfferDecision =
  | { eligible: true; expiresAt: number; isNew: boolean }
  | { eligible: false; reason: "used" | "expired" | "not_yet" };

export function decideOffer(input: { visits: number; issuedAt?: number; used: boolean; now: number }): OfferDecision {
  if (input.used) return { eligible: false, reason: "used" };
  if (input.issuedAt !== undefined) {
    const expiresAt = input.issuedAt + OFFER_VALID_MS;
    return input.now < expiresAt ? { eligible: true, expiresAt, isNew: false } : { eligible: false, reason: "expired" };
  }
  if (input.visits >= OFFER_VISIT_THRESHOLD) return { eligible: true, expiresAt: input.now + OFFER_VALID_MS, isNew: true };
  return { eligible: false, reason: "not_yet" };
}

// ---- Signed offer token: proves the server issued this offer to this visitor ----

function secret(): string | null {
  return process.env.NEXTAUTH_SECRET || null;
}

function sign(visitorId: string, expiresAtSec: number): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(`cart-offer:${visitorId}:${expiresAtSec}`).digest("base64url").slice(0, 32);
}

export function makeOfferToken(visitorId: string, expiresAtMs: number): string | null {
  const exp = Math.floor(expiresAtMs / 1000);
  const sig = sign(visitorId, exp);
  return sig ? `${exp}.${sig}` : null;
}

/** True only for an unexpired token this server signed for this exact visitor. */
export function verifyOfferToken(token: unknown, visitorId: unknown, now = Date.now()): boolean {
  if (typeof token !== "string" || !isVisitorId(visitorId)) return false;
  const [expStr, sig, extra] = token.split(".");
  if (extra !== undefined || !sig || !/^\d{9,12}$/.test(expStr ?? "")) return false;
  const exp = Number(expStr);
  if (exp * 1000 <= now) return false;
  const expected = sign(visitorId, exp);
  if (!expected || expected.length !== sig.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

// ---- Server-side records (kept out of the browser-reportable event list) ----

type ServerEvent = "cart_offer_issued" | "cart_offer_used" | "cart_converted";

async function record(name: ServerEvent, visitorId: string, extra: Record<string, unknown> = {}, at = new Date()) {
  try {
    await db.analyticsEvent.create({ data: { name, payloadJson: JSON.stringify({ visitorId, ...extra }), createdAt: at } });
  } catch (err) {
    console.error(`cart recovery: could not record ${name}`, err);
  }
}

/** Called when an order is placed from checkout: the cart is no longer abandoned. */
export const recordCartConverted = (visitorId: string, orderId: string) => record("cart_converted", visitorId, { orderId });
export const recordOfferUsed = (visitorId: string, orderId: string) => record("cart_offer_used", visitorId, { orderId });

const EVENT_NAMES = ["checkout_started", "cart_converted", "cart_offer_issued", "cart_offer_used"];

/** What to show this visitor right now. Records the offer the first time it is issued. */
export async function evaluateCartOffer(visitorId: string, now = Date.now()) {
  if (!isVisitorId(visitorId)) return null;
  const rows = await db.analyticsEvent.findMany({
    where: { name: { in: EVENT_NAMES }, payloadJson: { contains: `"visitorId":"${visitorId}"` } },
    select: { name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  const times = (name: string) => rows.filter((r) => r.name === name).map((r) => r.createdAt.getTime());

  const lastConverted = Math.max(0, ...times("cart_converted"));
  const visits = countVisits(times("checkout_started").filter((t) => t > lastConverted), now);
  const issued = times("cart_offer_issued");
  const decision = decideOffer({
    visits,
    issuedAt: issued.length ? Math.min(...issued) : undefined,
    used: times("cart_offer_used").length > 0,
    now,
  });
  if (!decision.eligible) return null;

  const token = makeOfferToken(visitorId, decision.expiresAt);
  if (!token) return null;
  // Stamped with the same moment the 72 hours were counted from, so every later answer shows the same end time.
  if (decision.isNew) await record("cart_offer_issued", visitorId, { visits }, new Date(now));
  return { token, percent: OFFER_PERCENT, expiresAt: new Date(decision.expiresAt).toISOString() };
}

/** Is this token good for this visitor, and not yet used? */
export async function offerIsRedeemable(token: unknown, visitorId: unknown): Promise<boolean> {
  if (!verifyOfferToken(token, visitorId) || !isVisitorId(visitorId)) return false;
  const used = await db.analyticsEvent.findFirst({
    where: { name: "cart_offer_used", payloadJson: { contains: `"visitorId":"${visitorId}"` } },
    select: { id: true },
  });
  return !used;
}

/** Numbers for the admin dashboard, all from real records. */
export async function cartRecoveryStats(since: Date) {
  const [issued, used, orders] = await Promise.all([
    db.analyticsEvent.count({ where: { name: "cart_offer_issued", createdAt: { gte: since } } }),
    db.analyticsEvent.count({ where: { name: "cart_offer_used", createdAt: { gte: since } } }),
    db.order.findMany({
      where: { couponCode: RECOVERY_COUPON, createdAt: { gte: since } },
      select: { status: true, totalCents: true, discountCents: true },
    }),
  ]);
  const paid = orders.filter((o) => o.status === "PAID");
  return {
    issued,
    used,
    paidOrders: paid.length,
    revenueCents: paid.reduce((s, o) => s + o.totalCents, 0),
    discountGivenCents: paid.reduce((s, o) => s + o.discountCents, 0),
  };
}
