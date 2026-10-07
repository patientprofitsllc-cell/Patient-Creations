import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config/site";
import { GENERIC_NAME, NAMES, UPSTREAM } from "@/lib/site/showcaseUpstream.mjs";
import { transformCss, transformHtml, transformJs, unavailablePage } from "@/lib/site/showcaseTransform";

// Serves a client site from our own address (see lib/site/showcaseTransform.ts). Only the pages, scripts and stylesheets pass through
// here, because they have to be rewritten; images, video and fonts are passed straight through by rewrites in next.config.mjs.
// Only the names in UPSTREAM can be requested, and nothing the visitor sends is ever used as an address.

const CACHE = "public, s-maxage=300, stale-while-revalidate=86400";
const HEADERS = { "X-Robots-Tag": "noindex, nofollow" };

const fetchUpstream = (url: string) => fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000), headers: { "user-agent": "PatientCreationsShowcase/1.0" } });

export async function GET(_req: NextRequest, { params }: { params: { slug: string; path?: string[] } }) {
  const host = Object.prototype.hasOwnProperty.call(UPSTREAM, params.slug) ? UPSTREAM[params.slug] : undefined;
  if (!host) return new NextResponse("Not found", { status: 404, headers: HEADERS });
  const path = params.path ?? [];

  try {
    // The page itself.
    if (path.length === 0) {
      const res = await fetchUpstream(`https://${host}/`);
      if (!res.ok) throw new Error(`upstream answered ${res.status}`);
      const html = transformHtml(await res.text(), { slug: params.slug, host, siteUrl: SITE_URL, names: NAMES[params.slug], generic: GENERIC_NAME });
      return new NextResponse(html, { headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": CACHE } });
    }
    // A stylesheet: /showcase/<name>/_css/<file>.css
    if (path.length === 2 && path[0] === "_css" && /^[\w.-]+\.css$/.test(path[1])) {
      const res = await fetchUpstream(`https://${host}/assets/${path[1]}`);
      if (!res.ok) return new NextResponse("Not found", { status: 404, headers: HEADERS });
      return new NextResponse(transformCss(await res.text(), params.slug), { headers: { ...HEADERS, "Content-Type": "text/css; charset=utf-8", "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
    }
    // A script: /showcase/<name>/_js/<file>.js
    if (path.length === 2 && path[0] === "_js" && /^[\w.-]+\.js$/.test(path[1])) {
      const res = await fetchUpstream(`https://${host}/assets/${path[1]}`);
      if (!res.ok) return new NextResponse("Not found", { status: 404, headers: HEADERS });
      return new NextResponse(transformJs(await res.text(), params.slug, host, NAMES[params.slug], GENERIC_NAME), { headers: { ...HEADERS, "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
    }
  } catch (err) {
    console.error("showcase: could not reach", params.slug, err instanceof Error ? err.message : err);
    return new NextResponse(unavailablePage(), { status: 503, headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" } });
  }
  return new NextResponse("Not found", { status: 404, headers: HEADERS });
}
