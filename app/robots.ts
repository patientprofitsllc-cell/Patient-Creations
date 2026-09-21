import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { AI_TRAINING_BOTS } from "@/lib/security/scrapers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI training crawlers and their opt-out tokens are refused everywhere (see /copyright).
      { userAgent: [...AI_TRAINING_BOTS], disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/api", "/checkout", "/auth", "/status", "/intake", "/preview", "/monthly-ads/manage", "/monthly-ads/start", "/unsubscribe", "/audit/report", "/invoice"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
