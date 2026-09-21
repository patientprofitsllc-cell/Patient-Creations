import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";

// Admin only. Marks the person behind a paid audit as contacted, so the follow-up queue does not nudge them too soon.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    if (!/^[a-z0-9]{20,40}$/.test(params.id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const audit = await db.growthAudit.findUnique({ where: { id: params.id }, select: { prospectId: true } });
    if (!audit?.prospectId) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const now = new Date();
    await db.prospect.updateMany({ where: { id: audit.prospectId, status: { in: ["NEW", "AUDITED"] } }, data: { status: "CONTACTED", contactedAt: now } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("mark contacted failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
