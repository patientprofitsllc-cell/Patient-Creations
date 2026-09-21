import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { createProspect } from "@/lib/prospects/service";
import { answerAuditQuestion } from "@/lib/agents/auditAgent";
import { sendEmail } from "@/lib/email/provider";
import { CONTACT_EMAIL } from "@/lib/config/site";

const schema = z.object({
  message: z.string().trim().min(1).max(400),
  // Only sent when the visitor chose to leave an email so a person can reply.
  email: z.string().trim().toLowerCase().email().max(120).optional(),
  company_url: z.string().max(200).optional(),
});

// The Audit Agent's endpoint. Anyone can call it, so it is rate limited, length limited, and has a hidden bot field.
// Nothing about the conversation is stored unless the visitor leaves an email, and then only their question (300
// characters) goes onto their prospect record so a person can reply.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`audit-agent:${ip}`, 30, 3_600_000).allowed) {
    return NextResponse.json({ error: "That is a lot of questions. Please call or email us and a person will help." }, { status: 429 });
  }
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Please type a short question." }, { status: 400 });
  if (body.data.company_url) return new NextResponse(null, { status: 204 });

  const answer = await answerAuditQuestion(body.data.message);

  let captured = false;
  const email = body.data.email;
  if (email && rateLimit(`audit-agent-lead:${email}`, 3, 86_400_000).allowed) {
    try {
      const p = await createProspect({ businessName: email.split("@")[0].slice(0, 60) || "Audit inquiry", email, source: "audit-inquiry" });
      const existing = await db.prospect.findUnique({ where: { id: p.id }, select: { notes: true, status: true } });
      if (existing && existing.status !== "DO_NOT_CONTACT") {
        const note = `Audit question ${new Date().toISOString().slice(0, 10)}: ${body.data.message.slice(0, 300)}`;
        await db.prospect.update({ where: { id: p.id }, data: { notes: [existing.notes, note].filter(Boolean).join("\n").slice(-1500) } });
        await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_audit_lead", {
          subject: "Someone asked about the Growth Audit",
          body: `A visitor asked about the Growth Audit and left an email.\n\nEmail: ${email}\nQuestion: ${body.data.message.slice(0, 300)}\nThe agent answered: ${answer.reply.slice(0, 300)}\n\nPlease reply to them.\n\nProspect record: ${(process.env.APP_BASE_URL || "").replace(/\/$/, "")}/admin/prospects/${p.id}`,
        });
        captured = true;
      }
    } catch (err) {
      console.error("audit agent: could not record the inquiry", err);
    }
  }

  return NextResponse.json({ reply: answer.reply, suggestions: answer.suggestions, escalate: answer.escalate, captured });
}
