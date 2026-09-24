import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";
import { PERMISSION_LEVELS } from "@/lib/universe/types";
import { CRITICAL_ACTIONS } from "@/lib/universe/core/permissionManager";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("level"), level: z.enum(PERMISSION_LEVELS) }),
  z.object({ action: z.literal("pause"), paused: z.boolean() }),
  z.object({ action: z.literal("grant"), name: z.enum(CRITICAL_ACTIONS as [string, ...string[]]), granted: z.boolean() }),
]);

// How far the agents may go. Only the owner can change it, and every change is read back before it is reported.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "That is not a setting the agents have." }, { status: 400 });
    const perm = patientCreationsUniverse().permissions;
    const b = body.data;
    if (b.action === "level") {
      await perm.setLevel(b.level);
      const now = await perm.level();
      return NextResponse.json({ ok: now === b.level, level: now });
    }
    if (b.action === "pause") {
      await perm.setPaused(b.paused);
      const now = await perm.paused();
      return NextResponse.json({ ok: now === b.paused, paused: now });
    }
    await perm.grant(b.name, b.granted);
    return NextResponse.json({ ok: (await perm.canDo(b.name)).allowed === b.granted });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
