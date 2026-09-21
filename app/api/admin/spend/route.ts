import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { isMonthKey } from "@/lib/revenue/time";

const MAX_CENTS = 100_000_000; // $1,000,000

const schema = z.object({
  month: z.string().refine(isMonthKey, "A month like 2026-09"),
  channel: z.string().trim().min(1).max(60),
  amountCents: z.number().int().min(1).max(MAX_CENTS),
  note: z.string().trim().max(200).optional(),
});

// The owner records what they spent on getting customers, so cost per lead and per customer can be worked out. Admin only.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Pick a month, name the channel, and enter an amount." }, { status: 400 });
    await db.marketingSpend.create({ data: { month: body.data.month, channel: body.data.channel, amountCents: body.data.amountCents, note: body.data.note || null } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
