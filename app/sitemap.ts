import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { INDUSTRIES } from "@/lib/site/industries";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/websites`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...INDUSTRIES.map((i) => ({
      url: `${SITE_URL}/websites/${i.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/examples`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...INDUSTRIES.map((i) => ({
      url: `${SITE_URL}/examples/${i.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/agents`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/guided-app-tour`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
