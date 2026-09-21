import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, usd } from "@/lib/pricing/catalog";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { sendEmail } from "@/lib/email/provider";
import { trackFunnel } from "@/lib/analytics/funnel";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { auditReportText, type AuditInput, type GrowthAuditReport } from "@/lib/audit/growthAudit";
import type { AuditResult } from "@/lib/prospects/audit";
import type { SiteFacts } from "@/lib/audit/diagnosis";
import { buildBriefing } from "@/lib/audit/briefing";

// The paid Growth Audit: the request is saved with its finished report, the visitor sees a free teaser, and the full
// report unlocks only when Stripe says the fee was paid. The fee comes back as a single-use credit code.

const baseUrl = () => (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const DAY = 86_400_000;

// ---- the teaser: real counts from their own homepage, never the findings themselves ----

export interface AuditTeaser {
  checked: number;
  needAttention: number;
  suggestions: number;
  headline: string;
}

export function auditTeaser(report: GrowthAuditReport): AuditTeaser {
  const site = report.observed.items.filter((i) => i.source === "your website");
  const checked = site.length;
  const needAttention = site.filter((i) => i.status === "issue").length;
  const suggestions = report.recommended.length;
  const headline =
    checked === 0
      ? `We have ${suggestions} suggestion${suggestions === 1 ? "" : "s"} for you based on what you told us.`
      : needAttention > 0
        ? `We read your homepage and ${needAttention} of ${checked} basic checks need attention. We also have ${suggestions} suggestion${suggestions === 1 ? "" : "s"} for you.`
        : `We read your homepage and all ${checked} basic checks look fine. We still have ${suggestions} suggestion${suggestions === 1 ? "" : "s"} for you.`;
  return { checked, needAttention, suggestions, headline };
}

// ---- credit codes ----

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
export function newCreditCode(): string {
  const bytes = randomBytes(8);
  return "AUDIT-" + Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
export const isAuditCreditCode = (code: string | null | undefined) => /^AUDIT-[A-Z2-9]{8}$/.test((code ?? "").trim().toUpperCase());

/** What the credit takes off an order: the whole fee, but never more than the order. Zero if the code is unknown, used, or expired. */
export async function resolveAuditCredit(code: string, subtotalCents: number, now = new Date()): Promise<number> {
  const c = code.trim().toUpperCase();
  if (!isAuditCreditCode(c)) return 0;
  const audit = await db.growthAudit.findUnique({ where: { creditCode: c }, select: { status: true, amountCents: true, creditUsedAt: true, creditExpiresAt: true } });
  if (!audit || audit.status !== "PAID" || audit.creditUsedAt || !audit.creditExpiresAt || audit.creditExpiresAt <= now) return 0;
  return Math.max(0, Math.min(audit.amountCents, subtotalCents));
}

/** Uses up the credit when the order it was applied to is paid. Only the first use counts. */
export async function consumeAuditCredit(code: string | null | undefined, now = new Date()): Promise<boolean> {
  const c = (code ?? "").trim().toUpperCase();
  if (!isAuditCreditCode(c)) return false;
  const r = await db.growthAudit.updateMany({ where: { creditCode: c, creditUsedAt: null }, data: { creditUsedAt: now } });
  return r.count === 1;
}

// ---- requesting, paying, delivering ----

export async function createAuditRequest(args: { input: AuditInput; report: GrowthAuditReport; prospectId: string | null; site: AuditResult | null; facts: SiteFacts | null }) {
  const token = randomBytes(24).toString("hex");
  const row = await db.growthAudit.create({
    data: {
      token,
      email: args.input.email.toLowerCase(),
      businessName: args.input.businessName,
      prospectId: args.prospectId,
      inputJson: JSON.stringify({ ...args.input, email: undefined, phone: undefined }),
      reportJson: JSON.stringify(args.report),
      factsJson: JSON.stringify({ site: args.site, facts: args.facts }),
      amountCents: AUDIT_FEE_CENTS,
    },
  });
  return { id: row.id, token };
}

export type CheckoutStart = { ok: true; url: string; paid?: boolean } | { ok: false; status: number; error: string };

/** A Stripe Checkout page for the fee, or, in development with no Stripe configured, the same path as if it had been paid. */
export async function startAuditCheckout(auditId: string): Promise<CheckoutStart> {
  const audit = await db.growthAudit.findUnique({ where: { id: auditId } });
  if (!audit) return { ok: false, status: 404, error: "We could not find that audit." };
  const reportUrl = `${baseUrl()}/audit/report/${audit.token}`;
  if (audit.status === "PAID") return { ok: true, url: reportUrl, paid: true };

  if (!isStripeConfigured()) {
    if (process.env.NODE_ENV === "production") return { ok: false, status: 503, error: "Payment is not available right now. Please email us and we will send your audit." };
    await markAuditPaid(audit.id, `mock_${audit.id}`);
    return { ok: true, url: reportUrl, paid: true };
  }
  try {
    const meta = { kind: "growth_audit", auditId: audit.id };
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: audit.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Growth Audit (credited toward your first order)", description: `Your fee comes back as a ${usd(audit.amountCents)} credit code for your first order within ${AUDIT_CREDIT_DAYS} days.` },
            unit_amount: audit.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: meta,
      payment_intent_data: { metadata: meta },
      success_url: `${reportUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: reportUrl,
    });
    if (!session.url) return { ok: false, status: 502, error: "We could not start checkout. Please try again." };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("audit checkout failed", err instanceof Error ? err.message : err);
    return { ok: false, status: 502, error: "We could not start checkout. Please try again, or email us." };
  }
}

/**
 * Marks the audit paid, exactly once: issues the credit code, moves the lead forward, sends the report, and tells the
 * owner. Safe if the webhook and the visitor's return trip both arrive.
 */
export async function markAuditPaid(auditId: string, stripeSessionId: string, now = new Date()): Promise<{ firstTime: boolean }> {
  let creditCode = newCreditCode();
  let claimed = false;
  for (let attempt = 0; attempt < 3 && !claimed; attempt++) {
    try {
      const r = await db.growthAudit.updateMany({
        where: { id: auditId, status: "PENDING" },
        data: { status: "PAID", paidAt: now, stripeSessionId, creditCode, creditExpiresAt: new Date(now.getTime() + AUDIT_CREDIT_DAYS * DAY) },
      });
      if (r.count === 0) return { firstTime: false };
      claimed = true;
    } catch {
      creditCode = newCreditCode(); // the code collided with another (very unlikely); try a new one
    }
  }
  if (!claimed) throw new Error("could not record the audit payment");

  const audit = await db.growthAudit.findUniqueOrThrow({ where: { id: auditId } });
  const report = JSON.parse(audit.reportJson) as GrowthAuditReport;

  // The owner's analyst reads what was found and writes the briefing: what they need, and what to offer first.
  let briefing: ReturnType<typeof buildBriefing> | null = null;
  try {
    const stored = JSON.parse(audit.factsJson ?? "{}") as { site?: AuditResult | null; facts?: SiteFacts | null };
    const input = JSON.parse(audit.inputJson) as Parameters<typeof buildBriefing>[0]["input"];
    briefing = buildBriefing({ input: { ...input, businessName: audit.businessName }, report, site: stored.site ?? null, facts: stored.facts ?? null, credit: { code: creditCode, amountCents: audit.amountCents, days: AUDIT_CREDIT_DAYS }, now });
    await db.growthAudit.update({ where: { id: audit.id }, data: { briefingJson: JSON.stringify(briefing) } });
  } catch (err) {
    console.error("audit briefing failed", err);
  }

  if (audit.prospectId) {
    const p = await db.prospect.findUnique({ where: { id: audit.prospectId }, select: { status: true } });
    await db.prospect.updateMany({ where: { id: audit.prospectId }, data: { auditedAt: now, auditJson: audit.reportJson, ...(p?.status === "NEW" ? { status: "AUDITED" } : {}) } });
  }
  await trackFunnel("audit_paid", { source: "growth-audit" });
  await trackFunnel("audit_completed", { source: "growth-audit" });

  try {
    await sendEmail(audit.email, "growth_audit_ready", {
      name: audit.businessName,
      report: auditReportText(report),
      plansUrl: `${baseUrl()}/services`,
      reportUrl: `${baseUrl()}/audit/report/${audit.token}`,
      creditCode: creditCode,
      creditAmount: usd(audit.amountCents),
      creditDays: AUDIT_CREDIT_DAYS,
    });
  } catch (err) {
    console.error("audit report email failed", err);
  }
  try {
    await sendEmail(process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL, "owner_audit_lead", {
      subject: `PAID growth audit: ${audit.businessName} (${usd(audit.amountCents)})`,
      body: `Someone paid for a Growth Audit.\n\nBusiness: ${audit.businessName}\nEmail: ${audit.email}\n\n${briefing ? `ANALYST: ${briefing.summary}\nBest first offer: ${briefing.primary.title} (${briefing.primary.price})\nNext: ${briefing.nextAction}\n\n` : ""}They have a ${usd(audit.amountCents)} credit code for their first order, valid ${AUDIT_CREDIT_DAYS} days. This is a serious lead: reach out.\n\nFull briefing and a drafted message: ${baseUrl()}/admin/audits/${audit.id}`,
    });
  } catch (err) {
    console.error("audit owner alert failed", err);
  }
  return { firstTime: true };
}

/**
 * The visitor came back from Stripe. Ask Stripe (never the browser) whether it was paid for this audit and this
 * amount, and mark it paid. The webhook does the same; whichever comes first wins.
 */
export async function confirmAuditPayment(auditId: string, sessionId: string): Promise<boolean> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !isStripeConfigured()) return false;
  try {
    const s: Stripe.Checkout.Session = await getStripe().checkout.sessions.retrieve(sessionId);
    const audit = await db.growthAudit.findUnique({ where: { id: auditId }, select: { amountCents: true } });
    if (!audit || s.payment_status !== "paid" || s.metadata?.kind !== "growth_audit" || s.metadata?.auditId !== auditId || s.amount_total !== audit.amountCents) return false;
    await markAuditPaid(auditId, s.id);
    return true;
  } catch (err) {
    console.error("audit payment confirmation failed", err instanceof Error ? err.message : err);
    return false;
  }
}

/** The webhook side: a paid checkout session for a growth audit. */
export async function handleAuditEvent(event: Stripe.Event): Promise<void> {
  if (event.type !== "checkout.session.completed") return;
  const s = event.data.object as Stripe.Checkout.Session;
  if (s.metadata?.kind !== "growth_audit" || s.payment_status !== "paid") return;
  const auditId = s.metadata.auditId;
  if (!auditId) return;
  const audit = await db.growthAudit.findUnique({ where: { id: auditId }, select: { amountCents: true } });
  if (!audit || s.amount_total !== audit.amountCents) return;
  await markAuditPaid(auditId, s.id);
}
