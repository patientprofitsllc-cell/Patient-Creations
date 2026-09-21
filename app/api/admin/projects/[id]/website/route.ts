import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { applyAdminPatch, launchWebsite, setChecklistItem } from "@/lib/site/build/actions";
import { rollbackWebsite } from "@/lib/site/build/rollback";
import { patchSchema } from "@/lib/site/build/copy";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("patch"), patch: patchSchema }),
  z.object({ action: z.literal("launch"), liveUrl: z.string().trim().min(4).max(300), skipChecklist: z.boolean().optional() }),
  z.object({ action: z.literal("rollback"), toVersion: z.number().int().min(1).max(10_000), reason: z.string().trim().min(3).max(300), notify: z.boolean().optional() }),
  z.object({ action: z.literal("check"), item: z.string().max(40), checked: z.boolean() }),
]);

// Admin-only. "patch" applies a manual change to the current preview (for a
// revision the automatic step couldn't do). "rollback" restores an earlier version as
// a new one waiting for approval. "check" ticks a launch-checklist item. "launch"
// records that an approved site is live, which completes the project, once the
// checklist is done (or the owner skips it on purpose, which is logged). The logic lives in
// lib/site/build/actions.ts; this route only checks who is asking.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const d = body.data;
    const result =
      d.action === "patch"
        ? await applyAdminPatch(params.id, d.patch)
        : d.action === "launch"
          ? await launchWebsite(params.id, d.liveUrl, { skipChecklist: d.skipChecklist })
          : d.action === "rollback"
            ? await rollbackWebsite(params.id, d.toVersion, d.reason, { notify: d.notify })
            : await setChecklistItem(params.id, d.item, d.checked);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true, detail: result.detail });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("admin website action failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
