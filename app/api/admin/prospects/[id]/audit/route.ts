import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { runProspectAudit } from "@/lib/prospects/service";

// Admin only. Checks the prospect's website (public addresses only, with time
// and size limits) and saves what it found.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const row = await runProspectAudit(params.id);
    if (!row) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("prospect audit failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
