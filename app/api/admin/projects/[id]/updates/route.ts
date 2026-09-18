import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { ensureStatusToken } from "@/lib/projects/ensureStatusToken";
import { logEvent } from "@/lib/analytics/events";

const updateSchema = z.object({
  message: z.string().min(1).max(1000),
  notifyEmail: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = updateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const project = await db.project.findUnique({
      where: { id: params.id },
      include: { customer: { include: { user: true } } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const statusToken = await ensureStatusToken(project.id, project.statusToken);

    const update = await db.projectUpdate.create({
      data: {
        projectId: project.id,
        message: body.data.message,
        notifyEmail: body.data.notifyEmail,
        authorName: session.user.name ?? "Patient Profits LLC",
      },
    });

    await logEvent("task.created", "ProjectUpdate", update.id, { projectId: project.id });

    if (body.data.notifyEmail) {
      await sendEmail(project.customer.user.email, "milestone", {
        projectName: project.name,
        message: body.data.message,
        statusUrl: statusUrlFor(statusToken),
      });
    }

    return NextResponse.json({ update, statusUrl: statusUrlFor(statusToken) });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
