// What can honestly be read from a page's HTML. This is a reader of markup, not of pixels: it cannot see colors, spacing, or how
// a page renders, and nothing built on it may claim to. Pure: no network, so every rule is tested directly.
//
// A reader that reports a problem that is not there is worse than no reader, so the rules below lean toward not accusing a page:
// a submit button is a call to action whatever it says, and fields a visitor never sees (anti-spam traps) are not counted.

export interface PageSignals {
  title: string | null;
  description: string | null;
  h1Count: number;
  h1Text: string | null;
  headingCount: number;
  viewport: boolean;
  lang: boolean;
  navLinks: number;
  ctaCount: number;
  formCount: number;
  /** Fields a visitor can fill in, in the longest single form. Hidden fields and anti-spam traps are not counted. */
  inputCount: number;
  submitButtons: number;
  imageCount: number;
  imagesMissingAlt: number;
  imagesWithoutSize: number;
  ogImage: boolean;
  favicon: boolean;
  tel: boolean;
  mailto: boolean;
  phoneText: boolean;
  policyLinks: number;
  trustWords: number;
  priceMentions: number;
  longParagraphs: number;
  textLength: number;
  scripts: number;
}

const strip = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, " ");
const clean = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;|&#x27;|&quot;/g, " ").replace(/\s+/g, " ").trim();
const CTA_WORDS = /\b(buy|order|get started|start|book|call|contact|sign up|subscribe|checkout|add to cart|schedule|request|try|claim|shop|get (your|a|my)|see (pricing|plans|what)|find out|check|apply|join|download|view (plans|pricing|services)|talk to|text us|send|learn more|continue|pay)\b/i;

/** Parts of a page a visitor never sees: elements marked aria-hidden, which is where anti-spam trap fields live. */
const withoutHidden = (html: string) => html.replace(/<div\b[^>]*aria-hidden=["']true["'][^>]*>[\s\S]*?<\/div>/gi, " ");
/** A field a visitor fills in: not hidden, not a button, not a checkbox or radio choice, and not taken out of the tab order. */
const FIELD = /<(input(?![^>]+type=["']?(hidden|submit|button|checkbox|radio|image)\b)(?![^>]+tabindex=["']?-1\b)|textarea|select)\b/gi;

export function pageSignals(rawHtml: string): PageSignals {
  const html = strip(rawHtml);
  const first = (re: RegExp) => re.exec(html)?.[1];
  const title = first(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = first(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? first(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => clean(m[1]));
  const anchors = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => clean(m[1]));
  const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].map((m) => ({ attrs: m[1], text: clean(m[2]) }));
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const text = clean(html);
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => clean(m[1]));
  const navBlock = /<nav\b[\s\S]*?<\/nav>/i.exec(html)?.[0] ?? "";

  const isSubmit = (attrs: string) => /type=["']?submit\b/i.test(attrs);
  const submitButtons = buttons.filter((b) => isSubmit(b.attrs) && b.text.length > 0).length + (html.match(/<input\b[^>]+type=["']?submit\b/gi) ?? []).length;
  const wordy = (t: string) => t.length > 0 && t.length <= 40 && CTA_WORDS.test(t);
  const otherActions = [...anchors, ...buttons.filter((b) => !isSubmit(b.attrs)).map((b) => b.text)].filter(wordy).length;

  return {
    title: title ? clean(title) : null,
    description: description ? description.trim() : null,
    h1Count: h1s.length,
    h1Text: h1s[0] ?? null,
    headingCount: (html.match(/<h[1-6]\b/gi) ?? []).length,
    viewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    lang: /<html[^>]+lang=["'][a-z-]+["']/i.test(html),
    navLinks: (navBlock.match(/<a\b/gi) ?? []).length,
    ctaCount: submitButtons + otherActions,
    formCount: forms.length,
    inputCount: Math.max(0, ...forms.map((f) => (withoutHidden(f).match(FIELD) ?? []).length)),
    submitButtons,
    imageCount: imgs.length,
    imagesMissingAlt: imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length,
    imagesWithoutSize: imgs.filter((i) => !(/\bwidth=/i.test(i) && /\bheight=/i.test(i))).length,
    ogImage: /<meta[^>]+property=["']og:image["']/i.test(html),
    favicon: /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html),
    tel: /href=["']tel:/i.test(html),
    mailto: /href=["']mailto:/i.test(html),
    phoneText: /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/.test(text),
    policyLinks: (html.match(/href=["'][^"']*(privacy|terms|refund|returns?|policy)[^"']*["']/gi) ?? []).length,
    trustWords: (text.match(/\b(guarantee|testimonials?|reviews?|verified|secure|licensed|insured|since (19|20)\d{2}|years? (in business|of experience)|trusted by|real person)\b/gi) ?? []).length,
    priceMentions: (text.match(/\$\s?\d[\d,]*(\.\d{2})?/g) ?? []).length,
    longParagraphs: paragraphs.filter((p) => p.length > 600).length,
    textLength: text.length,
    scripts: (rawHtml.match(/<script\b/gi) ?? []).length,
  };
}
