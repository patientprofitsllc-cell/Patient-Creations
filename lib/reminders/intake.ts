import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/provider";
import { intakeUrlFor } from "@/lib/intake/url";
import { statusUrlFor } from "@/lib/projects/statusToken";

// Reminders for customers who paid but haven't finished their intake, which is
// the point where a paid order most easily stalls. A person triggers them from
// the admin page, so nothing runs in the background and nothing is sent on its
// own. To stay polite there is a minimum gap between reminders and a hard cap.

export const REMINDER_MIN_HOURS = 24;
export const MAX_REMINDERS = 3;

const HOUR = 3_600_000;

export interface ReminderState {
  reminderCount: number;
  lastReminderAt: Date | null;
  paidAt: Date | null;
}

/** Why a reminder can't go out right now, or null if it can. */
export function reminderBlockedReason(s: ReminderState, now: Date): string | null {
  if (s.reminderCount >= MAX_REMINDERS) return `Already sent ${MAX_REMINDERS} reminders. A phone call is the next step.`;
  const since = s.lastReminderAt ?? s.paidAt;
  if (since && now.getTime() - since.getTime() < REMINDER_MIN_HOURS * HOUR) {
    const hoursLeft = Math.ceil((REMINDER_MIN_HOURS * HOUR - (now.getTime() - since.getTime())) / HOUR);
    return s.lastReminderAt ? `Reminded recently. Next reminder in about ${hoursLeft}h.` : `Only just paid. First reminder in about ${hoursLeft}h.`;
  }
  return null;
}

/** Paid website orders still waiting on the customer, with whether a reminder is allowed now. */
export async function reminderCandidates(now = new Date()) {
  const rows = await db.websiteIntake.findMany({
    where: { status: "STARTED", order: { status: "PAID" } },
    select: {
      id: true,
      businessName: true,
      reminderCount: true,
      lastReminderAt: true,
      order: { select: { paidAt: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return rows.map((r) => {
    const paidAt = r.order.paidAt;
    return {
      id: r.id,
      businessName: r.businessName,
      reminderCount: r.reminderCount,
      lastReminderAt: r.lastReminderAt,
      paidAt,
      blockedReason: reminderBlockedReason({ reminderCount: r.reminderCount, lastReminderAt: r.lastReminderAt, paidAt }, now),
    };
  });
}

export type ReminderResult = { ok: true; number: number } | { ok: false; reason: string };

/**
 * Sends one reminder. The count is claimed atomically before sending, so two
 * clicks can't send two emails, and it is rolled back if the email fails so a
 * failed send doesn't use up one of the customer's three.
 */
export async function sendIntakeReminder(intakeId: string, now = new Date()): Promise<ReminderResult> {
  const row = await db.websiteIntake.findUnique({
    where: { id: intakeId },
    include: { order: { include: { project: true, customer: { include: { user: true } } } } },
  });
  if (!row) return { ok: false, reason: "Not found" };
  if (row.status !== "STARTED") return { ok: false, reason: "They've already finished their intake" };
  if (row.order.status !== "PAID") return { ok: false, reason: "The order isn't paid yet" };

  const blocked = reminderBlockedReason({ reminderCount: row.reminderCount, lastReminderAt: row.lastReminderAt, paidAt: row.order.paidAt }, now);
  if (blocked) return { ok: false, reason: blocked };

  const cutoff = new Date(now.getTime() - REMINDER_MIN_HOURS * HOUR);
  const claim = await db.websiteIntake.updateMany({
    where: {
      id: row.id,
      status: "STARTED",
      reminderCount: row.reminderCount,
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: cutoff } }],
    },
    data: { reminderCount: { increment: 1 }, lastReminderAt: now },
  });
  if (claim.count === 0) return { ok: false, reason: "A reminder was just sent" };

  const number = row.reminderCount + 1;
  const result = await sendEmail(row.order.customer.user.email, "intake_reminder", {
    projectName: row.order.project?.name ?? row.businessName,
    intakeUrl: intakeUrlFor(row.token),
    statusUrl: row.order.project?.statusToken ? statusUrlFor(row.order.project.statusToken) : undefined,
    last: number >= MAX_REMINDERS,
  });

  if (!result.ok) {
    await db.websiteIntake.updateMany({ where: { id: row.id }, data: { reminderCount: row.reminderCount, lastReminderAt: row.lastReminderAt } });
    return { ok: false, reason: `The email couldn't be sent (${result.error ?? "unknown error"})` };
  }
  return { ok: true, number };
}

/** Sends every reminder that is allowed right now. Sequential, capped, and reports what happened. */
export async function sendAllDueReminders(now = new Date()) {
  const due = (await reminderCandidates(now)).filter((c) => !c.blockedReason).slice(0, 50);
  let sent = 0;
  const failures: string[] = [];
  for (const c of due) {
    const r = await sendIntakeReminder(c.id, now);
    if (r.ok) sent++;
    else failures.push(`${c.businessName}: ${r.reason}`);
  }
  return { attempted: due.length, sent, failures };
}
