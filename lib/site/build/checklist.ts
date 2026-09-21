// The launch checklist for a customer's website. A site goes live only when every required line is true. Some lines are
// facts the system can check for itself (the customer approved this version, the order is paid in full, the automated checks
// passed). The rest are things only a person can confirm (it looks right on a phone, the phone number really dials), and the
// owner ticks them for the exact version being launched, so a new or restored version has to be looked at again.
// Pure (no database), so the rules are tested.

export const MANUAL_ITEMS = [
  { id: "phone-layout", text: "I opened the preview on a phone and it looks right" },
  { id: "phone-call", text: "I tapped the phone number and it dialed the right number" },
  { id: "facts", text: "The business name, hours, and address match what the customer told us" },
  { id: "live-opens", text: "I put the site file on the customer's hosting and the live address opens it" },
] as const;

export type ManualItemId = (typeof MANUAL_ITEMS)[number]["id"];
export const isManualItem = (v: unknown): v is ManualItemId => MANUAL_ITEMS.some((m) => m.id === v);

export interface ChecklistFacts {
  buildStatus: string;
  qaPassed: boolean;
  qaErrors: string[];
  /** Things the customer typed that did not reach the page. */
  missingFromPage: string[];
  orderStatus: string;
  balanceDueCents: number;
  intakeComplete: boolean;
  openRevision: boolean;
  /** The manual items the owner has ticked for this exact version. */
  ticked: string[];
}

export interface ChecklistLine {
  id: string;
  text: string;
  kind: "auto" | "manual";
  ok: boolean;
  /** A required line blocks launch. An advisory line is shown but does not. */
  required: boolean;
  detail?: string;
}

export interface Checklist {
  lines: ChecklistLine[];
  missing: ChecklistLine[];
  ready: boolean;
}

export function buildChecklist(f: ChecklistFacts): Checklist {
  const lines: ChecklistLine[] = [
    { id: "approved", text: "The customer approved this version", kind: "auto", required: true, ok: f.buildStatus === "APPROVED" || f.buildStatus === "LIVE", detail: f.buildStatus === "PREVIEW" ? "It is still waiting for their approval." : undefined },
    { id: "no-revision", text: "No change request is still open", kind: "auto", required: true, ok: !f.openRevision, detail: f.openRevision ? "The customer asked for a change that has not been done." : undefined },
    { id: "qa", text: "The automated checks passed", kind: "auto", required: true, ok: f.qaPassed, detail: f.qaPassed ? undefined : f.qaErrors.join("; ") || "The checks did not pass." },
    { id: "fidelity", text: "Everything the customer told us is on the page", kind: "auto", required: false, ok: f.missingFromPage.length === 0, detail: f.missingFromPage.length ? `Missing: ${f.missingFromPage.join(", ")}` : undefined },
    { id: "intake", text: "The customer finished their intake", kind: "auto", required: true, ok: f.intakeComplete },
    { id: "paid", text: "The order is paid in full", kind: "auto", required: true, ok: f.orderStatus === "PAID" && f.balanceDueCents <= 0, detail: f.balanceDueCents > 0 ? "The final payment has not been received." : f.orderStatus !== "PAID" ? "The order is not marked paid." : undefined },
    ...MANUAL_ITEMS.map((m): ChecklistLine => ({ id: m.id, text: m.text, kind: "manual", required: true, ok: f.ticked.includes(m.id) })),
  ];
  const missing = lines.filter((l) => l.required && !l.ok);
  return { lines, missing, ready: missing.length === 0 };
}

/** A sentence naming what is still missing, for an error message. */
export function missingSummary(c: Checklist): string {
  return c.missing.map((l) => l.text).join("; ");
}
