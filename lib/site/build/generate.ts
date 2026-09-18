import { buildSiteConfig, templateCopy, type BuiltSite, type Copy, type IntakeFacts } from "@/lib/site/build/config";
import { generateCopy } from "@/lib/site/build/copy";
import { renderHtml } from "@/lib/site/build/renderHtml";
import { runFidelityCheck, runSiteQa, type QaResult } from "@/lib/site/build/qa";

export interface GeneratedSite {
  site: BuiltSite;
  html: string;
  qa: QaResult;
  copyMode: "model" | "template";
  /** Blocking problems. Empty means the build is safe to show the customer. */
  problems: string[];
}

function attempt(facts: IntakeFacts, copy: Copy, copyMode: "model" | "template"): GeneratedSite {
  const site = buildSiteConfig(facts, copy);
  const html = renderHtml(site);
  const qa = runSiteQa(site, html);
  const dropped = runFidelityCheck(facts, html).map((m) => `Missing from the page: ${m}`);
  return { site, html, qa, copyMode, problems: [...qa.errors, ...dropped] };
}

/**
 * Builds a customer's page from their intake. AI-written copy is tried first
 * (when a key is configured); if it is unavailable, or the page it produces
 * fails a check, the page is rebuilt from the customer's own wording. A build
 * that still has problems is returned with them listed and is never shown.
 */
export async function generateWebsite(facts: IntakeFacts): Promise<GeneratedSite> {
  const aiCopy = await generateCopy(facts);
  if (aiCopy) {
    const built = attempt(facts, aiCopy, "model");
    if (built.problems.length === 0) return built;
  }
  return attempt(facts, templateCopy(facts), "template");
}
