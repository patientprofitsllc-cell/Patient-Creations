import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { markInvoicePaid } from "@/lib/payments/invoices";

// The owner confirms a payment that arrived another way (Zelle, cash, a check) and has actually been received.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const r = await markInvoicePaid(params.id, "MANUAL");
    if (!r.firstTime) return NextResponse.json({ error: "That invoice is not open (it may already be paid)." }, { status: 409 });
    return NextResponse.json({ ok: true, message: "Recorded as paid. The customer was emailed a receipt." });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
