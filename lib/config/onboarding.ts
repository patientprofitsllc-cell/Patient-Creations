import { SITE_URL } from "@/lib/config/site";

// The client onboarding kit every buyer receives: welcome doc, sample invoice and terms, agreement, intake, access
// checklist, kickoff, project page, and handover. It is a static page on our own site (public/welcome-kit/), so customers
// open it with no sign-in. Set NEXT_PUBLIC_ONBOARDING_KIT_URL to point somewhere else.
export const ONBOARDING_KIT_PATH = "/welcome-kit/index.html";
export const ONBOARDING_KIT_URL: string = process.env.NEXT_PUBLIC_ONBOARDING_KIT_URL?.trim() || `${SITE_URL}${ONBOARDING_KIT_PATH}`;
