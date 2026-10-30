import { CALENDLY_URL } from "../config/calendly";

// Products that stop taking new orders while the owner is away at Air Force training: the AI builds that need a person
// to make and test them (the agent pipeline only plans them).
//
// OFF until the owner switches it on, in May before leaving: set NEXT_PUBLIC_PAUSE_AI_BUILDS=true in Netlify's
// environment variables and deploy. The deploy's catalog sync then takes these off sale and every page shows them as
// paused. To resume, remove the variable (or set it to anything else) and deploy again.
export const PAUSED_SLUGS: readonly string[] = [
  "agents",
  "saas",
  "agent-website-bundle",
  "agent-cinematic-bundle",
  "agent-lead-bundle",
  "everything-bundle",
];

/** Whether the pause is switched on. Read literally from process.env so Next.js also builds it into browser code. */
export const pauseOn = () => process.env.NEXT_PUBLIC_PAUSE_AI_BUILDS === "true";

export const isPaused = (slug: string) => pauseOn() && PAUSED_SLUGS.includes(slug);

/** What a visitor sees instead of a buy button. */
export const PAUSED_NOTE = "Not taking new orders right now. Book a free call to get on the list.";
export const PAUSED_HREF = CALENDLY_URL;
