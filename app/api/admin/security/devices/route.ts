import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { deviceCookie, forgetDevices } from "@/lib/security/ownerPin";
import { uid } from "@/lib/security/adminSecurity";

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
