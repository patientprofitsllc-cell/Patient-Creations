import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { voidInvoice } from "@/lib/payments/invoices";

// The owner cancels an extra-work invoice sent by mistake. A final-payment invoice cannot be cancelled.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const r = await voidInvoice(params.id);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 409 });
    return NextResponse.json({ ok: true, message: "Invoice cancelled." });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
