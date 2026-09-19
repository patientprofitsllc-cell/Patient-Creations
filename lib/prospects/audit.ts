import { normalizeWebUrl, safeFetchHtml } from "@/lib/prospects/net";

// A quick, honest look at a prospect's website. Every finding is something that
// was actually observed in the page's HTML. It does not judge design, and it
// never claims anything about search rankings or traffic.

export interface Finding {
  key: string;
  label: string;
  /** true = fine, false = a problem worth mentioning, null = couldn't tell */
  ok: boolean | null;
  detail?: string;
}

export interface AuditResult {
  checkedAt: string;
  url: string | null;
  finalUrl?: string;
  reachable: boolean;
  error?: string;
  findings: Finding[];
  problems: number;
}

const SOCIAL_HOSTS = /(^|\.)(facebook|instagram|tiktok|linktr\.ee|linktree|yelp|x|twitter|youtube)\.(com|ee)$/i;

function firstMatch(html: string, re: RegExp): string | undefined {
  return re.exec(html)?.[1]?.replace(/\s+/g, " ").trim();
}

/** Checks a page's HTML. Pure: no network, so it's easy to test. */
export function auditHtml(html: string, finalUrl: string, bytes: number, now = new Date()): Finding[] {
  const findings: Finding[] = [];
  const add = (key: string, label: string, ok: boolean | null, detail?: string) => findings.push({ key, label, ok, detail });

  let host = "";
  let secure = false;
  try {
    const u = new URL(finalUrl);
    host = u.hostname;
    secure = u.protocol === "https:";
  } catch {
    /* leave defaults */
  }

  if (SOCIAL_HOSTS.test(host)) {
    add("social_only", "Uses a social media page as its website", false, host);
  }
  add("https", "Loads securely (https)", secure, secure ? undefined : "The address is http only, so browsers show a \"not secure\" warning");

  const viewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
  add("viewport", "Declares a mobile layout", viewport, viewport ? undefined : "No mobile viewport setting, which usually means the page is hard to use on a phone");

  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  add("title", "Has a page title", Boolean(title), title ? undefined : "No title tag");

  const description = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html) || /<meta[^>]+content=["'][^"']{20,}["'][^>]+name=["']description["']/i.test(html);
  add("description", "Has a search description", description, description ? undefined : "No meta description");

  const tel = /href=["']tel:/i.test(html);
  const phoneText = /(\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b)/.test(html);
  add("phone", "Shows a phone number", tel || phoneText, tel || phoneText ? undefined : "No phone number found on the page");
  add("tap_to_call", "Phone number is tap-to-call", tel, tel ? undefined : "The page has no tap-to-call link");

  const years = [...html.matchAll(/(?:&copy;|©|copyright)\s*(?:<[^>]+>\s*)*(20\d{2})/gi)].map((m) => Number(m[1]));
  if (years.length > 0) {
    const latest = Math.max(...years);
    const stale = now.getFullYear() - latest >= 3;
    add("stale_year", "Footer year looks current", !stale, stale ? `The footer says ${latest}` : undefined);
  }

  add("size", "Page is a reasonable size", bytes < 400_000, bytes >= 400_000 ? `${Math.round(bytes / 1024)} KB of HTML` : undefined);

  const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ").replace(/\s+/g, " ").trim();
  add("content", "Has real text on the page", visible.length > 300, visible.length > 300 ? undefined : "Very little readable text, so the page may be mostly images or built with scripts");

  return findings;
}

function summarize(partial: Omit<AuditResult, "problems" | "checkedAt">): AuditResult {
  return { ...partial, checkedAt: new Date().toISOString(), problems: partial.findings.filter((f) => f.ok === false).length };
}

/** Looks at a prospect's website. No website is itself a finding. Never throws. */
export async function auditWebsite(website: string | null | undefined): Promise<AuditResult> {
  const url = normalizeWebUrl(website);
  if (!url) {
    return summarize({
      url: null,
      reachable: false,
      findings: [{ key: "no_website", label: "No website address on file", ok: false, detail: "There is no website to check" }],
    });
  }
  try {
    const page = await safeFetchHtml(url.toString());
    if (page.status >= 400 || !page.html) {
      return summarize({
        url: url.toString(),
        finalUrl: page.finalUrl,
        reachable: false,
        error: page.status >= 400 ? `The site returned status ${page.status}` : "The page wasn't a normal web page",
        findings: [{ key: "unreachable", label: "The website didn't load properly", ok: false, detail: page.status >= 400 ? `Status ${page.status}` : undefined }],
      });
    }
    return summarize({ url: url.toString(), finalUrl: page.finalUrl, reachable: true, findings: auditHtml(page.html, page.finalUrl, page.bytes) });
  } catch (err) {
    return summarize({
      url: url.toString(),
      reachable: false,
      error: err instanceof Error ? err.message : "Couldn't reach it",
      findings: [{ key: "unreachable", label: "Couldn't load the website", ok: null, detail: err instanceof Error ? err.message : undefined }],
    });
  }
}
