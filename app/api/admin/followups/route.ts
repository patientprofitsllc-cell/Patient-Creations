import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { sendAllDue, sendFollowup } from "@/lib/followups/service";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), id: z.string().min(3).max(80) }),
  z.object({ action: z.literal("sendAll") }),
]);

// Admin only. Sends follow-up emails when a person clicks the button.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    if (body.data.action === "sendAll") return NextResponse.json({ ok: true, ...(await sendAllDue()) });
    const r = await sendFollowup(body.data.id);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("follow-up failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
