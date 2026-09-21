import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { sendEmail } from "@/lib/email/provider";
import { usd } from "@/lib/pricing/catalog";
import { issueBalanceInvoice, invoiceUrl } from "@/lib/payments/invoiceCore";

// The delivery gate. A deposit order's build is finished on schedule, but the final files are released only after the
// balance is paid. Kept apart from the payment flow so the pipeline can import it without a circular dependency.

/**
 * If this project's order still owes a balance, asks for it. "hold" is for builds delivered automatically: it records that
 * delivery was held, so paying the balance releases it. "notify" is for website builds, which the owner launches: nothing
 * is held or auto-released, the customer is just told what is due before launch. Either way there is an open invoice and
 * the customer is emailed once. Returns true when a balance is owed.
 */
export async function holdDeliveryForBalance(projectId: string, mode: "hold" | "notify" = "hold"): Promise<boolean> {
  const project = await db.project.findUnique({ where: { id: projectId }, include: { order: true, customer: { include: { user: true } } } });
  if (!project || project.order.balanceDueCents <= 0) return false;

  const already = await db.auditLog.findFirst({ where: { event: { in: ["project.delivery_held", "project.balance_requested"] }, entityId: projectId } });
  const invoice = await issueBalanceInvoice(project.orderId);
  if (already || !invoice) return true;

  await logEvent(mode === "hold" ? "project.delivery_held" : "project.balance_requested", "Project", projectId, { balanceDueCents: project.order.balanceDueCents });
  try {
    await sendEmail(project.customer.user.email, "balance_due_ready", {
      projectName: project.name,
      amount: usd(invoice.amountCents),
      invoiceUrl: invoiceUrl(invoice.token),
      beforeLaunch: mode === "notify",
    });
  } catch (err) {
    console.error("balance due email failed", err);
  }
  return true;
}
