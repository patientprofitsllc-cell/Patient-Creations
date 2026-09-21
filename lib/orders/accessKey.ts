import { randomBytes, timingSafeEqual } from "crypto";

// The order confirmation page and the card-details form are reached from a link the buyer is sent to right after paying. An
// order id alone is not a secret (it appears in URLs and logs), so the link also carries a random key made when the order was
// placed. Without the matching key, neither the page nor the form will show or change anything.

export const newOrderAccessKey = (): string => randomBytes(18).toString("base64url");

export const ORDER_KEY_SHAPE = /^[A-Za-z0-9_-]{16,64}$/;

/** True only when a key was stored for the order and the one given matches it exactly. */
export function orderAccessOk(stored: string | null | undefined, given: unknown): boolean {
  if (!stored || typeof given !== "string" || !ORDER_KEY_SHAPE.test(given)) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The confirmation link for an order. */
export const successPath = (orderId: string, key: string | null | undefined) => `/checkout/success?order=${orderId}${key ? `&k=${key}` : ""}`;
