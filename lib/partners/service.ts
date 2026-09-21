import { createHash } from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/provider";
import { logEvent } from "@/lib/analytics/events";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { LEGAL_VERSION } from "@/lib/legal/config";
import { PARTNER, usd } from "@/lib/pricing/catalog";
import { createProspect } from "@/lib/prospects/service";
import { summarizeItems } from "@/lib/orders/summary";
import {
  approvalDecision,
  COMMISSION_LABEL,
  customerStatusLabel,
  decideCommission,
  isPartnerCode,
  newPartnerCode,
  newPartnerToken,
  partnerAssets,
  partnerLink,
  partnerTypeLabel,
  pendingReason,
  totalsOf,
  type CommissionState,
} from "@/lib/partners/rules";

// The partner program, the database side. Nothing here sends money: commissions are worked out and held by rules, and the
// owner pays approved ones by hand and records it.

const baseUrl = () => (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const dashboardUrl = (token: string) => `${baseUrl()}/partners/dashboard/${token}`;
const ownerEmail = () => process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL;

async function safeEmail(to: string, template: Parameters<typeof sendEmail>[1], payload: Record<string, unknown>) {
  try {
    await sendEmail(to, template, payload);
  } catch (err) {
    console.error(`partner email ${template} failed`, err);
  }
}

// ---- applying, approving ----

export async function applyToProgram(clean: { name: string; email: string; company: string; type: string; website: string; about: string }): Promise<{ created: boolean; id: string }> {
  const existing = await db.partner.findUnique({ where: { email: clean.email }, select: { id: true } });
  if (existing) return { created: false, id: existing.id };
  const p = await db.partner.create({
    data: { token: newPartnerToken(), name: clean.name, email: clean.email, company: clean.company || null, type: clean.type, website: clean.website || null, about: clean.about, termsVersion: LEGAL_VERSION },
  });
  await safeEmail(p.email, "partner_application_received", { name: p.name });
  await safeEmail(ownerEmail(), "owner_new_order", {
    subject: `New partner application: ${p.name}${p.company ? ` (${p.company})` : ""}`,
    body: `${p.name} applied to the partner program.\n\nType: ${partnerTypeLabel(p.type)}\nCompany: ${p.company ?? "n/a"}\nWebsite: ${p.website ?? "n/a"}\nEmail: ${p.email}\n\nHow they would send customers:\n${p.about}\n\nReview it: ${baseUrl()}/admin/partners`,
  });
  return { created: true, id: p.id };
}

export async function approvePartner(id: string, percent?: number): Promise<{ ok: boolean; error?: string }> {
  const p = await db.partner.findUnique({ where: { id } });
  if (!p) return { ok: false, error: "Partner not found." };
  if (p.status === "ACTIVE") return { ok: false, error: "Already active." };
  let code = p.code;
  for (let i = 0; i < 5 && !code; i++) {
    const candidate = newPartnerCode();
    if (!(await db.partner.findUnique({ where: { code: candidate }, select: { id: true } }))) code = candidate;
  }
  if (!code) return { ok: false, error: "Could not make a code. Try again." };
  const pct = percent === undefined ? p.commissionPercent : Math.round(percent);
  if (!Number.isFinite(pct) || pct < 1 || pct > 50) return { ok: false, error: "The commission must be between 1 and 50 percent." };
  const claim = await db.partner.updateMany({ where: { id, status: { in: ["APPLIED", "PAUSED", "DECLINED"] } }, data: { status: "ACTIVE", code, commissionPercent: pct, approvedAt: p.approvedAt ?? new Date(), termsVersion: LEGAL_VERSION } });
  if (claim.count === 0) return { ok: false, error: "Already active." };
  await safeEmail(p.email, "partner_approved", { name: p.name, dashboardUrl: dashboardUrl(p.token), link: partnerLink(code, baseUrl()), percent: pct, days: PARTNER.pendingDays });
  return { ok: true };
}

export async function declinePartner(id: string): Promise<{ ok: boolean; error?: string }> {
  const p = await db.partner.findUnique({ where: { id }, select: { status: true, email: true, name: true } });
  if (!p) return { ok: false, error: "Partner not found." };
  if (p.status !== "APPLIED") return { ok: false, error: "Only an application can be declined." };
  await db.partner.updateMany({ where: { id, status: "APPLIED" }, data: { status: "DECLINED" } });
  await safeEmail(p.email, "partner_declined", { name: p.name });
  return { ok: true };
}

export async function pausePartner(id: string): Promise<{ ok: boolean; error?: string }> {
  const r = await db.partner.updateMany({ where: { id, status: "ACTIVE" }, data: { status: "PAUSED" } });
  return r.count === 1 ? { ok: true } : { ok: false, error: "Only an active partner can be paused." };
}

export async function setPartnerPercent(id: string, percent: number): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isInteger(percent) || percent < 1 || percent > 50) return { ok: false, error: "The commission must be a whole number from 1 to 50 percent." };
  const r = await db.partner.updateMany({ where: { id }, data: { commissionPercent: percent } });
  return r.count === 1 ? { ok: true } : { ok: false, error: "Partner not found." };
}

