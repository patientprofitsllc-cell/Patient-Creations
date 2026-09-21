import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { askPatientAi, escalateToOwner, loadPortalFacts } from "@/lib/agents/patientAi";

// Patient AI. The customer is whoever is signed in: their id comes from the session, never from the request, so nothing
// the browser sends can point this at someone else's account.

const NO_STORE = { "Cache-Control": "no-store" };
const schema = z.object({ message: z.string().trim().min(1).max(500) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: NO_STORE });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`patient-ai:user:${userId}`, 40, 3_600_000).allowed || !rateLimit(`patient-ai:ip:${ip}`, 120, 3_600_000).allowed) {
    return NextResponse.json({ error: "You are asking a lot of questions. Please wait a little and try again, or call us." }, { status: 429, headers: NO_STORE });
  }

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Please type a question of up to 500 characters." }, { status: 400, headers: NO_STORE });

  const customer = await db.customer.findUnique({ where: { userId }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "There is no customer account for this login." }, { status: 404, headers: NO_STORE });
  const facts = await loadPortalFacts(customer.id);
  if (!facts) return NextResponse.json({ error: "There is no customer account for this login." }, { status: 404, headers: NO_STORE });

  const answer = await askPatientAi(facts, body.data.message);
  if (answer.escalate) {
    await escalateToOwner({ customerEmail: (session?.user?.email as string | undefined) ?? "", customerName: (session?.user?.name as string | undefined) ?? "", question: body.data.message, intent: answer.intent });
  }
  return NextResponse.json({ reply: answer.reply, suggestions: answer.suggestions, escalate: answer.escalate, links: answer.links }, { headers: NO_STORE });
}
