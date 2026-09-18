import type Stripe from "stripe";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { sendEmail } from "@/lib/email/provider";
import { statusUrlFor } from "@/lib/projects/statusToken";

export type CareStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

/** Stripe's subscription status to ours. Null means "not a state we act on yet" (for example, still incomplete). */
export function mapStripeStatus(status: string): CareStatus | null {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return null;
  }
}

interface SubscriptionLike {
  id: string;
  status: string;
  customer?: string | { id: string } | null;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  items?: { data?: { current_period_end?: number }[] };
  metadata?: Record<string, string> | null;
}

/** The end of the paid period. Newer Stripe API versions moved it from the subscription onto its items. */
export function periodEndOf(sub: SubscriptionLike): Date | null {
  const seconds = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

const idOf = (v: string | { id: string } | null | undefined): string | null => (typeof v === "string" ? v : (v?.id ?? null));

type SubRef = string | { id: string } | null | undefined;

/**
 * The subscription an invoice belongs to. Older Stripe API versions put it on
 * `invoice.subscription`; newer ones (2025 onward) moved it to
 * `invoice.parent.subscription_details.subscription`. Webhook endpoints can be
 * set to either version, so both are read.
 */
export function invoiceSubscriptionId(invoice: { subscription?: SubRef; parent?: { subscription_details?: { subscription?: SubRef } | null } | null }): string | null {
  return idOf(invoice.subscription) ?? idOf(invoice.parent?.subscription_details?.subscription);
}

async function notifyAdmin(title: string, body: string) {
  await db.notification.create({ data: { audience: "admin", title, body } });
}

/**
 * Creates the care-plan record the first time we see a subscription, and does
 * the "started" work exactly once. Safe if two events for the same subscription
 * arrive together or out of order.
 */
async function ensureRow(input: {
  subscriptionId: string;
  stripeCustomerId: string | null;
  projectId: string;
  customerId: string;
  status: CareStatus;
  periodEnd: Date | null;
}) {
  const existing = await db.careSubscription.findUnique({ where: { stripeSubscriptionId: input.subscriptionId } });
  if (existing) return { row: existing, created: false };

  const project = await db.project.findUnique({ where: { id: input.projectId }, include: { customer: { include: { user: true } } } });
  if (!project) return { row: null, created: false };

  const product = await db.product.findFirst({ where: { slug: "care-plan" } });
  const others = await db.careSubscription.count({ where: { projectId: input.projectId, status: { in: ["ACTIVE", "PAST_DUE"] } } });

  let row;
  try {
    row = await db.careSubscription.create({
      data: {
        projectId: input.projectId,
        customerId: input.customerId,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.subscriptionId,
        status: input.status,
        priceCents: product?.priceCents ?? 7900,
        currentPeriodEnd: input.periodEnd,
      },
    });
  } catch {
    // A concurrent event created it first (unique subscription id).
    const again = await db.careSubscription.findUnique({ where: { stripeSubscriptionId: input.subscriptionId } });
    return { row: again, created: false };
  }

  await logEvent("care.started", "Project", input.projectId, { subscriptionId: input.subscriptionId });
  await trackFunnel("subscription_started", { projectId: input.projectId, orderId: project.orderId });
  await notifyAdmin("Care plan started", `${project.name} started the monthly care plan.`);
  if (others > 0) {
    await notifyAdmin(
      "Duplicate care plan subscription",
      `${project.name} now has more than one active care plan. Refund and cancel one in Stripe (${input.subscriptionId}).`,
    );
  }
  await sendEmail(project.customer.user.email, "care_plan_started", {
    projectName: project.name,
    statusUrl: statusUrlFor(project.statusToken ?? ""),
  });
  return { row, created: true };
}

async function applyStatus(subscriptionId: string, status: CareStatus, extra: { periodEnd?: Date | null; cancelAtPeriodEnd?: boolean } = {}) {
  const row = await db.careSubscription.findUnique({ where: { stripeSubscriptionId: subscriptionId }, include: { project: true } });
  if (!row) return "ignored" as const;

  const becamePastDue = status === "PAST_DUE" && row.status !== "PAST_DUE";
  const becameCanceled = status === "CANCELED" && row.status !== "CANCELED";
  // A late "active" event must not resurrect a plan that has already ended.
  const next = row.status === "CANCELED" ? "CANCELED" : status;

  await db.careSubscription.update({
    where: { id: row.id },
    data: {
      status: next,
      ...(extra.periodEnd !== undefined ? { currentPeriodEnd: extra.periodEnd } : {}),
      ...(extra.cancelAtPeriodEnd !== undefined ? { cancelAtPeriodEnd: extra.cancelAtPeriodEnd } : {}),
    },
  });

  if (becamePastDue) {
    await logEvent("care.payment_failed", "Project", row.projectId, { subscriptionId });
    await notifyAdmin("Care plan payment failed", `${row.project.name}: the latest care plan payment didn't go through. Stripe will retry.`);
  }
  if (becameCanceled) {
    await logEvent("care.canceled", "Project", row.projectId, { subscriptionId });
    await notifyAdmin("Care plan canceled", `${row.project.name} canceled the care plan.`);
  }
  return "handled" as const;
}

/**
 * Applies one Stripe event to the care-plan records. Idempotent: replaying the
 * same event changes nothing further. Events that aren't about a care plan are ignored.
 */
export async function handleCareEvent(event: Stripe.Event): Promise<"handled" | "ignored"> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || session.metadata?.kind !== "care_plan") return "ignored";
      const { projectId, customerId } = session.metadata;
      const subscriptionId = idOf(session.subscription as string | { id: string } | null);
      if (!projectId || !customerId || !subscriptionId) return "ignored";
      // Only a paid (or no-payment-needed) checkout starts the plan.
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return "ignored";
      await ensureRow({
        subscriptionId,
        stripeCustomerId: idOf(session.customer as string | { id: string } | null),
        projectId,
        customerId,
        status: "ACTIVE",
        periodEnd: null,
      });
      return "handled";
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as unknown as SubscriptionLike;
      const status = event.type === "customer.subscription.deleted" ? "CANCELED" : mapStripeStatus(sub.status);
      if (!status) return "ignored";

      if (sub.metadata?.kind === "care_plan" && sub.metadata.projectId && sub.metadata.customerId) {
        // The update can arrive before the checkout event; create the record from it.
        await ensureRow({
          subscriptionId: sub.id,
          stripeCustomerId: idOf(sub.customer),
          projectId: sub.metadata.projectId,
          customerId: sub.metadata.customerId,
          status,
          periodEnd: periodEndOf(sub),
        });
      }
      return applyStatus(sub.id, status, { periodEnd: periodEndOf(sub), cancelAtPeriodEnd: sub.cancel_at_period_end ?? false });
    }

    case "invoice.payment_failed":
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as unknown as Parameters<typeof invoiceSubscriptionId>[0];
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!subscriptionId) return "ignored";
      return applyStatus(subscriptionId, event.type === "invoice.payment_failed" ? "PAST_DUE" : "ACTIVE");
    }

    default:
      return "ignored";
  }
}
