import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/provider";
import { renderTemplate } from "@/lib/email/templates";
import { COMPANY } from "@/lib/legal/config";
import { nextOffers, type Offer } from "@/lib/journey/ladder";
import { optedOutSet, normalizeEmail, unsubscribeUrl } from "@/lib/followups/optout";
import { FOLLOWUP_KINDS, FOLLOWUP_LABELS, HOUR, DAY, blockedReason, dueAt, isDue, nextAuditKind, type FollowupKind } from "@/lib/followups/rules";

// Finds who is due a follow-up, and sends it when the owner says so (or when the secured trigger is called).
// Nothing here runs by itself. The record of what was sent is the email log the site already keeps, so there is no
// second list to fall out of step with it.

const baseUrl = () => (process.env.APP_BASE_URL || "").replace(/\/$/, "");

export interface FollowupItem {
  id: string; // kind:ref
  kind: FollowupKind;
  label: string;
  ref: string;
  email: string;
  name: string | null;
  dueAt: Date;
  why: string;
  subject: string;
  blockedReason: string | null;
  payload: Record<string, unknown>;
}

interface Raw {
  kind: FollowupKind;
  ref: string;
  email: string;
  name: string | null;
  anchor: Date;
  why: string;
  payload: Record<string, unknown>;
  doNotContact?: boolean;
  purchased?: boolean;
  waitingOn?: FollowupKind | null;
}

