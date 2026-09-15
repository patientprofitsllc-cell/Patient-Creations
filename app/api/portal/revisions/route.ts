import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/security/permissions";
import { logEvent } from "@/lib/analytics/events";

const schema = z.object({ projectId: z.string(), notes: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const project = await db.project.findUniqueOrThrow({
    where: { id: body.data.projectId },
    include: { customer: true, order: { include: { items: { include: { product: true } } } }, revisions: true },
  });

  if (project.customer.userId !== session.user.id) {
    return NextResponse.json({ error: "Not your project" }, { status: 403 });
  }

  const revisionLimit = project.order.items[0]?.product.revisionLimit ?? 2;
  if (project.revisions.length >= revisionLimit) {
    return NextResponse.json({ error: `Revision limit (${revisionLimit}) reached for this product.` }, { status: 400 });
  }

  const revision = await db.revision.create({
    data: { projectId: project.id, notes: body.data.notes, status: "REQUESTED" },
  });

  await logEvent("task.created", "Revision", revision.id, { projectId: project.id });

  return NextResponse.json({ revision });
}
