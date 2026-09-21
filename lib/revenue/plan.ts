import { PRICE_CENTS, TARGET, TIER_PRICE_OVERRIDES, type PricedSlug } from "@/lib/pricing/catalog";

// The planning model. A calculator for "what would it take", not a forecast. It is always called a Planning Scenario, never
// expected revenue and never guaranteed revenue. The quantities below are the example from the founder's plan; the prices
// are TODAY'S prices from the price list, so the total shows what that example is really worth at current prices. Pure.

export const PLAN_LABEL = "Planning Scenario";
export const PLAN_DISCLAIMER = "A Planning Scenario is arithmetic on numbers you choose. It is not expected revenue, and it is not guaranteed revenue.";

export interface PlanLine {
  id: string;
  label: string;
  /** "one-time" lines are sold once per unit; "monthly" lines repeat every month (a plan). */
  kind: "one-time" | "monthly";
  slug?: PricedSlug;
  quantity: number;
  unitCents: number;
}

const leadEngineGrowth = TIER_PRICE_OVERRIDES["lead-engine"]?.Signature ?? PRICE_CENTS["lead-engine"];

/** The example scenario, with quantities from the founder's plan and prices from the price list. */
export function exampleScenario(): PlanLine[] {
  return [
    { id: "websites", label: "Quick Business Websites", kind: "one-time", slug: "starter-website", quantity: 30, unitCents: PRICE_CENTS["starter-website"] },
    { id: "bundles", label: "Launch Bundles", kind: "one-time", slug: "all-in-one-bundle", quantity: 10, unitCents: PRICE_CENTS["all-in-one-bundle"] },
    { id: "ads", label: "Monthly Ads (Growth plan)", kind: "monthly", slug: "ads-monthly-500", quantity: 40, unitCents: PRICE_CENTS["ads-monthly-500"] },
    { id: "cinematic", label: "Cinematic Websites", kind: "one-time", slug: "site", quantity: 8, unitCents: PRICE_CENTS.site },
    { id: "lead", label: "Lead Engines (Growth tier)", kind: "one-time", slug: "lead-engine", quantity: 5, unitCents: leadEngineGrowth },
    { id: "agents", label: "AI and Multi-Agent builds", kind: "one-time", slug: "agents", quantity: 2, unitCents: PRICE_CENTS.agents },
    { id: "other", label: "Additional products (a total, in cents)", kind: "one-time", quantity: 1, unitCents: 1_000_000 },
  ];
}

export interface PlanResult {
  lines: { id: string; label: string; kind: PlanLine["kind"]; quantity: number; unitCents: number; totalCents: number }[];
  oneTimeCents: number;
  monthlyCents: number;
  totalCents: number;
  targetCents: number;
  /** Positive: how far short of the target. Zero or negative: at or past it. */
  gapCents: number;
  percentOfTarget: number;
}

const clampInt = (n: number, max: number) => (Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : 0);

/** Adds the scenario up. Bad numbers count as zero, and everything is capped so a typo cannot make nonsense. */
export function computePlan(lines: PlanLine[], targetCents: number = TARGET.monthlyRevenueCents): PlanResult {
  const out = lines.map((l) => {
    const quantity = clampInt(l.quantity, 100_000);
    const unitCents = clampInt(l.unitCents, 1_000_000_000);
    return { id: l.id, label: l.label, kind: l.kind, quantity, unitCents, totalCents: quantity * unitCents };
  });
  const oneTimeCents = out.filter((l) => l.kind === "one-time").reduce((s, l) => s + l.totalCents, 0);
  const monthlyCents = out.filter((l) => l.kind === "monthly").reduce((s, l) => s + l.totalCents, 0);
  const totalCents = oneTimeCents + monthlyCents;
  return { lines: out, oneTimeCents, monthlyCents, totalCents, targetCents, gapCents: targetCents - totalCents, percentOfTarget: targetCents > 0 ? Math.round((totalCents / targetCents) * 1000) / 10 : 0 };
}

export interface GapSuggestion {
  label: string;
  extraUnits: number;
}

/** If the scenario falls short, how many more of each line would close the gap on its own. Nothing is recommended, only shown. */
export function gapSuggestions(result: PlanResult): GapSuggestion[] {
  if (result.gapCents <= 0) return [];
  return result.lines
    .filter((l) => l.unitCents > 0 && l.id !== "other")
    .map((l) => ({ label: l.label, extraUnits: Math.ceil(result.gapCents / l.unitCents) }))
    .sort((a, b) => a.extraUnits - b.extraUnits)
    .slice(0, 3);
}

/** Where this month really stands against the scenario, using only real numbers. */
export function actualVsPlan(actualOneTimeCents: number, actualMonthlyCents: number, plan: PlanResult): { actualCents: number; percentOfPlan: number; percentOfTarget: number } {
  const actualCents = actualOneTimeCents + actualMonthlyCents;
  return {
    actualCents,
    percentOfPlan: plan.totalCents > 0 ? Math.round((actualCents / plan.totalCents) * 1000) / 10 : 0,
    percentOfTarget: plan.targetCents > 0 ? Math.round((actualCents / plan.targetCents) * 1000) / 10 : 0,
  };
}
