import { auditHtml, type AuditResult } from "@/lib/prospects/audit";
import { normalizeWebUrl, safeFetchHtml } from "@/lib/prospects/net";

// What the owner's analyst reads on a customer's homepage. Every fact here is something found in the page's own HTML
// (a tag, a link, a phrase), never a judgment of taste and never a guess about traffic. The analyst's advice in
// lib/audit/briefing.ts is built only from these facts, so every line of it can point at the evidence.

export interface SiteFacts {
  words: number;
  title: string | null;
  h1: string | null;
  navLinks: number;
  ctaExamples: string[];
  forms: number;
  phone: string | null;
  email: string | null;
  hasAddress: boolean;
  hasMap: boolean;
  social: string[];
  reviewLink: boolean;
  testimonialsMention: boolean;
  pricingMentioned: boolean;
  images: number;
  imagesMissingAlt: number;
  platform: string | null;
  analytics: string[];
  bookingWidget: string | null;
  hasVideo: boolean;
  copyrightYear: number | null;
  structuredData: boolean;
  bytes: number;
}

const CTA = /\b(book( now| online| a)?|call( us| now| today)?|schedule|get (a )?(free )?(quote|estimate)|request (a )?(quote|estimate)|contact us|order( now| online)?|buy now|shop now|reserve|make an appointment|appointment|sign up|get started)\b/i;
const SOCIAL = /(facebook|instagram|tiktok|youtube|linkedin|x|twitter|pinterest|yelp|nextdoor)\.com/gi;
const BOOKING: [string, RegExp][] = [
  ["Calendly", /calendly\.com/i],
  ["Acuity", /acuityscheduling\.com|squarespacescheduling\.com/i],
  ["Square Appointments", /squareup\.com\/appointments|square\.site/i],
  ["Booksy", /booksy\.com/i],
  ["Vagaro", /vagaro\.com/i],
  ["StyleSeat", /styleseat\.com/i],
  ["OpenTable", /opentable\.com/i],
  ["Resy", /resy\.com/i],
  ["Setmore", /setmore\.com/i],
  ["Jobber", /getjobber\.com|clienthub/i],
];
const PLATFORMS: [string, RegExp][] = [
  ["WordPress", /wp-content|wp-includes|<meta[^>]+generator[^>]+wordpress/i],
  ["Wix", /wixstatic\.com|<meta[^>]+generator[^>]+wix/i],
  ["Squarespace", /squarespace\.com|static1\.squarespace|<meta[^>]+generator[^>]+squarespace/i],
  ["Shopify", /cdn\.shopify\.com|shopify\.com\/s\//i],
  ["GoDaddy", /godaddy\.com|websitebuilder\.godaddy|img1\.wsimg\.com/i],
  ["Weebly", /weebly\.com|editmysite\.com/i],
  ["Webflow", /webflow\.com|<meta[^>]+generator[^>]+webflow/i],
];

const textOf = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Reads the extra facts out of a page's HTML. Pure: no network, so it is tested with sample pages. */
export function extractSiteFacts(html: string, bytes = html.length): SiteFacts {
  const text = textOf(html);
  const clean = (s: string | undefined) => (s ? s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140) : null) || null;
  const title = clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]);
  const h1 = clean(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]);

  const anchors = [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => clean(m[2]) ?? "");
  const ctaExamples = [...new Set(anchors.filter((t) => t.length > 1 && t.length <= 40 && CTA.test(t)))].slice(0, 5);
  const navBlock = /<nav\b[\s\S]*?<\/nav>/i.exec(html)?.[0] ?? "";
  const navLinks = (navBlock.match(/<a\b/gi) ?? []).length;

  const tel = /href=["']tel:([+\d\s().-]{7,})["']/i.exec(html)?.[1]?.trim() ?? null;
  const phoneText = /(\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b)/.exec(text)?.[1] ?? null;
  const email = /href=["']mailto:([^"'?\s]+)/i.exec(html)?.[1] ?? /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,})/i.exec(text)?.[1] ?? null;

  const social = [...new Set([...html.matchAll(SOCIAL)].map((m) => m[0].toLowerCase()).filter((h) => !/^x\.com$/.test(h) || true))];
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const yearMatches = [...html.matchAll(/(?:&copy;|©|copyright)\s*(?:<[^>]+>\s*)*(20\d{2})/gi)].map((m) => Number(m[1]));

  const analytics: string[] = [];
  if (/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(html)) analytics.push("Google Tag Manager");
  if (/google-analytics\.com|gtag\(|googletagmanager\.com\/gtag|G-[A-Z0-9]{6,}/i.test(html)) analytics.push("Google Analytics");
  if (/connect\.facebook\.net|fbq\(/i.test(html)) analytics.push("Meta Pixel");

  return {
    words: text ? text.split(/\s+/).length : 0,
    title,
    h1,
    navLinks,
    ctaExamples,
    forms: (html.match(/<form\b/gi) ?? []).length,
    phone: tel ?? phoneText,
    email,
    hasAddress: /\b\d{1,5}\s+[A-Z][A-Za-z0-9.\s]{2,30}\s(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Hwy|Highway)\b\.?,?\s+[A-Z][a-z]+/.test(text),
    hasMap: /google\.com\/maps|maps\.googleapis|<iframe[^>]+maps/i.test(html),
    social,
    reviewLink: /g\.page|google\.com\/maps\/[^"']*review|search\.google\.com\/local\/writereview|yelp\.com\/biz|g\.co\/kgs/i.test(html),
    testimonialsMention: /testimonial|what our (customers|clients) say|customer reviews|5[- ]star/i.test(text),
    pricingMentioned: /\$\s?\d{2,}|pricing|our prices|rates\b/i.test(text),
    images: imgs.length,
    imagesMissingAlt: imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length,
    platform: PLATFORMS.find(([, re]) => re.test(html))?.[0] ?? null,
    analytics,
    bookingWidget: BOOKING.find(([, re]) => re.test(html))?.[0] ?? null,
    hasVideo: /<video\b|youtube\.com\/embed|player\.vimeo\.com/i.test(html),
    copyrightYear: yearMatches.length ? Math.max(...yearMatches) : null,
    structuredData: /application\/ld\+json/i.test(html),
    bytes,
  };
}

/**
 * Reads the visitor's homepage once and returns both the checks the customer sees and the deeper facts the owner
 * sees. Uses the same safe fetch as everything else (public addresses only, 8 seconds, 600 KB). Never throws.
 */
export async function readSite(website: string | null | undefined, now = new Date()): Promise<{ site: AuditResult | null; facts: SiteFacts | null }> {
  const url = normalizeWebUrl(website);
  if (!website) return { site: null, facts: null };
  const done = (partial: Omit<AuditResult, "problems" | "checkedAt">): AuditResult => ({ ...partial, checkedAt: now.toISOString(), problems: partial.findings.filter((f) => f.ok === false).length });
  if (!url) return { site: done({ url: null, reachable: false, findings: [{ key: "no_website", label: "No website address on file", ok: false, detail: "There is no website to check" }] }), facts: null };
  try {
    const page = await safeFetchHtml(url.toString());
    if (page.status >= 400 || !page.html) {
      return {
        site: done({ url: url.toString(), finalUrl: page.finalUrl, reachable: false, error: page.status >= 400 ? `The site returned status ${page.status}` : "The page was not a normal web page", findings: [{ key: "unreachable", label: "The website didn't load properly", ok: false, detail: page.status >= 400 ? `Status ${page.status}` : undefined }] }),
        facts: null,
      };
    }
    return { site: done({ url: url.toString(), finalUrl: page.finalUrl, reachable: true, findings: auditHtml(page.html, page.finalUrl, page.bytes, now) }), facts: extractSiteFacts(page.html, page.bytes) };
  } catch (err) {
    return { site: done({ url: url.toString(), reachable: false, error: err instanceof Error ? err.message : "Could not reach it", findings: [{ key: "unreachable", label: "Couldn't load the website", ok: null, detail: err instanceof Error ? err.message : undefined }] }), facts: null };
  }
}
