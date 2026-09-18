import { contrast, phoneDigits, splitLines, splitList, type BuiltSite } from "@/lib/site/build/config";
import { INDUSTRIES } from "@/lib/site/industries";
import { esc } from "@/lib/site/build/renderHtml";

export interface QaCheck {
  name: string;
  ok: boolean;
  /** "error" blocks the preview; "warning" is passed along to the team. */
  severity: "error" | "warning";
  detail?: string;
}

export interface QaResult {
  passed: boolean;
  checks: QaCheck[];
  errors: string[];
  warnings: string[];
}

// Text that only ever appears in our own sample designs: their fictional business
// names, address, and phone. If any of it reaches a customer's page, a template leaked through.
const SAMPLE_MARKERS = [
  ...new Set(INDUSTRIES.flatMap((i) => [i.sample.businessName, i.sample.address, i.sample.phone])),
  "yourbusiness.com",
];

const MAX_HTML_BYTES = 200_000;

/** Checks a built site and its rendered HTML the way a person would before showing it to the customer. */
export function runSiteQa(site: BuiltSite, html: string): QaResult {
  const checks: QaCheck[] = [];
  const add = (name: string, ok: boolean, severity: QaCheck["severity"], detail?: string) => checks.push({ name, ok, severity, detail });

  add("Business name is present", site.businessName.trim().length > 0, "error");
  add("Headline is present", site.tagline.trim().length >= 3, "error");
  add("Intro text is present", site.about.trim().length >= 20, "error", `${site.about.trim().length} characters`);

  const digits = phoneDigits(site.phone).replace(/\D/g, "");
  add("Phone number looks valid", digits.length >= 7 && digits.length <= 15, "error", site.phone);

  const hrefOk = /^(tel:|sms:|https?:\/\/)/i.test(site.ctaHref) && site.ctaHref.replace(/^(tel:|sms:)/i, "").length > 3;
  add("Main button links somewhere real", hrefOk, "error", site.ctaHref);

  const leaked = SAMPLE_MARKERS.filter((m) => html.includes(m));
  add("No sample-design text leaked in", leaked.length === 0, "error", leaked.join(", "));

  add("Page has a title and description", site.seo.title.length > 0 && site.seo.description.length >= 20, "error");
  add("Title is a sensible length", site.seo.title.length <= 70, "warning", `${site.seo.title.length} characters`);
  add("Description is a sensible length", site.seo.description.length <= 160, "warning", `${site.seo.description.length} characters`);

  add("Mobile viewport is set", /<meta name="viewport" content="width=device-width/.test(html), "error");
  add("Language is declared", /<html lang="/.test(html), "error");
  add("No scripts or external requests", !/<script(?![^>]*application\/ld\+json)/i.test(html) && !/(src|href)="https?:\/\/[^"]*\.(js|css)"/i.test(html), "error");
  add("Page is a small download", Buffer.byteLength(html, "utf8") <= MAX_HTML_BYTES, "error", `${Buffer.byteLength(html, "utf8")} bytes`);

  const bodyContrast = contrast(site.tokens.text, site.tokens.bg);
  add("Body text is readable", bodyContrast >= 4.5, "error", `contrast ${bodyContrast.toFixed(1)}:1`);
  const mutedContrast = contrast(site.tokens.muted, site.tokens.bg);
  add("Secondary text is readable", mutedContrast >= 3, "warning", `contrast ${mutedContrast.toFixed(1)}:1`);
  const accentContrast = contrast(site.tokens.accent, site.tokens.bg);
  add("Links and accents stand out", accentContrast >= 3, "error", `contrast ${accentContrast.toFixed(1)}:1`);

  const unsafeLinks = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]).filter((h) => h !== "#" && !/^(https?:\/\/|tel:|sms:)/i.test(h));
  add("Every link uses a safe address", unsafeLinks.length === 0, "error", unsafeLinks.join(", "));

  add("Services are listed", site.services.length > 0, "warning", "The customer did not list any services, so that section is left out.");
  add("Hours are listed", site.hours.length > 0, "warning", "No hours were given, so that card is left out.");
  add("Location is listed", site.address.length > 0, "warning", "No address was given, so there is no map link.");

  const errors = checks.filter((c) => !c.ok && c.severity === "error").map((c) => (c.detail ? `${c.name} (${c.detail})` : c.name));
  const warnings = checks.filter((c) => !c.ok && c.severity === "warning").map((c) => c.detail ?? c.name);
  return { passed: errors.length === 0, checks, errors, warnings };
}

/**
 * Confirms the page actually carries what the customer gave us, so nothing they
 * typed was silently dropped. Returns the facts that are missing from the page.
 */
export function runFidelityCheck(
  facts: { businessName: string; phone: string; address?: string | null; hours?: string | null; services?: string | null; pricing?: string | null },
  html: string,
): string[] {
  const missing: string[] = [];
  const need = (label: string, value: string | undefined | null) => {
    const v = (value ?? "").trim();
    if (v && !html.includes(esc(v))) missing.push(label);
  };
  need("business name", facts.businessName);
  need("phone number", facts.phone);
  need("address", facts.address);
  need("hours", facts.hours);
  // The customer's own lists, up to the number the page is built to show.
  splitList(facts.services).slice(0, 12).forEach((name) => need(`service "${name}"`, name));
  splitLines(facts.pricing).slice(0, 20).forEach((line) => need(`price "${line}"`, line));
  return missing;
}
