import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { ensureStatusToken } from "@/lib/projects/ensureStatusToken";

const replySchema = z.object({
  body: z.string().trim().min(1).max(1000),
  notifyEmail: z.boolean().default(false),
});

// Trenton's reply into a customer's private thread.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = replySchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const project = await db.project.findUnique({
      where: { id: params.id },
      include: { customer: { include: { user: true } } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const message = await db.projectMessage.create({
      data: { projectId: project.id, sender: "ADMIN", authorName: session.user.name ?? "Trenton", body: body.data.body },
    });

    if (body.data.notifyEmail) {
      const token = await ensureStatusToken(project.id, project.statusToken);
      await sendEmail(project.customer.user.email, "milestone", {
        projectName: project.name,
        message: body.data.body,
        statusUrl: statusUrlFor(token),
      });
    }

    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
