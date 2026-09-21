import Link from "next/link";
import { AssumptionsForm } from "@/components/founder/FounderSettingsForm";
import { ProductCostForm, type CostRow } from "@/components/founder/ProductCostForm";
import { DEAL_PRODUCTS, dealProductName } from "@/lib/crm/labels";
import { LENSES, LENS_LABEL, rankProducts, type Lens } from "@/lib/founder/profit";
import { loadProfit } from "@/lib/founder/service";

export const dynamic = "force-dynamic";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (v: number | null) => (v === null ? "n/a" : `${v}%`);
const dollars = (cents: number) => (cents === 0 ? "" : String(cents / 100));

export default async function ProfitPage({ searchParams }: { searchParams: { sort?: string } }) {
  const d = await loadProfit();
  const sort = (LENSES as string[]).includes(searchParams.sort ?? "") ? (searchParams.sort as Lens) : "overall";
  const ranked = rankProducts(d.inputs, sort);
  const anyCosts = d.inputs.some((p) => p.costsEntered);

  const costRows: CostRow[] = d.costRows.map((c) => ({ slug: c.slug, name: dealProductName(c.slug) ?? c.slug, fulfillmentDollars: dollars(c.fulfillmentCents), aiApiDollars: dollars(c.aiApiCents), laborMinutes: c.laborMinutes ? String(c.laborMinutes) : "", softwareDollars: dollars(c.softwareCents), note: c.note ?? "" }));
  // products with sales that have no cost row yet start with an empty row, so the first thing to do is obvious
  for (const p of d.inputs) if (!costRows.some((r) => r.slug === p.slug)) costRows.push({ slug: p.slug, name: p.name, fulfillmentDollars: "", aiApiDollars: "", laborMinutes: "", softwareDollars: "", note: "" });

  const cell = "px-3 py-3 text-right";
  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/founder" className="text-xs text-ice/40 hover:text-gold">← Founder dashboard</Link>
        <h1 className="mt-2 font-display text-3xl text-ice">Product profitability</h1>
        <p className="mt-2 max-w-3xl text-sm text-ice/60">
          For each product: what came in, less payment fees, partner commissions, refunds, and the costs you enter (materials, AI and API, your time, software). That leaves the contribution margin. Products are ranked by numbers in seven ways, and no cost is ever guessed for you: a product with no costs entered is left out of the margin rankings.
        </p>
      </div>

      <section aria-label="Your numbers" className="space-y-3">
        <h2 className="text-ice">Your numbers</h2>
        <AssumptionsForm laborRateDollars={d.assumptions.laborRateCentsPerHour / 100} processingPercent={d.assumptions.processingPercent} processingFixedCents={d.assumptions.processingFixedCents} />
        <p className="text-xs text-ice/40">The payment fee starts at Stripe&apos;s usual rate. Set your hour&apos;s worth so your time counts as a cost. AI and API costs come from what the production agents really cost, where recorded.</p>
      </section>

      <section aria-label="Ranking" className="space-y-3">
        <h2 className="text-ice">Ranking</h2>
        <nav aria-label="Rank by" className="flex flex-wrap gap-2 text-xs">
          {(["overall", ...LENSES] as const).map((l) => (
            <Link key={l} href={l === "overall" ? "/admin/founder/profit" : `/admin/founder/profit?sort=${l}`} className={sort === l ? "rounded-full bg-gold px-3 py-1.5 text-obsidian" : "rounded-full border border-white/10 px-3 py-1.5 text-ice/60 hover:text-gold"}>
              {l === "overall" ? "Overall" : LENS_LABEL[l]}
            </Link>
          ))}
        </nav>
        {ranked.length === 0 ? (
          <p className="text-sm text-ice/40">No paid orders yet, so there is nothing to rank. This fills in as customers buy.</p>
        ) : (
          <div className="glass-panel overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ice/40">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className={cell}>Overall</th>
                  <th className={cell}>Revenue</th>
                  <th className={cell}>Contribution</th>
                  <th className={cell}>Margin</th>
                  <th className={cell}>Per labor hour</th>
                  <th className={cell}>Conversion</th>
                  <th className={cell}>On a plan</th>
                  <th className={cell}>Upsell</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p) => (
                  <tr key={p.slug} className="border-t border-white/5">
                    <td className="px-3 py-3 text-ice">{p.name}<span className="block text-[11px] text-ice/40">{p.units} sold{p.costsEntered ? "" : " · no costs entered"}</span></td>
                    <td className={`${cell} text-champagne`}>{p.overall === null ? "n/a" : `${p.overall}`}<span className="block text-[11px] text-ice/40">{p.lensesUsed} measures</span></td>
                    <td className={cell}>{money(p.revenueCents - p.refundCents)}<span className="block text-[11px] text-ice/40">#{p.ranks.revenue ?? "-"}</span></td>
                    <td className={cell}>{p.costsEntered ? money(p.contributionCents) : "n/a"}<span className="block text-[11px] text-ice/40">{p.ranks.contribution ? `#${p.ranks.contribution}` : ""}</span></td>
                    <td className={cell}>{p.costsEntered ? pct(p.marginPercent) : "n/a"}<span className="block text-[11px] text-ice/40">{p.ranks.margin ? `#${p.ranks.margin}` : ""}</span></td>
                    <td className={cell}>{p.costsEntered && p.marginPerHourCents !== null ? money(p.marginPerHourCents) : "n/a"}<span className="block text-[11px] text-ice/40">{p.ranks.perHour ? `#${p.ranks.perHour}` : ""}</span></td>
                    <td className={cell}>{pct(p.conversionPercent)}<span className="block text-[11px] text-ice/40">{p.ranks.conversion ? `#${p.ranks.conversion}` : ""}</span></td>
                    <td className={cell}>{p.customersBehind >= 3 ? pct(p.retentionPercent) : "n/a"}<span className="block text-[11px] text-ice/40">{p.ranks.retention ? `#${p.ranks.retention}` : ""}</span></td>
                    <td className={cell}>{p.customersBehind >= 3 ? pct(p.upsellPercent) : "n/a"}<span className="block text-[11px] text-ice/40">{p.ranks.upsell ? `#${p.ranks.upsell}` : ""}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-ice/40">
          Overall is the average of a product&apos;s ranks across the measures it has an honest number for (the count is shown). Retention and upsell need at least three customers behind them. Conversion is paid orders over checkouts started.
          {anyCosts ? "" : " No costs are entered yet, so margin, contribution, and per-hour columns are empty."}
        </p>
      </section>

      {ranked.length > 0 && (
        <section aria-label="Where the money goes" className="space-y-3">
          <h2 className="text-ice">Where each product&apos;s money goes</h2>
          <div className="glass-panel overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ice/40">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className={cell}>Revenue</th>
                  <th className={cell}>Refunds</th>
                  <th className={cell}>Payment fees</th>
                  <th className={cell}>Commissions</th>
                  <th className={cell}>Fulfillment</th>
                  <th className={cell}>AI and API</th>
                  <th className={cell}>Your time</th>
                  <th className={cell}>Software</th>
                  <th className={cell}>Left over</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p) => (
                  <tr key={p.slug} className="border-t border-white/5">
                    <td className="px-3 py-3 text-ice">{p.name}</td>
                    <td className={cell}>{money(p.revenueCents)}</td>
                    <td className={cell}>{money(p.refundCents)}</td>
                    <td className={cell}>{money(p.processingCents)}</td>
                    <td className={cell}>{money(p.commissionCents)}</td>
                    <td className={cell}>{money(p.fulfillmentCents)}</td>
                    <td className={cell}>{money(p.aiApiCents)}</td>
                    <td className={cell}>{money(p.laborCents)}</td>
                    <td className={cell}>{money(p.softwareCents)}</td>
                    <td className={`${cell} text-champagne`}>{money(p.contributionCents)}{p.costsEntered ? "" : <span className="block text-[11px] text-ice/40">before your costs</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section aria-label="Costs per unit" className="space-y-3">
        <h2 className="text-ice">What one unit costs you</h2>
        <p className="text-sm text-ice/50">Enter what it really costs to deliver one of each product. Leave a box empty if it is zero. A rough honest number is better than none.</p>
        <ProductCostForm rows={costRows} options={DEAL_PRODUCTS.map((p) => ({ slug: p.slug, name: dealProductName(p.slug) ?? p.slug }))} />
      </section>
    </div>
  );
}
