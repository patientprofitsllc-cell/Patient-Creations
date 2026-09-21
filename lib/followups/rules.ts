// When a follow-up is due, and every reason one must not go out. Pure, so each rule is tested directly.
//
// The kinds, in the order a person meets them:
//   audit_followup_1     2 days after a growth audit: "any questions?"
//   audit_followup_2     6 days after: a short last note
//   abandoned_checkout   2 hours to 3 days after checkout was started and not paid: a reminder, no discount
//   checkin_7d           7 days after a project was delivered: "how is everything going?"
//   recommend_30d        30 days after delivery: what fits next (only if the ladder has something)
//
// Nobody gets more than one follow-up within MIN_GAP_DAYS, nobody gets the same one twice, and the owner is
// always the one who sends (or turns on the secured trigger).

export const FOLLOWUP_KINDS = ["audit_followup_1", "audit_followup_2", "abandoned_checkout", "checkin_7d", "recommend_30d"] as const;
export type FollowupKind = (typeof FOLLOWUP_KINDS)[number];

export const FOLLOWUP_LABELS: Record<FollowupKind, string> = {
  audit_followup_1: "Audit follow-up (2 days)",
  audit_followup_2: "Audit last note (6 days)",
  abandoned_checkout: "Unfinished checkout",
  checkin_7d: "Check-in (7 days after delivery)",
  recommend_30d: "What fits next (30 days after delivery)",
};

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

/** After the anchor moment, how long until due, and how long it stays worth sending. A late "how is it going?" or a
 *  "last note" weeks after the fact would be odd, so each one expires. */
export const TIMING: Record<FollowupKind, { afterMs: number; expiresAfterMs?: number }> = {
  audit_followup_1: { afterMs: 2 * DAY, expiresAfterMs: 14 * DAY },
  audit_followup_2: { afterMs: 6 * DAY, expiresAfterMs: 21 * DAY },
  abandoned_checkout: { afterMs: 2 * HOUR, expiresAfterMs: 3 * DAY },
  checkin_7d: { afterMs: 7 * DAY, expiresAfterMs: 21 * DAY },
  recommend_30d: { afterMs: 30 * DAY, expiresAfterMs: 90 * DAY },
};

/** A follow-up is never sent to someone who got another one this recently. */
export const MIN_GAP_DAYS = 2;

export const dueAt = (kind: FollowupKind, anchor: Date): Date => new Date(anchor.getTime() + TIMING[kind].afterMs);

export function isDue(kind: FollowupKind, anchor: Date, now: Date): boolean {
  const t = TIMING[kind];
  const age = now.getTime() - anchor.getTime();
  if (age < t.afterMs) return false;
  if (t.expiresAfterMs !== undefined && age > t.expiresAfterMs) return false;
  return true;
}

export interface BlockInput {
  kind: FollowupKind;
  optedOut: boolean;
  /** Already on the prospect do-not-contact list. */
  doNotContact?: boolean;
  /** The same follow-up was already sent for this same thing. */
  alreadySent: boolean;
  /** When this person last got any follow-up. */
  lastFollowupAt: Date | null;
  now: Date;
  /** A mailing address is configured (marketing email requires one). */
  hasAddress: boolean;
  /** They have bought since this began, so a nudge to buy would be wrong. */
  purchased?: boolean;
  /** A follow-up that must come first has not been sent yet. */
  waitingOn?: FollowupKind | null;
}

/** Why this follow-up must not go out right now, in plain words, or null if it may. */
export function blockedReason(i: BlockInput): string | null {
  if (i.optedOut) return "They asked not to get these emails.";
  if (i.doNotContact) return "They are on the do-not-contact list.";
  if (i.alreadySent) return "This one was already sent.";
  if (!i.hasAddress) return "Add your business mailing address first (OUTREACH_MAILING_ADDRESS). Marketing email needs one by law.";
  if (i.purchased && (i.kind === "audit_followup_1" || i.kind === "audit_followup_2" || i.kind === "abandoned_checkout")) return "They already bought, so this would be out of place.";
  if (i.waitingOn) return `Send "${FOLLOWUP_LABELS[i.waitingOn]}" first.`;
  if (i.lastFollowupAt && i.now.getTime() - i.lastFollowupAt.getTime() < MIN_GAP_DAYS * DAY) {
    const days = Math.ceil((MIN_GAP_DAYS * DAY - (i.now.getTime() - i.lastFollowupAt.getTime())) / DAY);
    return `They got a follow-up recently. Wait about ${days} more day${days === 1 ? "" : "s"}.`;
  }
  return null;
}

/** For an audit lead: which of the two audit follow-ups comes next, given what was already sent. */
export function nextAuditKind(sent: { first: boolean; second: boolean }): FollowupKind | null {
  if (sent.second) return null;
  return sent.first ? "audit_followup_2" : "audit_followup_1";
}
