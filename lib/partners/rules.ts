import { randomBytes } from "crypto";
import { PARTNER, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { SITE_URL } from "@/lib/config/site";

// The partner program, as rules. Pure (no database, no network), so every condition for earning and for being paid is tested.
//
// The promise to partners is narrow and true: a percent of what a customer they referred pays, on one-time orders, for a
// year after that customer's first paid order; held for a short time in case of a refund; approved only once the whole order
// is paid; paid by hand. No earnings are promised, and no results.

export const PARTNER_TYPES = [
  { key: "marketing-agency", label: "Marketing agency" },
  { key: "web-designer", label: "Web designer" },
  { key: "seo-agency", label: "SEO agency" },
  { key: "social-media-manager", label: "Social media manager" },
  { key: "business-consultant", label: "Business consultant" },
  { key: "photographer", label: "Photographer" },
  { key: "videographer", label: "Videographer" },
  { key: "accountant", label: "Accountant" },
  { key: "local-business-organization", label: "Local business organization" },
  { key: "franchise-consultant", label: "Franchise consultant" },
  { key: "other", label: "Something else" },
] as const;
export type PartnerTypeKey = (typeof PARTNER_TYPES)[number]["key"];
export const isPartnerType = (v: unknown): v is PartnerTypeKey => PARTNER_TYPES.some((t) => t.key === v);
export const partnerTypeLabel = (key: string) => PARTNER_TYPES.find((t) => t.key === key)?.label ?? "Partner";

export type PartnerStatus = "APPLIED" | "ACTIVE" | "PAUSED" | "DECLINED";
export type CommissionState = "PENDING" | "APPROVED" | "PAID" | "REFUNDED" | "REJECTED";

// ---- codes and tokens ----

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1
/** "PC" and six clear characters. Customer referral codes are hex, so a partner code can never be mistaken for one. */
export function newPartnerCode(): string {
  const bytes = randomBytes(6);
  return "PC" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
export const isPartnerCode = (v: unknown): v is string => typeof v === "string" && /^PC[A-HJKMNP-Z2-9]{6}$/.test(v);
export const newPartnerToken = () => randomBytes(24).toString("hex");
export const PARTNER_TOKEN_RE = /^[a-f0-9]{48}$/;

export const partnerLink = (code: string, base = SITE_URL) => `${base.replace(/\/$/, "")}/api/referrals/click?code=${code}`;

// ---- the application ----

export interface ApplicationInput {
  name: string;
  email: string;
  company?: string;
  type: string;
  website?: string;
  about?: string;
  agree: boolean;
}

export function validateApplication(i: Partial<ApplicationInput>): { ok: true; clean: Required<Omit<ApplicationInput, "agree">> & { agree: true } } | { ok: false; error: string } {
  const name = (i.name ?? "").trim();
  const email = (i.email ?? "").trim().toLowerCase();
  const company = (i.company ?? "").trim();
  const about = (i.about ?? "").trim();
  const website = (i.website ?? "").trim();
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { ok: false, error: "Please enter a valid email address." };
  if (!isPartnerType(i.type)) return { ok: false, error: "Please choose the kind of partner you are." };
  if (about.length < 20) return { ok: false, error: "Please tell us a little about how you would send customers our way (a sentence or two)." };
  if (about.length > 600) return { ok: false, error: "Please keep that to 600 characters." };
  if (company.length > 100 || website.length > 200) return { ok: false, error: "That company name or website is too long." };
  if (website && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(website)) return { ok: false, error: "That website address does not look right." };
  if (i.agree !== true) return { ok: false, error: "Please tick the box to agree to the Partner Program Terms." };
  return { ok: true, clean: { name, email, company, type: i.type, website, about, agree: true } };
}

// ---- earning a commission ----

export function partnerCommissionCents(grossCents: number, percent: number): number {
  if (!Number.isFinite(grossCents) || grossCents <= 0) return 0;
  const p = Math.min(100, Math.max(0, percent));
  return Math.round((grossCents * p) / 100);
}

/** The same person under a trivial disguise: case, dots and a plus tag in the part before the @ (which mail providers ignore). */
export function normalizeEmail(email: string): string {
  const [local = "", domain = ""] = email.trim().toLowerCase().split("@");
  const base = local.split("+")[0];
  return `${domain === "gmail.com" || domain === "googlemail.com" ? base.replace(/\./g, "") : base}@${domain === "googlemail.com" ? "gmail.com" : domain}`;
}
export const isSelfReferral = (partnerEmail: string, buyerEmail: string) => normalizeEmail(partnerEmail) === normalizeEmail(buyerEmail);

export interface PurchaseFacts {
  partnerStatus: string;
  partnerEmail: string;
  partnerPercent: number;
  buyerEmail: string;
  /** What counts: the order total less shipping. */
  grossCents: number;
  /** When the buyer's first paid order was paid (this one, if it is their first). */
  firstPaidAt: Date;
  now: Date;
}

export interface CommissionDecision {
  state: "PENDING" | "REJECTED";
  reason: string | null;
  grossCents: number;
  commissionCents: number;
  percent: number;
  pendingUntil: Date | null;
}

const DAY = 86_400_000;

/** Whether a paid order earns its partner a commission, and how much. A rejection says why, so it is visible in the data. */
export function decideCommission(f: PurchaseFacts): CommissionDecision {
  const reject = (reason: string): CommissionDecision => ({ state: "REJECTED", reason, grossCents: 0, commissionCents: 0, percent: f.partnerPercent, pendingUntil: null });
  if (f.partnerStatus !== "ACTIVE") return reject("The partner was not active");
  if (isSelfReferral(f.partnerEmail, f.buyerEmail)) return reject("The partner and the buyer are the same person");
  if (f.now.getTime() - f.firstPaidAt.getTime() > PARTNER.windowDays * DAY) return reject("The customer's first order was more than a year ago");
  if (f.grossCents <= 0) return reject("Nothing was paid");
  return {
    state: "PENDING",
    reason: null,
    grossCents: f.grossCents,
    commissionCents: partnerCommissionCents(f.grossCents, f.partnerPercent),
    percent: f.partnerPercent,
    pendingUntil: new Date(f.now.getTime() + PARTNER.pendingDays * DAY),
  };
}

/**
 * What to do with a pending commission, right now. It is approved only when the hold has passed AND the whole order is paid
 * (a deposit order's commission waits for its final payment). A refunded or cancelled order voids it.
 */
export function approvalDecision(f: { pendingUntil: Date | null; orderStatus: string; balanceDueCents: number; now: Date }): "approve" | "wait" | "void" {
  if (["REFUNDED", "CANCELLED", "FAILED"].includes(f.orderStatus)) return "void";
  if (f.orderStatus !== "PAID") return "wait";
  if (f.balanceDueCents > 0) return "wait";
  if (!f.pendingUntil || f.pendingUntil.getTime() > f.now.getTime()) return "wait";
  return "approve";
}

/** Why a commission is still pending, in words a partner can read. */
export function pendingReason(f: { pendingUntil: Date | null; balanceDueCents: number; now: Date }): string {
  if (f.balanceDueCents > 0) return "Waiting for the customer to finish paying";
  if (f.pendingUntil && f.pendingUntil.getTime() > f.now.getTime()) return `Held until ${f.pendingUntil.toLocaleDateString("en-US", { month: "short", day: "numeric" })} in case of a refund`;
  return "Ready to be approved";
}

export const COMMISSION_LABEL: Record<CommissionState, string> = {
  PENDING: "Pending",
  APPROVED: "Approved, waiting to be paid",
  PAID: "Paid",
  REFUNDED: "Voided (order refunded or cancelled)",
  REJECTED: "Not eligible",
};

/** What a partner may see about a customer they referred: a first name and a plain status, never contact details. */
export function customerStatusLabel(f: { hasPaidOrder: boolean; balanceDueCents: number; projectState: string | null }): string {
  if (!f.hasPaidOrder) return "Signed up, no order yet";
  const s = f.projectState;
  if (!s) return "Ordered";
  if (["DELIVERED", "REVIEW_REQUESTED", "COMPLETED"].includes(s)) return "Delivered";
  if (s === "CANCELLED") return "Cancelled";
  if (["PAID", "INTAKE_REQUIRED", "QUEUED", "DRAFT"].includes(s)) return "Getting started";
  return f.balanceDueCents > 0 ? "In production, final payment still due" : "In production";
}

// ---- the money on a dashboard ----

export interface CommissionTotals {
  pendingCents: number;
  approvedCents: number;
  paidCents: number;
}

export function totalsOf(commissions: { state: string; commissionCents: number }[]): CommissionTotals {
  const sum = (state: string) => commissions.filter((c) => c.state === state).reduce((s, c) => s + c.commissionCents, 0);
  return { pendingCents: sum("PENDING"), approvedCents: sum("APPROVED"), paidCents: sum("PAID") };
}

// ---- marketing assets ----

export interface MarketingAsset {
  id: string;
  title: string;
  where: string;
  text: string;
}

const DISCLOSURE = "Disclosure: I may earn a commission if you buy through this link.";

/**
 * Ready-to-use words for a partner, with their own link in them. Every one carries a disclosure (the FTC expects it), makes no
 * claim about results or earnings, and takes its prices from the price list.
 */
export function partnerAssets(link: string): MarketingAsset[] {
  const site = usd(PRICE_CENTS["starter-website"]);
  return [
    {
      id: "blurb",
      title: "One-line description",
      where: "Your bio, a directory listing, a quick reply",
      text: `Patient Creations builds websites, NFC review cards, ads, and simple automation for small businesses, starting at ${usd(PRICE_CENTS["nfc-cards"])}. ${link}`,
    },
    {
      id: "email",
      title: "A short email to a client",
      where: "An email to someone who needs a website or more customers",
      text: `Subject: A team I would point you to for your website\n\nHi,\n\nYou mentioned wanting a better website. Patient Creations builds a one-page business website from your own words for ${site}, and they can build bigger sites, ads, and lead tools too. They start with a low-cost Growth Audit of your current website, so you see what they would fix before you decide.\n\nHere is my link: ${link}\n\n${DISCLOSURE}\n\nNo pressure either way.`,
    },
    {
      id: "social",
      title: "A social post",
      where: "Facebook, LinkedIn, or Instagram",
      text: `If your business needs a website that works on a phone, a way for happy customers to leave reviews, or help getting started with ads, take a look at Patient Creations. Prices are on their site, and they start with a low-cost audit. ${link}\n\n${DISCLOSURE}`,
    },
    {
      id: "audit",
      title: "Send someone the audit",
      where: "A client who is not sure what they need",
      text: `If you are not sure what your business needs, Patient Creations has a Growth Audit that looks at your website and tells you what they would fix first. The fee comes back as a credit if you order. Start here: ${link}\n\n${DISCLOSURE}`,
    },
  ];
}

export const ASSET_RULES = [
  "Always say you may earn a commission when you share your link. The assets above already do.",
  "Do not promise results (more customers, sales, rankings, reviews) and do not quote earnings. We do not promise them either.",
  "Only share your link with people you have reason to think would benefit. Do not send unsolicited bulk email or text messages.",
  "Do not pretend to be Patient Creations, and do not use our name in a paid ad or a domain name without asking us first.",
];
