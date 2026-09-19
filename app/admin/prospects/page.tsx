import Link from "next/link";
import { AddProspects } from "@/components/prospects/AddProspects";
import { db } from "@/lib/db";
import { CLOSED_STATUSES, PROSPECT_STATUSES, dueFollowUps, prospectStats, type ProspectStatus } from "@/lib/prospects/service";

const LABELS: Record<ProspectStatus, string> = {
  NEW: "New",
  AUDITED: "Checked",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  CALL_BOOKED: "Call booked",
  WON: "Won",
  LOST: "Lost",
  DO_NOT_CONTACT: "Do not contact",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-1 font-display text-2xl text-ice">{value}</p>
    </div>
  );
}

const day = (d: Date | null) => (d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

export default async function ProspectsPage({ searchParams }: { searchParams: { status?: string } }) {
  const filter = (PROSPECT_STATUSES as readonly string[]).includes(searchParams.status ?? "") ? (searchParams.status as ProspectStatus) : null;
  const [stats, due, rows] = await Promise.all([
    prospectStats(),
    dueFollowUps(),
    db.prospect.findMany({
      where: filter ? { status: filter } : { status: { notIn: CLOSED_STATUSES } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl text-ice">Prospects</h2>
        <p className="mt-1 text-sm text-ice/50">
          Businesses you might build a website for. Nothing here is ever sent automatically: you check a site, copy a draft, and send it yourself.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Stat label="On the list" value={stats.total} />
          <Stat label="Website checked" value={stats.audited} />
          <Stat label="Contacted" value={stats.contacted} />
          <Stat label="Replied or further" value={stats.replied} />
          <Stat label="Call booked or won" value={stats.callsBooked} />
          <Stat label="Won" value={stats.won} />
        </div>
      </section>

      {due.length > 0 && (
        <section>
          <h3 className="mb-3 text-ice/70">Follow-ups due ({due.length})</h3>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {due.map((p) => (
              <Link key={p.id} href={`/admin/prospects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-white/[0.03]">
                <span className="text-ice">{p.businessName}</span>
                <span className="text-xs text-gold">
                  {LABELS[p.status as ProspectStatus]} · due {day(p.nextFollowUpAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <AddProspects />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <Link href="/admin/prospects" className={!filter ? "rounded-full bg-gold px-3 py-1 text-obsidian" : "rounded-full border border-white/10 px-3 py-1 text-ice/60 hover:text-gold"}>
            Open
          </Link>
          {PROSPECT_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/prospects?status=${s}`}
              className={filter === s ? "rounded-full bg-gold px-3 py-1 text-obsidian" : "rounded-full border border-white/10 px-3 py-1 text-ice/60 hover:text-gold"}
            >
              {LABELS[s]} ({stats.byStatus[s]})
            </Link>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-ice/40">Nothing here yet.</p>
        ) : (
          <div className="glass-panel overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ice/40">
                <tr>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/prospects/${p.id}`} className="text-ice hover:text-gold">
                        {p.businessName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ice/60">{p.city ?? ""}</td>
                    <td className="px-5 py-3 text-ice/60">{LABELS[p.status as ProspectStatus]}</td>
                    <td className="px-5 py-3 text-ice/60">{day(p.nextFollowUpAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
