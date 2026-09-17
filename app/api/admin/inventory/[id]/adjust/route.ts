import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";

const adjustSchema = z.object({ delta: z.number().int().min(-1000).max(1000) });

// Manual stock adjustment — receiving new cards, correcting a count, or
// decrementing a color bucket that auto-decrement can't (Google Review's
// black/white split isn't chosen at checkout, so it's fulfilled by hand).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const body = adjustSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const item = await db.inventoryItem.findUnique({ where: { id: params.id } });
    if (!item) return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });

    const updated = await db.inventoryItem.update({
      where: { id: params.id },
      data: { quantityOnHand: Math.max(0, item.quantityOnHand + body.data.delta) },
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
