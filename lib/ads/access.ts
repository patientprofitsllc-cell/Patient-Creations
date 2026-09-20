import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";

export const NO_STORE = { "Cache-Control": "no-store" };
export const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,40}$/;

/**
 * The customer's private plan link (the manage token) is the only credential for
 * the plan endpoints, the same as the project status page. An unknown or malformed
 * token gets the same 404 as anything else.
 */
export async function guardAds(req: NextRequest, token: string, scope: string, perTokenPerMinute: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`ads-ip:${ip}`, 30, 60_000).allowed || !rateLimit(`ads:${scope}:${token.slice(0, 40)}`, perTokenPerMinute, 60_000).allowed) {
    return { response: NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE }) };
  }
  if (!TOKEN_SHAPE.test(token)) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };

  const sub = await db.adSubscription.findUnique({ where: { manageToken: token }, include: { customer: { include: { user: true } } } });
  if (!sub) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };
  return { sub };
}
