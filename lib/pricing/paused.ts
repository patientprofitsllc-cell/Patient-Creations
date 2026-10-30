import { CALENDLY_URL } from "../config/calendly";

// Products that are temporarily not taking new orders. These are the AI builds that need a person to make and test
// them (the agent pipeline only plans them), paused while the owner is away at Air Force training. To start selling one
// again, remove it from this list and deploy: the catalog sync turns it back on and every page shows it again.
export const PAUSED_SLUGS: readonly string[] = [
  "agents",
  "saas",
  "agent-website-bundle",
  "agent-cinematic-bundle",
  "agent-lead-bundle",
  "everything-bundle",
];

export const isPaused = (slug: string) => PAUSED_SLUGS.includes(slug);

/** What a visitor sees instead of a buy button. */
export const PAUSED_NOTE = "Not taking new orders right now. Book a free call to get on the list.";
export const PAUSED_HREF = CALENDLY_URL;
