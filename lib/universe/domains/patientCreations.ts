import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/config/site";
import { loadFounder } from "@/lib/founder/service";
import { usd } from "@/lib/pricing/catalog";
import { safeFetchHtml } from "@/lib/prospects/net";
import type { Domain, PageResult, Probe, ProbeResult, Signal } from "@/lib/universe/types";

// Patient Creations, the first business plugged into the Agent Universe. This file is the ONLY place that knows anything about
// it: what its data sources are, who its stakeholders are, how its problems break down, which levers it can pull, and which
// rules its owner has set. The agents themselves are universal and read all of this through the Domain interface.
//
// Every number here is read from the real records through code the app already uses (the founder dashboard's loader, the funnel
// events, the invoice and product tables). Nothing is estimated. A source that cannot be read becomes DATA NOT AVAILABLE.

export type FounderData = Awaited<ReturnType<typeof loadFounder>>;

export interface PcSources {
  founder: () => Promise<FounderData>;
  /** Counts of each funnel event over the last 30 days. */
  funnel: () => Promise<Record<string, number>>;
  invoices: () => Promise<{ openCents: number; openCount: number; overdueCount: number; overdueCents: number }>;
  products: () => Promise<{ slug: string; name: string; category: string; type: string; priceCents: number; turnaround: string | null; description: string }[]>;
}

const DAY = 86_400_000;
/** The funnel is only judged where enough people entered a step to say anything, and a step is a leak only when almost no one continues. */
export const FUNNEL_MIN_SAMPLE = 5;
export const FUNNEL_LEAK_MAX_PERCENT = 10;
const FUNNEL_STEPS: [string, string, string][] = [
  ["landing_page_view", "offer_view", "saw a landing page, then an offer"],
  ["offer_view", "checkout_started", "saw an offer, then started checkout"],
  ["checkout_started", "checkout_completed", "started checkout, then paid"],
  ["checkout_completed", "intake_started", "paid, then began the intake"],
  ["intake_started", "intake_completed", "began the intake, then finished it"],
  ["audit_started", "audit_completed", "started the free audit, then finished it"],
];

/** The real sources, read once per run and shared by every probe that needs them. */
export function defaultSources(now = () => new Date()): PcSources {
  let founder: Promise<FounderData> | null = null;
  return {
    founder: () => (founder ??= loadFounder(now())),
    async funnel() {
      const since = new Date(now().getTime() - 30 * DAY);
      const rows = await db.analyticsEvent.groupBy({ by: ["name"], where: { createdAt: { gte: since } }, _count: { _all: true } });
      return Object.fromEntries(rows.map((r) => [r.name, r._count._all]));
    },
    async invoices() {
      const weekAgo = new Date(now().getTime() - 7 * DAY);
      const [open, overdue] = await Promise.all([
        db.invoice.aggregate({ where: { status: "OPEN" }, _sum: { amountCents: true }, _count: { _all: true } }),
        db.invoice.aggregate({ where: { status: "OPEN", createdAt: { lt: weekAgo } }, _sum: { amountCents: true }, _count: { _all: true } }),
      ]);
      return { openCents: open._sum.amountCents ?? 0, openCount: open._count._all, overdueCount: overdue._count._all, overdueCents: overdue._sum.amountCents ?? 0 };
    },
    async products() {
      const rows = await db.product.findMany({ where: { active: true }, select: { slug: true, name: true, category: true, type: true, priceCents: true, turnaround: true, description: true } });
      return rows;
    },
  };
}

