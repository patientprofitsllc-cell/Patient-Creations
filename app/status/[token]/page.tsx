import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMessages } from "@/components/status/ProjectMessages";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";
import { PIPELINE_ORDER } from "@/lib/workflows/stateMachine";
import { PHASE_WEIGHTS } from "@/lib/workflows/progress";

// Must reflect real, current build progress, not a snapshot frozen at
// `next build` time. Revalidated every 10s (not force-dynamic) so a
// customer checking a few times in a row gets a fast cached response
// instead of a fresh DB round-trip every time.
export const revalidate = 10;

// A private page: never indexed, and the token in the URL is never sent to
// other sites in a Referer header.
export const metadata: Metadata = {
  title: "Project status",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PublicStatusPage({ params }: { params: { token: string } }) {
  const project = await db.project.findUnique({
    where: { statusToken: params.token },
    include: {
      tasks: true,
      updates: { orderBy: { createdAt: "desc" } },
      deliverables: true,
      order: { select: { websiteIntake: { select: { token: true, status: true } } } },
      websiteBuilds: { orderBy: { version: "desc" }, take: 1, select: { status: true, version: true, liveUrl: true } },
    },
  });

  if (!project) notFound();

  const progress = await getProjectProgress(project.id);
  // A paid website that's still waiting on the customer's business info.
  const build = project.websiteBuilds[0] ?? null;
  const pendingIntake =
    project.order.websiteIntake && project.order.websiteIntake.status !== "COMPLETE" ? project.order.websiteIntake : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Live Build Status</p>
        <h1 className="mt-2 font-display text-4xl text-ice">{project.name}</h1>
        <p className="mt-2 text-sm text-ice/40">
          No login needed. Bookmark this page to check progress any time.
        </p>

        <div className="glass-panel mt-8 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-ice">{pendingIntake ? "Waiting for your business info" : progress.currentPhaseLabel}</p>
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
              We've flagged this build for a manual check. You'll hear from us shortly. No action needed on your end.
            </p>
          )}
          {project.deliverables.length > 0 && (
            <p className="mt-3 text-sm text-gold">Delivered. Check your email for access details.</p>
          )}
        </div>

        {project.previewToken && build && (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
            {build.status === "LIVE" ? (
              <>
                <p className="font-display text-xl text-ice">Your website is live</p>
                {build.liveUrl && (
                  <a href={build.liveUrl} rel="noopener noreferrer" className="mt-2 inline-block break-all text-gold hover:brightness-110">
                    {build.liveUrl}
                  </a>
                )}
              </>
            ) : build.status === "APPROVED" ? (
              <>
                <p className="font-display text-xl text-ice">Approved, launching soon</p>
                <p className="mt-2 text-sm text-ice/60">You approved your website. We&apos;ll post here as soon as it&apos;s live.</p>
              </>
            ) : (
              <>
                <p className="font-display text-xl text-ice">Your website preview is ready</p>
                <p className="mt-2 text-sm text-ice/60">Take a look, then approve it or ask for your included revision.</p>
                <Link
                  href={`/preview/${project.previewToken}`}
                  className="mt-4 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
                >
                  View my preview
                </Link>
              </>
            )}
          </div>
        )}

        {pendingIntake && (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
            <p className="font-display text-xl text-ice">One step left before we can build</p>
            <p className="mt-2 text-sm text-ice/60">
              Tell us about your business. It takes about 3 to 5 minutes, and you can skip anything you don&apos;t have.
            </p>
            <Link
              href={`/intake/${pendingIntake.token}`}
              className="mt-4 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              Finish your intake
            </Link>
          </div>
        )}

        <ProjectMessages token={params.token} />

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
