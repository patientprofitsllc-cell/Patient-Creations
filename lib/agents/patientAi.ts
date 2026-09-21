import { db } from "@/lib/db";
import { aiEnabled, callModel } from "@/lib/ai/callModel";
import { getProjectProgress } from "@/lib/workflows/progress";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { nextOffers } from "@/lib/journey/ladder";
import { summarizeItems } from "@/lib/orders/summary";
import { invoiceNumber, invoiceUrl } from "@/lib/payments/invoiceCore";
import { sendEmail } from "@/lib/email/provider";
import { CONTACT_EMAIL } from "@/lib/config/site";
import {
  EXACT_INTENTS,
  PATIENT_AI_SYSTEM,
  buildPatientAiPrompt,
  parsePatientAiModelReply,
  patientAiReply,
  patientAiReplyIsSafe,
  type AssistantReply,
  type PortalFacts,
} from "@/lib/agents/patientAiLogic";

// Patient AI, the database side. The customer is identified by the caller (from the signed-in session) and every query
// below is scoped to that one customer id. There is no way to ask it about anyone else.

const COUNTED_COMMISSIONS = ["PURCHASED", "PENDING", "APPROVED", "PAYABLE", "PAID"];

export async function loadPortalFacts(customerId: string): Promise<PortalFacts | null> {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      user: { select: { name: true } },
      projects: { orderBy: { createdAt: "desc" }, take: 10 },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { include: { product: true } }, invoices: { where: { status: "OPEN" }, orderBy: { createdAt: "desc" } } },
      },
    },
  });
  if (!customer) return null;

  const [care, ads, referral] = await Promise.all([
    db.careSubscription.count({ where: { customerId, status: "ACTIVE" } }),
    db.adSubscription.findMany({ where: { customerId, status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { planSlug: true } }),
    db.referral.findUnique({ where: { customerId }, select: { id: true } }),
  ]);
  const paidReferrals = referral ? await db.commission.count({ where: { referralId: referral.id, orderId: { not: null }, state: { in: COUNTED_COMMISSIONS } } }) : 0;

  const projects = await Promise.all(
    customer.projects.map(async (p) => {
      const progress = await getProjectProgress(p.id);
      const update = await db.projectUpdate.findFirst({ where: { projectId: p.id }, orderBy: { createdAt: "desc" }, select: { message: true } });
      const order = customer.orders.find((o) => o.id === p.orderId);
      return {
        name: p.name,
        phaseLabel: progress.currentPhaseLabel,
        percent: progress.percent,
        isException: progress.isException,
        isDelivered: ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED"].includes(p.state),
        turnaround: order?.items[0]?.product.turnaround ?? null,
        latestUpdate: update?.message ?? null,
        statusUrl: p.statusToken ? statusUrlFor(p.statusToken) : null,
      };
    }),
  );

  const owned = customer.orders.filter((o) => o.status === "PAID").flatMap((o) => o.items.map((i) => i.product.slug));
  const offers = nextOffers({ justBought: [], owned, hasCarePlan: care > 0, hasAdsPlan: ads.length > 0, statusPath: null }).map((o) => ({ title: o.title, why: o.why, priceLabel: o.priceLabel, href: o.href }));

  return {
    firstName: (customer.user.name ?? "").split(" ")[0] ?? "",
    projects,
    orders: customer.orders.map((o) => ({
      summary: summarizeItems(o.items),
      totalCents: o.totalCents,
      status: o.status,
      balanceDueCents: o.balanceDueCents,
      revisionLimit: o.items[0]?.product.revisionLimit ?? null,
      included: o.items[0]?.product.description ?? null,
      turnaround: o.items[0]?.product.turnaround ?? null,
    })),
    openInvoices: customer.orders.flatMap((o) => o.invoices.map((i) => ({ number: invoiceNumber(i.seq), description: i.description, amountCents: i.amountCents, url: invoiceUrl(i.token) }))),
    plans: [...(care > 0 ? ["Website Care"] : []), ...(ads.length > 0 ? ["Monthly Ads"] : [])],
    offers,
    paidReferrals,
  };
}

/**
 * Answers a signed-in customer. Uses the model only when AI is deliberately on, only with this customer's own facts, and only
 * for questions where wording matters less than warmth; anything about money, scope, or contact is answered by the exact rules.
 * A model reply that promises money, invents a number, or links somewhere it was not given is thrown away. Never throws.
 */
export async function askPatientAi(facts: PortalFacts, question: string): Promise<AssistantReply> {
  const rules = patientAiReply(question, facts);
  if (EXACT_INTENTS.has(rules.intent) || !process.env.ANTHROPIC_API_KEY || !aiEnabled()) return rules;
  try {
    const result = await callModel({ agentKey: "patient-ai", system: PATIENT_AI_SYSTEM, prompt: buildPatientAiPrompt(facts, question), maxTokens: 400 });
    const parsed = parsePatientAiModelReply(result.text);
    if (parsed && patientAiReplyIsSafe(parsed.reply, facts)) return { ...rules, reply: parsed.reply, escalate: rules.escalate || parsed.escalate };
  } catch (err) {
    console.error("patient ai: model call failed, using the rule-based answer", err);
  }
  return rules;
}

/** Hands a customer's question to Trenton: a note in the admin dashboard and an email. Never throws. */
export async function escalateToOwner(input: { customerEmail: string; customerName: string; question: string; intent: string }): Promise<void> {
  const q = input.question.slice(0, 500);
  try {
    await db.notification.create({ data: { audience: "admin", title: "A customer asked Patient AI something that needs you", body: `${input.customerName || input.customerEmail}: "${q.slice(0, 200)}"` } });
  } catch (err) {
    console.error("patient ai: notification failed", err);
  }
  try {
    await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_new_order", {
      subject: `Customer question for you: ${input.customerName || input.customerEmail}`,
      body: `A signed-in customer asked Patient AI something it passed to you (${input.intent}).\n\nCustomer: ${input.customerName || "(no name)"} <${input.customerEmail}>\n\n"${q}"\n\nReply to them directly by email.`,
    });
  } catch (err) {
    console.error("patient ai: owner email failed", err);
  }
}
