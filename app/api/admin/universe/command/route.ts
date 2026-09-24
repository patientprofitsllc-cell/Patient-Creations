import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { COMMANDS } from "@/lib/universe/commands";
import { STYLES } from "@/lib/universe/agents/speaker";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";

export const dynamic = "force-dynamic";
// A whole-business run reads live data and opens pages. Where the host allows a longer run, this is the time it asks for.
export const maxDuration = 60;

const schema = z.object({
  command: z.enum(COMMANDS as [string, ...string[]]),
  text: z.string().trim().max(2000).optional(),
  style: z.enum(STYLES).optional(),
  priority: z.enum(["P0", "P1", "P2", "P3", "P4"]).optional(),
  assumptions: z.array(z.string().trim().min(1).max(300)).max(10).optional(),
  attachments: z.array(z.object({ kind: z.enum(["url", "text"]), value: z.string().trim().min(1).max(20_000) })).max(3).optional(),
});

// Runs one MASTER command for the owner. Admin only. Whatever is sent, the run is recorded as started by a person: the owner
// cannot use this to pretend to be the scheduler, and the scheduler cannot use it at all.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "That is not a command MASTER understands." }, { status: 400 });
    const { command, ...input } = body.data;
    const u = patientCreationsUniverse();
    const r = await u.run(command as (typeof COMMANDS)[number], { ...input, triggeredBy: "user" });
    if (r.kind === "refused") return NextResponse.json({ ok: false, error: r.reason }, { status: 409 });
    if (r.kind === "view") return NextResponse.json({ ok: true, kind: "view", title: r.title, text: r.text });
    const m = r.result;
    return NextResponse.json({ ok: true, kind: "mission", missionId: m.mission.id, status: m.status, report: m.report, route: m.route, tasks: m.decision.tasks.length, errors: m.errors });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
