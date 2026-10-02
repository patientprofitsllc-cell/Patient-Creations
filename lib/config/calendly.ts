export const CALENDLY_URL = "https://calendly.com/patientprofitsllc/30min";

/**
 * The builds that start with a kickoff call, as the welcome kit says: Cinematic AI Websites, Lead Engines, AI agents, and
 * software. Website Specials and the bundle start with the intake, single ads and Business Cards need no call, and a
 * Strategy Session books its own call at checkout.
 */
export const KICKOFF_SLUGS: readonly string[] = ["site", "lead-engine", "agents", "saas"];

export const needsKickoff = (orderSlugs: readonly string[]) => orderSlugs.some((s) => KICKOFF_SLUGS.includes(s));

/** The booking link with the buyer's name and email filled in, so the invite matches the order. */
export function kickoffUrlFor(name: string | null | undefined, email: string): string {
  const q = new URLSearchParams({ email });
  if (name?.trim()) q.set("name", name.trim());
  return `${CALENDLY_URL}?${q.toString()}`;
}
