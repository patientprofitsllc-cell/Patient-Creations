// Turns a client site's built page into one we can serve from /showcase/<name>/ on our own domain, with nothing in it that
// says where it came from. Pure functions, so they are tested against a fixture. These sites are built to run from the root
// of their own address and their scripts fail from a subfolder, so we serve the fully built page without scripts: the layout,
// photos, video (which autoplays natively), links and order buttons all work.
import { OFFER_CHECKOUT_HREF } from "@/lib/site/offer";

export interface TransformInput {
  slug: string;
  /** The address the page is fetched from, for example "name.example.app". */
  host: string;
  /** Our own site, for example "https://patientcreations.com". */
  siteUrl: string;
}

const prefix = (slug: string) => `/showcase/${slug}`;

const BAR_STYLE =
  "background:#141412;color:#ecebe4;font:500 13px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;padding:10px 14px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap";

/** The slim bar across the top: back to the examples, who built it, and a way to start. */
export const topBar = () =>
  `<div data-pc-bar style="${BAR_STYLE}"><a href="/examples" style="color:#dbb77e;text-decoration:none;min-height:24px">← All examples</a><span style="opacity:.75">A site built by Patient Creations</span><a href="${OFFER_CHECKOUT_HREF}" style="background:#dbb77e;color:#1a1a16;padding:8px 12px;border-radius:8px;text-decoration:none;font-weight:600">Start a project →</a></div>`;

/** Controls that only make sense with the site's own scripts. */
const HEAD_ADDITIONS = `<meta name="robots" content="noindex,nofollow"><style>.video-control,[data-requires-js]{display:none!important}</style>`;

/** Last line of defence: nothing that names the hosting platform survives, whatever the page contained. */
function scrub(text: string, pre: string): string {
  return text.replace(/https?:\/\/[^\s"'<>)\\]*higgsfield[^\s"'<>)\\]*/gi, pre).replace(/higgsfield/gi, "");
}

export function transformHtml(html: string, { slug, host, siteUrl }: TransformInput): string {
  const pre = prefix(slug);
  let out = html
    // Scripts need the site's own address to start, so they go; so do the hints that preload them.
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/gi, "")
    .replace(/<link\b[^>]*\bas="script"[^>]*>/gi, "")
    // Stylesheets are rewritten on the way (their font URLs are root-relative), so they get their own path.
    .replace(/\/assets\/([\w.-]+\.css)/g, (_m, file) => `${pre}/_css/${file}`)
    // Everything else the page loads from its own root now loads from our folder.
    .replace(/(["'(=\s,])\/(assets\/|favicon\.|apple-touch-icon|site\.webmanifest)/g, (_m, lead, what) => `${lead}${pre}/${what}`)
    // Full addresses of the original (share images, canonical links) become ours.
    .split(`https://${host}`)
    .join(`${siteUrl}${pre}`);
  out = out.replace(/<\/head>/i, `${HEAD_ADDITIONS}</head>`).replace(/<body\b[^>]*>/i, (m) => `${m}${topBar()}`);
  return scrub(out, `${siteUrl}${pre}`);
}

export function transformCss(css: string, slug: string): string {
  return scrub(css.replace(/url\((["']?)\/assets\//g, `url($1${prefix(slug)}/assets/`), prefix(slug));
}

/** A friendly page for when the original can't be reached, so a visitor never sees an error. */
export const unavailablePage = () =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Temporarily unavailable</title></head><body style="margin:0;background:#141412;color:#ecebe4;font:16px/1.5 system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px"><div><p style="font-size:22px;margin:0 0 8px">This example is taking a moment.</p><p style="opacity:.7;margin:0 0 20px">Please try again in a minute.</p><a href="/examples" style="color:#dbb77e">← All examples</a></div></body></html>`;
