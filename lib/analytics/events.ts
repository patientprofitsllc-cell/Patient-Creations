import { db } from "@/lib/db";

// Every critical event from the spec's EVENT-DRIVEN ARCHITECTURE section
// funnels through here so there is a single, queryable audit trail.
export type StudioEvent =
  | "order.created"
  | "order.manual_payment_requested"
  | "alert.owner_order"
  | "nfc_intake.submitted"
  | "payment.succeeded"
  | "project.created"
  | "project.state_changed"
  | "task.created"
  | "task.completed"
  | "task.failed"
  | "qa.started"
  | "qa.failed"
  | "qa.passed"
  | "project.delivery_ready"
  | "project.delivery_held"
  | "project.balance_requested"
  | "invoice.paid"
  | "invoice.issued"
  | "partner.lead"
  | "partner.commission"
  | "partner.paid"
  | "deliverable.created"
  | "review.requested"
  | "referral.created"
  | "referral.click"
  | "referral.purchase"
  | "commission.created"
  | "commission.approved"
  | "commission.paid"
  | "campaign.created"
  | "campaign.optimized"
  | "agent.run_started"
  | "agent.run_succeeded"
  | "agent.run_failed"
  | "agent.escalated"
  | "website.approved"
  | "website.revision_requested"
  | "website.patched"
  | "website.launched"
  | "website.rolled_back"
  | "website.checklist"
  | "website.launched_without_checklist"
  | "care.started"
  | "care.payment_failed"
  | "care.canceled"
  | "ads.started"
  | "ads.payment_failed"
  | "ads.canceled"
  | "ads.delivery_logged"
  | "alert.owner_ads";

export async function logEvent(
  event: StudioEvent,
  entityType?: string,
  entityId?: string,
  payload: Record<string, unknown> = {},
) {
  await db.auditLog.create({
    data: {
      event,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      payloadJson: JSON.stringify(payload),
    },
  });

  await db.analyticsEvent.create({
    data: {
      name: event,
      payloadJson: JSON.stringify({ entityType, entityId, ...payload }),
    },
  });
}
