import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { sendAllDueReminders, sendIntakeReminder } from "@/lib/reminders/intake";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), intakeId: z.string().min(1).max(60) }),
  z.object({ action: z.literal("sendAll") }),
]);

// Admin only. Sends intake reminders when a person clicks the button.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    if (body.data.action === "sendAll") return NextResponse.json({ ok: true, ...(await sendAllDueReminders()) });

    const r = await sendIntakeReminder(body.data.intakeId);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 409 });
    return NextResponse.json({ ok: true, number: r.number });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("reminder failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
