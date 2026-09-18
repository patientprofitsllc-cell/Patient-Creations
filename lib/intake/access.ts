import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";

export const NO_STORE = { "Cache-Control": "no-store" };

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,40}$/;

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/**
 * Shared guard for the intake endpoints. The unguessable token is the only
 * credential, so an unknown or malformed token gets the same 404 and nothing
 * reveals whether an intake exists. Returns either a response to send back or
 * the intake row.
 */
export async function guardIntake(req: NextRequest, token: string, perTokenPerMinute: number) {
  const ip = clientIp(req);
  if (!rateLimit(`intake-ip:${ip}`, 90, 60_000).allowed || !rateLimit(`intake:${token.slice(0, 40)}`, perTokenPerMinute, 60_000).allowed) {
    return { response: NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE }) };
  }
  if (!TOKEN_SHAPE.test(token)) {
    return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };
  }
  const intake = await db.websiteIntake.findUnique({ where: { token } });
  if (!intake) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };
  return { intake };
}
