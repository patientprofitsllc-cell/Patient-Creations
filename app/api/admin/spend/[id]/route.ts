import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";

// Removes a spend entry entered by mistake. Admin only.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const r = await db.marketingSpend.deleteMany({ where: { id: params.id } });
    return r.count === 1 ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
