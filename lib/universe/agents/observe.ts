import { pageSignals } from "@/lib/universe/pageSignals";
import type { Domain, Fact, Mission, Signal, Snapshot } from "@/lib/universe/types";
import { idMaker } from "@/lib/universe/protocol";

// Looking is done once, up front, and shared. LOOK, IMAGE, and FEELINGS all work from the same snapshots and the same observed
// facts, so a page is fetched a single time and every claim about it cites a fact that names where it was seen.

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timed out")), ms))]);

/** Fetches the domain's own pages and anything the request attached. A failure is recorded as a failure, never skipped silently. */
export async function takeSnapshots(domain: Domain, mission: Mission, timeoutMs = 10_000): Promise<Snapshot[]> {
  const out: Snapshot[] = [];
  const attached = mission.attachments;
  const targets: { id: string; name: string; url: string; html?: string }[] = [];
  if (attached.length) {
    attached.forEach((a, i) => {
      if (a.kind === "url") targets.push({ id: `A${i + 1}`, name: `Attached page ${i + 1}`, url: a.value });
      else targets.push({ id: `A${i + 1}`, name: `Attached ${a.kind} ${i + 1}`, url: `attached:${i + 1}`, html: a.kind === "html" ? a.value : `<p>${a.value.replace(/[<>]/g, "")}</p>` });
    });
  } else {
    domain.surfaces.forEach((s) => targets.push({ id: s.id, name: s.name, url: s.url }));
  }
  await Promise.all(
    targets.map(async (t) => {
      if (t.html !== undefined) return void out.push({ id: t.id, name: t.name, url: t.url, ok: true, status: 200, html: t.html });
      try {
        const r = await withTimeout(domain.fetchPage(t.url), timeoutMs);
        const ok = r.status < 400 && Boolean(r.html);
        out.push({ id: t.id, name: t.name, url: r.finalUrl || t.url, ok, status: r.status, html: ok ? r.html : "", error: ok ? undefined : `The page answered with status ${r.status}` });
      } catch (err) {
        out.push({ id: t.id, name: t.name, url: t.url, ok: false, status: null, html: "", error: err instanceof Error ? err.message : "could not be opened" });
      }
    }),
  );
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/** What the snapshots show, as facts that say where they were seen. A page that would not open becomes an UNKNOWN. */
export function observedFacts(snapshots: Snapshot[], domain: Domain): Fact[] {
  const nextId = idMaker("O");
  const facts: Fact[] = [];
  const add = (s: Snapshot, what: string, topic: string, statement: string, value: number | string | null, tags: string[], signal: Signal) =>
    facts.push({ id: nextId(), label: "FACT", topic, key: `obs.${s.id}.${what}`, statement: `${s.name}: ${statement}`, value, source: `observed in the page's HTML at ${s.url}`, tags: ["observed", ...tags], signal });

  for (const s of snapshots) {
    if (!s.ok) {
      facts.push({ id: nextId(), label: "UNKNOWN", topic: "presentation", key: `obs.${s.id}.open`, statement: `${s.name}: DATA NOT AVAILABLE. The page could not be examined (${s.error ?? "no reason given"}).`, source: s.url, tags: ["observed", "look"], signal: "neutral", need: `The page at ${s.url} to open and answer normally.` });
      continue;
    }
    const p = pageSignals(s.html);
    const expects = domain.surfaces.find((x) => x.id === s.id)?.expects ?? [];

    add(s, "title", "presentation", p.title ? `the page title reads "${p.title.slice(0, 80)}".` : "the page has no title.", p.title, ["look", "structure", "seo"], p.title ? "positive" : "negative");
    add(s, "description", "presentation", p.description ? "the page has a search description." : "the page has no search description.", p.description ? p.description.length : 0, ["look", "seo"], p.description ? "positive" : "negative");
    add(s, "h1", "presentation", p.h1Count === 1 ? `there is one main heading ("${(p.h1Text ?? "").slice(0, 80)}").` : p.h1Count === 0 ? "there is no main heading (h1)." : `there are ${p.h1Count} main headings (h1) where one is usual.`, p.h1Count, ["look", "clarity"], p.h1Count === 1 ? "positive" : "negative");
    add(s, "viewport", "mobile", p.viewport ? "the page declares a mobile layout." : "the page does not declare a mobile layout, which usually means it is hard to use on a phone.", p.viewport ? 1 : 0, ["look", "mobile"], p.viewport ? "positive" : "negative");
    add(s, "cta", "conversion", p.ctaCount === 0 ? "no clear call-to-action link or button was found in the page's HTML (a button drawn by scripts after the page loads would not show here)." : p.ctaCount > 5 ? `${p.ctaCount} calls to action were found, which may compete for attention.` : `${p.ctaCount} call${p.ctaCount === 1 ? "" : "s"} to action found.`, p.ctaCount, ["look", "conversion", "friction"], p.ctaCount === 0 || p.ctaCount > 5 ? "negative" : "positive");
    add(s, "nav", "navigation", p.navLinks > 0 ? `the navigation has ${p.navLinks} link${p.navLinks === 1 ? "" : "s"}.` : "no navigation links were found.", p.navLinks, ["look", "navigation"], p.navLinks >= 2 ? "positive" : "negative");
    add(s, "text", "presentation", p.textLength < 300 ? `the page has very little readable text (${p.textLength} characters), so it may rely on images or scripts.` : `the page has ${p.textLength} characters of readable text.`, p.textLength, ["look", "content"], p.textLength < 300 ? "negative" : "positive");
    if (p.longParagraphs > 0) add(s, "walls", "presentation", `${p.longParagraphs} paragraph${p.longParagraphs === 1 ? " is" : "s are"} over 600 characters, which could be hard to scan.`, p.longParagraphs, ["look", "readability", "friction"], "negative");
    if (p.formCount > 0) add(s, "form", "conversion", `the page has ${p.formCount} form${p.formCount === 1 ? "" : "s"}; the longest asks for ${p.inputCount} field${p.inputCount === 1 ? "" : "s"}.`, p.inputCount, ["conversion", "friction", "form"], p.inputCount > 6 ? "negative" : "neutral");
    else if (expects.includes("form")) add(s, "form", "conversion", "no form was found in the page's HTML on a page that is expected to have one (a form drawn by scripts after the page loads would not show here).", 0, ["conversion", "form"], "negative");

    const contact = p.tel || p.mailto || p.phoneText;
    add(s, "contact", "trust", contact ? "a way to reach the business is visible." : "no phone number or email address is visible.", contact ? 1 : 0, ["trust", "contact"], contact ? "positive" : expects.includes("contact") ? "negative" : "neutral");
    add(s, "policy", "trust", p.policyLinks > 0 ? `${p.policyLinks} link${p.policyLinks === 1 ? "" : "s"} to a policy or terms page.` : "no link to a privacy, terms, or refund page was found.", p.policyLinks, ["trust", "policy"], p.policyLinks > 0 ? "positive" : "neutral");
    add(s, "proof", "trust", p.trustWords > 0 ? `${p.trustWords} trust word${p.trustWords === 1 ? "" : "s"} (such as reviews, guarantee, secure) appear in the text.` : "no words that signal proof, such as reviews, testimonials, or a guarantee, appear in the text.", p.trustWords, ["trust", "proof"], p.trustWords > 0 ? "positive" : expects.includes("price") || expects.includes("form") ? "negative" : "neutral");
    if (expects.includes("price")) add(s, "price", "clarity", p.priceMentions > 0 ? `${p.priceMentions} price${p.priceMentions === 1 ? " is" : "s are"} shown.` : "no price is shown on a page that is expected to show one.", p.priceMentions, ["clarity", "price"], p.priceMentions > 0 ? "positive" : "negative");

    add(s, "images", "imagery", p.imageCount === 0 ? "the page has no images." : `the page has ${p.imageCount} image${p.imageCount === 1 ? "" : "s"}.`, p.imageCount, ["image"], p.imageCount === 0 ? "negative" : "neutral");
    if (p.imageCount > 0) {
      add(s, "alt", "imagery", p.imagesMissingAlt > 0 ? `${p.imagesMissingAlt} of ${p.imageCount} images have no alt text.` : "every image has alt text.", p.imagesMissingAlt, ["image", "accessibility"], p.imagesMissingAlt > 0 ? "negative" : "positive");
      if (p.imagesWithoutSize > 0) add(s, "size", "imagery", `${p.imagesWithoutSize} of ${p.imageCount} images do not state a width and height, which may make the page jump as it loads.`, p.imagesWithoutSize, ["image", "layout"], "negative");
    }
    add(s, "og", "imagery", p.ogImage ? "a share image is set." : "no share image is set, so a shared link may show no picture.", p.ogImage ? 1 : 0, ["image", "share"], p.ogImage ? "positive" : "negative");
  }
  return facts;
}
