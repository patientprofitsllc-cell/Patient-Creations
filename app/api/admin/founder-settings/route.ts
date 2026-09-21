import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { SETTING_KEYS } from "@/lib/founder/service";

const schema = z
  .object({
    laborRateCentsPerHour: z.number().int().min(0).max(100_000),
    processingPercent: z.number().min(0).max(20),
    processingFixedCents: z.number().int().min(0).max(500),
    vision: z.string().max(2000),
  })
  .partial();

// The founder's own numbers: labor rate, the payment fee, and long-term goals. Admin only.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success || Object.keys(body.data).length === 0) return NextResponse.json({ error: "Check the numbers and try again." }, { status: 400 });
    const map: [keyof typeof body.data, string][] = [["laborRateCentsPerHour", SETTING_KEYS.laborRate], ["processingPercent", SETTING_KEYS.processingPercent], ["processingFixedCents", SETTING_KEYS.processingFixed], ["vision", SETTING_KEYS.vision]];
    for (const [field, key] of map) {
      const v = body.data[field];
      if (v === undefined) continue;
      await db.appSetting.upsert({ where: { key }, create: { key, value: String(v) }, update: { value: String(v) } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
