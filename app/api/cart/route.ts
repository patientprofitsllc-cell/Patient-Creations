import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalise } from "@/lib/cart/store";
import { requireSession, UnauthorizedError } from "@/lib/security/permissions";

const key = (userId: string) => `cart:${userId}`;

// A signed-in customer's saved cart, so it follows them to another device. Only ever their own, from the session.
export async function GET() {
  try {
    const userId = (await requireSession()).user.id as string;
    const row = await db.appSetting.findUnique({ where: { key: key(userId) } });
    return NextResponse.json({ items: normalise(row ? JSON.parse(row.value) : []) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = (await requireSession()).user.id as string;
    const body = (await req.json().catch(() => null)) as { items?: unknown } | null;
    const items = normalise(body?.items);
    await db.appSetting.upsert({ where: { key: key(userId) }, create: { key: key(userId), value: JSON.stringify(items) }, update: { value: JSON.stringify(items) } });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }
}
