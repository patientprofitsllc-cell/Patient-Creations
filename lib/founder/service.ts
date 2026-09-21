import { db } from "@/lib/db";
import { aiEnabled } from "@/lib/ai/callModel";
import { smsConfig } from "@/lib/alerts/ownerAlerts";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { bnplEnabled } from "@/lib/payments/bnpl";
import { loadRevenue } from "@/lib/revenue/service";
import { loadPipeline } from "@/lib/crm/service";
import { getMessagesNeedingAdmin } from "@/lib/projects/messages";
import { reminderCandidates } from "@/lib/reminders/intake";
import { rate, productStats, type OrderRow, type SubRow } from "@/lib/revenue/metrics";
import { startOfDay, startOfDayMinus } from "@/lib/revenue/time";
import { PARTNER, TARGET } from "@/lib/pricing/catalog";
import { collectedCents } from "@/lib/payments/deposit";
import { findBottleneck, type BottleneckFacts } from "@/lib/founder/bottleneck";
import { buildBrief, type BriefFacts } from "@/lib/founder/brief";
import { DEFAULT_ASSUMPTIONS, productProfits, rankProducts, type Assumptions, type ProfitOrder, type RankInput, type UnitCosts } from "@/lib/founder/profit";

// The founder dashboard's data, the database side. It reuses the revenue and pipeline loaders so a number means the same thing
// everywhere, and adds the checks that only matter to the founder: what is failing, what is waiting, and what is the constraint.

export const SETTING_KEYS = {
  laborRate: "labor_rate_cents_per_hour",
  processingPercent: "processing_percent",
  processingFixed: "processing_fixed_cents",
  vision: "vision_goals",
} as const;

