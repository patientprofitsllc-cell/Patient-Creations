// Who gets to talk to the AI. The site's live AI conversation (Vanessa) costs real credits for every minute, so it is for
// people who are serious. A short form decides, with rules anyone can read here; everyone else gets free help (prices,
// examples, the Growth Audit) and loses nothing. Pure data and logic: safe in the browser, the server and tests.

export const NEEDS = [
  { id: "website", label: "A website", product: "website-special" },
  { id: "ads", label: "Ads or video", product: "ugc-ad-special" },
  { id: "cards", label: "Business Cards", product: "nfc-cards" },
  { id: "automation", label: "Automation or AI agents", product: "agents" },
  { id: "unsure", label: "Not sure yet", product: null },
] as const;

export const BUDGETS = [
  { id: "lt500", label: "Under 500 dollars" },
  { id: "500-2000", label: "500 to 2,000 dollars" },
  { id: "2000-5000", label: "2,000 to 5,000 dollars" },
  { id: "5000plus", label: "5,000 dollars or more" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export const TIMELINES = [
  { id: "now", label: "As soon as possible" },
  { id: "soon", label: "In the next 1 to 3 months" },
  { id: "exploring", label: "Just exploring" },
] as const;

export type NeedId = (typeof NEEDS)[number]["id"];
export type BudgetId = (typeof BUDGETS)[number]["id"];
export type TimelineId = (typeof TIMELINES)[number]["id"];

export const isNeed = (v: unknown): v is NeedId => NEEDS.some((n) => n.id === v);
export const isBudget = (v: unknown): v is BudgetId => BUDGETS.some((b) => b.id === v);
export const isTimeline = (v: unknown): v is TimelineId => TIMELINES.some((t) => t.id === v);

/**
 * Serious means: ready to act soon, with a real budget, and wanting something a conversation helps decide. Business Cards
 * alone are a $20 checkout and need no call, so they go straight to checkout instead of using AI credits.
 */
export function isSerious(a: { need: NeedId; budget: BudgetId; timeline: TimelineId }): boolean {
  if (a.timeline === "exploring") return false;
  if (a.budget === "lt500") return false;
  if (a.need === "cards") return false;
  return true;
}

export const productFor = (need: NeedId): string | null => NEEDS.find((n) => n.id === need)?.product ?? null;
