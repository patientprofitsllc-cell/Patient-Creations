import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { assessIdea, cleanAnswers } from "@/lib/founder/ideas";

const schema = z.object({ title: z.string().trim().min(3).max(120), notes: z.string().trim().max(1000).optional(), answers: z.record(z.string(), z.string()).optional() });

// Saves a new idea to the parking lot. Saving never starts anything. Admin only.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Give the idea a short title (at least 3 characters)." }, { status: 400 });
    const answers = cleanAnswers(body.data.answers);
    const a = assessIdea(answers);
    await db.founderIdea.create({ data: { title: body.data.title, notes: body.data.notes || null, answersJson: JSON.stringify(answers), score: a.score, verdict: a.verdict } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
