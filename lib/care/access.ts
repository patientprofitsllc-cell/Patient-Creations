import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { latestBuild } from "@/lib/site/build/store";

export const NO_STORE = { "Cache-Control": "no-store" };
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,40}$/;

/**
 * The customer's private project link (the status token) is the only credential
 * for the care-plan endpoints, the same as their status page. An unknown or
 * malformed token gets the same 404 as anything else.
 */
export async function guardCare(req: NextRequest, scope: string, perTokenPerMinute: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";

  if (!rateLimit(`care-ip:${ip}`, 30, 60_000).allowed || !rateLimit(`care:${scope}:${token.slice(0, 40)}`, perTokenPerMinute, 60_000).allowed) {
    return { response: NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE }) };
  }
  if (!TOKEN_SHAPE.test(token)) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };

  const project = await db.project.findUnique({
    where: { statusToken: token },
    include: { customer: { include: { user: true } }, careSubscriptions: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };

  return { project, token, build: await latestBuild(project.id) };
}
