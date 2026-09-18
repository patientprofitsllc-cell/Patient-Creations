import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { replyToCustomer, CONCIERGE_NAME } from "@/lib/agents/concierge";

// Private relay between a customer and their agent team. The unguessable
// status token is the only credential, so an unknown token gets the same 404
// as anything else and never reveals whether a project exists.

const NO_STORE = { "Cache-Control": "no-store" };
const DAILY_CUSTOMER_MESSAGE_CAP = 40;

const messageSchema = z.object({ message: z.string().trim().min(1).max(1000) });

async function findProject(token: string) {
  return db.project.findUnique({ where: { statusToken: token }, select: { id: true, name: true } });
}

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  if (!rateLimit(`status-read:${clientIp(req)}`, 120, 60_000).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const project = await findProject(params.token);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });

  const messages = await db.projectMessage.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, sender: true, authorName: true, body: true, createdAt: true },
  });
  return NextResponse.json({ messages }, { headers: NO_STORE });
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const ip = clientIp(req);
  if (!rateLimit(`status-msg-ip:${ip}`, 20, 60_000).allowed || !rateLimit(`status-msg:${params.token}`, 6, 60_000).allowed) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a minute." }, { status: 429, headers: NO_STORE });
  }

  const project = await findProject(params.token);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });

  const body = messageSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Please write a message of up to 1,000 characters." }, { status: 400, headers: NO_STORE });
  }

  const recent = await db.projectMessage.count({
    where: { projectId: project.id, sender: "CUSTOMER", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (recent >= DAILY_CUSTOMER_MESSAGE_CAP) {
    return NextResponse.json({ error: "Daily message limit reached. Our team will follow up on what's already sent." }, { status: 429, headers: NO_STORE });
  }

  const customerMessage = await db.projectMessage.create({
    data: { projectId: project.id, sender: "CUSTOMER", authorName: "You", body: body.data.message },
  });

  const reply = await replyToCustomer(project.id, body.data.message);
  const agentMessage = await db.projectMessage.create({
    data: { projectId: project.id, sender: "AGENT", authorName: CONCIERGE_NAME, body: reply.reply },
  });

  if (reply.escalate) {
    await db.projectMessage.update({ where: { id: customerMessage.id }, data: { escalated: true } });
    await db.notification.create({
      data: {
        audience: "admin",
        title: "Customer message needs you",
        body: `${project.name}: "${body.data.message.slice(0, 200)}"`,
      },
    });
  }

  const pick = (m: typeof customerMessage) => ({ id: m.id, sender: m.sender, authorName: m.authorName, body: m.body, createdAt: m.createdAt });
  return NextResponse.json({ messages: [pick(customerMessage), pick(agentMessage)] }, { headers: NO_STORE });
}
