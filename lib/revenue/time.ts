// Calendar days, weeks, and months in the business's own time zone, so "today" and "this month" mean the owner's today and
// this month and not Greenwich's. Pure, and it follows daylight saving time.

export const BUSINESS_TZ = "America/New_York";

interface Parts {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

function partsIn(date: Date, tz: string): Parts {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p: Record<string, number> = {};
  for (const x of f.formatToParts(date)) if (x.type !== "literal") p[x.type] = Number(x.value);
  return { y: p.year, m: p.month, d: p.day, h: p.hour % 24, mi: p.minute, s: p.second };
}

/** How far ahead of UTC the zone is at that instant, in milliseconds (negative in the Americas). */
function offsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant a wall-clock time (year, month, day, 00:00 unless given) happens in the zone. */
function zonedInstant(y: number, m: number, d: number, tz: string, h = 0): Date {
  const guess = Date.UTC(y, m - 1, d, h);
  let t = guess - offsetMs(new Date(guess), tz);
  t = guess - offsetMs(new Date(t), tz); // once more, in case the first guess landed across a clock change
  return new Date(t);
}

export function startOfDay(date: Date, tz = BUSINESS_TZ): Date {
  const p = partsIn(date, tz);
  return zonedInstant(p.y, p.m, p.d, tz);
}

/** The start of the day `n` days before the day containing `date` (n may be negative for after). */
export function startOfDayMinus(date: Date, n: number, tz = BUSINESS_TZ): Date {
  const p = partsIn(date, tz);
  const shifted = new Date(Date.UTC(p.y, p.m - 1, p.d - n));
  return zonedInstant(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(), tz);
}

/** The start of the month containing `date`, moved by `monthsBack` months. */
export function startOfMonth(date: Date, monthsBack = 0, tz = BUSINESS_TZ): Date {
  const p = partsIn(date, tz);
  const shifted = new Date(Date.UTC(p.y, p.m - 1 - monthsBack, 1));
  return zonedInstant(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1, tz);
}

/** "2026-09" for the month containing the date. */
export function monthKey(date: Date, tz = BUSINESS_TZ): string {
  const p = partsIn(date, tz);
  return `${p.y}-${String(p.m).padStart(2, "0")}`;
}

/** "2026-09-21" for the day containing the date. */
export function dayKey(date: Date, tz = BUSINESS_TZ): string {
  const p = partsIn(date, tz);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

export const isMonthKey = (v: unknown): v is string => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
