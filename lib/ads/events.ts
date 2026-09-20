import type Stripe from "stripe";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { trackFunnel } from "@/lib/analytics/funnel";
import { sendEmail } from "@/lib/email/provider";
import { notifyOwnerOfAdPlan } from "@/lib/alerts/ownerAlerts";
import { invoiceSubscriptionId, mapStripeStatus, periodEndOf, type CareStatus } from "@/lib/care/events";
import { getAdPlan, planDeliveryTarget } from "@/lib/ads/plans";

const idOf = (v: string | { id: string } | null | undefined): string | null => (typeof v === "string" ? v : (v?.id ?? null));
const manageUrl = (token: string) => `${(process.env.APP_BASE_URL ?? "").replace(/\/$/, "")}/monthly-ads/manage/${token}`;

async function notifyAdmin(title: string, body: string) {
  await db.notification.create({ data: { audience: "admin", title, body } });
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

/**
 * Marks a plan paid and active, and does the "started" work exactly once
 * (thank-you email, owner alert, admin note). Safe if events repeat or arrive out of order.
 */
export async function activateAdPlan(input: { adSubscriptionId: string; stripeSubscriptionId: string; stripeCustomerId: string | null; periodEnd: Date | null }) {
  const row = await db.adSubscription.findUnique({ where: { id: input.adSubscriptionId }, include: { customer: { include: { user: true } } } });
  if (!row) return "ignored" as const;

  const firstTime = row.status === "PENDING";
  // A late event must not revive a plan that has already ended.
  if (row.status === "CANCELED") return "handled" as const;

  await db.adSubscription.update({
    where: { id: row.id },
    data: {
      status: row.status === "PAST_DUE" ? "PAST_DUE" : "ACTIVE",
      stripeSubscriptionId: row.stripeSubscriptionId ?? input.stripeSubscriptionId,
      stripeCustomerId: row.stripeCustomerId ?? input.stripeCustomerId,
      ...(input.periodEnd ? { currentPeriodEnd: input.periodEnd } : {}),
      ...(firstTime ? { activatedAt: new Date() } : {}),
    },
  });

  if (firstTime) {
    const plan = getAdPlan(row.planSlug);
    await logEvent("ads.started", "AdSubscription", row.id, { plan: row.planSlug });
    await trackFunnel("subscription_started", { adSubscriptionId: row.id, plan: row.planSlug });
    await notifyAdmin("Monthly ads plan started", `${row.businessName} started ${plan?.name ?? row.planSlug}.`);
    await sendEmail(row.customer.user.email, "ads_plan_started", {
      planName: plan?.name ?? "your Monthly Ads plan",
      businessName: row.businessName,
      manageUrl: manageUrl(row.manageToken),
      deliveryTarget: plan ? planDeliveryTarget(plan) : undefined,
    });
    await notifyOwnerOfAdPlan(row.id);
  }
  return "handled" as const;
}

async function applyStatus(stripeSubscriptionId: string, status: CareStatus, extra: { periodEnd?: Date | null; cancelAtPeriodEnd?: boolean } = {}) {
  const row = await db.adSubscription.findUnique({ where: { stripeSubscriptionId } });
  if (!row) return "ignored" as const;

  const becamePastDue = status === "PAST_DUE" && row.status !== "PAST_DUE";
  const becameCanceled = status === "CANCELED" && row.status !== "CANCELED";
  const next = row.status === "CANCELED" ? "CANCELED" : status;

  await db.adSubscription.update({
    where: { id: row.id },
    data: {
      status: next,
      ...(extra.periodEnd !== undefined ? { currentPeriodEnd: extra.periodEnd } : {}),
      ...(extra.cancelAtPeriodEnd !== undefined ? { cancelAtPeriodEnd: extra.cancelAtPeriodEnd } : {}),
    },
  });

  if (becamePastDue) {
    await logEvent("ads.payment_failed", "AdSubscription", row.id, { stripeSubscriptionId });
    await notifyAdmin("Monthly ads payment failed", `${row.businessName}: the latest plan payment didn't go through. Stripe will retry.`);
  }
  if (becameCanceled) {
    await logEvent("ads.canceled", "AdSubscription", row.id, { stripeSubscriptionId });
    await notifyAdmin("Monthly ads plan canceled", `${row.businessName} canceled ${getAdPlan(row.planSlug)?.name ?? "their plan"}.`);
  }
  return "handled" as const;
}

/**
 * Applies one Stripe event to the Monthly Ads records. Idempotent: replaying an
 * event changes nothing further. Events that are not about an ads plan are ignored.
 */
export async function handleAdsEvent(event: Stripe.Event): Promise<"handled" | "ignored"> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || session.metadata?.kind !== "ads_plan") return "ignored";
      const adSubscriptionId = session.metadata.adSubscriptionId;
      const stripeSubscriptionId = idOf(session.subscription as string | { id: string } | null);
      if (!adSubscriptionId || !stripeSubscriptionId) return "ignored";
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return "ignored";
      return activateAdPlan({
        adSubscriptionId,
        stripeSubscriptionId,
        stripeCustomerId: idOf(session.customer as string | { id: string } | null),
        periodEnd: null,
      });
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as unknown as SubscriptionLike;
      const status = event.type === "customer.subscription.deleted" ? "CANCELED" : mapStripeStatus(sub.status);
      if (!status) return "ignored";

      // The update can arrive before the checkout event; link and activate from it.
      if (sub.metadata?.kind === "ads_plan" && sub.metadata.adSubscriptionId && status !== "CANCELED") {
        await activateAdPlan({
          adSubscriptionId: sub.metadata.adSubscriptionId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: idOf(sub.customer),
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
