import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { AgentNetworkCanvas } from "@/components/agents/AgentNetworkCanvas";
import { db } from "@/lib/db";

export default async function AgentNetworkPage() {
  const recentRuns = await db.agentRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 10,
    include: { agent: true },
  });

  return (
    <>
      <SiteHeader />
      <main className="pt-32">
        <section className="mx-auto max-w-4xl px-6 pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">The Digital Crew</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">One Orchestrator. A network of specialists.</h1>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            Every project is decomposed into tasks and routed to specialized AI workers, then independently
            audited before delivery.
          </p>
        </section>

        <section className="relative mx-auto h-[480px] max-w-4xl px-6">
          <AgentNetworkCanvas className="h-full w-full" />
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-4 text-ice/70">Recent Agent Activity</h2>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-ice">{run.agent.name}</span>
                <span
                  className={
                    run.status === "SUCCEEDED" ? "text-gold" : run.status === "RUNNING" ? "text-champagne" : "text-red-400"
                  }
                >
                  {run.status}
                </span>
              </div>
            ))}
            {recentRuns.length === 0 && <p className="p-4 text-ice/40">No agent activity yet — place a test order to see the crew in action.</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
