import type { Metadata } from "next";
import Link from "next/link";
import { CarePlanCard } from "@/components/care/CarePlanCard";
import { money } from "@/components/home/specialFrame";
import { CARE_PLAN_INCLUDES, CARE_PLAN_NOT_INCLUDED, CARE_PLAN_TIMING_NOTE, getCarePlanProduct } from "@/lib/site/carePlan";
import { notFound } from "next/navigation";
import { ProjectMessages } from "@/components/status/ProjectMessages";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";
import { AutoRefresh } from "@/components/tracking/AutoRefresh";
import { TrackingCard } from "@/components/tracking/TrackingCard";
import { generalTracker, websiteTracker } from "@/lib/tracking/tracker";
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
      order: {
        select: {
          status: true,
          paidAt: true,
          websiteIntake: { select: { token: true, status: true, completedAt: true } },
          items: { take: 1, select: { product: { select: { turnaround: true } } } },
        },
      },
      websiteBuilds: { orderBy: { version: "asc" }, select: { status: true, version: true, liveUrl: true, createdAt: true, approvedAt: true } },
      revisions: { where: { status: "REQUESTED" }, select: { id: true }, take: 1 },
      careSubscriptions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } },
    },
  });

  if (!project) notFound();

  // A paid website that's still waiting on the customer's business info.
  const build = project.websiteBuilds[project.websiteBuilds.length - 1] ?? null;
  // The care plan is offered once the website is live.
  const careProduct = build?.status === "LIVE" ? await getCarePlanProduct() : null;
  const care = project.careSubscriptions[0] ?? null;
  const careState = care && care.status !== "CANCELED" ? (care.status === "PAST_DUE" ? "past_due" : "active") : "offer";
  const intake = project.order.websiteIntake;
  const pendingIntake = intake && intake.status !== "COMPLETE" ? intake : null;
  const isWebsite = Boolean(intake);
  const orderPaid = project.order.status === "PAID";
  const liveAt = project.updates.find((u) => u.message.startsWith("Your website is live"))?.createdAt ?? null;
  const tracker = isWebsite
    ? websiteTracker({
        orderPaid,
        paidAt: project.order.paidAt,
        intakeStatus: intake?.status ?? null,
        intakeCompletedAt: intake?.completedAt ?? null,
        productionStartedAt: project.productionStartedAt,
        projectState: project.state,
        builds: project.websiteBuilds,
        openRevision: project.revisions.length > 0,
        liveAt,
      })
    : generalTracker({
        orderPaid,
        paidAt: project.order.paidAt,
        projectState: project.state,
        turnaround: project.order.items[0]?.product.turnaround ?? null,
      });

  const hasAside = Boolean(project.previewToken && build?.status === "LIVE") || Boolean(build?.status === "LIVE" && careProduct);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-5 pb-28 pt-28 sm:px-6 sm:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Live Build Status</p>
        <h1 className="mt-2 break-words font-display text-2xl text-ice sm:text-3xl lg:text-4xl">{project.name}</h1>
        <p className="mt-2 text-sm text-ice/40">
          No login needed. Bookmark this page to check progress any time.
        </p>

        <TrackingCard tracker={tracker} intakeHref={pendingIntake ? `/intake/${pendingIntake.token}` : null} previewHref={project.previewToken ? `/preview/${project.previewToken}` : null} />
        <AutoRefresh active={!tracker.complete} />

        {/* Cards about the finished site come first on phones and sit in a side column on wide screens. */}
        <div className={`mt-8 grid gap-8 ${hasAside ? "lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start" : ""}`}>
          {hasAside && (
            <aside className="space-y-6 lg:order-2 [&>*]:!mt-0">
              {project.previewToken && build?.status === "LIVE" && (
                <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
                  <p className="font-display text-xl text-ice">Your website is live</p>
                  {build.liveUrl && (
                    <a href={build.liveUrl} rel="noopener noreferrer" className="mt-1 inline-block break-all py-3 text-gold hover:brightness-110">
                      {build.liveUrl}
                    </a>
                  )}
                </div>
              )}
              {build?.status === "LIVE" && careProduct && (
                <CarePlanCard
                  token={params.token}
                  state={careState}
                  priceLabel={money(careProduct.priceCents)}
                  includes={CARE_PLAN_INCLUDES}
                  notIncluded={CARE_PLAN_NOT_INCLUDED}
                  timingNote={CARE_PLAN_TIMING_NOTE}
                  renewsOn={care?.currentPeriodEnd ? care.currentPeriodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null}
                  cancelsAtPeriodEnd={care?.cancelAtPeriodEnd ?? false}
                />
              )}
            </aside>
          )}

          <div className={`min-w-0 lg:order-1 [&>*:first-child]:!mt-0 ${hasAside ? "" : "lg:max-w-3xl"}`}>
            <ProjectMessages token={params.token} />

            {project.updates.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-ice/70">Updates</h2>
                <div className="space-y-3">
                  {project.updates.map((u) => (
                    <div key={u.id} className="glass-panel rounded-2xl p-5">
                      <p className="text-ice/90">{u.message}</p>
                      <p className="mt-2 text-xs text-ice/40">
                        {u.authorName} · {new Date(u.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isWebsite && (
            <section className="mt-10">
              <h2 className="mb-4 text-ice/70">Detailed steps</h2>
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
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
