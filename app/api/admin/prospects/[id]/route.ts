import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { PROSPECT_STATUSES, markContacted, updateProspect } from "@/lib/prospects/service";

const schema = z
  .object({
    status: z.enum(PROSPECT_STATUSES),
    nextFollowUpAt: z.string().max(40).nullable(),
    note: z.string().max(500),
    phone: z.string().max(40).nullable(),
    email: z.string().max(120).nullable(),
    website: z.string().max(300).nullable(),
    markContacted: z.number().int().min(1).max(30),
    stage: z.string().max(20).nullable(),
    valueCents: z.number().int().min(0).max(100_000_000).nullable(),
    probability: z.number().int().min(0).max(100).nullable(),
    productInterest: z.string().max(60).nullable(),
    nextAction: z.string().max(200).nullable(),
    logContact: z.boolean(),
  })
  .partial()
  .strict();

// Admin only. Edits a prospect, or records that outreach was sent by hand.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Check the fields and try again." }, { status: 400 });
    const { markContacted: days, nextFollowUpAt, ...rest } = body.data;

    let followUp: Date | null | undefined;
    if (nextFollowUpAt !== undefined) {
      followUp = nextFollowUpAt === null ? null : new Date(nextFollowUpAt);
      if (followUp && Number.isNaN(followUp.getTime())) return NextResponse.json({ error: "That date isn't valid." }, { status: 400 });
    }

    let row = null;
    if (days !== undefined) row = await markContacted(params.id, days);
    if (Object.keys(rest).length > 0 || followUp !== undefined) row = await updateProspect(params.id, { ...rest, nextFollowUpAt: followUp });
    if (!row) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (err instanceof Error && /asked not to be contacted|already closed|Unknown status|can't be changed|Unknown sales stage|Unknown value|Unknown chance|Unknown product/.test(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("prospect update failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
