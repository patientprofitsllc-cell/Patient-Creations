import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { AI_TRAINING_BOTS } from "@/lib/security/scrapers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI training crawlers and their opt-out tokens are refused everywhere (see /copyright).
      { userAgent: [...AI_TRAINING_BOTS], disallow: "/" },
      // Pages people can reach from links (cart, showcase, owner setup) stay crawlable but are marked noindex, so Search
      // Console reports them as intentionally excluded rather than "blocked by robots.txt". Private and account areas stay blocked.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/api", "/checkout", "/auth", "/status", "/intake", "/preview", "/monthly-ads/manage", "/monthly-ads/start", "/unsubscribe", "/audit/report", "/invoice", "/partners/dashboard"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
