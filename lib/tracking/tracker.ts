import { businessDays } from "@/lib/payments/deliveryWindow";

// The logic behind the customer's tracking screen. It is pure (no database, no
// clock unless passed in) so every state can be tested. It only reports what
// has really happened, and it words the delivery target as a target.

export type StepState = "done" | "current" | "attention" | "upcoming";

export interface TrackerStep {
  key: string;
  label: string;
  state: StepState;
  at: Date | null;
  note?: string;
}

export interface Tracker {
  kind: "website" | "general";
  steps: TrackerStep[];
  headline: string;
  detail: string;
  /** 1-based number of the step the order is on (the last step once complete). */
  stepNumber: number;
  total: number;
  /** How far along, 0 to 100. */
  percent: number;
  complete: boolean;
  /** Something the customer needs to do next, if anything. */
  action: { kind: "intake" | "preview"; label: string } | null;
  /** The delivery expectation, worded as a target. `at` is set when there's a date. */
  target: { text: string; at: Date | null } | null;
  /** Who the ball is with right now. */
  waitingOn: "you" | "us" | "nobody";
}

const HOUR = 3_600_000;
export const TARGET_HOURS = 72;

function progress(steps: TrackerStep[]): number {
  const done = steps.filter((s) => s.state === "done").length;
  const active = steps.some((s) => s.state === "current" || s.state === "attention") ? 0.5 : 0;
  return Math.round(((done + active) / steps.length) * 100);
}

function stepNumberOf(steps: TrackerStep[]): number {
  const i = steps.findIndex((s) => s.state !== "done");
  return i === -1 ? steps.length : i + 1;
}

export interface WebsiteTrackerInput {
  orderPaid: boolean;
  paidAt: Date | null;
  intakeStatus: string | null;
  intakeCompletedAt: Date | null;
  productionStartedAt: Date | null;
  projectState: string;
  /** All versions of the site, oldest first. */
  builds: { status: string; version: number; createdAt: Date; approvedAt: Date | null; liveUrl?: string | null }[];
  openRevision: boolean;
  liveAt: Date | null;
  now?: Date;
}

export function websiteTracker(i: WebsiteTrackerInput): Tracker {
  const now = i.now ?? new Date();
  const latest = i.builds[i.builds.length - 1] ?? null;
  const intakeDone = i.intakeStatus === "COMPLETE";
  const previewReady = Boolean(latest);
  const approved = latest?.status === "APPROVED" || latest?.status === "LIVE";
  const live = latest?.status === "LIVE";
  const exception = i.projectState === "EXCEPTION";

  const steps: TrackerStep[] = [
    i.orderPaid
      ? { key: "order", label: "Order confirmed", state: "done", at: i.paidAt }
      : { key: "order", label: "Order confirmed", state: "current", at: null, note: "Waiting for payment to be confirmed" },
    !i.orderPaid
      ? { key: "info", label: "Your business info", state: "upcoming", at: null }
      : intakeDone
        ? { key: "info", label: "Your business info", state: "done", at: i.intakeCompletedAt }
        : { key: "info", label: "Your business info", state: "attention", at: null, note: "We need a few details from you" },
    !intakeDone
      ? { key: "build", label: "Building your website", state: "upcoming", at: null }
      : previewReady
        ? { key: "build", label: "Building your website", state: "done", at: i.builds[0].createdAt }
        : { key: "build", label: "Building your website", state: "current", at: null, note: exception ? "A person on our team is checking this one" : "Being built now" },
    !previewReady
      ? { key: "review", label: "Your review", state: "upcoming", at: null }
      : approved
        ? { key: "review", label: "Your review", state: "done", at: latest!.approvedAt }
        : i.openRevision
          ? { key: "review", label: "Your review", state: "current", at: null, note: "Your change is being made" }
          : { key: "review", label: "Your review", state: "attention", at: null, note: "Your preview is ready" },
    !approved
      ? { key: "live", label: "Live", state: "upcoming", at: null }
      : live
        ? { key: "live", label: "Live", state: "done", at: i.liveAt, note: latest?.liveUrl ?? undefined }
        : { key: "live", label: "Live", state: "current", at: null, note: "Approved, going live" },
  ];

  let headline: string;
  let detail: string;
  let action: Tracker["action"] = null;
  let waitingOn: Tracker["waitingOn"] = "us";

  if (live) {
    headline = "Your website is live";
    detail = "It's up and ready for customers.";
    waitingOn = "nobody";
  } else if (approved) {
    headline = "Approved, going live";
    detail = "You approved your website. We'll post here the moment it's live.";
  } else if (previewReady && i.openRevision) {
    headline = "Your change is being made";
    detail = "We'll post your updated preview here and email you as soon as it's ready.";
  } else if (previewReady) {
    headline = "Your preview is ready";
    detail = "Take a look, then approve it or ask for your included revision.";
    action = { kind: "preview", label: "View my preview" };
    waitingOn = "you";
  } else if (intakeDone) {
    headline = exception ? "Your build is getting a personal check" : "Your website is being built";
    detail = exception ? "Our team is looking at it and will update you on this page." : "We'll email you as soon as your preview is ready.";
  } else if (i.orderPaid) {
    headline = "We need your business info to start";
    detail = "It takes about 3 to 5 minutes, and you can skip anything you don't have.";
    action = { kind: "intake", label: "Finish your intake" };
    waitingOn = "you";
  } else {
    headline = "Confirming your payment";
    detail = "Your build starts as soon as your payment is confirmed.";
  }

  // The 72-hour target counts from when we received the customer's info.
  let target: Tracker["target"] = null;
  if (!live) {
    const start = i.productionStartedAt ?? i.intakeCompletedAt;
    if (!intakeDone || !start) {
      target = { at: null, text: `Our ${TARGET_HOURS}-hour target starts when we receive your business info.` };
    } else if (waitingOn === "you") {
      target = { at: null, text: "Approving your preview keeps things moving. Our target runs from when we received your info." };
    } else {
      const at = new Date(start.getTime() + TARGET_HOURS * HOUR);
      target =
        now.getTime() > at.getTime()
          ? { at, text: `Our ${TARGET_HOURS}-hour target has passed. Message us below and we'll tell you where things stand.` }
          : { at, text: "Our target" };
    }
  }

  return {
    kind: "website",
    steps,
    headline,
    detail,
    stepNumber: stepNumberOf(steps),
    total: steps.length,
    percent: live ? 100 : progress(steps),
    complete: live,
    action,
    target,
    waitingOn,
  };
}

