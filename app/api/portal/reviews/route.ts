import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, UnauthorizedError } from "@/lib/security/permissions";

const schema = z.object({
  projectId: z.string().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(2000).optional(),
  testimonial: z.string().trim().max(1000).optional(),
  canPublish: z.boolean().default(false),
  canUsePortfolio: z.boolean().default(false),
});

const DELIVERED = ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED"];

// A signed-in customer reviews their own delivered project. Someone else's project, and one that does not exist, both
// answer the same 404.
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = (await requireSession()).user.id as string;
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    throw err;
  }
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Give a rating from 1 to 5. Your words can be up to 2,000 characters." }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: body.data.projectId }, include: { customer: true } });
  if (!project || project.customer.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!DELIVERED.includes(project.state)) return NextResponse.json({ error: "You can leave a review once your project is delivered." }, { status: 409 });

  const { projectId: _projectId, ...fields } = body.data;
  const review = await db.review.upsert({
    where: { projectId: project.id },
    update: fields,
    create: { ...fields, projectId: project.id, customerId: project.customerId },
  });

  return NextResponse.json({ review });
}
