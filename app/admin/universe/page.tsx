import Link from "next/link";
import { UniverseConsole } from "@/components/universe/UniverseConsole";
import { GROUPS } from "@/components/universe/commandGroups";
import { TaskActions } from "@/components/universe/TaskActions";
import { UniverseSettings } from "@/components/universe/UniverseSettings";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";
import { agentsIn } from "@/lib/universe/route";
import type { UniverseTask } from "@/lib/universe/types";

export const dynamic = "force-dynamic";


const when = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const PRIORITY_TONE: Record<string, string> = { P0: "text-red-300", P1: "text-gold", P2: "text-ice/80", P3: "text-ice/50", P4: "text-ice/40" };

function TaskRow({ t, actions = true }: { t: UniverseTask; actions?: boolean }) {
  return (
    <li className="rounded-xl border border-white/10 p-4">
      <p className="text-sm text-ice">
        <span className={`mr-2 font-medium ${PRIORITY_TONE[t.priority]}`}>{t.priority}</span>
        {t.title}
        {t.approvalRequired && t.status === "NEEDS_APPROVAL" && <span className="ml-2 text-xs text-gold">needs your approval</span>}
      </p>
      {t.detail && <p className="mt-1 line-clamp-3 text-xs text-ice/50">{t.detail}</p>}
      {t.result && <p className="mt-1 text-xs text-ice/60">Result: {t.result}</p>}
      {actions && <TaskActions id={t.id} status={t.status} />}
    </li>
  );
}

function Column({ title, tasks, empty, actions }: { title: string; tasks: UniverseTask[]; empty: string; actions?: boolean }) {
  return (
    <section>
      <h2 className="mb-3 text-sm text-ice/70">
        {title} <span className="text-ice/40">({tasks.length})</span>
      </h2>
      {tasks.length === 0 ? <p className="text-xs text-ice/40">{empty}</p> : <ul className="space-y-3">{tasks.slice(0, 12).map((t) => <TaskRow key={t.id} t={t} actions={actions} />)}</ul>}
    </section>
  );
}

export default async function UniversePage() {
  const u = patientCreationsUniverse();
  const [board, missions, activity, decisions, results, level, paused] = await Promise.all([
    u.tasks.board(),
    u.store.listMissions({ domain: u.domain.id, limit: 8 }),
    u.store.listActivity({ domain: u.domain.id, limit: 30 }),
    u.memory.recall({ level: "DECISION", limit: 6 }),
    u.memory.recall({ level: "RESULT", limit: 6 }),
    u.permissions.level(),
    u.permissions.paused(),
  ]);
  const failed = activity.filter((a) => a.status === "FAILED" || a.status === "ESCALATED").length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Agent Universe</p>
        <h1 className="mt-2 font-display text-3xl text-ice">MASTER and the agents</h1>
        <p className="mt-2 max-w-3xl text-sm text-ice/60">
          Eleven agents, each with one job (looking, feeling, thinking, checking, gathering, and so on), led by MASTER, who wakes only the ones a question needs. They read your real records and pages, argue with each other, and hand you a ranked plan. They never change prices, send email, or spend money on their own: those stay drafts for you to approve.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Waiting for you", value: board.needsApproval.length, tone: board.needsApproval.length ? "text-gold" : "text-ice" },
          { label: "Active", value: board.active.length, tone: "text-ice" },
          { label: "Waiting to start", value: board.waiting.length, tone: "text-ice" },
          { label: "Done", value: board.done.length, tone: "text-ice" },
          { label: "Failed steps lately", value: failed, tone: failed ? "text-red-300" : "text-ice" },
        ].map((k) => (
          <div key={k.label} className="glass-panel rounded-2xl p-5">
            <p className={`font-display text-3xl ${k.tone}`}>{k.value}</p>
            <p className="mt-1 text-xs text-ice/50">{k.label}</p>
          </div>
        ))}
      </div>

      <UniverseConsole groups={GROUPS} />

      {board.needsApproval.length > 0 && (
        <section>
          <h2 className="mb-3 text-ice">Pending approvals</h2>
          <ul className="space-y-3">{board.needsApproval.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Column title="Active" tasks={board.active} empty="Nothing is in progress." />
        <Column title="Waiting to start" tasks={board.waiting} empty="Nothing is waiting. Run an audit to fill this." />
        <Column title="Done and failed" tasks={[...board.failed, ...board.done]} empty="Nothing has been finished yet." actions={false} />
      </div>

      <section>
        <h2 className="mb-3 text-ice">Recent requests</h2>
        {missions.length === 0 ? (
          <p className="text-sm text-ice/40">Nothing has been asked yet.</p>
        ) : (
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {missions.map((m) => (
              <Link key={m.id} href={`/admin/universe/missions/${m.id}`} className="block p-4 text-sm hover:bg-white/5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-ice">{m.command.replace(/_/g, " ")}</span>
                  <span className={m.status === "COMPLETED" ? "text-champagne" : m.status === "REFUSED" || m.status === "FAILED" ? "text-red-300" : "text-gold"}>{m.status}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-ice/50">{m.objective}</p>
                <p className="mt-1 text-xs text-ice/40">
                  {when(m.createdAt)} · started by {m.triggeredBy === "user" ? "you" : m.triggeredBy}
                  {m.route ? ` · woke ${agentsIn(m.route).filter((a) => a !== "MASTER").length} of 10 agents` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-ice">Recent decisions</h2>
          {decisions.length === 0 ? <p className="text-sm text-ice/40">None yet.</p> : <ul className="space-y-2 text-xs text-ice/70">{decisions.map((d) => <li key={d.id}><span className="text-ice/40">{when(d.createdAt)} </span>{d.content}</li>)}</ul>}
        </section>
        <section>
          <h2 className="mb-3 text-ice">Recent results</h2>
          <p className="mb-2 text-xs text-ice/40">What actually happened after a task, as you reported it. The agents remember these.</p>
          {results.length === 0 ? <p className="text-sm text-ice/40">None yet. Finish a task and say what happened.</p> : <ul className="space-y-2 text-xs text-ice/70">{results.map((d) => <li key={d.id}><span className="text-ice/40">{when(d.createdAt)} </span>{d.content}</li>)}</ul>}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-ice">Agent activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-ice/40">No activity yet.</p>
        ) : (
          <div className="glass-panel overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead className="text-ice/40">
                <tr>
                  <th className="p-3 font-normal">When</th>
                  <th className="p-3 font-normal">Agent</th>
                  <th className="p-3 font-normal">Step</th>
                  <th className="p-3 font-normal">Status</th>
                  <th className="p-3 font-normal">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-ice/70">
                {[...activity].reverse().map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 text-ice/40">{when(a.at)}</td>
                    <td className="p-3">{a.agent}</td>
                    <td className="p-3">{a.task}{a.error && <span className="block text-red-300">{a.error}</span>}</td>
                    <td className={`p-3 ${a.status === "FAILED" || a.status === "ESCALATED" ? "text-red-300" : ""}`}>{a.status}</td>
                    <td className="p-3">{a.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <UniverseSettings level={level} paused={paused} />
    </div>
  );
}
