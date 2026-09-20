// Visitors we turn away, and tell not to come back. Two kinds:
//   1. Crawlers that collect web pages to train AI models. Well-behaved ones obey robots.txt; we also refuse them.
//   2. Website copiers, which download a whole site so it can be re-hosted or imitated.
// This is a deterrent, not a wall: a determined person can change their user agent, and anything a
// browser can display can be saved. It stops the automatic, careless copying, and it puts our refusal on record.
// Ordinary search engines (Google, Bing, and the like) and Stripe, Resend, and Twilio are never listed here.
// Pure and dependency free, so the edge middleware, robots.txt, and the tests all read the same list.

/** AI training and data-collection crawlers. The names are what they call themselves in robots.txt. */
export const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Meta-ExternalAgent",
  "Omgilibot",
  "Timpibot",
  "PerplexityBot",
  "Webzio-Extended",
] as const;

/** Programs whose whole job is to save a copy of a site. */
export const SITE_COPIERS = [
  "HTTrack",
  "WebCopier",
  "Cyotek",
  "SiteSucker",
  "WebZIP",
  "WebStripper",
  "Teleport",
  "Offline Explorer",
  "Website eXtractor",
  "SiteSnagger",
  "BlackWidow",
  "Scrapy",
  "MegaIndex",
] as const;

const BLOCKED = [...AI_TRAINING_BOTS, ...SITE_COPIERS].map((n) => n.toLowerCase());

/** True when a request's user agent names one of the crawlers or copiers above. */
export function isBlockedAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BLOCKED.some((name) => ua.includes(name));
}

export const BLOCKED_MESSAGE =
  "Automated copying of this site, and its use to train AI models, is not permitted. See https://patientcreations.com/copyright";
