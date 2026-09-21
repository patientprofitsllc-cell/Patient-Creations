import { PRICE_CENTS } from "@/lib/pricing/catalog";
import { collectedCents } from "@/lib/payments/deposit";

// The sales pipeline, as rules. Eleven stages from a stranger to a customer who sends you more customers:
//
//   NEW LEAD > CONTACTED > AUDIT SENT > DISCOVERY > PROPOSAL > PAYMENT > ONBOARDING > DELIVERY > UPSELL > RETAINED > REFERRAL
//
// Before a sale, a person's stage comes from what has happened (you contacted them, they paid for an audit, they replied)
// and from what you set by hand (a proposal is something only you know you sent). After a sale, the stage is worked out
// from real records: the order, the project, the subscription, the referrals. Nothing here invents a number: a value
// or a chance that you did not set is labeled as a default or an estimate, never presented as a forecast.
// Pure (no database), so every rule is tested.

export const STAGES = [
  { key: "NEW_LEAD", label: "New lead", side: "before", chance: 5, hint: "Someone who might buy. Nothing sent yet." },
  { key: "CONTACTED", label: "Contacted", side: "before", chance: 10, hint: "You have reached out." },
  { key: "AUDIT_SENT", label: "Audit sent", side: "before", chance: 20, hint: "They paid for a Growth Audit and have the report." },
  { key: "DISCOVERY", label: "Discovery", side: "before", chance: 40, hint: "They replied or booked a call. Learn what they need." },
  { key: "PROPOSAL", label: "Proposal", side: "before", chance: 55, hint: "You sent a quote or a plan." },
  { key: "PAYMENT", label: "Payment", side: "before", chance: 80, hint: "They said yes. The money has not arrived yet." },
  { key: "ONBOARDING", label: "Onboarding", side: "after", chance: 100, hint: "Paid. Intake and kickoff." },
  { key: "DELIVERY", label: "Delivery", side: "after", chance: 100, hint: "Being built, reviewed, or waiting on the final payment." },
  { key: "UPSELL", label: "Upsell", side: "after", chance: 100, hint: "Delivered. Time to offer the next step." },
  { key: "RETAINED", label: "Retained", side: "after", chance: 100, hint: "On a monthly plan." },
  { key: "REFERRAL", label: "Referral", side: "after", chance: 100, hint: "Has sent you a paying customer." },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
export const STAGE_KEYS = STAGES.map((s) => s.key) as StageKey[];
/** The stages you can set by hand on a prospect. After a sale, the stage comes from the records. */
export const BEFORE_SALE_KEYS = STAGES.filter((s) => s.side === "before").map((s) => s.key) as StageKey[];

export const stageIndex = (k: StageKey) => STAGE_KEYS.indexOf(k);
export const stageInfo = (k: StageKey) => STAGES[stageIndex(k)];
export const isStageKey = (v: unknown): v is StageKey => typeof v === "string" && (STAGE_KEYS as string[]).includes(v);
export const isBeforeSaleKey = (v: unknown): v is StageKey => typeof v === "string" && (BEFORE_SALE_KEYS as string[]).includes(v);

const later = (a: StageKey, b: StageKey): StageKey => (stageIndex(a) >= stageIndex(b) ? a : b);
const DAY = 86_400_000;
/** A lead with no contact for this long is going cold. */
export const STALE_DAYS = 14;

export type ValueSource = "yours" | "audit" | "catalog" | "none";

// ---------------------------------------------------------------------------------------------------------------------
// before a sale

export interface ProspectFacts {
  id: string;
  businessName: string;
  email: string | null;
  source: string | null;
  /** The outreach status the rest of the system uses. */
  status: string;
  /** A stage you set by hand. */
  stage: string | null;
  contactedAt: Date | null;
  lastContactAt: Date | null;
  createdAt: Date;
  nextFollowUpAt: Date | null;
  nextAction: string | null;
  valueCents: number | null;
  probability: number | null;
  productInterest: string | null;
  /** They paid for a Growth Audit, and the analyst's top recommendation, if there is one. */
  paidAudit: { primarySlug: string | null } | null;
}

/** A prospect is "open" on the board; won ones have become customers, lost and do-not-contact ones are off it. */
export function prospectOutcome(status: string): "open" | "won" | "lost" | "blocked" {
  if (status === "WON") return "won";
  if (status === "LOST") return "lost";
  if (status === "DO_NOT_CONTACT") return "blocked";
  return "open";
}

/** The stage the facts say, and the stage you set by hand: whichever is further along wins. */
export function prospectStage(f: Pick<ProspectFacts, "status" | "stage" | "contactedAt" | "paidAudit">): StageKey {
  let auto: StageKey = "NEW_LEAD";
  if (f.status === "CONTACTED" || f.contactedAt) auto = later(auto, "CONTACTED");
  if (f.paidAudit) auto = later(auto, "AUDIT_SENT");
  if (f.status === "REPLIED" || f.status === "CALL_BOOKED") auto = later(auto, "DISCOVERY");
  return isBeforeSaleKey(f.stage) ? later(auto, f.stage) : auto;
}

const clampChance = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

const DEFAULT_ACTION: Record<string, string> = {
  NEW_LEAD: "Check their website and send a first message",
  CONTACTED: "Follow up if they have not replied",
  AUDIT_SENT: "Call them about the audit",
  DISCOVERY: "Learn what they need, then send a proposal",
  PROPOSAL: "Follow up on the proposal",
  PAYMENT: "Send the pay link and confirm the payment",
};

// ---------------------------------------------------------------------------------------------------------------------
// after a sale

export interface CustomerFacts {
  id: string;
  name: string;
  email: string;
  /** Where they came from: the first order's campaign, a referral, or the prospect record that became them. */
  source: string | null;
  createdAt: Date;
  orders: { status: string; totalCents: number; balanceDueCents: number; createdAt: Date; intakePending: boolean }[];
  projects: { state: string }[];
  /** Monthly plans that are active, in cents a month. */
  monthlyCents: number;
  activePlans: number;
  /** Referred customers who have paid. */
  referralPurchases: number;
  lastNoteAt: Date | null;
  /** The next product the ladder suggests, by name. */
  suggestedOffer: string | null;
}

const FINISHED = ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED", "CANCELLED"];
const EARLY = ["DRAFT", "PAID", "INTAKE_REQUIRED", "QUEUED", "RESEARCH", "STRATEGY"];

/** null means they are not in the pipeline yet: an account that has not ordered anything. */
export function customerStage(f: Pick<CustomerFacts, "orders" | "projects" | "activePlans" | "referralPurchases">): StageKey | null {
  const paid = f.orders.filter((o) => o.status === "PAID");
  if (paid.length === 0) return f.orders.some((o) => o.status === "PENDING") ? "PAYMENT" : null;

  const active = f.projects.filter((p) => !FINISHED.includes(p.state));
  if (active.length > 0) {
    const stages = active.map((p) => (EARLY.includes(p.state) ? "ONBOARDING" : "DELIVERY") as StageKey);
    return stages.reduce(later);
  }
  let stage: StageKey = f.activePlans > 0 ? "RETAINED" : "UPSELL";
  if (f.referralPurchases > 0) stage = "REFERRAL";
  return stage;
}

// ---------------------------------------------------------------------------------------------------------------------
// the cards

export interface CrmCard {
  key: string;
  kind: "prospect" | "customer";
  name: string;
  email: string | null;
  stage: StageKey;
  source: string | null;
  productInterest: string | null;
  valueCents: number;
  valueSource: ValueSource;
  /** Percent. Yours if you set it, otherwise the stage's default. Not a forecast. */
  chance: number;
  chanceIsDefault: boolean;
  weightedCents: number;
  nextAction: string;
  nextActionAt: Date | null;
  overdue: boolean;
  stale: boolean;
  lastContactAt: Date | null;
  /** Cash collected from this customer so far. */
  ltvCents: number;
  mrrCents: number;
  referrals: number;
  badges: string[];
  href: string;
}

export function buildProspectCard(f: ProspectFacts, now = new Date()): CrmCard {
  const stage = prospectStage(f);
  const interest = f.productInterest ?? f.paidAudit?.primarySlug ?? null;
  let valueCents = 0;
  let valueSource: ValueSource = "none";
  if (f.valueCents != null) {
    valueCents = f.valueCents;
    valueSource = "yours";
  } else if (interest && interest in PRICE_CENTS) {
    valueCents = PRICE_CENTS[interest as keyof typeof PRICE_CENTS];
    valueSource = f.productInterest ? "catalog" : "audit";
  }
  const chanceIsDefault = f.probability == null;
  const chance = chanceIsDefault ? stageInfo(stage).chance : clampChance(f.probability!);
  const last = f.lastContactAt ?? f.contactedAt ?? null;
  const since = last ?? f.createdAt;
  const badges: string[] = [];
  if (f.paidAudit) badges.push("Paid for an audit");
  const overdue = Boolean(f.nextFollowUpAt && f.nextFollowUpAt.getTime() <= now.getTime());
  const stale = now.getTime() - since.getTime() > STALE_DAYS * DAY;
  return {
    key: `prospect:${f.id}`,
    kind: "prospect",
    name: f.businessName,
    email: f.email,
    stage,
    source: f.source,
    productInterest: interest,
    valueCents,
    valueSource,
    chance,
    chanceIsDefault,
    weightedCents: Math.round((valueCents * chance) / 100),
    nextAction: f.nextAction?.trim() || DEFAULT_ACTION[stage],
    nextActionAt: f.nextFollowUpAt,
    overdue,
    stale,
    lastContactAt: last,
    ltvCents: 0,
    mrrCents: 0,
    referrals: 0,
    badges,
    href: `/admin/prospects/${f.id}`,
  };
}

/** What to do next for a customer, from their real records. */
export function customerNextAction(f: CustomerFacts, stage: StageKey): string {
  const unpaid = f.orders.find((o) => o.status === "PENDING");
  if (stage === "PAYMENT" && unpaid) return "Payment has not arrived. Follow up, or confirm it in Orders if it came another way";
  const owes = f.orders.some((o) => o.status === "PAID" && o.balanceDueCents > 0);
  const stuck = f.projects.some((p) => p.state === "EXCEPTION");
  if (stuck) return "A build needs attention. Open Production";
  if (owes && stage === "DELIVERY") return "The final payment is due before delivery. Check Invoices";
  if (stage === "ONBOARDING") return f.orders.some((o) => o.intakePending) ? "Their intake is not finished. Nudge them" : "Confirm the kickoff and what they need";
  if (stage === "DELIVERY") return "Being built. Nothing to do unless it stalls";
  if (stage === "UPSELL") return f.suggestedOffer ? `Offer ${f.suggestedOffer}` : "Ask how it is going, and for a review";
  if (stage === "RETAINED") return "Ask for a review or a referral";
  if (stage === "REFERRAL") return "Thank them and check their referral payout";
  return "Follow up";
}

export function buildCustomerCard(f: CustomerFacts, now = new Date()): CrmCard | null {
  const stage = customerStage(f);
  if (!stage) return null;
  const paid = f.orders.filter((o) => o.status === "PAID");
  const ltvCents = paid.reduce((s, o) => s + collectedCents(o), 0);
  // What an unpaid order is worth is what was ordered. After payment the value is what they have paid, shown as lifetime value.
  const pending = f.orders.filter((o) => o.status === "PENDING").reduce((s, o) => s + o.totalCents, 0);
  const inPayment = stage === "PAYMENT";
  const owed = paid.reduce((s, o) => s + o.balanceDueCents, 0);
  const lastOrder = f.orders.reduce<Date | null>((m, o) => (!m || o.createdAt > m ? o.createdAt : m), null);
  const last = [f.lastNoteAt, lastOrder].filter((d): d is Date => Boolean(d)).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const badges: string[] = [];
  if (owed > 0) badges.push("Balance owed");
  if (f.activePlans > 0) badges.push("Monthly plan");
  if (f.referralPurchases > 0) badges.push(`${f.referralPurchases} referral${f.referralPurchases === 1 ? "" : "s"} paid`);
  const chance = stageInfo(stage).chance;
  const valueCents = inPayment ? pending : owed;
  return {
    key: `customer:${f.id}`,
    kind: "customer",
    name: f.name,
    email: f.email,
    stage,
    source: f.source,
    productInterest: stage === "UPSELL" ? f.suggestedOffer : null,
    valueCents,
    valueSource: valueCents > 0 ? "catalog" : "none",
    chance,
    chanceIsDefault: true,
    weightedCents: Math.round((valueCents * chance) / 100),
    nextAction: customerNextAction(f, stage),
    nextActionAt: null,
    overdue: false,
    stale: stage === "UPSELL" && last ? now.getTime() - last.getTime() > 30 * DAY : false,
    lastContactAt: last,
    ltvCents,
    mrrCents: f.monthlyCents,
    referrals: f.referralPurchases,
    badges,
    href: `/admin/crm/${f.id}`,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// the board

export interface Column {
  stage: (typeof STAGES)[number];
  cards: CrmCard[];
  /** Money on the table in this column: what open opportunities are worth, or what is still owed. */
  valueCents: number;
  weightedCents: number;
}

export interface BoardSummary {
  /** Open opportunities before the sale, in cents (what you set, or a catalog price you can see). */
  openCents: number;
  /** The same, times the chance. Your estimate, not a forecast. */
  weightedCents: number;
  overdue: number;
  stale: number;
  customers: number;
  lifetimeCents: number;
  mrrCents: number;
  /** Money owed on deposit orders. */
  owedCents: number;
}

const byUrgency = (a: CrmCard, b: CrmCard) =>
  Number(b.overdue) - Number(a.overdue) || b.valueCents - a.valueCents || (b.lastContactAt?.getTime() ?? 0) - (a.lastContactAt?.getTime() ?? 0);

export function buildBoard(cards: CrmCard[]): { columns: Column[]; summary: BoardSummary } {
  const columns: Column[] = STAGES.map((stage) => {
    const list = cards.filter((c) => c.stage === stage.key).sort(byUrgency);
    return { stage, cards: list, valueCents: list.reduce((s, c) => s + c.valueCents, 0), weightedCents: list.reduce((s, c) => s + c.weightedCents, 0) };
  });
  const before = columns.filter((c) => c.stage.side === "before");
  const customers = cards.filter((c) => c.kind === "customer");
  return {
    columns,
    summary: {
      openCents: before.reduce((s, c) => s + c.valueCents, 0),
      weightedCents: before.reduce((s, c) => s + c.weightedCents, 0),
      overdue: cards.filter((c) => c.overdue).length,
      stale: cards.filter((c) => c.stale).length,
      customers: customers.length,
      lifetimeCents: customers.reduce((s, c) => s + c.ltvCents, 0),
      mrrCents: customers.reduce((s, c) => s + c.mrrCents, 0),
      owedCents: columns.filter((c) => c.stage.side === "after").reduce((s, c) => s + c.valueCents, 0),
    },
  };
}

/** The handful of cards that need you today: overdue follow-ups first, then anything going cold. */
export function todayList(cards: CrmCard[], limit = 8): CrmCard[] {
  return cards
    .filter((c) => c.overdue || c.stale)
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.valueCents - a.valueCents)
    .slice(0, limit);
}
