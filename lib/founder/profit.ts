// Product profitability. For each product: what came in, less every cost the founder's plan names (payment processing,
// fulfillment, AI and API, labor, software, refunds, commissions), which leaves the CONTRIBUTION MARGIN. Products are ranked
// by numbers, never by feel.
//
// Where the numbers come from, and what is a guess:
//   - Revenue, refunds, and commissions are real records.
//   - Payment processing is worked out from the fee rate in the settings (Stripe's usual 2.9% + 30 cents until you change it).
//   - AI and API cost is taken from what the production agents really cost when there is a record, and from the per-unit
//     figure you enter when there is not.
//   - Fulfillment, software, and labor are the per-unit figures YOU enter. Until you enter them, a product's margin is only
//     "before the costs entered" and it is left out of margin rankings, so an unknown cost is never treated as zero.
// Pure (no database), so the arithmetic and the ranking are tested.

export interface Assumptions {
  laborRateCentsPerHour: number;
  processingPercent: number;
  processingFixedCents: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = { laborRateCentsPerHour: 0, processingPercent: 2.9, processingFixedCents: 30 };

export interface UnitCosts {
  fulfillmentCents: number;
  aiApiCents: number;
  laborMinutes: number;
  softwareCents: number;
}

export interface ProfitOrder {
  status: string; // PAID | REFUNDED
  /** Cash actually collected on this order. */
  collectedCents: number;
  paymentsCount: number;
  /** Commissions owed to partners and referrers on this order (not rejected or voided). */
  commissionCents: number;
  /** What the production agents actually cost on this order's project, if recorded. */
  aiActualCents: number;
  items: { slug: string; name: string; priceCents: number; quantity: number }[];
}

export interface ProductProfit {
  slug: string;
  name: string;
  units: number;
  revenueCents: number;
  refundCents: number;
  processingCents: number;
  commissionCents: number;
  fulfillmentCents: number;
  aiApiCents: number;
  laborCents: number;
  softwareCents: number;
  contributionCents: number;
  /** Contribution over net revenue, in percent; null when there is no net revenue. */
  marginPercent: number | null;
  laborHours: number;
  /** Contribution per hour of labor; null when no labor time is entered. */
  marginPerHourCents: number | null;
  /** True once the owner has entered at least one cost for this product (or the agents recorded one). */
  costsEntered: boolean;
}

const cleanUnits = (u?: Partial<UnitCosts>): UnitCosts => ({
  fulfillmentCents: Math.max(0, Math.round(u?.fulfillmentCents ?? 0)),
  aiApiCents: Math.max(0, Math.round(u?.aiApiCents ?? 0)),
  laborMinutes: Math.max(0, Math.round(u?.laborMinutes ?? 0)),
  softwareCents: Math.max(0, Math.round(u?.softwareCents ?? 0)),
});

export function productProfits(orders: ProfitOrder[], costs: Record<string, Partial<UnitCosts>>, a: Assumptions = DEFAULT_ASSUMPTIONS): ProductProfit[] {
  const acc = new Map<string, { name: string; units: number; revenue: number; refund: number; processing: number; commission: number; fulfillment: number; ai: number; labor: number; software: number; aiActualSeen: boolean }>();
  const get = (slug: string, name: string) => {
    let x = acc.get(slug);
    if (!x) acc.set(slug, (x = { name, units: 0, revenue: 0, refund: 0, processing: 0, commission: 0, fulfillment: 0, ai: 0, labor: 0, software: 0, aiActualSeen: false }));
    return x;
  };

  for (const o of orders) {
    const values = o.items.map((i) => i.priceCents * i.quantity);
    const total = values.reduce((s, v) => s + v, 0);
    if (total <= 0) continue;
    const processing = Math.round((o.collectedCents * a.processingPercent) / 100 + a.processingFixedCents * o.paymentsCount);
    o.items.forEach((item, idx) => {
      const share = values[idx] / total;
      const p = get(item.slug, item.name);
      const u = cleanUnits(costs[item.slug]);
      p.units += item.quantity;
      p.revenue += o.collectedCents * share;
      if (o.status === "REFUNDED") p.refund += o.collectedCents * share;
      p.processing += processing * share;
      p.commission += o.commissionCents * share;
      p.fulfillment += u.fulfillmentCents * item.quantity;
      if (o.aiActualCents > 0) {
        p.ai += o.aiActualCents * share;
        p.aiActualSeen = true;
      } else p.ai += u.aiApiCents * item.quantity;
      p.labor += (u.laborMinutes / 60) * a.laborRateCentsPerHour * item.quantity;
      p.software += u.softwareCents * item.quantity;
    });
  }

  return [...acc.entries()].map(([slug, x]) => {
    const u = cleanUnits(costs[slug]);
    const revenueCents = Math.round(x.revenue);
    const refundCents = Math.round(x.refund);
    const net = revenueCents - refundCents;
    const contributionCents = Math.round(net - x.processing - x.commission - x.fulfillment - x.ai - x.labor - x.software);
    const laborHours = Math.round(((u.laborMinutes * x.units) / 60) * 100) / 100;
    return {
      slug,
      name: x.name,
      units: x.units,
      revenueCents,
      refundCents,
      processingCents: Math.round(x.processing),
      commissionCents: Math.round(x.commission),
      fulfillmentCents: Math.round(x.fulfillment),
      aiApiCents: Math.round(x.ai),
      laborCents: Math.round(x.labor),
      softwareCents: Math.round(x.software),
      contributionCents,
      marginPercent: net > 0 ? Math.round((contributionCents / net) * 1000) / 10 : null,
      laborHours,
      marginPerHourCents: laborHours > 0 ? Math.round(contributionCents / laborHours) : null,
      costsEntered: u.fulfillmentCents + u.aiApiCents + u.laborMinutes + u.softwareCents > 0 || x.aiActualSeen,
    };
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// ranking

export type Lens = "revenue" | "contribution" | "margin" | "perHour" | "conversion" | "retention" | "upsell";

export const LENS_LABEL: Record<Lens, string> = {
  revenue: "Revenue",
  contribution: "Contribution margin",
  margin: "Margin percent",
  perHour: "Margin per hour of labor",
  conversion: "Conversion",
  retention: "Retention",
  upsell: "Upsell potential",
};

export interface RankInput extends ProductProfit {
  /** Paid orders over checkouts started, in percent. null when there is nothing to divide. */
  conversionPercent: number | null;
  /** Share of this product's buyers now on a monthly plan, in percent. */
  retentionPercent: number | null;
  /** Share of first-time buyers who later bought something else, in percent. */
  upsellPercent: number | null;
  /** How many customers stand behind the retention and upsell figures. */
  customersBehind: number;
}

const MIN_CUSTOMERS = 3;

/** The value a product is ranked by in a lens, or null when it has no honest value there. */
export function lensValue(p: RankInput, lens: Lens): number | null {
  switch (lens) {
    case "revenue":
      return p.revenueCents - p.refundCents;
    case "contribution":
      return p.costsEntered ? p.contributionCents : null;
    case "margin":
      return p.costsEntered ? p.marginPercent : null;
    case "perHour":
      return p.costsEntered ? p.marginPerHourCents : null;
    case "conversion":
      return p.conversionPercent;
    case "retention":
      return p.customersBehind >= MIN_CUSTOMERS ? p.retentionPercent : null;
    case "upsell":
      return p.customersBehind >= MIN_CUSTOMERS ? p.upsellPercent : null;
  }
}

/** 1 for the best, and only for products that have a value in that lens. Ties share a rank. */
export function ranksFor(products: RankInput[], lens: Lens): Map<string, number> {
  const vals = products.map((p) => ({ slug: p.slug, v: lensValue(p, lens) })).filter((x): x is { slug: string; v: number } => x.v !== null);
  vals.sort((a, b) => b.v - a.v);
  const out = new Map<string, number>();
  vals.forEach((x, i) => out.set(x.slug, i > 0 && vals[i - 1].v === x.v ? out.get(vals[i - 1].slug)! : i + 1));
  return out;
}

export interface RankedProduct extends RankInput {
  ranks: Partial<Record<Lens, number>>;
  /** The average of its ranks across the lenses it has a value in, with how many lenses that was. */
  overall: number | null;
  lensesUsed: number;
}

export const LENSES: Lens[] = ["revenue", "contribution", "margin", "perHour", "conversion", "retention", "upsell"];

/** Ranks every product in every lens it can be honestly ranked in, then by the average of those ranks. Best first. */
export function rankProducts(products: RankInput[], sortBy: Lens | "overall" = "overall"): RankedProduct[] {
  const byLens = Object.fromEntries(LENSES.map((l) => [l, ranksFor(products, l)])) as Record<Lens, Map<string, number>>;
  const ranked: RankedProduct[] = products.map((p) => {
    const ranks: Partial<Record<Lens, number>> = {};
    for (const l of LENSES) {
      const r = byLens[l].get(p.slug);
      if (r !== undefined) ranks[l] = r;
    }
    const used = Object.values(ranks) as number[];
    return { ...p, ranks, lensesUsed: used.length, overall: used.length ? Math.round((used.reduce((s, r) => s + r, 0) / used.length) * 10) / 10 : null };
  });
  const key = (p: RankedProduct) => (sortBy === "overall" ? p.overall : (p.ranks[sortBy] ?? null));
  return ranked.sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === null && kb === null) return b.revenueCents - a.revenueCents;
    if (ka === null) return 1;
    if (kb === null) return -1;
    return ka - kb || b.revenueCents - a.revenueCents;
  });
}