const parseJson = <T,>(s: string | null | undefined): T | null => {
  try {
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
};

export const hasMailingAddress = () => Boolean(COMPANY.mailingAddress);

function footerFor(email: string): string {
  return `Patient Profits LLC\n${COMPANY.mailingAddress ?? ""}\nDo not want these emails? Stop them here: ${unsubscribeUrl(email, baseUrl())}`;
}

function offersText(offers: Offer[]): string {
  const abs = (h: string) => (h.startsWith("/") ? `${baseUrl()}${h}` : h);
  return offers.map((o) => `- ${o.title} (${o.priceLabel}): ${o.why}\n  ${abs(o.href)}`).join("\n\n");
}

/** Everyone who is due a follow-up right now, with the reason if one is held back. */
export async function listFollowups(now = new Date()): Promise<{ items: FollowupItem[]; hasAddress: boolean }> {
  const hasAddress = hasMailingAddress();

  // ---- the record of what has already been sent ----
  const ledger = await db.emailEvent.findMany({
    where: { template: { in: [...FOLLOWUP_KINDS] }, status: "SENT" },
    select: { toEmail: true, template: true, payloadJson: true, createdAt: true },
  });
  const sent = new Set<string>();
  const lastFollowup = new Map<string, Date>();
  for (const e of ledger) {
    const email = normalizeEmail(e.toEmail);
    const ref = parseJson<{ ref?: string }>(e.payloadJson)?.ref ?? "";
    sent.add(`${email}|${e.template}|${ref}`);
    const prev = lastFollowup.get(email);
    if (!prev || prev < e.createdAt) lastFollowup.set(email, e.createdAt);
  }
  const wasSent = (email: string, kind: FollowupKind, ref: string) => sent.has(`${normalizeEmail(email)}|${kind}|${ref}`);

  const raws: Raw[] = [];

  // ---- 1. Growth audit leads ----
  const prospects = await db.prospect.findMany({
    where: { source: "growth-audit", email: { not: null }, auditedAt: { not: null }, status: { in: ["NEW", "AUDITED"] } },
    select: { id: true, businessName: true, email: true, auditedAt: true, auditJson: true },
    take: 500,
  });
  for (const p of prospects) {
    const email = normalizeEmail(p.email!);
    const kind = nextAuditKind({ first: wasSent(email, "audit_followup_1", p.id), second: wasSent(email, "audit_followup_2", p.id) });
    if (!kind || !p.auditedAt) continue;
    const report = parseJson<{ recommended?: { title?: string }[] }>(p.auditJson);
    raws.push({
      kind,
      ref: p.id,
      email,
      name: null,
      anchor: p.auditedAt,
      why: `Growth audit sent ${p.auditedAt.toISOString().slice(0, 10)}`,
      payload: { business: p.businessName, top: report?.recommended?.[0]?.title ?? null },
    });
  }

  // ---- 2. Unfinished checkouts ----
  const orders = await db.order.findMany({
    where: { status: "PENDING", paymentMethod: "stripe", createdAt: { gte: new Date(now.getTime() - 3 * DAY), lte: new Date(now.getTime() - 2 * HOUR) } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      items: { take: 1, select: { product: { select: { slug: true, name: true, active: true, type: true } } } },
      customer: { select: { user: { select: { email: true, name: true } } } },
    },
    take: 300,
  });
  const seenAbandoned = new Set<string>();
  for (const o of orders) {
    const product = o.items[0]?.product;
    const email = normalizeEmail(o.customer.user.email);
    if (!product || !product.active || product.type === "SUBSCRIPTION" || seenAbandoned.has(email)) continue;
    seenAbandoned.add(email);
    raws.push({
      kind: "abandoned_checkout",
      ref: o.id,
      email,
      name: o.customer.user.name?.trim().split(/\s+/)[0] ?? null,
      anchor: o.createdAt,
      why: `Started checkout for ${product.name} and did not pay`,
      payload: { product: product.name, link: `${baseUrl()}/checkout?product=${product.slug}` },
    });
  }

  // ---- 3. After delivery: a check-in, then what fits next ----
  const launches = await db.emailEvent.findMany({
    where: { template: { in: ["delivery", "website_live"] }, status: "SENT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, toEmail: true, payloadJson: true, createdAt: true },
    take: 1000,
  });
  const latestLaunch = new Map<string, (typeof launches)[number]>();
  for (const l of launches) {
    const email = normalizeEmail(l.toEmail);
    if (!latestLaunch.has(email)) latestLaunch.set(email, l);
  }
  const launchEmails = [...latestLaunch.keys()].filter((e) => now.getTime() - latestLaunch.get(e)!.createdAt.getTime() >= 7 * DAY);
  const customers = launchEmails.length
    ? await db.user.findMany({
        where: { email: { in: launchEmails } },
        select: {
          email: true,
          name: true,
          customer: {
            select: {
              id: true,
              orders: { where: { status: "PAID" }, orderBy: { createdAt: "desc" }, select: { items: { select: { product: { select: { slug: true } } } } } },
              projects: { orderBy: { createdAt: "desc" }, take: 1, select: { statusToken: true, careSubscriptions: { where: { status: { not: "CANCELED" } }, select: { id: true } } } },
              adSubscriptions: { where: { status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { id: true } },
            },
          },
        },
      })
    : [];
  for (const u of customers) {
    const email = normalizeEmail(u.email);
    const launch = latestLaunch.get(email);
    if (!launch || !u.customer) continue;
    const info = parseJson<{ projectName?: string; statusUrl?: string }>(launch.payloadJson);
    const firstName = u.name?.trim().split(/\s+/)[0] ?? null;
    raws.push({
      kind: "checkin_7d",
      ref: launch.id,
      email,
      name: firstName,
      anchor: launch.createdAt,
      why: `Delivered ${launch.createdAt.toISOString().slice(0, 10)}`,
      payload: { project: info?.projectName ?? null, statusUrl: info?.statusUrl ?? null },
    });
    const orders = u.customer.orders;
    const project = u.customer.projects[0];
    const offers = nextOffers({
      justBought: orders[0]?.items.map((i) => i.product.slug) ?? [],
      owned: orders.flatMap((o) => o.items.map((i) => i.product.slug)),
      hasCarePlan: (project?.careSubscriptions.length ?? 0) > 0,
      hasAdsPlan: u.customer.adSubscriptions.length > 0,
      statusPath: project?.statusToken ? `/status/${project.statusToken}` : null,
    });
    if (offers.length > 0) {
      raws.push({
        kind: "recommend_30d",
        ref: launch.id,
        email,
        name: firstName,
        anchor: launch.createdAt,
        why: `Delivered ${launch.createdAt.toISOString().slice(0, 10)}; ${offers.length} next step${offers.length === 1 ? "" : "s"} fit`,
        payload: { offers: offersText(offers) },
      });
    }
  }

  // ---- who must be held back ----
  const allEmails = [...new Set(raws.map((r) => r.email))];
  const out = await optedOutSet(allEmails);
  const paid = allEmails.length
    ? await db.order.findMany({ where: { status: "PAID", customer: { user: { email: { in: allEmails } } } }, select: { createdAt: true, customer: { select: { user: { select: { email: true } } } } } })
    : [];
  const paidAt = new Map<string, Date[]>();
  for (const o of paid) {
    const e = normalizeEmail(o.customer.user.email);
    paidAt.set(e, [...(paidAt.get(e) ?? []), o.createdAt]);
  }

  const items: FollowupItem[] = [];
  for (const r of raws) {
    if (!isDue(r.kind, r.anchor, now)) continue;
    const purchased = (paidAt.get(r.email) ?? []).some((d) => d > r.anchor);
    const reason = blockedReason({
      kind: r.kind,
      optedOut: out.has(r.email),
      doNotContact: r.doNotContact,
      alreadySent: wasSent(r.email, r.kind, r.ref),
      lastFollowupAt: lastFollowup.get(r.email) ?? null,
      now,
      hasAddress,
      purchased,
      waitingOn: r.waitingOn ?? null,
    });
    const payload = { ...r.payload, name: r.name, kind: r.kind, ref: r.ref };
    items.push({
      id: `${r.kind}:${r.ref}`,
      kind: r.kind,
      label: FOLLOWUP_LABELS[r.kind],
      ref: r.ref,
      email: r.email,
      name: r.name,
      dueAt: dueAt(r.kind, r.anchor),
      why: r.why,
      subject: renderTemplate(r.kind, payload).subject,
      blockedReason: reason,
      payload,
    });
  }
  // Oldest first, and only one item per person per pass, so a person is never sent two at once.
  items.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  return { items, hasAddress };
}

async function deliver(item: FollowupItem): Promise<{ ok: true } | { ok: false; reason: string }> {
  const mail = await sendEmail(item.email, item.kind, { ...item.payload, footer: footerFor(item.email) });
  return mail.ok ? { ok: true } : { ok: false, reason: `The email could not be sent (${mail.error ?? "unknown error"})` };
}

const inFlight = new Set<string>();

/** Sends one follow-up, after checking again that it is still due and allowed. */
export async function sendFollowup(id: string, now = new Date()): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (inFlight.has(id)) return { ok: false, reason: "That one is already being sent." };
  inFlight.add(id);
  try {
    const { items } = await listFollowups(now);
    const item = items.find((i) => i.id === id);
    if (!item) return { ok: false, reason: "That follow-up is no longer due." };
    if (item.blockedReason) return { ok: false, reason: item.blockedReason };
    return await deliver(item);
  } finally {
    inFlight.delete(id);
  }
}

/** Sends every follow-up that is allowed, at most one per person, up to a limit. */
export async function sendAllDue(now = new Date(), limit = 25): Promise<{ sent: number; skipped: number; failures: string[] }> {
  const { items } = await listFollowups(now);
  const seen = new Set<string>();
  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];
  for (const item of items) {
    if (sent >= limit) break;
    if (item.blockedReason || seen.has(item.email)) {
      skipped++;
      continue;
    }
    seen.add(item.email);
    const r = await deliver(item);
    if (r.ok) sent++;
    else failures.push(`${item.email}: ${r.reason}`);
  }
  return { sent, skipped, failures };
}

/** The last few follow-ups that went out, for the admin page. */
export async function recentFollowups(take = 12) {
  return db.emailEvent.findMany({
    where: { template: { in: [...FOLLOWUP_KINDS] } },
    orderBy: { createdAt: "desc" },
    take,
    select: { toEmail: true, template: true, status: true, createdAt: true },
  });
}
