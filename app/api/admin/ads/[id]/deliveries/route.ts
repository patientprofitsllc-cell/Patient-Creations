import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { periodLabel } from "@/lib/ads/plans";

const schema = z.object({
  itemsCount: z.number().int().min(0).max(100),
  note: z.string().trim().min(3).max(500),
  // Optional link to the finished files. Only ordinary secure web links are accepted.
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "The link must start with https://")
    .optional(),
});

// Admin only. Logs a batch of finished work against a customer's plan so both sides can see it.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Please check the details." }, { status: 400 });
    const sub = await db.adSubscription.findUnique({ where: { id: params.id } });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const row = await db.adDelivery.create({
      data: { subscriptionId: sub.id, period: periodLabel(new Date()), itemsCount: body.data.itemsCount, note: body.data.note, url: body.data.url || null },
    });
    await logEvent("ads.delivery_logged", "AdSubscription", sub.id, { items: body.data.itemsCount });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("log ad delivery failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
