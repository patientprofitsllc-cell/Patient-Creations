import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/security/permissions";

const schema = z.object({
  projectId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
  testimonial: z.string().optional(),
  canPublish: z.boolean().default(false),
  canUsePortfolio: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const project = await db.project.findUniqueOrThrow({ where: { id: body.data.projectId }, include: { customer: true } });
  if (project.customer.userId !== session.user.id) {
    return NextResponse.json({ error: "Not your project" }, { status: 403 });
  }

  const review = await db.review.upsert({
    where: { projectId: project.id },
    update: body.data,
    create: { ...body.data, customerId: project.customerId },
  });

  return NextResponse.json({ review });
}
