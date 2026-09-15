import { db } from "@/lib/db";

export default async function AdminSystemPage() {
  const [recentLogs, notifications] = await Promise.all([
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.notification.findMany({ where: { audience: "admin" }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const errorEvents = recentLogs.filter((l) => l.event.includes("failed") || l.event.includes("escalated"));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-ice/70">Open Notifications</h2>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 text-sm">
              <p className="text-ice">{n.title}</p>
              <p className="text-ice/50">{n.body}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="p-4 text-ice/40">No open notifications.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice/70">Error / Escalation Events ({errorEvents.length})</h2>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {errorEvents.map((l) => (
            <div key={l.id} className="p-4 text-sm">
              <p className="text-red-400">{l.event}</p>
              <p className="text-ice/40">{l.entityType} — {l.entityId}</p>
            </div>
          ))}
          {errorEvents.length === 0 && <p className="p-4 text-ice/40">No errors recorded.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice/70">Recent Event Log</h2>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {recentLogs.map((l) => (
            <div key={l.id} className="flex justify-between p-4 text-sm">
              <span className="text-ice/70">{l.event}</span>
              <span className="text-ice/30">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
