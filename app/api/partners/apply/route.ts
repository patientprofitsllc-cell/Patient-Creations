import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rateLimit";
import { validateApplication } from "@/lib/partners/rules";
import { applyToProgram } from "@/lib/partners/service";
import { recordAcceptance } from "@/lib/legal/acceptance";

// A public application to the partner program. It answers the same way whether the email is new or not, so it cannot be used
// to find out who is already a partner. Nothing is approved automatically.

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`partner-apply:${ip}`, 5, 3_600_000).allowed) {
    return NextResponse.json({ error: "Too many tries. Please wait a little and try again." }, { status: 429 });
  }
  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw || typeof raw !== "object") return NextResponse.json({ error: "Please fill in the form." }, { status: 400 });
  // A hidden field real people never see: a filled one is a bot. Answer as if it worked.
  if (typeof raw.fax === "string" && raw.fax.trim() !== "") return NextResponse.json({ ok: true });

  const parsed = validateApplication({
    name: typeof raw.name === "string" ? raw.name : "",
    email: typeof raw.email === "string" ? raw.email : "",
    company: typeof raw.company === "string" ? raw.company : "",
    type: typeof raw.type === "string" ? raw.type : "",
    website: typeof raw.website === "string" ? raw.website : "",
    about: typeof raw.about === "string" ? raw.about : "",
    agree: raw.agree === true,
  });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!rateLimit(`partner-apply-email:${parsed.clean.email}`, 3, 86_400_000).allowed) return NextResponse.json({ ok: true });

  const r = await applyToProgram(parsed.clean);
  if (r.created) await recordAcceptance({ scope: "PARTNER", refId: r.id, req });
  return NextResponse.json({ ok: true });
}
