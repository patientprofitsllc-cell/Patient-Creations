import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, SITE_URL } from "@/lib/config/site";
import type { AuditResult } from "@/lib/prospects/audit";

// Message drafts for a person to review and send. They are templates, not AI,
// so they cost nothing and say only what the website check actually observed.
// Nothing here is ever sent automatically.

export const ADDRESS_PLACEHOLDER = "[ADD YOUR MAILING ADDRESS]";

// Most persuasive first. Each returns a phrase that follows "I noticed ...".
const OBSERVATIONS: { key: string; text: (name: string, detail?: string) => string; needsOkFalse?: boolean }[] = [
  { key: "no_website", text: (n) => `I couldn't find a website for ${n}` },
  { key: "unreachable", text: () => "your website wasn't loading properly when I checked" },
  { key: "social_only", text: () => "your website address goes to a social media page rather than a site of your own" },
  { key: "https", text: () => "your site loads without the secure padlock, so browsers show visitors a warning" },
  { key: "viewport", text: () => "your site doesn't seem to be set up for phones, which is where most people will look you up" },
  { key: "tap_to_call", text: () => "there's no tap-to-call button, so people on a phone have to copy your number" },
  { key: "stale_year", text: (_n, d) => `the footer of your site still says ${(d ?? "").replace(/\D/g, "").slice(0, 4) || "an old year"}` },
  { key: "content", text: () => "there's very little text on the page for visitors to read" },
];

/** Up to two plain-language observations, from real findings only. */
export function pickObservations(audit: AuditResult | null, businessName: string, max = 2): string[] {
  if (!audit) return [];
  const out: string[] = [];
  for (const o of OBSERVATIONS) {
    const finding = audit.findings.find((f) => f.key === o.key);
    if (finding && finding.ok === false) out.push(o.text(businessName, finding.detail));
    if (out.length >= max) break;
  }
  return out;
}

export interface OutreachInput {
  businessName: string;
  industrySlug?: string | null;
  audit: AuditResult | null;
}

export interface OutreachDrafts {
  emailSubject: string;
  email: string;
  dm: string;
  followUp1: string;
  followUp2: string;
  observations: string[];
  warnings: string[];
}

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Removes dashes used as punctuation, per the site's copy rules. */
const clean = (text: string) => text.replace(/\s*[—–]\s*/g, ", ");

export function draftOutreach(input: OutreachInput, opts: { priceCents: number; mailingAddress?: string | null }): OutreachDrafts {
  const { businessName, industrySlug, audit } = input;
  const price = money(opts.priceCents);
  const observations = pickObservations(audit, businessName);
  const example = industrySlug ? `${SITE_URL}/websites/${industrySlug}` : `${SITE_URL}/examples`;
  const address = opts.mailingAddress?.trim() || ADDRESS_PLACEHOLDER;
  const warnings: string[] = [];
  if (!opts.mailingAddress?.trim()) warnings.push("Add your business mailing address before sending marketing email. It's required by the CAN-SPAM Act.");
  if (observations.length === 0) warnings.push("The check found nothing specific to mention, so the message is general. Consider looking at the site yourself first.");

  const noticed =
    observations.length === 0
      ? `I came across ${businessName} and wanted to reach out.`
      : `I was looking at ${businessName} online and noticed ${observations.join(", and ")}.`;

  const offer = `We build a professional one-page website for local businesses for ${price}: mobile-friendly, with your services, hours, contact details, and a call or booking button. It includes one revision, and our target is to have it ready in 72 hours once we have your business info. Here's an example for your type of business: ${example}`;
  const optOut = `If you'd rather not hear from us, just reply "no" and we won't contact you again.`;

  const emailSubject = `A quick idea for ${businessName}`;
  const email = clean(
    `Hi there,\n\n${noticed}\n\n${offer}\n\nIf it's useful, reply here or call ${CONTACT_PHONE_DISPLAY} and we'll get you started.\n\nPatient Profits LLC\n${CONTACT_EMAIL}\n${address}\n\n${optOut}`,
  );
  const dm = clean(
    `Hi! ${noticed} We build simple, professional one-page websites for local businesses for ${price}, with a target of 72 hours once we have your info. Example: ${example} Want me to send details? (Reply "no" and I won't message again.)`,
  );
  const followUp1 = clean(
    `Hi again, just following up on my note about a website for ${businessName}. It's ${price}, one page, one revision included. Happy to answer any questions, and you can see an example here: ${example}\n\nPatient Profits LLC, ${CONTACT_EMAIL}\n${optOut}`,
  );
  const followUp2 = clean(
    `Last note from me, I don't want to clutter your inbox. If a website for ${businessName} is ever on your list, we're at ${CONTACT_EMAIL} or ${CONTACT_PHONE_DISPLAY}. Thanks for your time.\n\nPatient Profits LLC\n${optOut}`,
  );

  return { emailSubject, email, dm, followUp1, followUp2, observations, warnings };
}
