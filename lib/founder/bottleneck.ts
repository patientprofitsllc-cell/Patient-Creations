import type { Rate } from "@/lib/revenue/metrics";

// The bottleneck rule: THE BUSINESS SHOULD ALWAYS WORK ON THE CURRENT BIGGEST CONSTRAINT.
//
// The constraint is found by walking the customer's path from the top and stopping at the first place it is broken:
//   traffic  >  conversion  >  fulfillment  >  keeping customers  >  selling them more
// Fixing something further down while something above it is broken only sends more people into the same leak, so the
// earliest broken stage is the constraint. Every rule shows the number it looked at and the line it is measured against,
// so nothing here is a hunch. The lines are rules of thumb for a business this size, written down in one place.

export const BOTTLENECK_LINES = {
  /** Fewer unique visitors than this in 30 days (about ten a day) AND fewer leads than MIN_LEADS is a traffic problem. */
  minVisitors30: 300,
  minLeads30: 15,
  /** Visitors turning into customers: below one percent, with enough visitors to judge, is a conversion problem. */
  minVisitorToCustomerPercent: 1,
  /** Leads turning into customers: below one in ten, with enough leads to judge. */
  minLeadToWonPercent: 10,
  /** Enough sales that fulfillment can be the limit. */
  salesForFulfillment: 3,
  /** Deliveries taking longer than this many days from payment to delivered, on average. */
  slowDeliveryDays: 14,
  /** A backlog this big, or this many stuck builds, is a fulfillment problem. */
  backlogProjects: 8,
  stuckProjects: 2,
  /** Enough customers to judge keeping them. */
  customersForRetention: 5,
  /** Less than this share of customers on a monthly plan, or churn at or above this, is a keeping problem. */
  minPlanSharePercent: 10,
  maxChurnPercent: 10,
  /** Enough customers to judge selling them more, and the share who bought a second time that is too low. */
  customersForExpansion: 10,
  minRepeatPercent: 15,
} as const;

export interface BottleneckFacts {
  visitors30: number;
  leads30: number;
  newCustomers30: number;
  customers: number;
  visitorToCustomer: Rate;
  leadToWon: Rate;
  activeProjects: number;
  stuckProjects: number;
  avgDeliveryDays: number | null;
  delivered60: number;
  planShare: Rate;
  churn30: Rate;
  repeatCustomers: Rate;
}

export type BottleneckKey = "acquisition" | "conversion" | "fulfillment" | "retention" | "expansion";

export interface Signal {
  key: BottleneckKey;
  triggered: boolean;
  /** Whether there was enough data to judge this stage at all. */
  judged: boolean;
  title: string;
  /** What we measured. */
  measure: string;
  /** The line it is measured against. */
  line: string;
  /** What to work on if this is the constraint. */
  action: string;
}

export interface BottleneckResult {
  primary: Signal | null;
  signals: Signal[];
  /** A sentence for when no stage is broken or nothing is measured yet. */
  note: string;
}

const L = BOTTLENECK_LINES;
const n = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
const pct = (r: Rate) => (r.percent === null ? "no data yet" : `${r.percent}% (${r.numerator} of ${r.denominator})`);

