import { db } from "@/lib/db";

/**
 * AuditLog rows are keyed by (entityType, entityId) for whatever triggered
 * them (an Order, a Project, an AgentRun, a Commission...) — there's no
 * direct customerId column. This gathers every entity id that belongs to
 * one customer and pulls the matching log rows into a single timeline, so
 * the CRM view reads as "everything that happened with this person"
 * instead of a jumble of disconnected system events.
 */
export async function getCustomerTimeline(customerId: string, limit = 100) {
  const [orders, projects, commissions] = await Promise.all([
    db.order.findMany({ where: { customerId }, select: { id: true } }),
    db.project.findMany({ where: { customerId }, select: { id: true } }),
    db.commission.findMany({ where: { earnerCustomerId: customerId }, select: { id: true } }),
  ]);

  const agentRuns = projects.length
    ? await db.agentRun.findMany({ where: { projectId: { in: projects.map((p) => p.id) } }, select: { id: true } })
    : [];

  const entityIds = [
    ...orders.map((o) => o.id),
    ...projects.map((p) => p.id),
    ...commissions.map((c) => c.id),
    ...agentRuns.map((r) => r.id),
    customerId,
  ];

  if (entityIds.length === 0) return [];

  return db.auditLog.findMany({
    where: { entityId: { in: entityIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
