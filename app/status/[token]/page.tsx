import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";
import { PIPELINE_ORDER } from "@/lib/workflows/stateMachine";
import { PHASE_WEIGHTS } from "@/lib/workflows/progress";

export default async function PublicStatusPage({ params }: { params: { token: string } }) {
  const project = await db.project.findUnique({
    where: { statusToken: params.token },
    include: { tasks: true, updates: { orderBy: { createdAt: "desc" } }, deliverables: true },
  });

  if (!project) notFound();

  const progress = await getProjectProgress(project.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Live Build Status</p>
        <h1 className="mt-2 font-display text-4xl text-ice">{project.name}</h1>
        <p className="mt-2 text-sm text-ice/40">
          No login needed — bookmark this page to check progress any time.
        </p>

        <div className="glass-panel mt-8 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-ice">{progress.currentPhaseLabel}</p>
            <span className={progress.isException ? "text-red-400" : "text-gold"}>
              {progress.isException ? "Needs a quick check-in" : `${progress.percent}%`}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${progress.isException ? "bg-red-400" : "bg-gradient-to-r from-gold-deep to-gold"}`}
              style={{ width: `${progress.isException ? 100 : progress.percent}%` }}
            />
          </div>
          {progress.isException && (
            <p className="mt-3 text-sm text-red-400">
              We've flagged this build for a manual check — you'll hear from us shortly. No action needed on your end.
            </p>
          )}
          {project.deliverables.length > 0 && (
            <p className="mt-3 text-sm text-gold">Delivered — check your email for access details.</p>
          )}
        </div>

        {project.updates.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-ice/70">Updates</h2>
            <div className="space-y-3">
              {project.updates.map((u) => (
                <div key={u.id} className="glass-panel rounded-2xl p-5">
                  <p className="text-ice/90">{u.message}</p>
                  <p className="mt-2 text-xs text-ice/40">
                    {u.authorName} · {new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-ice/70">Production Timeline</h2>
          <ol className="space-y-2">
            {PIPELINE_ORDER.filter((s) => s !== "DRAFT").map((phase, i) => {
              const task = project.tasks.find((t) => t.phase === phase);
              const currentIdx = PIPELINE_ORDER.indexOf(project.state as (typeof PIPELINE_ORDER)[number]);
              const isDone = task?.status === "PASSED" || (currentIdx !== -1 && currentIdx > i);
              const isActive = task?.status === "IN_PROGRESS" || (currentIdx === i && !isDone);
              const label = task?.label ?? PHASE_WEIGHTS[phase].label;
              return (
                <li key={phase} className="flex items-center gap-3 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${isDone ? "bg-gold" : isActive ? "animate-pulseGlow bg-champagne" : "bg-white/10"}`}
                  />
                  <span className={isDone ? "text-ice" : "text-ice/40"}>{label}</span>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