/** The founder dashboard's own rule: work on the earliest broken stage of the customer's path first. */
const STAGE_RANK = { acquisition: 1, conversion: 2, fulfillment: 3, retention: 4, expansion: 5 } as const;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function probes(s: PcSources, now: () => Date): Probe[] {
  const p = (id: string, topic: string, need: string, read: () => Promise<ProbeResult | ProbeResult[] | null>): Probe => ({ id, topic, need, read });
  const from = (source: string) => (key: string, statement: string, value: number | string | null, tags: string[], signal: Signal = "neutral", severity?: ProbeResult["severity"], rank?: number): ProbeResult => ({ key, statement, value, tags, signal, source, severity, rank });

  const bottleneck = (stage: "acquisition" | "conversion" | "fulfillment" | "retention" | "expansion", tags: string[]) =>
    p(`bottleneck.${stage}`, stage, `The ${stage} measurements from the founder dashboard (visitors, leads, sales, projects, plans).`, async () => {
      const f = await s.founder();
      const sig = f.bottleneck.signals.find((x) => x.key === stage);
      if (!sig) return null;
      const r = from("the founder dashboard's bottleneck rule, computed from orders, leads, visitors, and projects");
      return r(`bottleneck.${stage}`, `${sig.title}: ${sig.measure}.${sig.judged ? "" : " There is not enough data yet to judge this stage."} Measured against: ${sig.line}.`, sig.triggered ? 1 : 0, [...tags, ...(sig.judged ? [] : ["low-sample"])], sig.triggered ? "negative" : "neutral", sig.triggered ? "high" : undefined, sig.triggered ? STAGE_RANK[stage] : undefined);
    });

  return [
    bottleneck("acquisition", ["acquisition", "traffic", "low-traffic"]),
    bottleneck("conversion", ["conversion", "leads"]),
    bottleneck("fulfillment", ["fulfillment", "delivery-speed", "stuck", "backlog"]),
    bottleneck("retention", ["retention", "plans", "churn"]),
    bottleneck("expansion", ["expansion", "upsell", "repeat"]),

    p("revenue", "cash", "Cash collected this month, monthly plan revenue, and the monthly target.", async () => {
      const f = await s.founder();
      const r = from("payments, paid audits, and monthly plans in the database");
      const target = f.vision.targetCents;
      const mtd = f.vision.monthToDateCents;
      const n = now();
      const dayOf = n.getUTCDate();
      const daysIn = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 0)).getUTCDate();
      const reached = target > 0 ? Math.round((mtd / target) * 100) : 0;
      const elapsed = Math.round((dayOf / daysIn) * 100);
      // A plain comparison of two numbers, not a forecast: the share of the goal reached against the share of the month gone.
      const behind = reached + 10 < elapsed;
      return [
        r("revenue.mtd", `This month so far: ${usd(mtd)} collected, including ${usd(f.financials.mrrCents)} a month in plans. That is ${reached}% of the ${usd(target)} monthly goal with ${elapsed}% of the month gone. The goal is a target, not a forecast.`, mtd, ["revenue", "cash", "mrr"], behind ? "negative" : "neutral", behind ? "medium" : undefined),
        r("revenue.last30", `Last 30 days: ${usd(f.financials.last30Cents)} collected.`, f.financials.last30Cents, ["revenue", "cash"]),
      ];
    }),

    p("invoices", "cash", "Open and overdue invoices.", async () => {
      const i = await s.invoices();
      const r = from("the invoice table");
      const out: ProbeResult[] = [r("invoices.open", `${plural(i.openCount, "invoice")} open, ${usd(i.openCents)} waiting to be paid.`, i.openCents, ["cash", "collection"])];
      out.push(i.overdueCount > 0 ? r("invoices.overdue", `${plural(i.overdueCount, "invoice")} open for more than 7 days, ${usd(i.overdueCents)} overdue.`, i.overdueCents, ["cash", "collection", "overdue"], "negative", "medium") : r("invoices.overdue", "No invoice has been open for more than 7 days.", 0, ["cash", "collection"], "positive"));
      return out;
    }),

    p("systems", "systems", "Failed agent runs, failed QA, failed emails, stuck builds, and which services are switched on.", async () => {
      const f = await s.founder();
      const r = from("agent runs, QA logs, email log, projects, and server settings");
      const sys = f.systems;
      const out: ProbeResult[] = [
        r("systems.agents", `In the last 24 hours: ${plural(sys.failedAgentRuns24h, "agent run")} failed or escalated, ${plural(sys.qaFailed24h, "quality check")} failed, ${plural(sys.emailFailures24h, "email")} failed to send.`, sys.failedAgentRuns24h + sys.qaFailed24h + sys.emailFailures24h, ["failure", "reliability"], sys.failedAgentRuns24h + sys.qaFailed24h + sys.emailFailures24h > 0 ? "negative" : "positive", "medium"),
        r("systems.stuck", `${plural(sys.stuckProjects, "build")} stuck and needing a person.`, sys.stuckProjects, ["stuck", "reliability", "waiting", "customer-experience"], sys.stuckProjects > 0 ? "negative" : "positive", sys.stuckProjects > 0 ? "high" : undefined),
      ];
      // Only the services the business cannot run without are problems when off. The rest are optional and are reported as such.
      const essential = /Stripe|Resend|Mailing address|Daily automatic/i;
      for (const c of sys.configured) {
        const needed = essential.test(c.label);
        out.push(r(`config.${c.label}`, c.on ? `${c.label} is on.` : `${c.label} is off${needed ? "" : " (optional)"}.`, c.on ? 1 : 0, ["config", "automation", ...(c.on || !needed ? [] : ["config-missing"])], c.on || !needed ? "neutral" : "negative", c.on || !needed ? undefined : /Stripe|Resend/i.test(c.label) ? "high" : "medium"));
      }
      return out;
    }),

    p("experience", "experience", "Customer ratings, messages waiting for the owner, and stuck builds.", async () => {
      const f = await s.founder();
      const r = from("reviews, project messages, and projects");
      const e = f.experience;
      const out: ProbeResult[] = [];
      out.push(e.reviews > 0 ? r("experience.rating", `Average rating ${e.avgRating?.toFixed(1) ?? "n/a"} from ${plural(e.reviews, "review")} in the last 90 days.`, e.avgRating ?? null, ["reviews", "trust", "customer-experience"], (e.avgRating ?? 5) < 4 ? "negative" : "positive") : r("experience.rating", "No reviews were received in the last 90 days.", 0, ["reviews", "trust", "customer-experience"]));
      out.push(e.messagesNeedingYou > 0 ? r("experience.messages", `${plural(e.messagesNeedingYou, "customer message")} waiting for a reply from the owner.`, e.messagesNeedingYou, ["waiting", "support", "customer-experience"], "negative", "high") : r("experience.messages", "No customer message is waiting for a reply.", 0, ["support", "customer-experience"], "positive"));
      return out;
    }),

    p("sales", "conversion", "Leads due for follow-up and the open pipeline value.", async () => {
      const f = await s.founder();
      const r = from("the prospect pipeline");
      const out: ProbeResult[] = [r("sales.pipeline", `The open pipeline holds ${usd(f.sales.pipelineOpenCents)}; ${plural(f.sales.newLeads30, "new lead")} and ${plural(f.sales.calls30, "call")} in the last 30 days.`, f.sales.pipelineOpenCents, ["leads", "pipeline"])];
      out.push(f.sales.leadsDue > 0 ? r("sales.due", `${plural(f.sales.leadsDue, "lead")} overdue or stale and needing a follow-up.`, f.sales.leadsDue, ["leads", "stale-leads", "pipeline"], "negative", "medium") : r("sales.due", "No lead is overdue for a follow-up.", 0, ["leads", "pipeline"], "positive"));
      return out;
    }),

    p("funnel", "funnel", "Counts of each step of the customer funnel over the last 30 days.", async () => {
      const c = await s.funnel();
      const r = from("funnel events recorded on the site in the last 30 days");
      const out: ProbeResult[] = [];
      for (const [a, b, phrase] of FUNNEL_STEPS) {
        const entered = c[a] ?? 0;
        const continued = c[b] ?? 0;
        if (entered === 0 && continued === 0) continue;
        const pct = entered > 0 ? Math.round((continued / entered) * 100) : null;
        const leak = entered >= FUNNEL_MIN_SAMPLE && pct !== null && pct <= FUNNEL_LEAK_MAX_PERCENT;
        out.push(r(`funnel.${a}.${b}`, `In 30 days, ${plural(entered, "visitor")} ${phrase}: ${continued} of ${entered}${pct === null ? "" : ` (${pct}%)`} continued.${entered < FUNNEL_MIN_SAMPLE ? " Too few to judge." : ""}`, pct, ["conversion", "funnel", ...(entered < FUNNEL_MIN_SAMPLE ? ["low-sample"] : [])], leak ? "negative" : "neutral", leak ? "medium" : undefined));
      }
      return out.length ? out : [r("funnel.none", "No funnel events were recorded in the last 30 days.", 0, ["funnel", "low-sample"])];
    }),

    p("catalog", "catalog", "The active products with their prices, delivery estimates, and descriptions.", async () => {
      const items = await s.products();
      const r = from("the product table");
      const priced = items.filter((i) => i.type !== "SUBSCRIPTION");
      const noEta = priced.filter((i) => i.type === "PRIMARY" && !i.turnaround);
      const noPrice = items.filter((i) => i.priceCents <= 0);
      const thin = items.filter((i) => i.description.trim().length < 40);
      const out: ProbeResult[] = [r("catalog.count", `${plural(items.length, "product")} on sale across ${new Set(items.map((i) => i.category)).size} categories.`, items.length, ["catalog", "clarity"])];
      out.push(noEta.length ? r("catalog.eta", `${plural(noEta.length, "main product")} with no delivery estimate: ${noEta.map((i) => i.name).slice(0, 5).join(", ")}.`, noEta.length, ["catalog", "clarity", "price"], "negative", "medium") : r("catalog.eta", "Every main product states a delivery estimate.", 0, ["catalog", "clarity"], "positive"));
      out.push(noPrice.length ? r("catalog.price", `${plural(noPrice.length, "product")} listed at no price: ${noPrice.map((i) => i.name).slice(0, 5).join(", ")}.`, noPrice.length, ["catalog", "price"], "negative", "high") : r("catalog.price", "Every product has a price.", 0, ["catalog", "price"], "positive"));
      if (thin.length) out.push(r("catalog.description", `${plural(thin.length, "product")} with a very short description: ${thin.map((i) => i.name).slice(0, 5).join(", ")}.`, thin.length, ["catalog", "clarity"], "negative", "low"));
      return out;
    }),

    p("partners", "partners", "Partner applications waiting and commissions owed.", async () => {
      const f = await s.founder();
      const r = from("the partner program records");
      const x = f.relationships;
      const out: ProbeResult[] = [r("partners.active", `${plural(x.activePartners, "partner")} active.`, x.activePartners, ["partner"])];
      out.push(x.waiting > 0 ? r("partners.waiting", `${plural(x.waiting, "partner application")} waiting for review.`, x.waiting, ["partner", "delay", "waiting"], "negative", "low") : r("partners.waiting", "No partner application is waiting.", 0, ["partner"], "positive"));
      if (x.partnerPayableCents > 0) out.push(r("partners.payable", `${usd(x.partnerPayableCents)} in approved partner commissions is ready to pay.`, x.partnerPayableCents, ["partner", "commission", "delay"], "negative", "low"));
      return out;
    }),
  ];
}

