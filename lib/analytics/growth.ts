import { FUNNEL_EVENTS, type FunnelEvent } from "@/lib/analytics/funnel";

// The acquisition target is configuration, not code, so it can change without a
// deploy. Defaults match the current 21-day push.
export function getAcquisitionConfig(env: Record<string, string | undefined> = process.env) {
  const goal = Number(env.ACQUISITION_GOAL);
  const days = Number(env.ACQUISITION_DAYS);
  const start = env.ACQUISITION_START_DATE ? new Date(env.ACQUISITION_START_DATE) : new Date("2026-09-18T00:00:00");
  return {
    goal: Number.isFinite(goal) && goal > 0 ? Math.round(goal) : 200,
    days: Number.isFinite(days) && days > 0 ? Math.round(days) : 21,
    start: Number.isNaN(start.getTime()) ? new Date("2026-09-18T00:00:00") : start,
  };
}

const DAY_MS = 86_400_000;

export interface AcquisitionProgress {
  goal: number;
  current: number;
  remaining: number;
  /** Whole days since the start, 1 on the first day. */
  dayNumber: number;
  daysLeft: number;
  requiredPerDay: number;
  /** Actual average paying customers per elapsed day. */
  actualPerDay: number;
  /** If the pace so far simply continued to the end of the window. */
  projected: number;
  notStarted: boolean;
  ended: boolean;
}

/** Where the push stands, using only real counts. No assumption is made about future conversion. */
export function acquisitionProgress(cfg: { goal: number; days: number; start: Date }, current: number, now: Date): AcquisitionProgress {
  const elapsedMs = now.getTime() - cfg.start.getTime();
  const notStarted = elapsedMs < 0;
  const dayNumber = notStarted ? 0 : Math.min(cfg.days, Math.floor(elapsedMs / DAY_MS) + 1);
  const ended = !notStarted && elapsedMs >= cfg.days * DAY_MS;
  const daysLeft = notStarted ? cfg.days : Math.max(0, cfg.days - Math.floor(elapsedMs / DAY_MS));
  const remaining = Math.max(0, cfg.goal - current);
  const elapsedDays = Math.max(1, dayNumber);
  const actualPerDay = notStarted ? 0 : current / elapsedDays;
  return {
    goal: cfg.goal,
    current,
    remaining,
    dayNumber,
    daysLeft,
    requiredPerDay: daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining,
    actualPerDay,
    projected: Math.round(actualPerDay * cfg.days),
    notStarted,
    ended,
  };
}

/** The funnel in order, each stage with its share of the stage before it. */
export const FUNNEL_STAGES: FunnelEvent[] = [
  "landing_page_view",
  "offer_view",
  "checkout_started",
  "checkout_completed",
  "intake_started",
  "intake_completed",
  "production_started",
  "preview_created",
  "approved",
  "deployed",
];

// Events we can record today. The rest are defined but nothing emits them yet,
// and the dashboard says so rather than showing a misleading zero.
export const INSTRUMENTED: ReadonlySet<FunnelEvent> = new Set<FunnelEvent>([
  "landing_page_view",
  "offer_view",
  "checkout_started",
  "checkout_completed",
  "intake_started",
  "intake_completed",
  "production_started",
]);

export interface FunnelRow {
  event: FunnelEvent;
  count: number;
  instrumented: boolean;
  /** Percent of the previous instrumented stage, or null for the first stage / uninstrumented. */
  rateFromPrevious: number | null;
}

export function funnelRows(counts: Partial<Record<FunnelEvent, number>>): FunnelRow[] {
  let previous: number | null = null;
  return FUNNEL_STAGES.map((event) => {
    const instrumented = INSTRUMENTED.has(event);
    const count = counts[event] ?? 0;
    let rate: number | null = null;
    if (instrumented) {
      if (previous !== null && previous > 0) rate = Math.round((count / previous) * 1000) / 10;
      previous = count;
    }
    return { event, count, instrumented, rateFromPrevious: rate };
  });
}

export function isKnownEvent(name: string): name is FunnelEvent {
  return (FUNNEL_EVENTS as readonly string[]).includes(name);
}
