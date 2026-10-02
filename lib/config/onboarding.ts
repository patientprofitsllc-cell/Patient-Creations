// The client onboarding kit every buyer receives: welcome doc, invoice terms, agreement, intake, access checklist,
// kickoff, project page, and handover. It lives as a shared canvas; set NEXT_PUBLIC_ONBOARDING_KIT_URL to move it.
// The link must be shared (Share › anyone with the link) or customers will see a sign-in page instead of the kit.
export const ONBOARDING_KIT_URL: string =
  process.env.NEXT_PUBLIC_ONBOARDING_KIT_URL?.trim() || "https://claude.ai/artifact/QGfaHjjVxdLFsMrYqaqxbm";
