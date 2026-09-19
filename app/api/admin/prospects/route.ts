import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { createProspect, importProspects } from "@/lib/prospects/service";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    businessName: z.string().trim().min(1).max(120),
    industry: z.string().max(60).optional(),
    city: z.string().max(80).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().max(120).optional(),
    website: z.string().max(300).optional(),
  }),
  z.object({ action: z.literal("import"), text: z.string().min(1).max(200_000) }),
]);

// Admin only. Adds one prospect, or imports many (one business per line).
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Check the fields and try again." }, { status: 400 });
    if (body.data.action === "import") return NextResponse.json({ ok: true, ...(await importProspects(body.data.text)) });
    const { action: _action, ...input } = body.data;
    return NextResponse.json({ ok: true, ...(await createProspect({ ...input, source: "manual" })) });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("prospect create failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
