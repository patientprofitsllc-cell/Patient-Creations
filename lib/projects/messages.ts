import { db } from "@/lib/db";

/**
 * Customer messages the concierge handed to Trenton that he hasn't answered
 * yet: an escalated customer message with no later reply from him on the
 * same project.
 */
export async function getMessagesNeedingAdmin() {
  const escalated = await db.projectMessage.findMany({
    where: { sender: "CUSTOMER", escalated: true },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (escalated.length === 0) return [];

  const projectIds = Array.from(new Set(escalated.map((m) => m.projectId)));
  const adminReplies = await db.projectMessage.findMany({
    where: { projectId: { in: projectIds }, sender: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });
  const latestReply = new Map<string, Date>();
  for (const r of adminReplies) if (!latestReply.has(r.projectId)) latestReply.set(r.projectId, r.createdAt);

  return escalated.filter((m) => {
    const replied = latestReply.get(m.projectId);
    return !replied || replied < m.createdAt;
  });
}
