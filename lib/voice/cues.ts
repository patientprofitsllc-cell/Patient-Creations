import { CUE_IDS } from "@/lib/voice/script";

// Which line belongs to which page or product. Pure, so the same answer is used by the player and the tests.
// A switch between products is a change of the ?product= value on the checkout page (or a change of page),
// and both come out of this one function.

const PAGE_CUES: Record<string, string> = {
  "/": "home",
  "/services": "services",
  "/pricing": "pricing",
  "/audit": "audit",
  "/monthly-ads": "monthly-ads",
  "/monthly-ads/start": "ads-plan",
  "/gallery": "showcase",
  "/examples": "showcase",
  "/websites": "showcase",
  "/agents": "agents",
  "/checkout": "checkout",
  "/checkout/success": "success",
  "/checkout/upsell": "upsell",
  "/guided-app-tour": "guided-tour",
};

/** The seven single-design NFC card products all share the one card line. */
const NFC_SLUG = /^nfc-/;

/** Pages where the guide stays silent: staff areas, private tokens' work areas, sign in, and legal text. */
const SILENT_PREFIXES = ["/admin", "/portal", "/auth", "/preview", "/intake", "/api", "/terms", "/privacy", "/refunds", "/acceptable-use", "/copyright"];

export interface RouteFlags {
  /** A Monthly Ads plan was just paid for (the plan page opens with ?started=1). */
  adsStarted?: boolean;
  /** A Website Care Plan was just paid for (the project page opens with ?care=started). */
  careStarted?: boolean;
}

/** The thank you for purchasing that belongs to a product bought, or the general one for a product without its own. */
export function thanksCueFor(slug: string | null | undefined): string {
  if (!slug) return "success";
  const key = NFC_SLUG.test(slug) ? "nfc-cards" : slug;
  return CUE_IDS.includes(`thanks-${key}`) ? `thanks-${key}` : "success";
}

export function cueForRoute(pathname: string, product?: string | null, flags: RouteFlags = {}): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (SILENT_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return null;
  if (path.startsWith("/monthly-ads/manage")) return flags.adsStarted ? "thanks-ads-plan" : null;
  if (path.startsWith("/status/")) return flags.careStarted ? "thanks-care-plan" : "chat-welcome";
  if (path.startsWith("/websites/") || path.startsWith("/examples/")) return "showcase";
  if (path === "/checkout" && product) {
    const slug = NFC_SLUG.test(product) ? "nfc-cards" : product;
    return CUE_IDS.includes(slug) ? slug : "checkout";
  }
  return PAGE_CUES[path] ?? null;
}