const site = (path: string) => `${process.env.UNIVERSE_SITE_URL?.trim() || SITE_URL}${path}`;

export function createPatientCreationsDomain(opts: { sources?: PcSources; now?: () => Date; fetchPage?: (url: string) => Promise<PageResult> } = {}): Domain {
  const now = opts.now ?? (() => new Date());
  const sources = opts.sources ?? defaultSources(now);
  return {
    id: "patient-creations",
    name: "Patient Creations",
    description: "A business-growth and digital-automation studio run by Patient Profits LLC: cinematic AI websites, ads, NFC cards, software, and agent systems for small businesses.",
    objectives: [
      "Reach the monthly revenue goal set in the price list, by working on the current biggest constraint.",
      "Get every paid customer through intake, preview, approval, and launch without confusion or delay.",
      "Keep customers on a plan and selling them the next fitting step.",
      "Keep the website, checkout, and follow-up honest, clear, and working.",
    ],
    stakeholders: [
      { id: "customer", name: "Customer", wants: ["trust", "clarity", "speed", "support", "price", "reviews"], wary: ["delay", "hidden-cost", "upsell", "waiting"] },
      { id: "buyer", name: "First-time buyer", wants: ["proof", "price", "clarity", "contact", "reviews"], wary: ["risk", "pushy", "hidden-cost"] },
      { id: "owner", name: "Business owner", wants: ["revenue", "cash", "margin", "efficiency", "retention"], wary: ["cost", "failure", "distraction"] },
      { id: "sales", name: "Seller", wants: ["leads", "conversion", "upsell", "pipeline"], wary: ["stale-leads", "churn"] },
      { id: "marketing", name: "Marketing", wants: ["traffic", "acquisition", "reviews", "share"], wary: ["low-traffic", "spend"] },
      { id: "operations", name: "Operations", wants: ["delivery-speed", "automation", "reliability"], wary: ["stuck", "backlog", "failure"] },
      { id: "technical", name: "Technical", wants: ["reliability", "config", "automation"], wary: ["failure", "stuck", "config-missing"] },
      { id: "financial", name: "Financial", wants: ["cash", "collection", "margin", "mrr"], wary: ["overdue", "refunds", "cost"] },
      { id: "long-term", name: "Long-term", wants: ["retention", "plans", "repeat", "trust", "mrr"], wary: ["churn"] },
      { id: "risk", name: "Risk", wants: ["reliability", "config", "collection"], wary: ["failure", "overdue", "config-missing", "stuck"] },
      { id: "growth", name: "Growth", wants: ["acquisition", "traffic", "expansion", "upsell", "partner"], wary: ["low-traffic", "churn"] },
      { id: "partner", name: "Partner", wants: ["partner", "commission"], wary: ["delay"] },
    ],
    components: {
      business: [
        { id: "acquisition", title: "Getting found", question: "Are enough of the right people finding the business?", topics: ["acquisition"], keywords: ["traffic", "visitors", "leads", "marketing", "audience", "acquisition", "awareness", "found"] },
        { id: "website", title: "The website", question: "Does the site make the offer clear and trustworthy?", topics: ["presentation", "mobile", "navigation", "trust", "clarity", "imagery"], keywords: ["website", "site", "homepage", "page", "design"] },
        { id: "conversion", title: "Turning interest into sales", question: "Where do visitors and leads stop?", topics: ["conversion", "funnel"], keywords: ["conversion", "checkout", "sales", "close", "convert", "funnel"], dependsOn: ["acquisition"] },
        { id: "products", title: "The products", question: "Are the offers clear, priced, and complete?", topics: ["catalog"], keywords: ["products", "offers", "catalog", "pricing", "price", "services"] },
        { id: "fulfillment", title: "Delivering what was sold", question: "Do builds finish on time without a person stepping in?", topics: ["fulfillment"], keywords: ["delivery", "build", "builds", "projects", "production", "fulfillment", "stuck"], dependsOn: ["conversion"] },
        { id: "experience", title: "Customer experience", question: "Are customers informed, answered, and satisfied?", topics: ["experience"], keywords: ["customers", "reviews", "support", "experience", "messages"], dependsOn: ["fulfillment"] },
        { id: "retention", title: "Keeping customers", question: "Do customers stay on a plan and come back?", topics: ["retention", "expansion"], keywords: ["retention", "plans", "churn", "subscription", "repeat", "upsell", "expansion"], dependsOn: ["experience"] },
        { id: "money", title: "Money in and owed", question: "Is cash coming in and is what is owed being collected?", topics: ["cash"], keywords: ["revenue", "money", "cash", "invoices", "profit", "financial", "owed"] },
        { id: "systems", title: "Systems and automation", question: "Are the automatic parts switched on and working?", topics: ["systems"], keywords: ["system", "systems", "email", "stripe", "automation", "errors", "reliability", "technical"] },
        { id: "partners", title: "Partners", question: "Are partner applications and payments handled?", topics: ["partners"], keywords: ["partner", "partners", "referral", "commission"] },
      ],
      website: [{ id: "website", title: "The website", question: "Does the site make the offer clear and trustworthy?", topics: ["presentation", "mobile", "navigation", "trust", "clarity", "imagery", "conversion"], keywords: ["website"] }],
      products: [
        { id: "products", title: "The products", question: "Are the offers clear, priced, and complete?", topics: ["catalog"], keywords: [] },
        { id: "presentation", title: "How the products are shown", question: "Are the price, the promise, and the next step clear on the pages?", topics: ["clarity", "trust", "conversion"], keywords: [] },
        { id: "upsell", title: "What to offer next", question: "Which next steps fit, and are they offered?", topics: ["expansion", "retention"], keywords: [] },
      ],
      journey: [
        { id: "awareness", title: "Awareness", question: "Do people find the business?", topics: ["acquisition"], keywords: [] },
        { id: "understanding", title: "Landing, understanding, and trust", question: "Does the first look explain and reassure?", topics: ["presentation", "trust", "clarity", "mobile", "navigation"], keywords: [], dependsOn: ["awareness"] },
        { id: "selection", title: "Choosing a product", question: "Can a visitor tell what to buy?", topics: ["catalog"], keywords: [], dependsOn: ["understanding"] },
        { id: "checkout", title: "Checkout and payment", question: "Do people who start checkout finish it?", topics: ["funnel", "conversion"], keywords: [], dependsOn: ["selection"] },
        { id: "delivery", title: "Confirmation and fulfillment", question: "Are paid customers guided and delivered to?", topics: ["fulfillment"], keywords: [], dependsOn: ["checkout"] },
        { id: "followup", title: "Follow-up and reviews", question: "Are customers followed up with and asked for feedback?", topics: ["experience"], keywords: [], dependsOn: ["delivery"] },
        { id: "referral", title: "Referral", question: "Do partners and customers refer others?", topics: ["partners"], keywords: [], dependsOn: ["followup"] },
        { id: "repeat", title: "Repeat purchase", question: "Do customers buy again or stay on a plan?", topics: ["retention", "expansion"], keywords: [], dependsOn: ["followup"] },
      ],
      growth: [
        { id: "acquisition", title: "Acquisition", question: "Are enough people arriving?", topics: ["acquisition"], keywords: [] },
        { id: "conversion", title: "Conversion", question: "Do they become customers?", topics: ["conversion", "funnel"], keywords: [], dependsOn: ["acquisition"] },
        { id: "aov", title: "Order value and next steps", question: "Do customers buy more?", topics: ["expansion", "catalog"], keywords: [] },
        { id: "retention", title: "Retention", question: "Do they stay?", topics: ["retention"], keywords: [] },
        { id: "referral", title: "Referral and partnerships", question: "Do others send customers?", topics: ["partners"], keywords: [] },
        { id: "operations", title: "Operations and automation", question: "Can the business deliver more without more effort?", topics: ["fulfillment", "systems"], keywords: [] },
      ],
      customers: [
        { id: "who", title: "Who the customers are and how they buy", question: "What do orders and plans show?", topics: ["expansion", "retention"], keywords: [] },
        { id: "experience", title: "Their experience", question: "Are they informed and satisfied?", topics: ["experience", "fulfillment"], keywords: [] },
      ],
      conversion: [
        { id: "traffic", title: "Who arrives", question: "Is there enough traffic to judge?", topics: ["acquisition"], keywords: [] },
        { id: "funnel", title: "Where people stop", question: "Which funnel step loses people?", topics: ["funnel", "conversion"], keywords: [], dependsOn: ["traffic"] },
        { id: "pages", title: "What the pages say", question: "Do the pages explain and reassure?", topics: ["presentation", "trust", "clarity", "mobile"], keywords: [] },
      ],
      strategy: [
        { id: "constraint", title: "The current constraint", question: "What is holding the business back most?", topics: ["acquisition", "conversion", "fulfillment", "retention", "expansion"], keywords: [] },
        { id: "money", title: "Money", question: "Where does cash stand?", topics: ["cash"], keywords: [] },
      ],
      research: [{ id: "known", title: "What is already known", question: "What do the connected records say?", topics: ["acquisition", "conversion", "funnel", "catalog", "retention", "cash"], keywords: [] }],
      daily: [
        { id: "systems", title: "Systems", question: "Is anything failing?", topics: ["systems"], keywords: [] },
        { id: "customers", title: "Customers", question: "Is anyone waiting?", topics: ["experience", "fulfillment"], keywords: [] },
        { id: "money", title: "Money", question: "Is anything overdue?", topics: ["cash"], keywords: [] },
        { id: "leads", title: "Leads and partners", question: "Is anyone waiting for a reply?", topics: ["conversion", "partners"], keywords: [] },
      ],
      weekly: [
        { id: "constraint", title: "The constraint", question: "What is holding the business back?", topics: ["acquisition", "conversion", "fulfillment", "retention", "expansion"], keywords: [] },
        { id: "money", title: "Money", question: "How is the month against the goal?", topics: ["cash"], keywords: [] },
        { id: "customers", title: "Customers", question: "How are customers doing?", topics: ["experience", "retention"], keywords: [] },
      ],
    },
    probes: probes(sources, now),
    surfaces: [
      { id: "home", name: "Home page", url: site("/"), expects: ["cta", "contact"] },
      { id: "services", name: "Services page", url: site("/services"), expects: ["price", "cta"] },
      { id: "audit", name: "Free audit page", url: site("/audit"), expects: ["form", "cta"] },
      { id: "checkout", name: "Checkout page", url: site("/checkout?product=starter-website"), expects: ["form", "price"] },
    ],
    levers: [
      { id: "acquisition", title: "Put the audit, the offers, and the partner link in front of more of the right people", component: "acquisition", triggerTags: ["acquisition", "low-traffic"], when: "negative", rationale: "Fewer people are arriving than the business needs to judge or grow.", expectedEffect: "More qualified people could reach the free audit and the offers.", dependencies: ["Knowing where each new lead came from"], risks: ["Effort spent on a channel that does not fit", "Paid channels cost money"], secondOrder: ["More leads may test fulfillment capacity"], severity: "high", rank: 1 },
      { id: "conversion", title: "Sharpen the first offer and follow up on every lead", component: "conversion", triggerTags: ["conversion", "stale-leads", "funnel"], when: "negative", rationale: "People are arriving or asking but not becoming customers.", expectedEffect: "It could turn more of the interest that already exists into orders.", dependencies: ["Seeing where in the funnel people stop"], risks: ["Changing the offer may confuse returning visitors"], secondOrder: ["A clearer offer may lower the number of questions to answer"], severity: "high", rank: 2 },
      { id: "fulfillment", title: "Take the manual work out of the slowest step of delivery", component: "fulfillment", triggerTags: ["fulfillment", "stuck", "backlog", "delivery-speed"], when: "negative", rationale: "Builds are stuck or slow, and customers are waiting.", expectedEffect: "Customers may get their work sooner and need fewer check-ins.", dependencies: ["Finding which step holds builds up"], risks: ["Automation that hides a real problem"], secondOrder: ["Faster delivery may raise the number of reviews"], actions: [], severity: "high", rank: 3 },
      { id: "retention", title: "Make the care plan and monthly ads clearly worth keeping", component: "retention", triggerTags: ["retention", "churn", "plans"], when: "negative", rationale: "Too few customers are on a plan, or plans are being lost.", expectedEffect: "More monthly income could become steady.", dependencies: ["Asking customers what they would want monthly"], risks: ["Promising more than the plan delivers"], secondOrder: ["Recurring income may make planning easier"], severity: "high", rank: 4 },
      { id: "expansion", title: "Offer the next fitting step when a customer's work is delivered", component: "retention", triggerTags: ["expansion", "upsell", "repeat"], when: "negative", rationale: "Few customers buy a second time.", expectedEffect: "More customers could buy again without new marketing.", dependencies: ["The customer ladder being shown at delivery"], risks: ["Feeling pushy"], secondOrder: ["Customers who buy twice may refer more"], severity: "medium", rank: 5 },
      { id: "basics", title: "Switch on the missing basics (email, daily jobs, mailing address, card payments)", component: "systems", triggerTags: ["config-missing", "failure"], when: "negative", rationale: "Something the business depends on is off or failing, so parts of the automation are not running.", expectedEffect: "Follow-ups, alerts, and reminders could start working on their own.", dependencies: ["The owner setting the missing values"], risks: ["A mistake in a payment or email setting is visible to customers"], secondOrder: ["More automatic messages means more to keep honest"], actions: ["change_infrastructure"], severity: "high", rank: 6 },
      { id: "collect", title: "Send the payment reminders for open invoices", component: "money", triggerTags: ["overdue", "collection"], when: "negative", rationale: "Money that is owed is sitting unpaid.", expectedEffect: "Some of it may come in within days.", dependencies: ["Email sending being verified"], risks: ["A reminder to someone who already paid"], secondOrder: ["Delivery held for a balance may be released"], actions: ["send_mass_communication"], severity: "medium", rank: 7 },
      { id: "waiting", title: "Reply to the customers who are waiting, before anything else", component: "experience", triggerTags: ["waiting", "support"], when: "negative", rationale: "A customer waiting without an answer may lose confidence in the whole purchase.", expectedEffect: "It could prevent a refund request or a bad review.", dependencies: [], risks: [], secondOrder: ["Answers can be reused in the customer assistant"], severity: "high", rank: 0 },
      { id: "partners", title: "Review the waiting partner applications and pay approved commissions", component: "partners", triggerTags: ["partner", "delay"], when: "negative", rationale: "Partners are waiting on the business.", expectedEffect: "Partners who are answered quickly may send more customers.", dependencies: [], risks: [], secondOrder: [], severity: "low" },
      { id: "pages", title: "Fix the basics found on the pages (title, headings, mobile layout, and one clear next step)", component: "presentation", triggerTags: ["look", "structure", "mobile", "seo", "navigation", "readability"], when: "negative", rationale: "The page markup shows gaps that make a page harder to use or to find.", expectedEffect: "Visitors could understand the offer sooner, and search engines may read the page better.", dependencies: ["Looking at the real page on a phone"], risks: ["Changing a working page"], secondOrder: ["A cleaner page is easier to keep consistent"], severity: "medium", rank: 9 },
      { id: "proof", title: "Show real proof and a clear way to reach a person, only where it is true", component: "trust", triggerTags: ["proof", "contact", "policy", "trust"], when: "negative", rationale: "A first-time buyer has little visible reason to trust the page.", expectedEffect: "It could reduce hesitation at the moment of buying.", dependencies: ["Real reviews or facts to show"], risks: ["Overstating proof would break the honesty rule"], secondOrder: [], severity: "medium", rank: 9 },
      { id: "images", title: "Fill the image gaps (a share image, alt text, and a main picture)", component: "imagery", triggerTags: ["image"], when: "negative", rationale: "The pages have image gaps that hurt sharing and accessibility.", expectedEffect: "Shared links could look complete and the pages become easier to use with a screen reader.", dependencies: ["An image brief from IMAGE"], risks: ["Generic images that do not fit the look"], secondOrder: [], severity: "low" },
      { id: "catalog", title: "Complete the product listings: delivery estimates, prices, and descriptions", component: "catalog", triggerTags: ["catalog"], when: "negative", rationale: "A product missing a price, estimate, or description makes a buyer hesitate.", expectedEffect: "Buyers could decide with fewer questions.", dependencies: [], risks: ["A wrong estimate becomes a promise"], secondOrder: [], severity: "medium", rank: 9 },
      { id: "goal", title: "Work on the biggest constraint before starting anything new", component: "cash", triggerTags: ["mrr"], when: "negative", rationale: "The month is behind the pace needed for the goal.", expectedEffect: "Focus on one constraint may move revenue more than spreading effort.", dependencies: ["The founder dashboard's bottleneck"], risks: [], secondOrder: [], severity: "medium", rank: 8 },
      { id: "exp-referral", title: "A customer referral month", component: "acquisition", triggerTags: [], when: "any", rationale: "Happy customers may send friends, and they already trust the business.", expectedEffect: "It might add customers without ad spend.", dependencies: ["A simple way to track who referred whom"], risks: ["A reward costs money"], secondOrder: ["Referred customers may expect the same reward"], experiment: true, actions: ["spend_money"] },
      { id: "exp-bundle", title: "Test a bundle price for a website plus NFC cards", component: "products", triggerTags: [], when: "any", rationale: "Customers often want the site and the cards together.", expectedEffect: "It could raise the value of an average order.", dependencies: ["Margin costs entered for both products"], risks: ["A discount that lowers profit", "Confusing the price list"], secondOrder: ["Other products may need bundles too"], experiment: true, actions: ["change_pricing"] },
      { id: "exp-local", title: "Partner with a local business group", component: "acquisition", triggerTags: [], when: "any", rationale: "A group of local owners is a ready audience for exactly what the business sells.", expectedEffect: "It might bring in several customers at once.", dependencies: ["A partner agreement in the partner terms"], risks: ["Time spent with no result"], secondOrder: ["The group may want a special rate"], experiment: true },
    ],
    constraints: [
      { id: "reserved", text: "Only the owner changes prices, issues refunds, changes payment settings, sends email to many people, spends money, changes production infrastructure, or deletes customer data.", forbidsActions: ["change_pricing", "issue_refund", "change_payment_config", "send_mass_communication", "spend_money", "change_infrastructure", "delete_customer_data"] },
      { id: "files", text: "Customer files, logos, and photos are never stored on the site; they arrive by email or on a call.", forbidsActions: ["store_customer_files"] },
      { id: "honest", text: "No wording may guarantee rankings, traffic, leads, sales, ratings, or reviews.", forbidsActions: [], bannedPhrases: ["\\bguarantee[ds]?\\b", "\\b(rank|ranking)s? (#|number )?1\\b", "\\bfirst page of google\\b", "\\bwill (increase|double|triple) (your )?(sales|traffic|revenue|leads)\\b"] },
      { id: "name", text: "Customer-facing wording says Patient Profits LLC, not a personal name.", forbidsActions: [], bannedPhrases: ["\\bTrenton\\b"] },
      { id: "symbolic", text: "Numerology and other symbolic frameworks are never used to predict or prioritize.", forbidsActions: [], bannedPhrases: ["numerolog", "destiny matrix"] },
    ],
    visualStyle: "Cinematic and premium: deep obsidian backgrounds, warm gold and champagne accents, glass panels, a live-drawn network of glowing lines, real work shown rather than stock imagery",
    fetchPage: opts.fetchPage ?? (async (url) => {
      const r = await safeFetchHtml(url);
      return { status: r.status, html: r.html ?? "", finalUrl: r.finalUrl, bytes: r.bytes };
    }),
  };
}
