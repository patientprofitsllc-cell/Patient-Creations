import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { sendEmail } from "@/lib/email/provider";

// Admin only. Sends a test email to the signed-in admin's own address and
// reports exactly what happened, so a broken sending setup can't stay hidden.
export async function POST() {
  try {
    const session = await requireAdmin();
    const to = (session.user as { email?: string | null }).email;
    if (!to) return NextResponse.json({ error: "Your account has no email address." }, { status: 400 });
    const r = await sendEmail(to, "test_email", {});
    return NextResponse.json({ ok: r.ok, provider: r.provider, to, error: r.error });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("email test failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
