import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";
import { ensureStatusToken } from "@/lib/projects/ensureStatusToken";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { ProjectUpdateForm } from "@/components/admin/ProjectUpdateForm";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      customer: { include: { user: true } },
      agentRuns: { include: { agent: true }, orderBy: { startedAt: "asc" } },
      tasks: true,
      qaReports: { orderBy: { createdAt: "asc" } },
      perceptionReports: { orderBy: { createdAt: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  const progress = await getProjectProgress(project.id);
  const statusToken = await ensureStatusToken(project.id, project.statusToken);

  const logs = await db.auditLog.findMany({
    where: { entityId: { in: [project.id, ...project.agentRuns.map((r) => r.id)] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/logs" className="text-xs text-ice/40 hover:text-gold">← All sessions</Link>
        <h2 className="mt-2 font-display text-3xl text-ice">{project.name}</h2>
        <p className="text-sm text-ice/40">
          <Link href={`/admin/crm/${project.customerId}`} className="hover:text-gold">{project.customer.user.email}</Link>
          {" · "}
          {progress.isException ? <span className="text-red-400">Exception</span> : `${progress.percent}% · ${progress.currentPhaseLabel}`}
        </p>
        {project.exceptionNote && <p className="mt-2 text-sm text-red-400">{project.exceptionNote}</p>}
      </div>

      <section>
        <h3 className="mb-4 text-ice/70">Customer Status Page</h3>
        <ProjectUpdateForm projectId={project.id} statusUrl={statusUrlFor(statusToken)} />
        {project.updates.length > 0 && (
          <div className="glass-panel mt-3 divide-y divide-white/5 rounded-2xl">
            {project.updates.map((u) => (
              <div key={u.id} className="p-4 text-sm">
                <p className="text-ice/80">{u.message}</p>
                <p className="mt-1 text-xs text-ice/30">
                  {u.authorName} · {new Date(u.createdAt).toLocaleString()} {u.notifyEmail && "· emailed"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-ice/70">Agent Runs ({project.agentRuns.length})</h3>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {project.agentRuns.map((r) => (
            <div key={r.id} className="p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ice">{r.agent.name}</span>
                <span
                  className={
                    r.status === "SUCCEEDED" ? "text-gold" : r.status === "RUNNING" ? "text-champagne" : "text-red-400"
                  }
                >
                  {r.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-ice/40">
                {new Date(r.startedAt).toLocaleString()} · {r.durationMs != null ? `${r.durationMs}ms` : "in progress"}
              </p>
              {r.failureReason && <p className="mt-1 text-xs text-red-400">{r.failureReason}</p>}
            </div>
          ))}
          {project.agentRuns.length === 0 && <p className="p-4 text-sm text-ice/40">No agent runs yet.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-ice/70">QA &amp; Perception</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass-panel rounded-2xl p-4">
            <p className="mb-2 text-sm text-ice/70">QA Reports</p>
            {project.qaReports.map((q) => (
              <p key={q.id} className={`text-sm ${q.passed ? "text-gold" : "text-red-400"}`}>
                {q.passed ? "Passed" : "Failed"} · {new Date(q.createdAt).toLocaleString()}
              </p>
            ))}
            {project.qaReports.length === 0 && <p className="text-sm text-ice/40">None yet.</p>}
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="mb-2 text-sm text-ice/70">Perception Reports</p>
            {project.perceptionReports.map((p) => (
              <p key={p.id} className="text-sm text-ice/70">
                Avg score check · {new Date(p.createdAt).toLocaleString()}
              </p>
            ))}
            {project.perceptionReports.length === 0 && <p className="text-sm text-ice/40">None yet.</p>}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-ice/70">Full Event Replay ({logs.length})</h3>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-4 text-sm">
              <span className="text-ice/70">{l.event}</span>
              <span className="text-xs text-ice/30">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="p-4 text-sm text-ice/40">No events recorded.</p>}
        </div>
      </section>
    </div>
  );
}
