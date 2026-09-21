import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/security/permissions";
import { assessIdea, canMove, cleanAnswers, isIdeaStatus, type IdeaStatus } from "@/lib/founder/ideas";

const schema = z.object({
  answers: z.record(z.string(), z.string()).optional(),
  to: z.string().optional(),
  override: z.boolean().optional(),
  note: z.string().trim().max(300).optional(),
});

// Answers the seven questions for an idea, or moves it. Starting one (DOING) is deliberately hard: all questions answered,
// at most two in progress, and an explicit override if it distracts from the bottleneck. Admin only.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Check the answers and try again." }, { status: 400 });
    const idea = await db.founderIdea.findUnique({ where: { id: params.id } });
    if (!idea) return NextResponse.json({ error: "Idea not found." }, { status: 404 });

    let answers = cleanAnswers(JSON.parse(idea.answersJson));
    if (body.data.answers) answers = { ...answers, ...cleanAnswers(body.data.answers) };
    const a = assessIdea(answers);
    const data: Record<string, unknown> = { answersJson: JSON.stringify(answers), score: a.score, verdict: a.verdict };

    if (body.data.to !== undefined) {
      if (!isIdeaStatus(body.data.to)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
      const doingCount = await db.founderIdea.count({ where: { status: "DOING", NOT: { id: idea.id } } });
      const move = canMove({ to: body.data.to as IdeaStatus, from: idea.status as IdeaStatus, answers, doingCount, override: body.data.override });
      if (!move.ok) return NextResponse.json({ error: move.error, needsOverride: move.needsOverride ?? false }, { status: 409 });
      data.status = body.data.to;
      if (body.data.to === "DONE" || body.data.to === "DROPPED") data.decidedAt = new Date();
      if (body.data.note) data.decisionNote = body.data.note;
    }
    await db.founderIdea.update({ where: { id: idea.id }, data });
    return NextResponse.json({ ok: true, verdict: a.verdict });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const r = await db.founderIdea.deleteMany({ where: { id: params.id } });
    return r.count === 1 ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
