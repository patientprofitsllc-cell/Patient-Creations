import type { AuditResult } from "@/lib/prospects/audit";
import { PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { businessDays } from "@/lib/payments/deliveryWindow";

// The Free Growth Audit. Every line in the report belongs to exactly one of three kinds, and says which:
//
//   OBSERVED     something read directly from the public homepage today, or something the visitor told us.
//   RECOMMENDED  what we suggest, with the observed facts or answers it is based on.
//   ESTIMATED    our own prices and delivery targets for what we recommend. Never a prediction of traffic,
//                rankings, leads, or sales. We cannot see those, so we never guess at them.
//
// Pure: no network and no database, so every rule is tested directly.

export const AUDIT_GOALS = [
  { value: "website", label: "Get a website" },
  { value: "customers", label: "Get more customers" },
  { value: "reviews", label: "Get more reviews" },
  { value: "automate", label: "Automate my business" },
] as const;
export type AuditGoal = (typeof AUDIT_GOALS)[number]["value"];

export const AUDIT_CHANNELS = ["Google Business Profile", "Facebook or Instagram", "TikTok", "Paid ads", "Email or text", "Word of mouth and referrals", "None yet"] as const;
export type AuditChannel = (typeof AUDIT_CHANNELS)[number];

export interface AuditInput {
  businessName: string;
  website?: string | null;
  industry?: string | null;
  city?: string | null;
  email: string;
  phone?: string | null;
  goal: AuditGoal;
  channels: AuditChannel[];
}

/** What a product costs and how long it takes, read from the live catalog by the caller. */
export interface ProductFacts {
  slug: string;
  name: string;
  priceCents: number;
  turnaround: string | null;
}

export interface ObservedItem {
  label: string;
  status: "good" | "issue" | "unknown";
  detail?: string;
  source: "your website" | "you told us";
}

export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  why: string;
  /** The observed facts or answers this suggestion rests on. */
  basedOn: string[];
  href: string;
}

export interface EstimateItem {
  title: string;
  price: string;
  timing: string | null;
}

export interface GrowthAuditReport {
  generatedAt: string;
  businessName: string;
  observed: { website: { checked: boolean; address: string | null; reachable: boolean; note?: string }; items: ObservedItem[] };
  recommended: Recommendation[];
  estimated: EstimateItem[];
  bundle: { title: string; price: string; separately: string; saving: string } | null;
  notes: string[];
}

export const AUDIT_DEFINITIONS = {
  observed: "Read directly from your public homepage today, or something you told us.",
  recommended: "What we suggest, and the facts or answers each suggestion is based on.",
  estimated: "Our own prices and delivery targets for what we recommend. These are not predictions of traffic, rankings, leads, or sales; we cannot see those.",
} as const;

const has = (input: AuditInput, c: AuditChannel) => input.channels.includes(c);

const SOCIAL_OR_ADS: AuditChannel[] = ["Facebook or Instagram", "TikTok", "Paid ads"];

