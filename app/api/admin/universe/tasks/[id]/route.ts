import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";
import { TaskError } from "@/lib/universe/core/taskManager";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject") }),
  z.object({ action: z.literal("start") }),
  z.object({ action: z.literal("complete"), result: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal("fail"), reason: z.string().trim().min(1).max(500) }),
]);

// A person moves a task along: approve or reject a draft, start it, finish it with what happened, or mark it failed.
// Finishing or failing writes a RESULT to memory, so the agents learn what actually happened. Admin only.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Say what to do with the task, and for complete or fail, what happened." }, { status: 400 });
    if (!/^[a-z0-9]{10,40}$/i.test(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const t = patientCreationsUniverse().tasks;
    const b = body.data;
    const task = b.action === "approve" ? await t.approve(params.id) : b.action === "reject" ? await t.reject(params.id) : b.action === "start" ? await t.start(params.id) : b.action === "complete" ? await t.complete(params.id, b.result) : await t.fail(params.id, b.reason);
    return NextResponse.json({ ok: true, status: task.status });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    if (err instanceof TaskError) return NextResponse.json({ error: err.message }, { status: err.message === "That task does not exist." ? 404 : 409 });
    throw err;
  }
}
