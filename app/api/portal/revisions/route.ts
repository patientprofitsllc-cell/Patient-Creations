import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, UnauthorizedError } from "@/lib/security/permissions";
import { logEvent } from "@/lib/analytics/events";

const schema = z.object({ projectId: z.string().min(1).max(60), notes: z.string().trim().min(1).max(2000) });

// A signed-in customer asks for a change to their own project. Someone else's project, and one that does not exist,
// both answer the same 404, so this cannot be used to find out which project ids exist.
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = (await requireSession()).user.id as string;
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    throw err;
  }
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Tell us what you would like changed (up to 2,000 characters)." }, { status: 400 });

  const project = await db.project.findUnique({
    where: { id: body.data.projectId },
    include: { customer: true, order: { include: { items: { include: { product: true } } } }, revisions: true },
  });
  if (!project || project.customer.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
