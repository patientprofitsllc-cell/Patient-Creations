import { INDUSTRIES, getIndustry, type CtaKind, type IndustryConfig } from "@/lib/site/industries";

/** Entries one per line. A list typed on a single line is split on commas instead. */
export function splitList(text: string | null | undefined): string[] {
  const t = (text ?? "").trim();
  const parts = /[\r\n]/.test(t) ? t.split(/\r?\n/) : t.split(",");
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** Entries one per line only, so amounts like "$1,000" stay whole. */
export function splitLines(text: string | null | undefined): string[] {
  return (text ?? "").split(/\r?\n/).map((p) => p.trim()).filter(Boolean);
}

// The structured content and design a customer's page is rendered from. It is
// built only from what the customer told us; nothing is filled in with
// invented facts. Missing information means a section is left out.
export interface BuiltSite {
  businessName: string;
  businessType: string;
  industrySlug: string;
  tagline: string;
  about: string;
  services: { name: string; blurb?: string }[];
  /** The customer's own price list, one entry per line. Never generated. */
  pricing: string[];
  hours: string;
  address: string;
  phone: string;
  ctaKind: CtaKind;
  ctaLabel: string;
  ctaHref: string;
  bookingUrl?: string;
  socials: { label: string; url: string }[];
  tokens: IndustryConfig["sample"]["tokens"];
  seo: { title: string; description: string };
}

export interface IntakeFacts {
  businessName: string;
  businessType: string;
  phone: string;
  description?: string | null;
  address?: string | null;
  hours?: string | null;
  services?: string | null;
  pricing?: string | null;
  bookingUrl?: string | null;
  socialUrls?: string | null;
  colors?: string | null;
  fontStyle?: string | null;
  goal?: string | null;
}

// Business type (as shown in the intake) to the industry template that styles it.
const TYPE_TO_INDUSTRY: Record<string, string> = {
  Barbershop: "barbers",
  "Beauty salon": "salons",
  "Restaurant or food": "restaurants",
  Contractor: "contractors",
  "Pressure washing": "pressure-washing",
  Landscaping: "landscaping",
  "Auto detailing": "auto-detailing",
  "Real estate": "realtors",
  Photography: "photographers",
  "Personal training or fitness": "personal-trainers",
  "Cleaning company": "cleaning-companies",
  "Local retail": "local-retail",
};

export function industryFor(businessType: string): IndustryConfig {
  const slug = TYPE_TO_INDUSTRY[businessType] ?? "local-retail";
  return getIndustry(slug) ?? INDUSTRIES[0];
}

const GOAL_TO_CTA: Record<string, CtaKind> = {
  CALL: "call",
  TEXT: "text",
  BOOK: "book",
  QUOTE: "quote",
  VISIT: "visit",
  BUY: "book",
  FORM: "quote",
  OTHER: "call",
};

const CTA_LABEL: Record<CtaKind, string> = {
  call: "Call now",
  text: "Text us",
  book: "Book now",
  quote: "Get a quote",
  visit: "Get directions",
};

/** An http(s) URL, or undefined. Anything else (javascript:, data:, mailto:) is rejected. */
export function safeUrl(input: string | null | undefined): string | undefined {
  const raw = (input ?? "").trim();
  if (!raw) return undefined;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (!url.hostname.includes(".")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function phoneDigits(phone: string): string {
  const hasPlus = phone.trim().startsWith("+");
  return (hasPlus ? "+" : "") + phone.replace(/\D/g, "");
}

function socialLabel(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const known: [RegExp, string][] = [
    [/instagram\.com$/, "Instagram"],
    [/facebook\.com$|fb\.com$/, "Facebook"],
    [/tiktok\.com$/, "TikTok"],
    [/youtube\.com$|youtu\.be$/, "YouTube"],
    [/(^|\.)x\.com$|twitter\.com$/, "X"],
    [/linkedin\.com$/, "LinkedIn"],
    [/yelp\.com$/, "Yelp"],
    [/google\.com$|goo\.gl$/, "Google"],
  ];
  return known.find(([re]) => re.test(host))?.[1] ?? host;
}

const HEX = /#(?:[0-9a-fA-F]{6})\b/;

// WCAG relative luminance and contrast, used to keep text readable on any color.
export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#111111" : "#ffffff";
}

const HEADING_BY_STYLE: Record<string, "serif" | "sans"> = {
  Classic: "serif",
  Elegant: "serif",
  Modern: "sans",
  Bold: "sans",
  Friendly: "sans",
};

export interface Copy {
  tagline: string;
  about: string;
  blurbs?: string[];
}

/** The plain wording used when AI copy isn't available or doesn't pass the checks: the customer's own words. */
export function templateCopy(facts: IntakeFacts): Copy {
  const description = (facts.description ?? "").trim();
  return {
    tagline: `Welcome to ${facts.businessName}`,
    about: description || `${facts.businessName} is a local ${facts.businessType.toLowerCase()}. Get in touch to learn more.`,
  };
}

export function buildSiteConfig(facts: IntakeFacts, copy: Copy = templateCopy(facts)): BuiltSite {
  const industry = industryFor(facts.businessType);
  const tokens = { ...industry.sample.tokens };

  const chosen = facts.colors?.match(HEX)?.[0];
  // A customer color is used as the accent only if it stands out from the background.
  if (chosen && contrast(chosen, tokens.bg) >= 3) tokens.accent = chosen;
  const style = facts.fontStyle ? HEADING_BY_STYLE[facts.fontStyle] : undefined;
  if (style) tokens.heading = style;

  const serviceNames = splitList(facts.services).slice(0, 12);
  const services = serviceNames.map((name, i) => ({
    name,
    blurb: copy.blurbs && copy.blurbs.length === serviceNames.length ? copy.blurbs[i] : undefined,
  }));

  const bookingUrl = safeUrl(facts.bookingUrl);
  const address = (facts.address ?? "").trim();
  const hours = (facts.hours ?? "").trim();
  const digits = phoneDigits(facts.phone);

  // The button does what the customer asked for, and falls back to calling when
  // the link it needs (a booking page, an address) wasn't provided.
  let ctaKind = GOAL_TO_CTA[facts.goal ?? ""] ?? "call";
  if ((ctaKind === "book" || ctaKind === "quote") && !bookingUrl) ctaKind = "call";
  if (ctaKind === "visit" && !address) ctaKind = "call";

  const ctaHref =
    ctaKind === "call"
      ? `tel:${digits}`
      : ctaKind === "text"
        ? `sms:${digits}`
        : ctaKind === "visit"
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
          : (bookingUrl as string);

  const socials = splitList(facts.socialUrls)
    .map(safeUrl)
    .filter((u): u is string => Boolean(u))
    .slice(0, 6)
    .map((url) => ({ label: socialLabel(url), url }));

  const about = copy.about.trim();
  const description = (about.length > 155 ? `${about.slice(0, 152).trimEnd()}...` : about) || `${facts.businessName}: ${facts.businessType}.`;

  return {
    businessName: facts.businessName.trim(),
    businessType: facts.businessType,
    industrySlug: industry.slug,
    tagline: copy.tagline.trim(),
    about,
    services,
    pricing: splitLines(facts.pricing).slice(0, 20),
    hours,
    address,
    phone: facts.phone.trim(),
    ctaKind,
    ctaLabel: CTA_LABEL[ctaKind],
    ctaHref,
    bookingUrl,
    socials,
    tokens,
    seo: { title: `${facts.businessName.trim()} | ${facts.businessType}`.slice(0, 70), description },
  };
}

/** The only fields a revision request is allowed to change. */
export interface SitePatch {
  tagline?: string;
  about?: string;
  hours?: string;
  address?: string;
  phone?: string;
  services?: string[];
  accent?: string;
  heading?: "serif" | "sans";
}

function ctaHrefFor(site: BuiltSite): string {
  if (site.ctaKind === "call") return `tel:${phoneDigits(site.phone)}`;
  if (site.ctaKind === "text") return `sms:${phoneDigits(site.phone)}`;
  if (site.ctaKind === "visit") return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  return site.bookingUrl ?? `tel:${phoneDigits(site.phone)}`;
}

/** Applies a validated revision to a built site, recomputing anything derived from the changed fields. */
export function patchSite(site: BuiltSite, patch: SitePatch): BuiltSite {
  const next: BuiltSite = { ...site, tokens: { ...site.tokens } };
  if (patch.tagline?.trim()) next.tagline = patch.tagline.trim();
  if (patch.about?.trim()) {
    next.about = patch.about.trim();
    next.seo = { ...next.seo, description: next.about.length > 155 ? `${next.about.slice(0, 152).trimEnd()}...` : next.about };
  }
  if (patch.hours !== undefined) next.hours = patch.hours.trim();
  if (patch.address !== undefined) next.address = patch.address.trim();
  if (patch.phone?.trim()) next.phone = patch.phone.trim();
  if (patch.services) next.services = patch.services.map((n) => n.trim()).filter(Boolean).slice(0, 12).map((name) => ({ name }));
  if (patch.accent && HEX.test(patch.accent) && contrast(patch.accent, next.tokens.bg) >= 3) next.tokens.accent = patch.accent;
  if (patch.heading) next.tokens.heading = patch.heading;
  if (next.ctaKind === "visit" && !next.address) next.ctaKind = "call";
  next.ctaLabel = CTA_LABEL[next.ctaKind];
  next.ctaHref = ctaHrefFor(next);
  return next;
}
