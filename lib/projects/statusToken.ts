import { randomBytes } from "crypto";

/** URL-safe token for the public /status/[token] page — not a guessable sequential id. */
export function generateStatusToken(): string {
  return randomBytes(16).toString("base64url");
}

export function statusUrlFor(token: string): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${base}/status/${token}`;
}
