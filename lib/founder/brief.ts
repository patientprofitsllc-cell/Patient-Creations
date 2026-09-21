import { usd } from "@/lib/pricing/catalog";

// The Founder Operating Brief: the eight questions, answered from what is actually in the business. Priorities come from
// real counts and dates, never from numerology, and every answer says where it came from. Pure (no database, no model), so
// what it says for any set of facts is tested. An AI can rewrite the tone later; it must not change the facts or the order.

export interface BriefFacts {
  yesterday: { label: string; cashCents: number; orders: number; newLeads: number; auditsPaid: number; partnerApplications: number; invoicesPaid: number; deliveries: number };
  revenue: { last7Cents: number; topProducts: { name: string; cents: number }[]; topSources: { source: string; cents: number }[] };
  failures: { stuckProjects: { name: string }[]; failedAgentRuns24h: number; qaFailed24h: number; emailFailures24h: number; pastDuePlans: number; overdueInvoices: { number: string; amountCents: number; days: number }[] };
  attention: { messagesNeedingYou: number; partnerApplications: number; partnerPayableCents: number; openInvoiceCents: number; intakeStalled: number; heldDeliveries: number };
  leads: { name: string; nextAction: string; overdue: boolean; stale: boolean; valueCents: number }[];
  upsell: { name: string; offer: string }[];
  partners: { waiting: number; payableCents: number; paused: number };
  bottleneck: { title: string; action: string } | null;
}

export interface BriefItem {
  n: number;
  question: string;
  lines: string[];
}

