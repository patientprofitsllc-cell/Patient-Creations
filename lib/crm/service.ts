import { db } from "@/lib/db";
import { nextOffers } from "@/lib/journey/ladder";
import { buildBoard, buildCustomerCard, buildProspectCard, type CrmCard, type CustomerFacts, type ProspectFacts } from "@/lib/crm/pipeline";

// Loads everyone who is in the sales pipeline and turns them into cards. Prospects who have already bought are shown once,
// as customers. A few hundred people is the scale here, so this reads them in a handful of queries.

const LIMIT = 500;
const COUNTED_COMMISSIONS = ["PURCHASED", "PENDING", "APPROVED", "PAYABLE", "PAID"];

export async function loadPipeline(now = new Date()) {
  const [prospects, lost, paidAudits, customers] = await Promise.all([
    db.prospect.findMany({ where: { status: { notIn: ["WON", "LOST", "DO_NOT_CONTACT"] } }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    db.prospect.count({ where: { status: "LOST" } }),
    db.growthAudit.findMany({ where: { status: "PAID" }, select: { email: true, briefingJson: true }, orderBy: { paidAt: "desc" }, take: LIMIT }),
    db.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      include: {
        user: { select: { email: true, name: true } },
        orders: {
          select: {
            status: true,
            totalCents: true,
            balanceDueCents: true,
            createdAt: true,
            campaignSource: true,
            websiteIntake: { select: { status: true } },
            items: { select: { product: { select: { slug: true } } } },
          },
        },
        projects: { select: { state: true } },
        notes: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    }),
  ]);

  const ids = customers.map((c) => c.id);
  const emails = customers.map((c) => c.user.email.toLowerCase());
  const [care, ads, referred, sources] = await Promise.all([
    ids.length ? db.careSubscription.findMany({ where: { customerId: { in: ids }, status: "ACTIVE" }, select: { customerId: true, priceCents: true } }) : [],
    ids.length ? db.adSubscription.findMany({ where: { customerId: { in: ids }, status: { in: ["ACTIVE", "PAST_DUE"] } }, select: { customerId: true, priceCents: true } }) : [],
    ids.length ? db.commission.groupBy({ by: ["earnerCustomerId"], where: { earnerCustomerId: { in: ids }, orderId: { not: null }, state: { in: COUNTED_COMMISSIONS } }, _count: { _all: true } }) : [],
    emails.length ? db.prospect.findMany({ where: { email: { in: emails } }, select: { email: true, source: true } }) : [],
  ]);

  const cards: CrmCard[] = [];
  const customerEmails = new Set(emails);

  for (const c of customers) {
    const email = c.user.email.toLowerCase();
    const plans = [...care.filter((s) => s.customerId === c.id), ...ads.filter((s) => s.customerId === c.id)];
    const owned = c.orders.filter((o) => o.status === "PAID").flatMap((o) => o.items.map((i) => i.product.slug));
    const hasCare = care.some((s) => s.customerId === c.id);
    const hasAds = ads.some((s) => s.customerId === c.id);
    const firstOrder = [...c.orders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const facts: CustomerFacts = {
      id: c.id,
      name: c.user.name ?? c.user.email,
      email: c.user.email,
      source: c.referredByCode ? "referral" : (firstOrder?.campaignSource ?? sources.find((s) => s.email === email)?.source ?? null),
      createdAt: c.createdAt,
      orders: c.orders.map((o) => ({ status: o.status, totalCents: o.totalCents, balanceDueCents: o.balanceDueCents, createdAt: o.createdAt, intakePending: Boolean(o.websiteIntake && o.websiteIntake.status !== "COMPLETE") })),
      projects: c.projects,
      monthlyCents: plans.reduce((s, p) => s + p.priceCents, 0),
      activePlans: plans.length,
      referralPurchases: referred.find((r) => r.earnerCustomerId === c.id)?._count._all ?? 0,
      lastNoteAt: c.notes[0]?.createdAt ?? null,
      suggestedOffer: nextOffers({ justBought: [], owned, hasCarePlan: hasCare, hasAdsPlan: hasAds, statusPath: null })[0]?.title ?? null,
    };
    const card = buildCustomerCard(facts, now);
    if (card) cards.push(card);
  }

  const auditByEmail = new Map<string, { primarySlug: string | null }>();
  for (const a of paidAudits) {
    const key = a.email.toLowerCase();
    if (auditByEmail.has(key)) continue;
    let primarySlug: string | null = null;
    try {
      primarySlug = (JSON.parse(a.briefingJson ?? "{}") as { primary?: { slug?: string } }).primary?.slug ?? null;
    } catch {
      primarySlug = null;
    }
    auditByEmail.set(key, { primarySlug });
  }

  for (const p of prospects) {
    const email = p.email?.toLowerCase() ?? null;
    if (email && customerEmails.has(email)) continue; // already a customer, shown above
    const facts: ProspectFacts = {
      id: p.id,
      businessName: p.businessName,
      email,
      source: p.source,
      status: p.status,
      stage: p.stage,
      contactedAt: p.contactedAt,
      lastContactAt: p.lastContactAt,
      createdAt: p.createdAt,
      nextFollowUpAt: p.nextFollowUpAt,
      nextAction: p.nextAction,
      valueCents: p.valueCents,
      probability: p.probability,
      productInterest: p.productInterest,
      paidAudit: email ? (auditByEmail.get(email) ?? null) : null,
    };
    cards.push(buildProspectCard(facts, now));
  }

  return { ...buildBoard(cards), cards, lost, truncated: prospects.length === LIMIT || customers.length === LIMIT };
}
