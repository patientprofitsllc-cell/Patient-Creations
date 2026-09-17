import Link from "next/link";
import { db } from "@/lib/db";

const PAGE_SIZE = 40;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { event?: string; entityType?: string; skip?: string };
}) {
  const skip = Number(searchParams.skip ?? 0) || 0;
  const where: Record<string, unknown> = {};
  if (searchParams.event) where.event = { contains: searchParams.event };
  if (searchParams.entityType) where.entityType = searchParams.entityType;

  const [logs, total, entityTypes, sessions] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true } }),
    db.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: { include: { user: true } }, agentRuns: true },
    }),
  ]);

  const qs = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { event: searchParams.event, entityType: searchParams.entityType, skip: searchParams.skip, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") params.set(k, String(v));
    }
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-2 text-ice/70">Production Sessions</h2>
        <p className="mb-4 text-sm text-ice/40">
          Each project is one production "session": the full run of agents from order to delivery.
        </p>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/admin/logs/session/${s.id}`}
              className="flex items-center justify-between p-4 text-sm hover:bg-white/[0.02]"
            >
              <div>
                <p className="text-ice">{s.name}</p>
                <p className="text-xs text-ice/40">{s.customer.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-ice/70">{s.state}</p>
                <p className="text-xs text-ice/40">{s.agentRuns.length} agent run(s)</p>
              </div>
            </Link>
          ))}
          {sessions.length === 0 && <p className="p-4 text-sm text-ice/40">No sessions yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice/70">Event Log</h2>
        <form className="mb-4 flex flex-wrap gap-3">
          <div>
            <label htmlFor="log-event" className="sr-only">Filter by event name</label>
            <input
              id="log-event"
              name="event"
              defaultValue={searchParams.event ?? ""}
              placeholder="Filter by event name…"
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
            />
          </div>
          <div>
            <label htmlFor="log-entity" className="sr-only">Filter by entity type</label>
            <select
              id="log-entity"
              name="entityType"
              defaultValue={searchParams.entityType ?? ""}
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice"
            >
              <option value="">All entity types</option>
              {entityTypes
                .map((e) => e.entityType)
                .filter((e): e is string => Boolean(e))
                .map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
            </select>
          </div>
          <button type="submit" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-obsidian">
            Filter
          </button>
        </form>

        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <span className="text-ice/70">{l.event}</span>
              <span className="flex-1 truncate text-xs text-ice/30">
                {l.entityType ? `${l.entityType} · ${l.entityId}` : ""}
              </span>
              <span className="whitespace-nowrap text-xs text-ice/30">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="p-4 text-sm text-ice/40">No events match this filter.</p>}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-ice/40">
          <span>
            {total === 0 ? 0 : skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-3">
            {skip > 0 && (
              <Link href={qs({ skip: Math.max(0, skip - PAGE_SIZE) })} className="hover:text-gold">
                ← Newer
              </Link>
            )}
            {skip + PAGE_SIZE < total && (
              <Link href={qs({ skip: skip + PAGE_SIZE })} className="hover:text-gold">
                Older →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
