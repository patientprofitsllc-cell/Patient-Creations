import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { completeOrderPayment } from "@/lib/payments/completeOrder";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";

// Confirms a manually-collected payment (PayPal, Zelle, Venmo, etc.) that an
// admin has actually verified was received, and starts production the same
// way a Stripe webhook would. Never callable by a customer or agent.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const order = await db.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "PAID") return NextResponse.json({ error: "Order is already paid" }, { status: 409 });

    const project = await completeOrderPayment(order.id, "MANUAL", paymentMethodLabel(order.paymentMethod));

    return NextResponse.json({ project });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
