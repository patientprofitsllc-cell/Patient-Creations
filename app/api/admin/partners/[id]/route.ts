import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { approvePartner, declinePartner, pausePartner, setPartnerPercent } from "@/lib/partners/service";

const schema = z.object({ action: z.enum(["approve", "decline", "pause", "percent"]), percent: z.number().int().optional() });

// The owner decides. Admin only.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    const { action, percent } = body.data;
    const r =
      action === "approve" ? await approvePartner(params.id, percent) : action === "decline" ? await declinePartner(params.id) : action === "pause" ? await pausePartner(params.id) : await setPartnerPercent(params.id, percent ?? NaN);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
