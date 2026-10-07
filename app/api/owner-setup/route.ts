import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rateLimit";
import { checkSetupKey, claimOwner, isEmail, setupEnabled, validateOwnerPassword } from "@/lib/security/ownerSetup";

const NO_STORE = { "Cache-Control": "no-store" };

// Creates or resets the owner account for whoever holds OWNER_SETUP_KEY (set in Netlify). Off unless the key is set; the
// answer to a wrong key is always the same, and attempts are rate limited per address.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!setupEnabled()) return NextResponse.json({ error: "Owner setup is turned off." }, { status: 404, headers: NO_STORE });
  if (!rateLimit(`owner-setup:${ip}`, 5, 15 * 60_000).allowed) return NextResponse.json({ error: "Too many tries. Wait 15 minutes." }, { status: 429, headers: NO_STORE });

  const body = (await req.json().catch(() => null)) as { key?: unknown; email?: unknown; password?: unknown; confirm?: unknown } | null;
  if (!checkSetupKey(body?.key)) return NextResponse.json({ error: "That setup key isn't right." }, { status: 403, headers: NO_STORE });
  if (!isEmail(body?.email)) return NextResponse.json({ error: "Enter a real email address." }, { status: 400, headers: NO_STORE });
  const problem = validateOwnerPassword(body?.password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400, headers: NO_STORE });
  if (body?.password !== body?.confirm) return NextResponse.json({ error: "The two passwords don't match." }, { status: 400, headers: NO_STORE });

  try {
    const result = await claimOwner({ email: body.email as string, password: body.password as string }, ip);
    return NextResponse.json({ ok: true, result }, { headers: NO_STORE });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status: 409, headers: NO_STORE });
  }
}
