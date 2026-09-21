import type { AuditResult } from "@/lib/prospects/audit";
import { AUDIT_FEE_CENTS, PRICE_CENTS, usd } from "@/lib/pricing/catalog";
import { nextOffers } from "@/lib/journey/ladder";
import { CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import type { AuditInput, GrowthAuditReport } from "@/lib/audit/growthAudit";
import type { SiteFacts } from "@/lib/audit/diagnosis";

// The owner's analyst. Right after someone pays for a Growth Audit, this reads what was found on their homepage and
// what they said they want, and tells the owner three things: what they actually need, which product to offer
// first, and what to say. Every "need" carries the evidence it rests on. It never predicts results and never
// pushes a bigger product than the evidence supports: the ladder starts small, and a large build is scoped on a call.

export interface Need {
  id: string;
  need: string;
  evidence: string[];
  severity: "high" | "medium" | "low";
}

export interface OfferPick {
  slug: string;
  title: string;
  price: string;
  why: string;
  href: string;
}

export interface OwnerBriefing {
  generatedAt: string;
  businessName: string;
  confidence: "high" | "medium" | "low";
  confidenceNote: string;
  summary: string;
  needs: Need[];
  primary: OfferPick;
  secondary: OfferPick | null;
  bundle: { title: string; price: string; separately: string } | null;
  avoid: string[];
  talkingPoints: string[];
  objections: { objection: string; answer: string }[];
  nextAction: string;
  suggestedMessage: string;
}

export interface BriefingInput {
  input: Pick<AuditInput, "businessName" | "goal" | "channels" | "industry" | "city"> & { website?: string | null };
  report: GrowthAuditReport;
  site: AuditResult | null;
  facts: SiteFacts | null;
  credit?: { code: string; amountCents: number; days: number } | null;
  now?: Date;
}

const RANK = { high: 0, medium: 1, low: 2 } as const;

const PICKS: Record<string, { title: string; from?: boolean; why: string; href: string }> = {
  "starter-website": { title: "Quick Business Website", why: "A one page site with services, contact details, and a call button, built from their own words.", href: "/checkout?product=starter-website" },
  site: { title: "Cinematic AI Website", from: true, why: "A multi page site with a motion hero, for a business whose current site is bigger than one page.", href: "/checkout?product=site" },
  "nfc-cards": { title: "NFC cards", why: "A tap opens their review page, so it is easy for happy customers to leave honest feedback.", href: "/checkout?product=nfc-cards" },
  "lead-engine": { title: "Lead Engine", from: true, why: "A landing page, lead capture, and automatic follow-up, so visitors have a clear way to reach them.", href: "/checkout?product=lead-engine" },
  "ugc-ad-special": { title: "A launch ad (UGC Ad Special)", why: "A creator style video ad, a low-cost way to get in front of people.", href: "/checkout?product=ugc-ad-special" },
  "strategy-session": { title: "Strategy Session", why: "A live call to map out what to build first, before committing to a build.", href: "/checkout?product=strategy-session" },
};

const pick = (slug: string): OfferPick => {
  const p = PICKS[slug];
  const cents = PRICE_CENTS[slug as keyof typeof PRICE_CENTS];
  return { slug, title: p.title, price: `${p.from ? "from " : ""}${usd(cents)}`, why: p.why, href: p.href };
};

export function buildBriefing(a: BriefingInput): OwnerBriefing {
  const now = a.now ?? new Date();
  const { input, report, site, facts } = a;
  const findings = site?.findings ?? [];
  const issue = (key: string) => findings.some((f) => f.key === key && f.ok === false);
  const reachable = Boolean(site?.reachable);
  const answeredWithError = findings.some((f) => f.key === "unreachable" && f.ok === false);
  const couldNotOpen = Boolean(site) && !reachable && !answeredWithError;
  const problems = findings.filter((f) => f.ok === false).length;
  const judgeable = reachable && !issue("social_only");
  const goal = input.goal;
  const host = (() => {
    try {
      return new URL(site?.finalUrl ?? site?.url ?? "").hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  // ---- what they need, each with its evidence ----
  const needs: Need[] = [];
  const need = (id: string, text: string, evidence: string[], severity: Need["severity"]) => {
    if (evidence.length > 0) needs.push({ id, need: text, evidence, severity });
  };

  need("no-site", "A website of their own", [
    ...(!input.website ? ["They gave no website address"] : []),
    ...(answeredWithError ? ["The address they gave answered with an error"] : []),
    ...(issue("social_only") ? [`Their website is a social media page (${host})`] : []),
  ], "high");

  if (judgeable) {
    need("mobile", "A site that works on a phone", issue("viewport") ? ["The page has no mobile layout setting"] : [], "high");
    need("secure", "A secure (https) site", issue("https") ? ["The page does not load securely, so browsers warn visitors"] : [], "medium");
    need("basics", "The basics search engines read", [...(issue("title") ? ["No page title"] : []), ...(issue("description") ? ["No search description"] : [])], "medium");
    if (facts) {
      const noWayToReach = !facts.phone && facts.forms === 0 && !facts.email;
      need("contact", "An obvious way to reach them", [
        ...(!facts.phone ? ["No phone number found on the page"] : []),
        ...(facts.phone && issue("tap_to_call") ? ["The phone number is not tap-to-call"] : []),
        ...(noWayToReach ? ["No phone, no email, and no contact form found"] : []),
      ], !facts.phone ? "high" : "medium");
      need("cta", "A clear next step on the page", facts.ctaExamples.length === 0 && facts.forms === 0 && !facts.bookingWidget ? ["No book, call, quote, or order buttons, no form, and no booking tool found"] : [], "high");
      need("thin", "Real content on the page", facts.words < 150 ? [`Only about ${facts.words} words of readable text`] : [], "medium");
      need("reviews", "A path for customers to leave reviews", !facts.reviewLink && !facts.testimonialsMention ? ["No link to a review page and no testimonials found"] : [], goal === "reviews" ? "high" : "medium");
      need("social", "Social media linked from the site", facts.social.length === 0 ? ["No social media links found"] : [], goal === "customers" ? "medium" : "low");
      need("measure", "A way to see where visitors come from", facts.analytics.length === 0 ? ["No analytics or ad pixel found"] : [], "low");
      need("stale", "A site that looks maintained", facts.copyrightYear !== null && now.getFullYear() - facts.copyrightYear >= 3 ? [`The footer year says ${facts.copyrightYear}`] : [], "medium");
      need("images", "Descriptions on images", facts.images >= 4 && facts.imagesMissingAlt / facts.images > 0.5 ? [`${facts.imagesMissingAlt} of ${facts.images} images have no description`] : [], "low");
      need("weight", "A lighter page", facts.bytes > 400_000 ? [`${Math.round(facts.bytes / 1024)} KB of HTML on the homepage`] : [], "low");
    }
  }
  if (goal === "reviews" && !input.channels.includes("Google Business Profile") && !needs.some((n) => n.id === "reviews")) {
    need("reviews", "A path for customers to leave reviews", ["They told us reviews are their goal and they did not list a Google Business Profile"], "high");
  }
  if (goal === "automate") need("automation", "Automation, scoped first", ["They told us automation is their goal"], "medium");
  needs.sort((x, y) => RANK[x.severity] - RANK[y.severity]);

  // ---- which product to offer first ----
  const has = (id: string) => needs.some((n) => n.id === id);
  const complex = Boolean(facts && (facts.navLinks >= 8 || facts.words > 1200));
  const rebuild = has("no-site") || has("mobile") || has("secure") || problems >= 3 || (has("thin") && has("contact"));
  let primary: OfferPick;
  if (rebuild) primary = pick(complex && judgeable ? "site" : "starter-website");
  else if (goal === "reviews" || has("reviews")) primary = pick("nfc-cards");
  else if (goal === "customers" && (has("cta") || has("contact"))) primary = pick("lead-engine");
  else if (goal === "customers") primary = pick("ugc-ad-special");
  else primary = pick("strategy-session");
  if (goal === "automate") primary = pick("strategy-session");

  const secondarySlug = nextOffers({ justBought: [primary.slug], owned: [primary.slug], statusPath: null })[0];
  const secondary = secondarySlug ? (PICKS[secondarySlug.href.replace("/checkout?product=", "")] ? pick(secondarySlug.href.replace("/checkout?product=", "")) : null) : null;

  const partsCents = PRICE_CENTS["starter-website"] + 2 * PRICE_CENTS["cinematic-ad-special"] + 2 * PRICE_CENTS["ugc-ad-special"] + 3 * PRICE_CENTS["nfc-cards"];
  const bundle = report.bundle ? { title: report.bundle.title, price: report.bundle.price, separately: usd(partsCents) } : null;

  const avoid: string[] = [];
  if (primary.slug !== "strategy-session") avoid.push("Do not lead with AI Software or the Multi Agent System. Nothing found points at a need for them, and a large build is scoped on a call, not pitched first.");
  if (judgeable && !rebuild) avoid.push("Do not sell a new website. Their homepage passed the basic checks.");
  if (goal === "reviews" || primary.slug === "nfc-cards") avoid.push("Do not promise reviews or ratings. The card makes leaving one easier; it does not raise ratings.");
  avoid.push("Do not quote results (leads, rankings, sales). We can see their page, not their traffic or income.");

  // ---- confidence ----
  let confidence: OwnerBriefing["confidence"] = "medium";
  let confidenceNote = "Based on what they told us; their homepage was not read.";
  if (reachable && facts && findings.length >= 6) {
    confidence = "high";
    confidenceNote = `Based on their homepage (${host || "read today"}) and what they told us.`;
  } else if (couldNotOpen) {
    confidence = "low";
    confidenceNote = "We could not open their address, so this rests only on what they told us. Look at the site yourself before the call.";
  } else if (!input.website) {
    confidenceNote = "They have no website, which is what they told us. The rest rests on their answers.";
  }

  // ---- what to say ----
  const net = Math.max(0, PRICE_CENTS[primary.slug as keyof typeof PRICE_CENTS] - AUDIT_FEE_CENTS);
  const top = needs.slice(0, 3);
  const talkingPoints = [
    ...top.map((n) => `${n.need}: ${n.evidence.join("; ")}.`),
    ...(a.credit ? [`Their audit fee comes back as a ${usd(a.credit.amountCents)} credit (code ${a.credit.code}, ${a.credit.days} days), so ${primary.title} would be about ${usd(net)} after it.`] : []),
  ];
  const objections = [
    ...(reachable ? [{ objection: "I already have a website.", answer: `They do, and it works in the basics. ${top[0] ? `The gap is ${top[0].need.toLowerCase()}: ${top[0].evidence[0].toLowerCase()}.` : "The audit shows where it could do more."}` }] : []),
    { objection: "That is more than I wanted to spend.", answer: `Their audit fee is already a credit. ${primary.title} is ${primary.price} before it${a.credit ? ` and about ${usd(net)} after` : ""}. If that is still too much, the smallest step is ${usd(PRICE_CENTS["nfc-cards"])} for an NFC card.` },
    { objection: "Can you guarantee this will get me customers?", answer: "No, and nobody honestly can. We can make it easier for people to call, book, or leave a review. What that earns depends on their offer and their market." },
    { objection: "I will do it myself.", answer: "Fair. The audit lists exactly what to fix either way. If they would rather have it built, that is what the credit is for." },
    { objection: "I need to think about it.", answer: `That is fine. Their credit lasts ${a.credit?.days ?? 30} days. Offer a short call or a Strategy Session (${usd(PRICE_CENTS["strategy-session"])}) to talk it through.` },
  ];

  const first = top[0];
  const message = [
    `Hi ${input.businessName},`,
    "",
    `Thanks for ordering the Growth Audit. ${reachable ? "I read your homepage" : "I went through what you told us"}${first ? `, and the biggest thing I noticed: ${first.evidence[0].charAt(0).toLowerCase()}${first.evidence[0].slice(1)}.` : ", and nothing on the basics stood out."}`,
    ...(top[1] ? ["", `Also: ${top[1].evidence[0].charAt(0).toLowerCase()}${top[1].evidence[0].slice(1)}.`] : []),
    "",
    `What I would start with is ${primary.title} (${primary.price}). ${primary.why}${a.credit ? ` Your audit fee comes back as a ${usd(a.credit.amountCents)} credit (code ${a.credit.code}), so it would be about ${usd(net)}.` : ""}`,
    "",
    `Want me to set that up, or would a quick call help first? Reply here or call ${CONTACT_PHONE_DISPLAY}.`,
    "",
    "Patient Profits LLC",
  ].join("\n");

  const high = needs.filter((n) => n.severity === "high").length;
  const summary = `${needs.length} need${needs.length === 1 ? "" : "s"} found (${high} high). Offer ${primary.title} first${secondary ? `, then ${secondary.title}` : ""}. Confidence: ${confidence}.`;

  return {
    generatedAt: now.toISOString(),
    businessName: input.businessName,
    confidence,
    confidenceNote,
    summary,
    needs,
    primary,
    secondary,
    bundle,
    avoid,
    talkingPoints,
    objections,
    nextAction: confidence === "low" ? "Open their website yourself, then call or email today while the audit is fresh." : primary.slug === "strategy-session" ? "Offer a short call or a Strategy Session, and ask what they want to grow." : `Send the drafted message, then follow with a call. Lead with ${primary.title}.`,
    suggestedMessage: message,
  };
}
