// Pure constants/math only — no server imports — so this module is safe to
// import from client components too (the checkout form mirrors this exact
// formula for a live price preview; the server recomputes it independently
// in lib/payments/pricing.ts and never trusts the client's number).

export type DeliverySpeedKey = "standard" | "priority" | "express" | "immediate";

export interface DeliverySpeedOption {
  key: DeliverySpeedKey;
  label: string;
  days: string;
  /** Rush surcharge as a percentage of the primary build's price. */
  surchargePct: number;
}

export const DELIVERY_SPEEDS: DeliverySpeedOption[] = [
  { key: "standard", label: "Standard", days: "1-2 weeks", surchargePct: 0 },
  { key: "priority", label: "Priority", days: "6-7 days", surchargePct: 15 },
  { key: "express", label: "Express", days: "4-5 days", surchargePct: 30 },
  { key: "immediate", label: "Immediate", days: "3-4 days", surchargePct: 50 },
];

export function getDeliverySpeed(key: string): DeliverySpeedOption {
  return DELIVERY_SPEEDS.find((s) => s.key === key) ?? DELIVERY_SPEEDS[0];
}

// The max days each rush tier actually promises, used to guard against
// ever offering a paid "rush" tier that isn't genuinely faster than a
// product's own normal turnaround, or so much faster that it could not be kept.
// A rush must be done by the earliest the normal delivery could arrive, and may cut the
// worst-case time by at most half.
const MAX_RUSH_SPEEDUP = 0.5;
const RUSH_MAX_DAYS: Record<Exclude<DeliverySpeedKey, "standard">, number> = {
  priority: 7,
  express: 5,
  immediate: 4,
};

/**
 * Parses a free-text turnaround estimate ("3-5 days", "2-3 weeks", "72 hours", "60
 * minutes", "scoped on the call") into a worst-case day count. Returns null
 * when the estimate isn't a day/week duration at all (a call, or scoped
 * work) — rush pricing doesn't apply to those.
 */
export function parseTurnaroundMaxDays(turnaround?: string | null): number | null {
  return parseTurnaroundRangeDays(turnaround)?.max ?? null;
}

/** The fastest and slowest a turnaround estimate can be, in days ("1-2 weeks" is 7 to 14). */
export function parseTurnaroundRangeDays(turnaround?: string | null): { min: number; max: number } | null {
  if (!turnaround) return null;
  if (/minute|call/i.test(turnaround)) return null;
  const numbers = turnaround.match(/\d+/g)?.map(Number);
  if (!numbers || numbers.length === 0) return null;
  const toDays = (n: number) => (/hour/i.test(turnaround) ? Math.ceil(n / 24) : /week/i.test(turnaround) ? n * 7 : n);
  return { min: toDays(Math.min(...numbers)), max: toDays(Math.max(...numbers)) };
}

/**
 * Standard, plus only the rush tiers that are genuinely faster than this product's
 * own normal turnaround: done by the earliest it could arrive, but not by more than
 * half. A product already delivered in 3-5 days has no business being offered a paid
 * "Priority (6-7 days)" upgrade, a 3-6 day one no "Express (4-5 days)", and a 4 to 8
 * week app no "3-4 day" one.
 */
export function getApplicableSpeeds(turnaround?: string | null): DeliverySpeedOption[] {
  const range = parseTurnaroundRangeDays(turnaround);
  if (range === null) return [DELIVERY_SPEEDS[0]];
  const rush = DELIVERY_SPEEDS.filter(
    (s) => {
      const promised = RUSH_MAX_DAYS[s.key as Exclude<DeliverySpeedKey, "standard">];
      // Done by the earliest the normal delivery could arrive, but never more than twice as fast.
      return s.key !== "standard" && promised <= range.min && promised >= range.max * MAX_RUSH_SPEEDUP;
    },
  );
  return [DELIVERY_SPEEDS[0], ...rush];
}

/**
 * Rush fees scale with real queue load: the busier production is right now,
 * the more a guaranteed rush slot costs. Capped so a very deep queue can't
 * produce a runaway price. Standard is always free regardless of load.
 */
export function loadMultiplier(activeProjectCount: number): number {
  return 1 + Math.min(activeProjectCount, 10) * 0.03; // up to +30% at 10+ active builds
}

export function computeRushFeeCents(primaryPriceCents: number, speedKey: string, activeProjectCount: number): number {
  const speed = getDeliverySpeed(speedKey);
  if (speed.surchargePct === 0) return 0;
  const raw = primaryPriceCents * (speed.surchargePct / 100) * loadMultiplier(activeProjectCount);
  return Math.round(raw / 100) * 100; // round to the nearest dollar
}
