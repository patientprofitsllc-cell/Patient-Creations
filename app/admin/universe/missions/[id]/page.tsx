import Link from "next/link";
import { notFound } from "next/navigation";
import { patientCreationsUniverse } from "@/lib/universe/domains/instance";
import { renderMessage } from "@/lib/universe/protocol";

export const dynamic = "force-dynamic";

const when = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });

/** One request, in full: which agents MASTER woke and which it left asleep (and why), what each said, where they disagreed, and what was done. */
export default async function MissionPage({ params }: { params: { id: string } }) {
  if (!/^m_[a-z0-9]{6,30}$/i.test(params.id)) notFound();
  const u = patientCreationsUniverse();
  const m = await u.store.getMission(params.id);
  if (!m || m.domain !== u.domain.id) notFound();
  const activity = await u.store.listActivity({ domain: u.domain.id, missionId: m.id, limit: 200 });
  const r = m.result;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/universe" className="text-xs text-ice/40 hover:text-gold">← Agent Universe</Link>
        <h1 className="mt-2 font-display text-2xl text-ice">{m.command.replace(/_/g, " ")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-ice/60">{m.objective}</p>
        <p className="mt-2 text-xs text-ice/40">
          {when(m.createdAt)} · {m.status} · started by {m.triggeredBy === "user" ? "you" : m.triggeredBy}
        </p>
      </div>

      {m.route && (
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-ice">Which agents MASTER woke</h2>
          <p className="mt-2 text-sm text-ice/60">{m.route.reason}</p>
          <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {m.route.steps.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-ice/30">→</span>}
                <span className="rounded-full border border-gold/40 px-3 py-1 text-ice">{step.join(" + ")}</span>
              </li>
            ))}
          </ol>
          {m.route.skipped.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-ice/40">Left asleep, to save time and cost:</p>
              <ul className="mt-1 space-y-1 text-xs text-ice/50">
                {m.route.skipped.map((s) => (
                  <li key={s.agent}>
                    <span className="text-ice/70">{s.agent}</span>: {s.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {m.report && (
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-ice">The answer</h2>
          <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-ice/80">{m.report}</pre>
        </section>
      )}

      {r && r.executed.length > 0 && (
        <section>
          <h2 className="mb-3 text-ice">What was done, and confirmed</h2>
          <ul className="space-y-1 text-xs text-ice/70">
            {r.executed.map((e, i) => (
              <li key={i}>
                <span className={e.ok ? (e.verified ? "text-champagne" : "text-gold") : "text-red-300"}>{e.ok ? (e.verified ? "Done and confirmed" : "Done, not confirmed") : "Not done"}</span> · {e.action.replace(/_/g, " ")}: {e.detail}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r && r.decision.disagreements.length > 0 && (
        <section>
          <h2 className="mb-3 text-ice">Where the agents disagreed</h2>
          <ul className="space-y-3">
            {r.decision.disagreements.map((d, i) => (
              <li key={i} className="rounded-xl border border-white/10 p-4 text-xs text-ice/70">
                <p className="text-ice">
                  {d.topic} <span className={d.resolution === "resolved" ? "text-champagne" : "text-gold"}>({d.resolution === "resolved" ? "settled" : "needs you"})</span>
                </p>
                {d.positions.map((p, j) => (
                  <p key={j} className="mt-1">
                    <span className="text-ice/90">{p.agent}</span> ({p.stance}): {p.text}
                  </p>
                ))}
                <p className="mt-2 text-ice/50">Rule: {d.rule}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r && (
        <section>
          <h2 className="mb-3 text-ice">What each agent said</h2>
          <div className="space-y-2">
            {r.messages.map((msg, i) => (
              <details key={i} className="glass-panel rounded-xl p-4">
                <summary className="cursor-pointer text-sm text-ice">
                  {msg.agent} <span className="text-ice/40">· {msg.task} · confidence {msg.confidence}</span>
                </summary>
                <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-ice/70">{renderMessage(msg)}</pre>
              </details>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-ice">Audit trail</h2>
        <div className="glass-panel overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[36rem] text-left text-xs">
            <tbody className="divide-y divide-white/5 text-ice/70">
              {activity.map((a) => (
                <tr key={a.id}>
                  <td className="p-3 text-ice/40">{when(a.at)}</td>
                  <td className="p-3">{a.agent}</td>
                  <td className="p-3">
                    {a.task}
                    {a.handoff && <span className="text-ice/40"> → {a.handoff}</span>}
                    {a.error && <span className="block text-red-300">{a.error}</span>}
                  </td>
                  <td className={`p-3 ${a.status === "FAILED" || a.status === "ESCALATED" ? "text-red-300" : ""}`}>{a.status}</td>
                  <td className="p-3">{a.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
