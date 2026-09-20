import { NextResponse, type NextRequest } from "next/server";
import { BLOCKED_MESSAGE, isBlockedAgent } from "@/lib/security/scrapers";

// Turns away known website copiers and AI training crawlers (lib/security/scrapers.ts). Every other
// visitor passes straight through untouched. robots.txt, the sitemap, the copyright notice, and
// static files stay reachable so a blocked visitor can still read the rules.
export function middleware(req: NextRequest) {
  if (isBlockedAgent(req.headers.get("user-agent"))) {
    return new NextResponse(BLOCKED_MESSAGE, { status: 403, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|copyright|.well-known|assets).*)"],
};
