import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { getProjectProgress, PHASE_WEIGHTS } from "@/lib/workflows/progress";
import { PIPELINE_ORDER } from "@/lib/workflows/stateMachine";
import { RevisionForm } from "@/components/portal/RevisionForm";
import { ReviewForm } from "@/components/portal/ReviewForm";
import { ensureStatusToken } from "@/lib/projects/ensureStatusToken";
import { statusUrlFor } from "@/lib/projects/statusToken";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      tasks: true,
      deliverables: { orderBy: { version: "desc" } },
      revisions: { orderBy: { createdAt: "desc" } },
      review: true,
      order: { include: { items: { include: { product: true } } } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();
  if (project.customer.userId !== session?.user.id) redirect("/portal/dashboard");

  const progress = await getProjectProgress(project.id);
  const revisionLimit = project.order.items[0]?.product.revisionLimit ?? 2;
  const canReview = ["DELIVERED", "REVIEW_REQUESTED", "COMPLETED"].includes(project.state);
  const statusToken = await ensureStatusToken(project.id, project.statusToken);
  const shareUrl = statusUrlFor(statusToken);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Project</p>
        <h1 className="mt-2 font-display text-3xl text-ice">{project.name}</h1>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <p className="text-ice">{progress.currentPhaseLabel}</p>
          <span className={progress.isException ? "text-red-400" : "text-gold"}>
            {progress.isException ? "Needs attention" : `${progress.percent}%`}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${progress.isException ? "bg-red-400" : "bg-gold"}`}
            style={{ width: `${progress.isException ? 100 : progress.percent}%` }}
          />
        </div>
        {progress.isException && project.exceptionNote && (
          <p className="mt-3 text-sm text-red-400">{project.exceptionNote}. Our team has been notified.</p>
        )}
        <p className="mt-4 text-xs text-ice/30">
          Shareable status link (no login needed): <span className="text-ice/50">{shareUrl}</span>
        </p>
      </div>

      {project.updates.length > 0 && (
        <div>
          <h2 className="mb-4 text-ice">Updates</h2>
          <div className="space-y-3">
            {project.updates.map((u) => (
              <div key={u.id} className="glass-panel rounded-2xl p-5">
                <p className="text-ice/90">{u.message}</p>
                <p className="mt-2 text-xs text-ice/40">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-ice">Production Timeline</h2>
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
      </div>

      <div>
        <h2 className="mb-4 text-ice">Deliverables</h2>
        {project.deliverables.length === 0 && <p className="text-ice/40">Nothing delivered yet.</p>}
        <div className="space-y-2">
          {project.deliverables.map((d) => (
            <div key={d.id} className="glass-panel flex items-center justify-between rounded-xl p-4 text-sm">
              <span className="text-ice">Version {d.version}</span>
              <span className="text-ice/40">{d.path}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-ice">Revisions ({project.revisions.length}/{revisionLimit})</h2>
        <div className="mb-4 space-y-2">
          {project.revisions.map((r) => (
            <div key={r.id} className="glass-panel rounded-xl p-4 text-sm">
              <p className="text-ice">{r.notes}</p>
              <p className="mt-1 text-ice/40">{r.status}</p>
            </div>
          ))}
        </div>
        <RevisionForm projectId={project.id} remaining={Math.max(0, revisionLimit - project.revisions.length)} />
      </div>

      {canReview && (
        <div>
          <h2 className="mb-4 text-ice">Leave a Review</h2>
          <ReviewForm projectId={project.id} existingRating={project.review?.rating} />
        </div>
      )}
    </div>
  );
}
