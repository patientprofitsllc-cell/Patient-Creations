import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";

const noteSchema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = noteSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const customer = await db.customer.findUnique({ where: { id: params.id } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const note = await db.customerNote.create({
      data: {
        customerId: params.id,
        body: body.data.body,
        authorName: session.user.name ?? "Admin",
      },
    });

    return NextResponse.json({ note });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
