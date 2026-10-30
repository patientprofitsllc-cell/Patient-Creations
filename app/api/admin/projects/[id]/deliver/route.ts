import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { deliverProject } from "@/lib/agents/orchestrator";

const schema = z.object({ deliveryUrl: z.string().trim().min(4).max(500), notes: z.string().trim().max(1000).default("") });

// Admin-only. Delivers a finished AI / software build: the agents only plan these, so a person builds the real thing
// and records where the customer gets it. The rules live in deliverProject; this route only checks who is asking.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    const result = await deliverProject(params.id, body.data.deliveryUrl, body.data.notes);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true, detail: result.detail });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("admin deliver failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
