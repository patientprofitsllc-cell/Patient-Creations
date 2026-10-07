import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { deviceCookie, forgetDevices, hasPin, trustDevice } from "@/lib/security/ownerPin";
import { rateLimit } from "@/lib/security/rateLimit";
import { adminWithPassword, uid } from "@/lib/security/adminSecurity";

// Trusts the device you're on, with just your password, so your phone and your computer can each use your code.
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!rateLimit(`device-trust:${uid(session)}`, 10, 15 * 60_000).allowed) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
    const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
    const user = await adminWithPassword(uid(session), body?.password);
    if (!user) return NextResponse.json({ error: "Your current password isn't right." }, { status: 400 });
    if (!(await hasPin(user.id))) return NextResponse.json({ error: "Set your code first, then trust your devices." }, { status: 409 });
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", deviceCookie(await trustDevice(user.id)));
    return res;
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}

// Forgets every trusted device (for a lost phone): the PIN then works nowhere until a device is trusted again.
export async function DELETE() {
  try {
    const session = await requireAdmin();
    await forgetDevices(uid(session)!);
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", deviceCookie(null));
    return res;
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
