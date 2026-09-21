import Link from "next/link";
import { PipelineBoard } from "@/components/crm/PipelineBoard";
import { loadPipeline } from "@/lib/crm/service";
import { stageInfo, todayList } from "@/lib/crm/pipeline";

export const dynamic = "force-dynamic";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const day = (d: Date | null) => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-1 font-display text-2xl text-ice">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-snug text-ice/40">{note}</p>}
    </div>
  );
}

export default async function CrmPage() {
  const { columns, summary, cards, lost, truncated } = await loadPipeline();
  const today = todayList(cards);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ice">Sales pipeline</h2>
            <p className="mt-1 max-w-2xl text-sm text-ice/50">
              Everyone from a first look to a customer who sends you customers, in eleven stages. Before a sale, prospects move on their own as things happen (you contact them, they pay for an audit, they reply) and you can set a stage by hand. After a sale, the stage comes from their real order, project, plan, and referrals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href="/admin/prospects" className="rounded-full border border-white/15 px-4 py-2 text-ice/70 hover:border-gold/40 hover:text-gold">Add or import prospects</Link>
            <Link href="/admin/crm/customers" className="rounded-full border border-white/15 px-4 py-2 text-ice/70 hover:border-gold/40 hover:text-gold">Customer list</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Open opportunities" value={money(summary.openCents)} note="Deals before a sale, at the value you set or the product's price." />
          <Tile label="Weighted by your chances" value={money(summary.weightedCents)} note="Your own estimate. Not a forecast, and not a promise." />
          <Tile label="Follow-ups due" value={String(summary.overdue)} note={`${summary.stale} going cold (no contact in two weeks)`} />
          <Tile label="Balance owed to you" value={money(summary.owedCents)} note="Deposit orders and unpaid orders." />
          <Tile label="Customers" value={String(summary.customers)} />
          <Tile label="Paid to date" value={money(summary.lifetimeCents)} note="Cash collected from customers in the pipeline." />
          <Tile label="Monthly plans" value={`${money(summary.mrrCents)}/mo`} note="Care and Monthly Ads that are active." />
          <Tile label="Lost deals" value={String(lost)} />
        </div>
      </section>

      {today.length > 0 && (
        <section aria-label="Needs you today">
          <h3 className="mb-3 text-ice/70">Needs you today</h3>
          <ul className="glass-panel divide-y divide-white/5 rounded-2xl">
            {today.map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm hover:bg-white/[0.03]">
                  <span>
                    <span className="text-ice">{c.name}</span>
                    <span className="ml-2 text-xs text-ice/40">{stageInfo(c.stage).label}</span>
                    <span className="mt-0.5 block text-xs text-ice/60">{c.nextAction}</span>
                  </span>
                  <span className={`text-xs ${c.overdue ? "text-gold" : "text-red-300"}`}>{c.overdue ? `Due ${day(c.nextActionAt)}` : "Going cold"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Pipeline">
        <nav aria-label="Jump to a stage" className="mb-4 flex gap-2 overflow-x-auto pb-2 text-xs lg:hidden">
          {columns.map((c) => (
            <a key={c.stage.key} href={`#stage-${c.stage.key}`} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-ice/60">
              {c.stage.label} ({c.cards.length})
            </a>
          ))}
        </nav>
        <PipelineBoard columns={columns} />
        {truncated && <p className="mt-3 text-xs text-ice/40">Showing the newest 500 people in each list.</p>}
      </section>
    </div>
  );
}
