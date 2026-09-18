import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { applyAdminPatch, launchWebsite } from "@/lib/site/build/actions";
import { patchSchema } from "@/lib/site/build/copy";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("patch"), patch: patchSchema }),
  z.object({ action: z.literal("launch"), liveUrl: z.string().trim().min(4).max(300) }),
]);

// Admin-only. "patch" applies a manual change to the current preview (for a
// revision the automatic step couldn't do). "launch" records that an approved
// site is live, which completes the project. The logic lives in
// lib/site/build/actions.ts; this route only checks who is asking.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const result = body.data.action === "patch" ? await applyAdminPatch(params.id, body.data.patch) : await launchWebsite(params.id, body.data.liveUrl);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true, detail: result.detail });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("admin website action failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
