import { phoneDigits, readableOn, type BuiltSite } from "@/lib/site/build/config";

// Turns a BuiltSite into one self-contained HTML file: inline CSS, no scripts,
// no external requests, so it loads fast, deploys anywhere, and can't run
// anything from customer-supplied text. Every value is escaped.

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Only https, http, tel, and sms links are ever emitted. */
export function safeHref(href: string): string {
  return /^(https?:|tel:|sms:)/i.test(href) ? href : "#";
}

/** JSON for a <script type="application/ld+json"> block, safe against "</script>" breakouts. */
function jsonLd(site: BuiltSite): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.businessName,
    description: site.seo.description,
    telephone: phoneDigits(site.phone),
  };
  if (site.address) data.address = site.address;
  if (site.socials.length) data.sameAs = site.socials.map((s) => s.url);
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function renderHtml(site: BuiltSite, opts: { year?: number } = {}): string {
  const t = site.tokens;
  const onAccent = readableOn(t.accent);
  const headingFont = t.heading === "serif" ? "Georgia, 'Times New Roman', serif" : "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const year = opts.year ?? new Date().getFullYear();
  const line = `${t.muted}44`;

  const services = site.services.length
    ? `<section class="wrap" id="services"><h2>Services</h2><ul class="cards">${site.services
        .map((s) => `<li class="card"><h3>${esc(s.name)}</h3>${s.blurb ? `<p>${esc(s.blurb)}</p>` : ""}</li>`)
        .join("")}</ul></section>`
    : "";

  const pricing = site.pricing.length
    ? `<section class="wrap" id="prices"><h2>Prices</h2><ul class="plain">${site.pricing.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>`
    : "";

  const info: string[] = [];
  if (site.hours) info.push(`<div class="card"><h3>Hours</h3><p class="pre">${esc(site.hours)}</p></div>`);
  if (site.address) info.push(`<div class="card"><h3>Location</h3><p>${esc(site.address)}</p><p><a href="${esc(mapsUrl(site.address))}">Get directions</a></p></div>`);
  info.push(`<div class="card"><h3>Contact</h3><p><a href="tel:${esc(phoneDigits(site.phone))}">${esc(site.phone)}</a></p><p><a href="sms:${esc(phoneDigits(site.phone))}">Send a text</a></p></div>`);
  const contact = `<section class="wrap" id="contact"><h2>Find us</h2><div class="cards">${info.join("")}</div></section>`;

  const socials = site.socials.length
    ? `<p class="socials">${site.socials.map((s) => `<a href="${esc(safeHref(s.url))}" rel="noopener noreferrer">${esc(s.label)}</a>`).join("")}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.seo.title)}</title>
<meta name="description" content="${esc(site.seo.description)}">
<meta property="og:title" content="${esc(site.seo.title)}">
<meta property="og:description" content="${esc(site.seo.description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${esc(t.bg)}">
<script type="application/ld+json">${jsonLd(site)}</script>
<style>
:root{--accent:${t.accent};--on-accent:${onAccent};--bg:${t.bg};--surface:${t.surface};--text:${t.text};--muted:${t.muted};--line:${line};--radius:${t.radius}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.55}
h1,h2,h3{font-family:${headingFont};margin:0;line-height:1.15}
a{color:var(--accent)}
.wrap{max-width:920px;margin:0 auto;padding:48px 20px}
header.top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:920px;margin:0 auto;padding:16px 20px;border-bottom:1px solid var(--line)}
header.top .name{font-family:${headingFont};font-size:1.15rem;font-weight:600}
.btn{display:inline-block;background:var(--accent);color:var(--on-accent);text-decoration:none;font-weight:600;padding:12px 22px;border-radius:var(--radius)}
.hero{text-align:center;padding:72px 20px 56px;max-width:720px;margin:0 auto}
.hero h1{font-size:clamp(2rem,6vw,3.2rem)}
.hero p{color:var(--muted);font-size:1.1rem;margin:18px 0 28px}
h2{font-size:1.6rem;margin-bottom:20px}
h3{font-size:1.05rem;margin-bottom:6px}
.cards{list-style:none;margin:0;padding:0;display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px}
.card p{margin:4px 0;color:var(--muted)}
.pre{white-space:pre-line}
.plain{list-style:none;margin:0;padding:0}
.plain li{padding:10px 0;border-bottom:1px solid var(--line)}
.socials{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin:0}
footer{text-align:center;color:var(--muted);font-size:.85rem;padding:32px 20px 40px;border-top:1px solid var(--line)}
@media (max-width:520px){header.top .btn{padding:10px 14px;font-size:.9rem}.wrap{padding:36px 16px}}
</style>
</head>
<body>
<header class="top"><span class="name">${esc(site.businessName)}</span><a class="btn" href="${esc(safeHref(site.ctaHref))}">${esc(site.ctaLabel)}</a></header>
<main>
<section class="hero"><h1>${esc(site.tagline)}</h1><p>${esc(site.about)}</p><a class="btn" href="${esc(safeHref(site.ctaHref))}">${esc(site.ctaLabel)}</a></section>
${services}
${pricing}
${contact}
</main>
<footer>${socials}<p>&copy; ${year} ${esc(site.businessName)}</p></footer>
</body>
</html>`;
}
