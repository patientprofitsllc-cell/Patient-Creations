import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { sendEmail } from "@/lib/email/provider";
import { CONTACT_EMAIL, CONTACT_PHONE_DIGITS } from "@/lib/config/site";

export type OrderAlertKind = "awaiting_payment" | "paid";

export interface OrderAlertFacts {
  kind: OrderAlertKind;
  totalCents: number;
  productNames: string[];
  businessName?: string | null;
  paymentMethod: string;
  source?: string | null;
  returnVisitorOffer: boolean;
  adminUrl: string;
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

// Text messages cost per segment, and any non-ASCII character makes each
// segment much shorter, so the text is plain ASCII and one line.
const ascii = (s: string, max: number) =>
  s
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const METHOD_LABEL: Record<string, string> = { stripe: "Card", zelle: "Zelle", apple_pay: "Apple Pay" };

/** The words of the alert, for a text message and for an email. Pure, so it is tested directly. */
export function buildOrderAlert(f: OrderAlertFacts) {
  const what = ascii(f.productNames.join(" + "), 70) || "Order";
  const who = f.businessName ? ` (${ascii(f.businessName, 30)})` : "";
  const how = METHOD_LABEL[f.paymentMethod] ?? ascii(f.paymentMethod, 20);
  const head = f.kind === "paid" ? "NEW PAID ORDER" : "NEW ORDER, awaiting payment";
  const extra = [f.returnVisitorOffer ? "5% return offer used" : "", f.source ? `from ${ascii(f.source, 30)}` : ""].filter(Boolean).join(", ");

  const sms = `Patient Creations: ${head} ${money(f.totalCents)} ${what}${who}. ${how}${extra ? `, ${extra}` : ""}. ${f.adminUrl}`;
  const subject = `${head}: ${money(f.totalCents)} ${what}`;
  const details = [
    `Total: ${money(f.totalCents)}`,
    `Items: ${f.productNames.join(", ") || "n/a"}`,
    f.businessName ? `Business: ${f.businessName}` : "",
    `Payment: ${how}${f.kind === "awaiting_payment" ? " (not confirmed yet; confirm it in the admin dashboard once the money arrives)" : ""}`,
    f.source ? `Source: ${f.source}` : "",
    f.returnVisitorOffer ? `The 5% return-visitor offer was used on this order.` : "",
  ].filter(Boolean);
  const body = `${head}\n\n${details.join("\n")}\n\nOpen the dashboard: ${f.adminUrl}`;
  return { sms, subject, body };
}

export interface SmsConfig {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
}

/** Text alerts need a Twilio account. Without all four values, they are simply off. */
export function smsConfig(env: NodeJS.ProcessEnv = process.env): SmsConfig | null {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  const from = env.TWILIO_FROM_NUMBER?.trim();
  const to = (env.OWNER_ALERT_PHONE?.trim() || CONTACT_PHONE_DIGITS).trim();
  if (!accountSid || !authToken || !from || !/^\+\d{10,15}$/.test(to) || !/^\+\d{10,15}$/.test(from)) return null;
  return { accountSid, authToken, from, to };
}

export async function sendSms(cfg: SmsConfig, text: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetchImpl(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(cfg.accountSid)}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: cfg.to, From: cfg.from, Body: text }).toString(),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as { message?: string } | null;
      return { ok: false, error: `Twilio answered ${res.status}${detail?.message ? `: ${detail.message}` : ""}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Addresses under these are reserved for testing; nothing real ever uses them. */
const isTestAddress = (email: string) => /@example\.(com|org|net)$/i.test(email) || /\.test$/i.test(email);

const SMS_PER_HOUR_CAP = 10;

/**
 * Tells the owner about an order, by text when a Twilio account is set up and
 * always by email, plus a note in the admin dashboard. It never throws and never
 * holds up the customer's order: any failure is recorded and the order goes on.
 */
export async function notifyOwnerOfOrder(orderId: string, kind: OrderAlertKind) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, websiteIntake: true, customer: { include: { user: true } } },
    });
    if (!order || isTestAddress(order.customer.user.email)) return;

    const base = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
    const alert = buildOrderAlert({
      kind,
      totalCents: order.totalCents,
      productNames: order.items.map((i) => (i.quantity > 1 ? `${i.product.name} x${i.quantity}` : i.product.name)),
      businessName: order.websiteIntake?.businessName,
      paymentMethod: order.paymentMethod,
      source: order.campaignSource,
      returnVisitorOffer: order.couponCode === "COMEBACK5",
      adminUrl: `${base}/admin/dashboard`,
    });

    const result: Record<string, string> = {};

    const cfg = smsConfig();
    if (!cfg) {
      result.sms = "not_configured";
    } else {
      const recent = await db.auditLog.count({ where: { event: "alert.owner_order", createdAt: { gt: new Date(Date.now() - 3_600_000) } } });
      if (recent >= SMS_PER_HOUR_CAP) result.sms = "skipped_hourly_cap";
      else {
        const sent = await sendSms(cfg, alert.sms);
        result.sms = sent.ok ? "sent" : `failed: ${sent.error}`;
      }
    }

    const to = process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL;
    const mail = await sendEmail(to, "owner_new_order", { subject: alert.subject, body: alert.body });
    result.email = mail.ok ? "sent" : `failed: ${mail.error}`;

    await db.notification.create({ data: { audience: "admin", title: alert.subject, body: alert.sms.replace("Patient Creations: ", "") } });
    await logEvent("alert.owner_order", "Order", orderId, { kind, ...result });
  } catch (err) {
    console.error("owner order alert failed", err);
  }
}

/** The words of the alert when someone starts a Monthly Ads plan. Pure, so it is tested directly. */
export function buildAdPlanAlert(f: { planName: string; priceCents: number; businessName: string; adminUrl: string }) {
  const what = ascii(f.planName, 40) || "Monthly Ads plan";
  const who = ascii(f.businessName, 30);
  const sms = `Patient Creations: NEW MONTHLY ADS PLAN ${what} ${money(f.priceCents)}/mo${who ? ` (${who})` : ""}. ${f.adminUrl}`;
  const subject = `NEW MONTHLY ADS PLAN: ${what} ${money(f.priceCents)}/mo`;
  const body = `NEW MONTHLY ADS PLAN\n\nPlan: ${f.planName}\nPrice: ${money(f.priceCents)} a month\nBusiness: ${f.businessName}\n\nThey will fill in their first brief on their plan page. Open the dashboard: ${f.adminUrl}`;
  return { sms, subject, body };
}

/** Tells the owner a Monthly Ads plan just started. Same channels and safety rules as order alerts. */
export async function notifyOwnerOfAdPlan(adSubscriptionId: string) {
  try {
    const sub = await db.adSubscription.findUnique({ where: { id: adSubscriptionId }, include: { customer: { include: { user: true } } } });
    if (!sub || isTestAddress(sub.customer.user.email)) return;
    const { getAdPlan } = await import("@/lib/ads/plans");
    const base = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
    const alert = buildAdPlanAlert({ planName: getAdPlan(sub.planSlug)?.name ?? sub.planSlug, priceCents: sub.priceCents, businessName: sub.businessName, adminUrl: `${base}/admin/ads` });

    const result: Record<string, string> = {};
    const cfg = smsConfig();
    if (!cfg) {
      result.sms = "not_configured";
    } else {
      const recent = await db.auditLog.count({ where: { event: { in: ["alert.owner_order", "alert.owner_ads"] }, createdAt: { gt: new Date(Date.now() - 3_600_000) } } });
      if (recent >= SMS_PER_HOUR_CAP) result.sms = "skipped_hourly_cap";
      else {
        const sent = await sendSms(cfg, alert.sms);
        result.sms = sent.ok ? "sent" : `failed: ${sent.error}`;
      }
    }
    const to = process.env.OWNER_ALERT_EMAIL?.trim() || CONTACT_EMAIL;
    const mail = await sendEmail(to, "owner_new_order", { subject: alert.subject, body: alert.body });
    result.email = mail.ok ? "sent" : `failed: ${mail.error}`;
    await logEvent("alert.owner_ads", "AdSubscription", adSubscriptionId, result);
  } catch (err) {
    console.error("owner ad plan alert failed", err);
  }
}