export function buildGrowthAudit(input: AuditInput, site: AuditResult | null, facts: Record<string, ProductFacts>, now = new Date()): GrowthAuditReport {
  const items: ObservedItem[] = [];
  const told = (label: string, detail?: string) => items.push({ label, status: "unknown", detail, source: "you told us" });

  // ---- observed ----
  const findings = site?.findings ?? [];
  const reachable = Boolean(site?.reachable);
  for (const f of findings) {
    if (f.key === "no_website") continue;
    items.push({ label: f.label, status: f.ok === true ? "good" : f.ok === false ? "issue" : "unknown", detail: f.detail, source: "your website" });
  }
  const issue = (key: string) => findings.some((f) => f.key === key && f.ok === false);
  const problems = findings.filter((f) => f.ok === false).length;
  // An address that answered with an error is a real problem. An address we simply could not open (a timeout, a
  // certificate we could not verify, a blocked address) is unknown: it may be fine, so we do not judge it.
  const answeredWithError = findings.some((f) => f.key === "unreachable" && f.ok === false);
  const couldNotOpen = Boolean(site) && !reachable && !answeredWithError;
  const noSite = !site || !reachable || issue("social_only");
  const judgeable = reachable && !issue("social_only");
  const website = {
    checked: Boolean(site),
    address: site?.finalUrl ?? site?.url ?? null,
    reachable,
    note: !input.website
      ? "You did not give a website address, so there was nothing to check."
      : couldNotOpen
        ? "We could not open that address from our side, so we did not judge your site. If it works for you, this is on our end."
        : !reachable
          ? (site?.error ?? "The address did not load.")
          : undefined,
  };

  told("Your goal", AUDIT_GOALS.find((g) => g.value === input.goal)?.label);
  told("Where customers find you today", input.channels.length ? input.channels.join(", ") : "Not answered");
  if (input.industry) told("Your industry", input.industry);
  if (input.city) told("Your location", input.city);

  // ---- recommended ----
  const recs: Recommendation[] = [];
  const add = (slug: string, id: string, why: string, basedOn: string[], href: string, title?: string) => {
    if (recs.some((r) => r.id === id) || basedOn.length === 0) return;
    recs.push({ id, slug, title: title ?? facts[slug]?.name ?? slug, why, basedOn, href });
  };
  const checkout = (slug: string) => `/checkout?product=${slug}`;

  // 1. A website of your own
  const websiteWhy: string[] = [];
  if (!input.website) websiteWhy.push("You did not give a website address");
  else if (answeredWithError) websiteWhy.push("The address you gave answered with an error");
  if (issue("social_only")) websiteWhy.push("Your website address is a social media page");
  if (reachable && !issue("social_only")) {
    if (issue("viewport")) websiteWhy.push("The page has no mobile layout setting");
    if (issue("https")) websiteWhy.push("The page does not load securely");
    if (problems >= 3) websiteWhy.push(`${problems} basics on the page need attention`);
  }
  add("starter-website", "website", "A one page site with your services, contact details, and a call button, built from your own words.", websiteWhy, checkout("starter-website"));

  // 2. Reviews
  const reviewWhy: string[] = [];
  if (input.goal === "reviews") reviewWhy.push("You told us reviews are your goal");
  if (!has(input, "Google Business Profile")) reviewWhy.push("You did not list a Google Business Profile");
  add("nfc-cards", "reviews", "A card that opens your review page with one tap, so it is easy for happy customers to leave honest feedback. It does not raise ratings by itself, and we never write or buy reviews.", reviewWhy, checkout("nfc-cards"));

  // 3. Attention
  const attentionWhy: string[] = [];
  const noAttentionChannel = !SOCIAL_OR_ADS.some((c) => has(input, c));
  if (noAttentionChannel) attentionWhy.push("You did not list social media or paid ads as a way customers find you");
  if (input.goal === "customers") attentionWhy.push("You told us more customers is your goal");
  add("ugc-ad-special", "launch-ad", "A creator style video ad, a low-cost way to get something in front of people. Monthly Ads keeps fresh ads coming.", attentionWhy, checkout("ugc-ad-special"), "A launch ad");

  // 4. Capturing customers
  const captureWhy: string[] = [];
  if (input.goal === "customers" && judgeable) captureWhy.push("You told us more customers is your goal, and you have a website to send them to");
  if (judgeable && issue("phone")) captureWhy.push("No phone number was found on your page");
  else if (judgeable && issue("tap_to_call")) captureWhy.push("Your phone number is not tap-to-call");
  add("lead-engine", "leads", "A landing page, lead capture, and automatic follow-up, so people who show interest are not left waiting.", captureWhy, checkout("lead-engine"));

  // 5. Automation starts with a conversation
  const automateWhy: string[] = [];
  if (input.goal === "automate") automateWhy.push("You told us automation is your goal");
  add("strategy-session", "automate", "Automation projects start with a live call, so we scope the right thing before you commit to a build.", automateWhy, checkout("strategy-session"));

  if (recs.length === 0) {
    add("strategy-session", "talk", "Nothing on the basics stood out, so the best next step is a conversation about what you want to grow.", ["Nothing you told us or that we observed pointed to a clear gap"], checkout("strategy-session"));
  }
  const recommended = recs.slice(0, 4);

  // ---- estimated ----
  const estimated: EstimateItem[] = recommended.map((r) => {
    const f = facts[r.slug];
    const timing = f?.turnaround ? (/minute|call/i.test(f.turnaround) ? f.turnaround : businessDays(f.turnaround)) : null;
    return { title: r.title, price: f ? usd(f.priceCents) : usd(PRICE_CENTS[r.slug as keyof typeof PRICE_CENTS] ?? 0), timing };
  });

  // ---- the bundle, only when it really covers what was recommended ----
  const coveredByBundle = ["website", "reviews", "launch-ad"].filter((id) => recommended.some((r) => r.id === id));
  let bundle: GrowthAuditReport["bundle"] = null;
  if (coveredByBundle.length >= 2) {
    const separately = PRICE_CENTS["starter-website"] + 2 * PRICE_CENTS["cinematic-ad-special"] + 2 * PRICE_CENTS["ugc-ad-special"] + 3 * PRICE_CENTS["nfc-cards"];
    bundle = {
      title: "All-in-One Launch Bundle",
      price: usd(PRICE_CENTS["all-in-one-bundle"]),
      separately: usd(separately),
      saving: usd(separately - PRICE_CENTS["all-in-one-bundle"]),
    };
  }

  return {
    generatedAt: now.toISOString(),
    businessName: input.businessName,
    observed: { website, items },
    recommended,
    estimated,
    bundle,
    notes: [
      "This audit looks only at your public homepage and what you told us. We cannot see your traffic, search rankings, ad results, or sales, so we do not comment on them.",
      "Prices and delivery times are the ones shown at checkout today.",
    ],
  };
}

/** The report as plain text, for the email. */
export function auditReportText(r: GrowthAuditReport): string {
  const lines: string[] = [`Growth Audit for ${r.businessName}`, ""];
  lines.push("OBSERVED (" + AUDIT_DEFINITIONS.observed + ")");
  if (r.observed.website.note) lines.push(`- Website: ${r.observed.website.note}`);
  for (const i of r.observed.items) lines.push(`- ${i.label}${i.detail ? `: ${i.detail}` : ""}${i.status === "issue" ? " (needs attention)" : i.status === "good" ? " (fine)" : ""} [${i.source}]`);
  lines.push("", "RECOMMENDED (" + AUDIT_DEFINITIONS.recommended + ")");
  for (const rec of r.recommended) lines.push(`- ${rec.title}: ${rec.why} Based on: ${rec.basedOn.join("; ")}.`);
  lines.push("", "ESTIMATED (" + AUDIT_DEFINITIONS.estimated + ")");
  r.estimated.forEach((e) => lines.push(`- ${e.title}: ${e.price}${e.timing ? `, delivery target ${e.timing}` : ""}`));
  if (r.bundle) lines.push(`- ${r.bundle.title}: ${r.bundle.price} (buying the same items one by one is ${r.bundle.separately}, so the bundle saves ${r.bundle.saving})`);
  lines.push("", ...r.notes);
  return lines.join("\n");
}