// ---- clicks and leads ----

/** Counts a visit through a partner's link. Only an active partner's clicks are counted. Never throws. */
export async function recordPartnerClick(code: string, ip: string, userAgent: string | null): Promise<boolean> {
  if (!isPartnerCode(code)) return false;
  try {
    const p = await db.partner.findUnique({ where: { code }, select: { id: true, status: true } });
    if (!p || p.status !== "ACTIVE") return false;
    await db.partnerClick.create({ data: { partnerId: p.id, ipHash: createHash("sha256").update(ip).digest("hex"), userAgent: userAgent?.slice(0, 300) ?? null } });
    return true;
  } catch (err) {
    console.error("partner click failed", err);
    return false;
  }
}

export interface LeadInput {
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  note?: string;
  /** The partner confirms they have permission to share this person's details. */
  permission: boolean;
}

export const DAILY_LEAD_CAP = 20;

export async function submitPartnerLead(token: string, input: LeadInput): Promise<{ ok: true; alreadyKnown: boolean } | { ok: false; error: string }> {
  const partner = await db.partner.findUnique({ where: { token } });
  if (!partner || partner.status !== "ACTIVE") return { ok: false, error: "Your partner account is not active." };
  const businessName = input.businessName.trim().slice(0, 120);
  const email = input.email.trim().toLowerCase();
  if (businessName.length < 2) return { ok: false, error: "Please enter the business name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { ok: false, error: "Please enter the person's email address." };
  if (input.permission !== true) return { ok: false, error: "Please confirm you have their permission to share their details with us." };
  const recent = await db.prospect.count({ where: { partnerId: partner.id, createdAt: { gte: new Date(Date.now() - 86_400_000) } } });
  if (recent >= DAILY_LEAD_CAP) return { ok: false, error: "That is the limit for today. Please try again tomorrow." };

  const { id, duplicate } = await createProspect({ businessName, email, phone: input.phone, source: "partner" });
  if (duplicate) return { ok: true, alreadyKnown: true }; // never reassign someone we already had, and never say more
  const note = `Introduced by partner ${partner.name}${partner.company ? ` (${partner.company})` : ""}, code ${partner.code}. ${input.contactName ? `Contact: ${input.contactName.trim().slice(0, 80)}. ` : ""}${input.note ? `Note: ${input.note.trim().slice(0, 300)}` : ""}`.trim();
  await db.prospect.update({ where: { id }, data: { partnerId: partner.id, notes: note } });
  await logEvent("partner.lead", "Partner", partner.id, { prospectId: id });
  await safeEmail(ownerEmail(), "owner_new_order", { subject: `Partner lead: ${businessName}`, body: `${partner.name} introduced a lead.\n\nBusiness: ${businessName}\nEmail: ${email}\n${input.note ? `Note: ${input.note.slice(0, 300)}\n` : ""}\nThey are in your CRM as a new lead: ${baseUrl()}/admin/prospects/${id}\n\nReach out yourself. Nothing is sent to them automatically.` });
  return { ok: true, alreadyKnown: false };
}

// ---- earning ----

/**
 * A customer's order has just been paid: if a partner referred that customer, record the commission (held). The partner is the
 * one whose code the customer signed up with, or the one who registered that person's email as a lead. Safe to call twice.
 * Never throws: a commission problem must not hold up an order.
 */
export async function recordPartnerPurchase(orderId: string): Promise<"recorded" | "none" | "exists" | "error"> {
  try {
    if (await db.partnerCommission.findUnique({ where: { orderId }, select: { id: true } })) return "exists";
    const order = await db.order.findUnique({ where: { id: orderId }, include: { customer: { include: { user: { select: { email: true } } } } } });
    if (!order || order.status !== "PAID") return "none";
    const buyerEmail = order.customer.user.email.toLowerCase();

    let partner = null;
    const code = order.customer.referredByCode;
    if (code && isPartnerCode(code)) partner = await db.partner.findUnique({ where: { code } });
    if (!partner) {
      const lead = await db.prospect.findFirst({ where: { email: buyerEmail, partnerId: { not: null } }, select: { partnerId: true } });
      if (lead?.partnerId) partner = await db.partner.findUnique({ where: { id: lead.partnerId } });
    }
    if (!partner) return "none";

    const paid = await db.order.findMany({ where: { customerId: order.customerId, status: "PAID" }, select: { paidAt: true } });
    const now = new Date();
    const firstPaidAt = paid.map((o) => o.paidAt).filter((d): d is Date => Boolean(d)).sort((a, b) => a.getTime() - b.getTime())[0] ?? now;
    const d = decideCommission({ partnerStatus: partner.status, partnerEmail: partner.email, partnerPercent: partner.commissionPercent, buyerEmail, grossCents: order.totalCents - order.shippingCents, firstPaidAt, now });
    await db.partnerCommission.create({
      data: { partnerId: partner.id, orderId, customerId: order.customerId, state: d.state, grossCents: d.grossCents, commissionCents: d.commissionCents, percent: d.percent, pendingUntil: d.pendingUntil, note: d.reason },
    });
    await logEvent("partner.commission", "Partner", partner.id, { orderId, state: d.state });
    return "recorded";
  } catch (err) {
    console.error("partner commission failed", err);
    return "error";
  }
}

/** Approves commissions whose hold has passed and whose order is fully paid; voids those whose order was refunded or cancelled. */
export async function approveMaturedPartnerCommissions(now = new Date()): Promise<{ approved: number; voided: number }> {
  const pending = await db.partnerCommission.findMany({ where: { state: "PENDING" }, take: 500 });
  let approved = 0;
  let voided = 0;
  for (const c of pending) {
    const order = await db.order.findUnique({ where: { id: c.orderId }, select: { status: true, balanceDueCents: true } });
    if (!order) continue;
    const decision = approvalDecision({ pendingUntil: c.pendingUntil, orderStatus: order.status, balanceDueCents: order.balanceDueCents, now });
    if (decision === "wait") continue;
    const r = await db.partnerCommission.updateMany({ where: { id: c.id, state: "PENDING" }, data: decision === "approve" ? { state: "APPROVED", approvedAt: now } : { state: "REFUNDED", note: "The order was refunded or cancelled" } });
    if (r.count === 1) decision === "approve" ? approved++ : voided++;
  }
  return { approved, voided };
}

/** The owner has sent the money for everything approved: record it, once, and tell the partner. */
export async function payApprovedForPartner(partnerId: string, ref: string, now = new Date()): Promise<{ ok: true; amountCents: number; count: number } | { ok: false; error: string }> {
  const partner = await db.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return { ok: false, error: "Partner not found." };
  const cleanRef = ref.trim().slice(0, 120);
  if (!cleanRef) return { ok: false, error: "Enter a note about how you paid, like the Zelle confirmation." };
  const approved = await db.partnerCommission.findMany({ where: { partnerId, state: "APPROVED" } });
  if (approved.length === 0) return { ok: false, error: "Nothing is approved for this partner right now." };
  let amountCents = 0;
  let count = 0;
  for (const c of approved) {
    const r = await db.partnerCommission.updateMany({ where: { id: c.id, state: "APPROVED" }, data: { state: "PAID", paidAt: now, payoutRef: cleanRef } });
    if (r.count === 1) {
      amountCents += c.commissionCents;
      count++;
    }
  }
  if (count === 0) return { ok: false, error: "Nothing is approved for this partner right now." };
  await logEvent("partner.paid", "Partner", partnerId, { amountCents, count });
  await safeEmail(partner.email, "partner_payout_sent", { name: partner.name, amount: usd(amountCents), count, ref: cleanRef, dashboardUrl: dashboardUrl(partner.token) });
  return { ok: true, amountCents, count };
}

// ---- what a partner sees ----

const LEAD_LABEL: Record<string, string> = { NEW: "Received", AUDITED: "Received", CONTACTED: "We have reached out", REPLIED: "In conversation", CALL_BOOKED: "In conversation", WON: "Became a customer", LOST: "Not moving forward", DO_NOT_CONTACT: "Closed" };

export async function loadPartnerDashboard(token: string, now = new Date()) {
  const partner = await db.partner.findUnique({ where: { token } });
  if (!partner || partner.status === "DECLINED") return null;
  const link = partner.code ? partnerLink(partner.code, baseUrl()) : null;

  const [clicks, prospects, commissions, signups] = await Promise.all([
    db.partnerClick.count({ where: { partnerId: partner.id } }),
    db.prospect.findMany({ where: { partnerId: partner.id }, orderBy: { createdAt: "desc" }, take: 100, select: { businessName: true, status: true, createdAt: true } }),
    db.partnerCommission.findMany({ where: { partnerId: partner.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    partner.code ? db.customer.findMany({ where: { referredByCode: partner.code }, take: 200, select: { id: true, user: { select: { name: true } }, orders: { select: { status: true, balanceDueCents: true } }, projects: { select: { state: true } } } }) : Promise.resolve([]),
  ]);

  const orders = commissions.length ? await db.order.findMany({ where: { id: { in: commissions.map((c) => c.orderId) } }, select: { id: true, balanceDueCents: true, items: { select: { productId: true, quantity: true, product: { select: { name: true } } } } } }) : [];
  const rows = commissions.map((c) => {
    const o = orders.find((x) => x.id === c.orderId);
    return {
      when: c.createdAt,
      what: o ? summarizeItems(o.items) : "An order",
      commissionCents: c.commissionCents,
      percent: c.percent,
      state: c.state as CommissionState,
      label: COMMISSION_LABEL[c.state as CommissionState] ?? c.state,
      detail: c.state === "PENDING" ? pendingReason({ pendingUntil: c.pendingUntil, balanceDueCents: o?.balanceDueCents ?? 0, now }) : c.state === "PAID" && c.paidAt ? `Paid ${c.paidAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : c.state === "REJECTED" || c.state === "REFUNDED" ? (c.note ?? "") : "",
    };
  });

  const customers = signups.map((c) => {
    const paid = c.orders.filter((o) => o.status === "PAID");
    const active = c.projects.filter((p) => !["DELIVERED", "REVIEW_REQUESTED", "COMPLETED", "CANCELLED"].includes(p.state))[0] ?? c.projects[0] ?? null;
    return { firstName: (c.user.name ?? "").split(" ")[0] || "A customer", status: customerStatusLabel({ hasPaidOrder: paid.length > 0, balanceDueCents: paid.reduce((s, o) => s + o.balanceDueCents, 0), projectState: active?.state ?? null }) };
  });

  return {
    partner: { name: partner.name, company: partner.company, type: partnerTypeLabel(partner.type), status: partner.status, code: partner.code, percent: partner.commissionPercent, payoutNote: partner.payoutNote },
    link,
    stats: { clicks, leads: prospects.length, customers: customers.filter((c) => c.status !== "Signed up, no order yet").length, signups: customers.length },
    totals: totalsOf(commissions),
    leads: prospects.map((p) => ({ name: p.businessName, added: p.createdAt, status: LEAD_LABEL[p.status] ?? "Received" })),
    customers,
    commissions: rows,
    assets: link ? partnerAssets(link) : [],
  };
}

// ---- what the owner sees ----

export async function loadAdminPartners() {
  const partners = await db.partner.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 300, include: { commissions: true, _count: { select: { clicks: true } } } });
  const leadCounts = await db.prospect.groupBy({ by: ["partnerId"], where: { partnerId: { not: null } }, _count: { _all: true } });
  return partners.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    company: p.company,
    type: partnerTypeLabel(p.type),
    website: p.website,
    about: p.about,
    status: p.status,
    code: p.code,
    percent: p.commissionPercent,
    createdAt: p.createdAt,
    clicks: p._count.clicks,
    leads: leadCounts.find((l) => l.partnerId === p.id)?._count._all ?? 0,
    commissions: p.commissions.length,
    totals: totalsOf(p.commissions),
    dashboardUrl: dashboardUrl(p.token),
  }));
}
