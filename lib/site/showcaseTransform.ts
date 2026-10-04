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

/** The slim bar: back to the examples, who built it, and a way to start. Added by a script after the site has started, so
 *  the site's own page is never altered before it comes alive. Compact and fixed to the bottom, clear of the site's header. */
export const barScript = () =>
  `<script>addEventListener("load",function(){setTimeout(function(){if(document.querySelector("[data-pc-bar]"))return;var d=document.createElement("div");d.setAttribute("data-pc-bar","");d.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483000;display:flex;gap:10px;align-items:center;justify-content:space-between;background:#141412;color:#ecebe4;font:500 12px/1.2 system-ui,sans-serif;padding:6px 8px 6px 12px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.45);max-width:560px;margin:0 auto";d.innerHTML='<a href="/examples" style="color:#dbb77e;text-decoration:none;padding:8px 0">\\u2190 All examples</a><span style="opacity:.7">Built by Patient Creations</span><a href="${OFFER_CHECKOUT_HREF}" style="background:#dbb77e;color:#1a1a16;padding:8px 10px;border-radius:8px;text-decoration:none;font-weight:600">Start a project</a>';document.body.appendChild(d)},1500)});</script>`;

const HEAD_ADDITIONS = `<meta name="robots" content="noindex,nofollow">`;

/** Last line of defence: nothing that names the hosting platform survives, whatever the page contained. */
function scrub(text: string, pre: string): string {
  return text.replace(/https?:\/\/[^\s"'<>)\\]*higgsfield[^\s"'<>)\\]*/gi, pre).replace(/higgsfield/gi, "");
}

export function transformHtml(html: string, { slug, host, siteUrl }: TransformInput): string {
  const pre = prefix(slug);
  let out = html
    // The site's scripts run from our own folder, where they are adjusted to start from a sub-path (see transformJs).
    .replace(/\/assets\/([\w.-]+\.js)/g, (_m, file) => `${pre}/_js/${file}`)
    // Stylesheets are rewritten on the way (their font URLs are root-relative), so they get their own path.
    .replace(/\/assets\/([\w.-]+\.css)/g, (_m, file) => `${pre}/_css/${file}`)
    // Everything else the page loads from its own root now loads from our folder.
    .replace(/(["'(=\s,])\/(assets\/|favicon\.|apple-touch-icon|site\.webmanifest)/g, (_m, lead, what) => `${lead}${pre}/${what}`)
    // Full addresses of the original (share images, canonical links) become ours.
    .split(`https://${host}`)
    .join(`${siteUrl}${pre}`);
  out = out.replace(/<\/head>/i, `${HEAD_ADDITIONS}</head>`).replace(/<\/body>/i, `${barScript()}</body>`);
  return scrub(out, `${siteUrl}${pre}`);
}

export function transformCss(css: string, slug: string): string {
  return scrub(css.replace(/url\((["']?)\/assets\//g, `url($1${prefix(slug)}/assets/`), prefix(slug));
}

/**
 * The site's own script, adjusted to run from /showcase/<name>/: the router reads the address to decide which page to show, so it
 * is told to ignore our folder, and the links it builds get the folder put back. Asset paths point at our folder as well.
 */
export function transformJs(js: string, slug: string, host: string): string {
  const pre = prefix(slug);
  return js
    .replace(/(["'`])\/assets\/([\w.-]+\.js)\b/g, (_m, q, file) => `${q}${pre}/_js/${file}`)
    .replace(/(["'`])\/assets\/([\w.-]+\.css)\b/g, (_m, q, file) => `${q}${pre}/_css/${file}`)
    .replace(/(["'`])\/assets\//g, (_m, q) => `${q}${pre}/assets/`)
    .replace(/parseLocation\?\?\(\(\)=>(\w+)\(`\$\{(\w+)\.location\.pathname\}/, (_m, fn, w) => `parseLocation??(()=>${fn}(\`\${(${w}.location.pathname.startsWith("${pre}")?${w}.location.pathname.slice(${pre.length}):${w}.location.pathname)||"/"}`)
    .replace(/createHref\?\?\((\w+)=>\1\)/, (_m, a) => `createHref??(${a}=>${a}.startsWith("${pre}")?${a}:"${pre}"+${a})`)
    // Vite's loader for lazily loaded parts of the page builds each address as "/" + name; scripts and stylesheets go via our routes.
    .replace(/function\((\w+)\)\{return`\/`\+\1\}/g, (_m, a) => `function(${a}){var n=${a}.replace(/^assets\\//,"");return /\\.js$/.test(n)?"${pre}/_js/"+n:/\\.css$/.test(n)?"${pre}/_css/"+n:"${pre}/"+${a}}`)
    .split(`https://${host}`)
    .join(pre);
}

/** A friendly page for when the original can't be reached, so a visitor never sees an error. */
export const unavailablePage = () =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Temporarily unavailable</title></head><body style="margin:0;background:#141412;color:#ecebe4;font:16px/1.5 system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px"><div><p style="font-size:22px;margin:0 0 8px">This example is taking a moment.</p><p style="opacity:.7;margin:0 0 20px">Please try again in a minute.</p><a href="/examples" style="color:#dbb77e">← All examples</a></div></body></html>`;
