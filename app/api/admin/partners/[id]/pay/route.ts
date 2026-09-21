import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { payApprovedForPartner } from "@/lib/partners/service";
import { usd } from "@/lib/pricing/catalog";

const schema = z.object({ ref: z.string().trim().min(1).max(120) });

// Records that the owner has paid everything approved for a partner. Nothing here moves money: the owner pays by hand
// (Zelle, PayPal, a check) and then records it, and the partner is emailed. Admin only.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Enter a note about how you paid, like the Zelle confirmation." }, { status: 400 });
    const r = await payApprovedForPartner(params.id, body.data.ref);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 409 });
    return NextResponse.json({ ok: true, message: `Recorded ${usd(r.amountCents)} paid for ${r.count} commission${r.count === 1 ? "" : "s"}. The partner was emailed.` });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
