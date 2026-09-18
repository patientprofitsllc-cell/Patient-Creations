import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NO_STORE, guardIntake } from "@/lib/intake/access";
import { intakePatchSchema } from "@/lib/intake/schema";

// Autosave for the intake wizard: saves whichever fields were sent.
const REQUIRED_COLUMNS = new Set(["businessName", "businessType", "phone"]);

export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardIntake(req, params.token, 60);
  if ("response" in guarded) return guarded.response;
  if (guarded.intake.status === "COMPLETE") {
    return NextResponse.json({ error: "This intake was already submitted." }, { status: 409, headers: NO_STORE });
  }

  const parsed = intakePatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Some fields were too long or invalid." }, { status: 400, headers: NO_STORE });

  const data: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue;
    if (REQUIRED_COLUMNS.has(key)) {
      if (value) data[key] = value; // a required field is never blanked out
    } else {
      data[key] = value === "" ? null : value;
    }
  }

  // updateMany with the status guard means a save can never land after the
  // customer has submitted (and production may already have read the answers).
  const saved = await db.websiteIntake.updateMany({ where: { token: params.token, status: "STARTED" }, data });
  if (saved.count === 0) return NextResponse.json({ error: "This intake was already submitted." }, { status: 409, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
