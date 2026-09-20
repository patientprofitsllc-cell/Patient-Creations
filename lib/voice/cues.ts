import { CUE_IDS } from "@/lib/voice/script";

// Which line belongs to which page or product. Pure, so the same answer is used by the player and the tests.
// A switch between products is a change of the ?product= value on the checkout page (or a change of page),
// and both come out of this one function.

const PAGE_CUES: Record<string, string> = {
  "/": "home",
  "/services": "services",
  "/pricing": "pricing",
  "/monthly-ads": "monthly-ads",
  "/monthly-ads/start": "ads-plan",
  "/gallery": "showcase",
  "/examples": "showcase",
  "/websites": "showcase",
  "/agents": "agents",
  "/checkout": "checkout",
  "/checkout/success": "success",
};

/** The seven single-design NFC card products all share the one card line. */
const NFC_SLUG = /^nfc-/;

/** Pages where the guide stays silent: staff areas, private tokens' work areas, sign in, and legal text. */
const SILENT_PREFIXES = ["/admin", "/portal", "/auth", "/preview", "/intake", "/api", "/terms", "/privacy", "/refunds", "/acceptable-use", "/copyright"];

export function cueForRoute(pathname: string, product?: string | null): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (SILENT_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return null;
  if (path.startsWith("/status/")) return "chat-welcome";
  if (path.startsWith("/websites/") || path.startsWith("/examples/")) return "showcase";
  if (path.startsWith("/monthly-ads/manage")) return null;
  if (path === "/checkout" && product) {
    const slug = NFC_SLUG.test(product) ? "nfc-cards" : product;
    return CUE_IDS.includes(slug) ? slug : "checkout";
  }
  return PAGE_CUES[path] ?? null;
}