export function findBottleneck(f: BottleneckFacts): BottleneckResult {
  const trafficLow = f.visitors30 < L.minVisitors30 && f.leads30 < L.minLeads30;
  const trafficEnough = !trafficLow;
  const visitorsJudged = f.visitors30 >= L.minVisitors30;
  const leadsJudged = f.leads30 >= L.minLeads30;

  const acquisition: Signal = {
    key: "acquisition",
    triggered: trafficLow,
    judged: true,
    title: "Getting people to find you",
    measure: `${n(f.visitors30, "visitor")} and ${n(f.leads30, "lead")} in the last 30 days`,
    line: `fewer than ${L.minVisitors30} visitors and fewer than ${L.minLeads30} leads is low`,
    action: "Improve acquisition: get the audit, the offers, and your partner link in front of more of the right people. Measure where each new lead came from.",
  };

  const lowVisitorRate = visitorsJudged && f.visitorToCustomer.percent !== null && f.visitorToCustomer.percent < L.minVisitorToCustomerPercent;
  const lowLeadRate = leadsJudged && f.leadToWon.percent !== null && f.leadToWon.percent < L.minLeadToWonPercent;
  const conversion: Signal = {
    key: "conversion",
    triggered: trafficEnough && (lowVisitorRate || lowLeadRate),
    judged: visitorsJudged || leadsJudged,
    title: "Turning visitors and leads into customers",
    measure: `visitors to customers ${pct(f.visitorToCustomer)}; leads to customers ${pct(f.leadToWon)}`,
    line: `under ${L.minVisitorToCustomerPercent}% of visitors, or under ${L.minLeadToWonPercent}% of leads, is low`,
    action: "Improve the offer and the website: look at where people leave, sharpen what the first product promises, and follow up on every lead.",
  };

  const slow = f.avgDeliveryDays !== null && f.delivered60 >= 3 && f.avgDeliveryDays >= L.slowDeliveryDays;
  const fulfillment: Signal = {
    key: "fulfillment",
    triggered: (f.newCustomers30 >= L.salesForFulfillment || f.activeProjects >= 1) && (slow || f.stuckProjects >= L.stuckProjects || f.activeProjects >= L.backlogProjects),
    judged: f.activeProjects > 0 || f.delivered60 > 0 || f.newCustomers30 > 0,
    title: "Building and delivering what was sold",
    measure: `${n(f.activeProjects, "build")} in progress, ${f.stuckProjects} stuck, ${f.avgDeliveryDays === null ? "no delivery time yet" : `${f.avgDeliveryDays} days from payment to delivery on average (${f.delivered60} delivered in 60 days)`}`,
    line: `${L.slowDeliveryDays} days or more to deliver, ${L.stuckProjects} or more stuck builds, or ${L.backlogProjects} or more in progress is slow`,
    action: "Automate fulfillment: find the step that holds builds up (intake, review, approvals) and take the manual work out of it.",
  };

  const noPlans = f.planShare.percent !== null && f.planShare.percent < L.minPlanSharePercent;
  const churning = f.churn30.percent !== null && f.churn30.percent >= L.maxChurnPercent;
  const retention: Signal = {
    key: "retention",
    triggered: f.customers >= L.customersForRetention && (noPlans || churning),
    judged: f.customers >= L.customersForRetention,
    title: "Keeping customers after they buy",
    measure: `customers on a monthly plan ${pct(f.planShare)}; plans lost in 30 days ${pct(f.churn30)}`,
    line: `under ${L.minPlanSharePercent}% on a plan, or ${L.maxChurnPercent}% or more lost in a month, is low`,
    action: "Improve recurring value: make the care plan and monthly ads clearly worth keeping, and ask every website customer at the moment it goes live.",
  };

  const expansion: Signal = {
    key: "expansion",
    triggered: f.customers >= L.customersForExpansion && f.repeatCustomers.percent !== null && f.repeatCustomers.percent < L.minRepeatPercent,
    judged: f.customers >= L.customersForExpansion,
    title: "Selling more to the customers you have",
    measure: `customers who bought again ${pct(f.repeatCustomers)}`,
    line: `under ${L.minRepeatPercent}% buying a second time is low`,
    action: "Improve upsells: use the customer ladder, offer the next step at delivery, and follow up with each customer about what to add.",
  };

  const signals = [acquisition, conversion, fulfillment, retention, expansion];
  const primary = signals.find((s) => s.triggered) ?? null;
  const measured = f.visitors30 + f.leads30 + f.customers + f.activeProjects > 0;
  const note = primary
    ? "This is the earliest place the path is broken. Work on it before anything below it, and do not add features only because they sound impressive."
    : !measured
      ? "Nothing is being measured yet. Until there are visitors, leads, or customers, the constraint is getting the first of them."
      : "No stage is broken by the lines above. Keep measuring, and take the next step from the ideas you have parked, one at a time.";
  return { primary, signals, note };
}