export async function loadSettings(): Promise<{ assumptions: Assumptions; vision: string }> {
  const rows = await db.appSetting.findMany({ where: { key: { in: Object.values(SETTING_KEYS) } } });
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  const num = (v: string | undefined, fallback: number) => {
    const n = Number(v);
    return v !== undefined && v !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return {
    assumptions: {
      laborRateCentsPerHour: Math.round(num(get(SETTING_KEYS.laborRate), DEFAULT_ASSUMPTIONS.laborRateCentsPerHour)),
      processingPercent: num(get(SETTING_KEYS.processingPercent), DEFAULT_ASSUMPTIONS.processingPercent),
      processingFixedCents: Math.round(num(get(SETTING_KEYS.processingFixed), DEFAULT_ASSUMPTIONS.processingFixedCents)),
    },
    vision: get(SETTING_KEYS.vision) ?? "",
  };
}

const DAY = 86_400_000;
const ACTIVE_NOT = ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED", "CANCELLED", "DRAFT", "EXCEPTION"];

export async function loadFounder(now = new Date()) {
  const [rev, pipe] = await Promise.all([loadRevenue(now), loadPipeline(now)]);
  const yFrom = startOfDayMinus(now, 1);
  const yTo = startOfDay(now);
  const day1 = new Date(now.getTime() - DAY);
  const last7 = startOfDayMinus(now, 6);
  const since60 = new Date(now.getTime() - 60 * DAY);
  const since7d = new Date(now.getTime() - 7 * DAY);

  const [
    ordersYesterday, newLeadsYesterday, auditsYesterday, appsYesterday, invoicesYesterday, deliveriesYesterday,
    orders7, stuck, failedRuns, qaFailed, emailFailed, overdueInv, openInv, messages, intake, held, waitingPartners, pausedPartners, approvedPartner,
    deliverables, activeProjects, repeatGroups, liveCare, liveAds, ratings, pendingCustomerCommissions,
  ] = await Promise.all([
    db.order.count({ where: { status: "PAID", paidAt: { gte: yFrom, lt: yTo } } }),
    db.prospect.count({ where: { createdAt: { gte: yFrom, lt: yTo } } }),
    db.growthAudit.count({ where: { status: "PAID", paidAt: { gte: yFrom, lt: yTo } } }),
    db.partner.count({ where: { createdAt: { gte: yFrom, lt: yTo } } }),
    db.invoice.count({ where: { status: "PAID", paidAt: { gte: yFrom, lt: yTo } } }),
    db.deliverable.count({ where: { createdAt: { gte: yFrom, lt: yTo } } }),
    db.order.findMany({ where: { status: "PAID", paidAt: { gte: last7 } }, select: { totalCents: true, balanceDueCents: true, campaignSource: true, items: { select: { priceCents: true, quantity: true, product: { select: { name: true } } } } } }),
    db.project.findMany({ where: { state: "EXCEPTION" }, select: { name: true }, take: 20 }),
    db.agentRun.count({ where: { status: { in: ["FAILED", "ESCALATED"] }, startedAt: { gte: day1 } } }),
    db.auditLog.count({ where: { event: "qa.failed", createdAt: { gte: day1 } } }),
    db.emailEvent.count({ where: { status: "FAILED", createdAt: { gte: day1 } } }),
    db.invoice.findMany({ where: { status: "OPEN", createdAt: { lt: since7d } }, select: { seq: true, amountCents: true, createdAt: true }, take: 20 }),
    db.invoice.aggregate({ where: { status: "OPEN" }, _sum: { amountCents: true } }),
    getMessagesNeedingAdmin().catch(() => []),
    reminderCandidates(now).catch(() => []),
    db.project.count({ where: { state: "DELIVERY_READY", order: { balanceDueCents: { gt: 0 } } } }),
    db.partner.count({ where: { status: "APPLIED" } }),
    db.partner.count({ where: { status: "PAUSED" } }),
    db.partnerCommission.aggregate({ where: { state: "APPROVED" }, _sum: { commissionCents: true } }),
    db.deliverable.findMany({ where: { createdAt: { gte: since60 } }, select: { createdAt: true, project: { select: { order: { select: { paidAt: true } } } } }, take: 500 }),
    db.project.count({ where: { state: { notIn: ACTIVE_NOT } } }),
    db.order.groupBy({ by: ["customerId"], where: { status: "PAID" }, _count: { _all: true } }),
    db.careSubscription.findMany({ where: { status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { customerId: true } }),
    db.adSubscription.findMany({ where: { status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { customerId: true } }),
    db.review.aggregate({ where: { createdAt: { gte: new Date(now.getTime() - 90 * DAY) } }, _avg: { rating: true }, _count: { _all: true } }),
    db.commission.aggregate({ where: { state: { in: ["PENDING", "APPROVED"] } }, _sum: { commissionCents: true } }),
  ]);

  // what produced revenue in the last 7 days
  const byProduct = new Map<string, number>();
  const bySource = new Map<string, number>();
  for (const o of orders7) {
    const values = o.items.map((i) => i.priceCents * i.quantity);
    const total = values.reduce((s, v) => s + v, 0) || 1;
    const cash = collectedCents(o);
    o.items.forEach((i, idx) => byProduct.set(i.product.name, (byProduct.get(i.product.name) ?? 0) + Math.round((cash * values[idx]) / total)));
    const src = o.campaignSource ?? "direct or unknown";
    bySource.set(src, (bySource.get(src) ?? 0) + cash);
  }
  const top = <T extends string>(m: Map<string, number>, key: T) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, cents]) => ({ [key]: name, cents }) as { cents: number } & Record<T, string>);
  const last7Cents = rev.daily.slice(-7).reduce((s, p) => s + p.cents, 0);

  // delivery speed
  const days = deliverables.map((d) => (d.project.order.paidAt ? (d.createdAt.getTime() - d.project.order.paidAt.getTime()) / DAY : null)).filter((x): x is number => x !== null && x >= 0);
  const avgDeliveryDays = days.length ? Math.round((days.reduce((s, x) => s + x, 0) / days.length) * 10) / 10 : null;

  const customers = rev.lifetime.customers;
  const onPlan = new Set([...liveCare, ...liveAds].map((s) => s.customerId));
  const repeat = repeatGroups.filter((g) => g._count._all >= 2).length;
  const bottleneckFacts: BottleneckFacts = {
    visitors30: rev.marketing.visitors30,
    leads30: rev.sales.last30.leads,
    newCustomers30: rev.sales.last30.purchases,
    customers,
    visitorToCustomer: rev.sales.visitorToCustomer,
    leadToWon: rev.sales.leadToWon,
    activeProjects,
    stuckProjects: stuck.length,
    avgDeliveryDays,
    delivered60: days.length,
    planShare: rate(onPlan.size, customers),
    churn30: rev.retention.churn30,
    repeatCustomers: rate(repeat, customers),
  };
  const bottleneck = findBottleneck(bottleneckFacts);

  const leads = pipe.cards
    .filter((c) => c.kind === "prospect" && (c.overdue || c.stale))
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.valueCents - a.valueCents)
    .map((c) => ({ name: c.name, nextAction: c.nextAction, overdue: c.overdue, stale: c.stale, valueCents: c.valueCents }));
  const upsell = pipe.cards.filter((c) => c.kind === "customer" && c.stage === "UPSELL" && c.productInterest).map((c) => ({ name: c.name, offer: c.productInterest as string }));

  const facts: BriefFacts = {
    yesterday: { label: yFrom.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", month: "short", day: "numeric" }), cashCents: rev.daily[rev.daily.length - 2]?.cents ?? 0, orders: ordersYesterday, newLeads: newLeadsYesterday, auditsPaid: auditsYesterday, partnerApplications: appsYesterday, invoicesPaid: invoicesYesterday, deliveries: deliveriesYesterday },
    revenue: { last7Cents, topProducts: top(byProduct, "name"), topSources: top(bySource, "source") },
    failures: {
      stuckProjects: stuck,
      failedAgentRuns24h: failedRuns,
      qaFailed24h: qaFailed,
      emailFailures24h: emailFailed,
      pastDuePlans: rev.retention.pastDue,
      overdueInvoices: overdueInv.map((i) => ({ number: `PC-${1000 + i.seq}`, amountCents: i.amountCents, days: Math.floor((now.getTime() - i.createdAt.getTime()) / DAY) })),
    },
    attention: { messagesNeedingYou: messages.length, partnerApplications: waitingPartners, partnerPayableCents: approvedPartner._sum.commissionCents ?? 0, openInvoiceCents: openInv._sum.amountCents ?? 0, intakeStalled: intake.length, heldDeliveries: held },
    leads,
    upsell,
    partners: { waiting: waitingPartners, payableCents: approvedPartner._sum.commissionCents ?? 0, paused: pausedPartners },
    bottleneck: bottleneck.primary ? { title: bottleneck.primary.title, action: bottleneck.primary.action } : null,
  };
  const brief = buildBrief(facts);

  const settings = await loadSettings();
  return {
    now,
    brief,
    bottleneck,
    vision: { text: settings.vision, targetCents: TARGET.monthlyRevenueCents, monthToDateCents: rev.monthToDate.combinedCents },
    sales: { todayCents: rev.windows.find((w) => w.key === "today")?.totalCents ?? 0, leadsDue: leads.length, pipelineOpenCents: pipe.summary.openCents, newLeads30: rev.sales.last30.leads, calls30: rev.sales.last30.calls },
    relationships: { activePartners: await db.partner.count({ where: { status: "ACTIVE" } }), waiting: waitingPartners, partnerPayableCents: approvedPartner._sum.commissionCents ?? 0, holdDays: PARTNER.pendingDays, customerCommissionsCents: pendingCustomerCommissions._sum.commissionCents ?? 0 },
    systems: {
      failedAgentRuns24h: failedRuns,
      qaFailed24h: qaFailed,
      emailFailures24h: emailFailed,
      stuckProjects: stuck.length,
      configured: [
        { label: "Card payments (Stripe)", on: isStripeConfigured(), fix: "Set STRIPE_SECRET_KEY and the webhook secret." },
        { label: "Email sending (Resend)", on: Boolean(process.env.RESEND_API_KEY?.trim()), fix: "Verify your domain in Resend and set RESEND_API_KEY." },
        { label: "Mailing address for follow-ups", on: Boolean(process.env.OUTREACH_MAILING_ADDRESS?.trim()), fix: "Set OUTREACH_MAILING_ADDRESS." },
        { label: "Daily automatic jobs", on: (process.env.CRON_SECRET?.trim().length ?? 0) >= 24, fix: "Set CRON_SECRET and point a scheduler at the cron addresses." },
        { label: "Text alerts (Twilio)", on: smsConfig() !== null, fix: "Add the Twilio settings." },
        { label: "AI wording (optional)", on: aiEnabled(), fix: "Optional. Set AI_ENABLED=true and an API key." },
        { label: "Pay over time (Klarna, Afterpay)", on: bnplEnabled(), fix: "Optional. Turn on in Stripe, then set BNPL_ENABLED=true." },
      ],
    },
    experience: { avgRating: ratings._avg.rating, reviews: ratings._count._all, messagesNeedingYou: messages.length, stuckProjects: stuck.length },
    financials: { monthToDateCashCents: rev.monthToDate.cashCents, mrrCents: rev.retention.mrrCents, last30Cents: rev.windows.find((w) => w.key === "last30")?.totalCents ?? 0 },
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// product profitability

export async function loadProfit() {
  const { assumptions } = await loadSettings();
  const [ordersRaw, commissionsC, commissionsP, runs, costRows, started, care, ads] = await Promise.all([
    db.order.findMany({
      where: { status: { in: ["PAID", "REFUNDED"] } },
      select: { id: true, customerId: true, status: true, totalCents: true, balanceDueCents: true, paidAt: true, campaignSource: true, project: { select: { id: true } }, payments: { select: { status: true, provider: true } }, items: { select: { priceCents: true, quantity: true, product: { select: { slug: true, name: true } } } } },
      take: 5000,
    }),
    db.commission.findMany({ where: { state: { in: ["PENDING", "APPROVED", "PAID", "PAYABLE", "PURCHASED"] }, orderId: { not: null } }, select: { orderId: true, commissionCents: true } }),
    db.partnerCommission.findMany({ where: { state: { in: ["PENDING", "APPROVED", "PAID"] } }, select: { orderId: true, commissionCents: true } }),
    db.agentRun.groupBy({ by: ["projectId"], _sum: { costCents: true } }),
    db.productCost.findMany(),
    db.analyticsEvent.findMany({ where: { name: "checkout_started" }, select: { payloadJson: true }, take: 20000 }),
    db.careSubscription.findMany({ select: { customerId: true, status: true, priceCents: true, createdAt: true, updatedAt: true } }),
    db.adSubscription.findMany({ where: { status: { not: "PENDING" } }, select: { customerId: true, status: true, priceCents: true, createdAt: true, updatedAt: true } }),
  ]);

  const commissionByOrder = new Map<string, number>();
  for (const c of [...commissionsC, ...commissionsP]) if (c.orderId) commissionByOrder.set(c.orderId, (commissionByOrder.get(c.orderId) ?? 0) + c.commissionCents);
  const aiByProject = new Map(runs.map((r) => [r.projectId, r._sum.costCents ?? 0]));

  const profitOrders: ProfitOrder[] = ordersRaw.map((o) => ({
    status: o.status,
    collectedCents: collectedCents(o),
    paymentsCount: Math.max(1, o.payments.filter((p) => p.status === "PAID" && p.provider !== "MOCK").length),
    commissionCents: commissionByOrder.get(o.id) ?? 0,
    aiActualCents: o.project ? (aiByProject.get(o.project.id) ?? 0) : 0,
    items: o.items.map((i) => ({ slug: i.product.slug, name: i.product.name, priceCents: i.priceCents, quantity: i.quantity })),
  }));
  const costs: Record<string, UnitCosts> = Object.fromEntries(costRows.map((c) => [c.slug, { fulfillmentCents: c.fulfillmentCents, aiApiCents: c.aiApiCents, laborMinutes: c.laborMinutes, softwareCents: c.softwareCents }]));
  const profits = productProfits(profitOrders, costs, assumptions);

  // conversion, retention, upsell from the same records the revenue dashboard uses
  const startedBy = new Map<string, number>();
  for (const e of started) {
    try {
      const p = (JSON.parse(e.payloadJson) as { product?: string }).product;
      if (p) startedBy.set(p, (startedBy.get(p) ?? 0) + 1);
    } catch {
      /* skip an unreadable row */
    }
  }
  const paidOrders: OrderRow[] = ordersRaw
    .filter((o) => o.status === "PAID" && o.paidAt)
    .map((o) => ({ id: o.id, customerId: o.customerId, paidAt: o.paidAt, totalCents: o.totalCents, balanceDueCents: o.balanceDueCents, campaignSource: o.campaignSource, items: o.items.map((i) => ({ slug: i.product.slug, name: i.product.name, priceCents: i.priceCents, quantity: i.quantity })) }));
  const subs: SubRow[] = [...care.map((s) => ({ ...s, kind: "care" as const })), ...ads.map((s) => ({ ...s, kind: "ads" as const }))];
  const stats = productStats(paidOrders, subs);
  const ordersBySlug = new Map<string, number>();
  for (const o of paidOrders) for (const slug of new Set(o.items.map((i) => i.slug))) ordersBySlug.set(slug, (ordersBySlug.get(slug) ?? 0) + 1);

  const inputs: RankInput[] = profits.map((p) => {
    const s = stats.find((x) => x.slug === p.slug);
    const started_ = startedBy.get(p.slug) ?? 0;
    const paid = ordersBySlug.get(p.slug) ?? 0;
    return {
      ...p,
      conversionPercent: started_ > 0 ? Math.min(100, Math.round((paid / started_) * 1000) / 10) : null,
      retentionPercent: s?.onPlan.percent ?? null,
      upsellPercent: s?.upsell.percent ?? null,
      customersBehind: s?.upsell.denominator ?? 0,
    };
  });
  return { assumptions, costs, ranked: rankProducts(inputs), inputs, costRows: costRows.map((c) => ({ slug: c.slug, fulfillmentCents: c.fulfillmentCents, aiApiCents: c.aiApiCents, laborMinutes: c.laborMinutes, softwareCents: c.softwareCents, note: c.note })) };
}
