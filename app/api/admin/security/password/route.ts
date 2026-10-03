import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { rateLimit } from "@/lib/security/rateLimit";
import { SEED_PASSWORD } from "@/lib/security/ownerPin";
import { adminWithPassword, uid } from "@/lib/security/adminSecurity";

// Changes the owner's password. Needs the current one, and a new one of at least 12 characters.
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!rateLimit(`pw-change:${uid(session)}`, 10, 15 * 60_000).allowed) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
    const body = (await req.json().catch(() => null)) as { password?: unknown; next?: unknown; confirm?: unknown } | null;
    const user = await adminWithPassword(uid(session), body?.password);
    if (!user) return NextResponse.json({ error: "Your current password isn't right." }, { status: 400 });
    const next = typeof body?.next === "string" ? body.next : "";
    if (next.length < 12) return NextResponse.json({ error: "Use at least 12 characters." }, { status: 400 });
    if (next === SEED_PASSWORD || next === body?.password) return NextResponse.json({ error: "Pick a new password you haven't used here." }, { status: 400 });
    if (next !== body?.confirm) return NextResponse.json({ error: "The two passwords don't match." }, { status: 400 });
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