export interface GeneralTrackerInput {
  orderPaid: boolean;
  paidAt: Date | null;
  projectState: string;
  turnaround: string | null;
  deliveredAt?: Date | null;
}

const GENERAL_LABELS = ["Order confirmed", "In production", "Quality checks", "Final review", "Delivered"];

const STATE_TO_STEP: Record<string, number> = {
  DRAFT: 1,
  PAID: 1,
  INTAKE_REQUIRED: 1,
  QUEUED: 1,
  RESEARCH: 1,
  STRATEGY: 1,
  CONCEPT: 1,
  GENERATION: 1,
  BUILD: 1,
  AUTOMATION: 1,
  QA: 2,
  PERCEPTION: 2,
  REVISION: 2,
  DELIVERY_READY: 3,
  DELIVERED: 5,
  REVIEW_REQUESTED: 5,
  COMPLETED: 5,
  EXCEPTION: 1,
};

/** A simpler tracker for orders that aren't a website build. */
export function generalTracker(i: GeneralTrackerInput): Tracker {
  const exception = i.projectState === "EXCEPTION";
  const at = i.orderPaid ? (STATE_TO_STEP[i.projectState] ?? 1) : 0;
  const complete = at >= 5;

  const steps: TrackerStep[] = GENERAL_LABELS.map((label, idx) => {
    if (idx < at) return { key: `s${idx}`, label, state: "done", at: idx === 0 ? i.paidAt : idx === 4 ? (i.deliveredAt ?? null) : null };
    if (idx === at) return { key: `s${idx}`, label, state: "current", at: null, note: exception && idx === 1 ? "A person on our team is checking this one" : undefined };
    return { key: `s${idx}`, label, state: "upcoming", at: null };
  });
  if (complete) steps[4] = { ...steps[4], state: "done" };

  const headlines = ["Confirming your payment", "Your order is in production", "Running quality checks", "Final review", "Delivered"];
  const details = [
    "Your build starts as soon as your payment is confirmed.",
    exception ? "Our team is looking at it and will update you on this page." : "The team is working on it. Updates appear below as they happen.",
    "We check that everything works properly before you see it.",
    "One last look before it's delivered to you.",
    "Check your email and your portal for access details.",
  ];
  const idx = Math.min(4, at);
  const total = steps.length;
  const percent = complete ? 100 : Math.round(((at + 0.5) / total) * 100);

  return {
    kind: "general",
    steps,
    headline: exception && !complete ? "Your order is getting a personal check" : headlines[idx],
    detail: details[idx],
    stepNumber: complete ? total : at + 1,
    total,
    percent,
    complete,
    action: null,
    target: !complete && i.turnaround ? { at: null, text: `Estimated delivery: ${businessDays(i.turnaround)}` } : null,
    waitingOn: complete ? "nobody" : "us",
  };
}
