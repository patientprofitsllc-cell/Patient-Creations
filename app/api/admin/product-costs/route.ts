import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { PRICE_CENTS } from "@/lib/pricing/catalog";

const money = z.number().int().min(0).max(100_000_000);
const schema = z.object({
  slug: z.string().refine((s) => s in PRICE_CENTS, "Unknown product"),
  fulfillmentCents: money,
  aiApiCents: money,
  laborMinutes: z.number().int().min(0).max(100_000),
  softwareCents: money,
  note: z.string().trim().max(200).optional(),
});

// What one unit of a product costs to deliver, entered by the owner. It feeds the profitability ranking and nothing else. Admin only.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Pick a product and enter each cost as a whole number, zero or more." }, { status: 400 });
    const { slug, note, ...costs } = body.data;
    await db.productCost.upsert({ where: { slug }, create: { slug, ...costs, note: note || null }, update: { ...costs, note: note || null } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