export interface Brief {
  items: BriefItem[];
  /** The one thing to do first today, and the real reason. */
  task: { title: string; reason: string };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The single highest-leverage task, from a fixed order of what protects customers and cash before what grows the business. */
export function highestLeverage(f: BriefFacts): { title: string; reason: string } {
  const stuck = f.failures.stuckProjects[0];
  if (stuck) return { title: `Unblock "${stuck.name}"`, reason: `A paying customer's build is stuck${f.failures.stuckProjects.length > 1 ? ` (and ${f.failures.stuckProjects.length - 1} more)` : ""}. Nothing you do later matters if delivery fails.` };
  if (f.attention.messagesNeedingYou > 0) return { title: `Answer ${plural(f.attention.messagesNeedingYou, "customer message")}`, reason: "A customer asked for a person and is waiting on you." };
  const late = [...f.failures.overdueInvoices].sort((a, b) => b.amountCents - a.amountCents)[0];
  if (late) return { title: `Collect invoice ${late.number} (${usd(late.amountCents)})`, reason: `It has been open ${late.days} days. It is money already earned.` };
  const hot = [...f.leads].filter((l) => l.overdue).sort((a, b) => b.valueCents - a.valueCents)[0];
  if (hot) return { title: `Follow up with ${hot.name}`, reason: `Their follow-up date has passed${hot.valueCents > 0 ? ` and the deal is worth ${usd(hot.valueCents)}` : ""}.` };
  if (f.bottleneck) return { title: f.bottleneck.action, reason: `It targets your current biggest constraint: ${f.bottleneck.title.toLowerCase()}.` };
  return { title: "Add prospects and follow up on the ones you have", reason: "Nothing is urgent, and more people at the top of the pipeline is the only thing that moves the numbers." };
}

export function buildBrief(f: BriefFacts): Brief {
  const y = f.yesterday;
  const yesterday: string[] = [
    y.cashCents > 0 ? `${usd(y.cashCents)} collected across ${plural(y.orders, "paid order")}.` : "No cash was collected.",
    `${plural(y.newLeads, "new lead")}, ${plural(y.auditsPaid, "paid audit")}, ${plural(y.partnerApplications, "partner application")}.`,
    `${plural(y.invoicesPaid, "invoice")} paid, ${plural(y.deliveries, "delivery", "deliveries")}.`,
  ];

  const revenue: string[] = [];
  if (f.revenue.topProducts.length) revenue.push(`Products, last 7 days: ${f.revenue.topProducts.map((p) => `${p.name} ${usd(p.cents)}`).join(", ")}.`);
  if (f.revenue.topSources.length) revenue.push(`Sources, last 7 days: ${f.revenue.topSources.map((s) => `${s.source} ${usd(s.cents)}`).join(", ")}.`);
  if (!revenue.length) revenue.push(`Nothing produced revenue in the last 7 days (${usd(f.revenue.last7Cents)} collected).`);

  const failed: string[] = [];
  if (f.failures.stuckProjects.length) failed.push(`${plural(f.failures.stuckProjects.length, "build")} stuck: ${f.failures.stuckProjects.map((p) => p.name).join(", ")}.`);
  if (f.failures.failedAgentRuns24h) failed.push(`${plural(f.failures.failedAgentRuns24h, "production agent run")} failed in the last 24 hours.`);
  if (f.failures.qaFailed24h) failed.push(`${plural(f.failures.qaFailed24h, "quality check")} failed in the last 24 hours.`);
  if (f.failures.emailFailures24h) failed.push(`${plural(f.failures.emailFailures24h, "email")} failed to send in the last 24 hours.`);
  if (f.failures.pastDuePlans) failed.push(`${plural(f.failures.pastDuePlans, "monthly plan")} past due.`);
  if (f.failures.overdueInvoices.length) failed.push(`${plural(f.failures.overdueInvoices.length, "invoice")} open for more than 7 days.`);
  if (!failed.length) failed.push("Nothing failed that the system can see.");

  const attn: string[] = [];
  const a = f.attention;
  if (a.messagesNeedingYou) attn.push(`${plural(a.messagesNeedingYou, "customer message")} waiting for you.`);
  if (a.partnerApplications) attn.push(`${plural(a.partnerApplications, "partner application")} to decide.`);
  if (a.partnerPayableCents > 0) attn.push(`${usd(a.partnerPayableCents)} approved and ready to pay partners.`);
  if (a.openInvoiceCents > 0) attn.push(`${usd(a.openInvoiceCents)} in open invoices.`);
  if (a.intakeStalled) attn.push(`${plural(a.intakeStalled, "customer")} started but did not finish their intake.`);
  if (a.heldDeliveries) attn.push(`${plural(a.heldDeliveries, "finished build")} held until the final payment.`);
  if (!attn.length) attn.push("Nothing is waiting on you.");

  const leads = f.leads.length ? f.leads.slice(0, 5).map((l) => `${l.name}: ${l.nextAction}${l.overdue ? " (overdue)" : l.stale ? " (going cold)" : ""}${l.valueCents > 0 ? `, ${usd(l.valueCents)}` : ""}`) : ["No lead is overdue or going cold."];
  const upsell = f.upsell.length ? f.upsell.slice(0, 5).map((u) => `${u.name}: ${u.offer}`) : ["No delivered customer is waiting on an offer."];

  const partners: string[] = [];
  if (f.partners.waiting) partners.push(`${plural(f.partners.waiting, "application")} waiting for a decision.`);
  if (f.partners.payableCents > 0) partners.push(`${usd(f.partners.payableCents)} approved and waiting to be paid.`);
  if (f.partners.paused) partners.push(`${plural(f.partners.paused, "partner")} paused.`);
  if (!partners.length) partners.push("Nothing needs attention.");

  const task = highestLeverage(f);
  return {
    task,
    items: [
      { n: 1, question: "What happened yesterday?", lines: yesterday },
      { n: 2, question: "What produced revenue?", lines: revenue },
      { n: 3, question: "What failed?", lines: failed },
      { n: 4, question: "What needs attention?", lines: attn },
      { n: 5, question: "Which leads need follow-up?", lines: leads },
      { n: 6, question: "Which customers should be upsold?", lines: upsell },
      { n: 7, question: "Which partnerships need attention?", lines: partners },
      { n: 8, question: "What is today's highest-leverage task?", lines: [`${task.title}. ${task.reason}`] },
    ],
  };
}

/** The brief as plain text, for the morning email. */
export function briefText(b: Brief, date: string): string {
  return `Founder Operating Brief, ${date}\n\n${b.items.map((i) => `${i.n}. ${i.question}\n${i.lines.map((l) => `   ${l}`).join("\n")}`).join("\n\n")}\n\nPriorities come from your real data. Nothing here is a prediction.`;
}
