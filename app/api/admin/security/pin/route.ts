import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { rateLimit } from "@/lib/security/rateLimit";
import { clearPin, deviceCookie, setPin, trustDevice, validatePin } from "@/lib/security/ownerPin";
import { adminWithPassword, uid } from "@/lib/security/adminSecurity";

// Sets the owner's 4-digit PIN (current password required) and trusts the device it was set on.
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!rateLimit(`pin-set:${uid(session)}`, 10, 15 * 60_000).allowed) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
    const body = (await req.json().catch(() => null)) as { password?: unknown; pin?: unknown; confirm?: unknown } | null;
    const user = await adminWithPassword(uid(session), body?.password);
    if (!user) return NextResponse.json({ error: "Your current password isn't right." }, { status: 400 });
    const problem = validatePin(body?.pin);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    if (body?.pin !== body?.confirm) return NextResponse.json({ error: "The two PINs don't match." }, { status: 400 });
    await setPin(user.id, body!.pin as string);
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", deviceCookie(await trustDevice(user.id)));
    return res;
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}

// Turns PIN sign-in off.
export async function DELETE() {
  try {
    const session = await requireAdmin();
    await clearPin(uid(session)!);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
