"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QUESTIONS, VERDICT_TEXT, assessIdea, type Answer, type Answers } from "@/lib/founder/ideas";

export interface IdeaRow {
  id: string;
  title: string;
  notes: string | null;
  status: string;
  answers: Answers;
  created: string;
  decisionNote: string | null;
}

const INPUT = "min-h-[44px] w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";
const CHOICES: { v: Answer; label: string }[] = [{ v: "yes", label: "Yes" }, { v: "no", label: "No" }, { v: "unsure", label: "Not sure" }];
const STATUS_LABEL: Record<string, string> = { PARKED: "Parked", DOING: "Doing now", DONE: "Done", DROPPED: "Dropped" };

function Questions({ answers, onChange, idPrefix }: { answers: Answers; onChange: (a: Answers) => void; idPrefix: string }) {
  return (
    <div className="space-y-3">
      {QUESTIONS.map((q) => (
        <fieldset key={q.id} className="rounded-xl border border-white/10 p-3">
          <legend className="px-1 text-sm text-ice/80">{q.text}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={q.text}>
            {CHOICES.map((c) => (
              <button
                key={c.v}
                type="button"
                role="radio"
                aria-checked={answers[q.id] === c.v}
                id={`${idPrefix}-${q.id}-${c.v}`}
                onClick={() => onChange({ ...answers, [q.id]: c.v })}
                className={`min-h-[44px] rounded-full border px-4 text-sm transition ${answers[q.id] === c.v ? "border-gold bg-gold/10 text-ice" : "border-white/15 text-ice/60 hover:border-gold/40"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** The parking lot: save an idea, answer seven questions about it, and only then decide. Saving never starts anything. */
export function IdeaBoard({ ideas, bottleneckTitle, doingCount, max }: { ideas: IdeaRow[]; bottleneckTitle: string | null; doingCount: number; max: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Answers>>({});

  async function call(key: string, url: string, method: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: (data.error as string) ?? "That did not work." });
      else router.refresh();
      return { ok: res.ok, data };
    } catch {
      setMsg({ ok: false, text: "Could not reach the server." });
      return { ok: false, data: {} };
    } finally {
      setBusy(null);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await call("add", "/api/admin/ideas", "POST", { title, notes: notes || undefined, answers });
    if (r.ok) {
      setTitle("");
      setNotes("");
      setAnswers({});
      setMsg({ ok: true, text: "Parked. Nothing was started." });
    }
  }

  async function move(idea: IdeaRow, to: string) {
    const r = await call(`${to}-${idea.id}`, `/api/admin/ideas/${idea.id}`, "POST", { answers: drafts[idea.id], to });
    if (!r.ok && r.data.needsOverride && window.confirm(`${r.data.error as string}\n\nThe current bottleneck is: ${bottleneckTitle ?? "not set"}.`)) {
      await call(`${to}-${idea.id}`, `/api/admin/ideas/${idea.id}`, "POST", { answers: drafts[idea.id], to, override: true });
    }
  }

  const groups = [
    { status: "DOING", title: "Doing now" },
    { status: "PARKED", title: "Parked" },
    { status: "DONE", title: "Done" },
    { status: "DROPPED", title: "Dropped" },
  ];

  return (
    <div className="space-y-10">
      <form onSubmit={add} className="glass-panel space-y-4 rounded-2xl p-5">
        <div>
          <h2 className="text-ice">Park a new idea</h2>
          <p className="mt-1 text-sm text-ice/50">Saving an idea does not start it. Answer the questions, and it waits here until you decide.</p>
          {bottleneckTitle && <p className="mt-2 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm text-ice/80">Your current bottleneck: <span className="text-ice">{bottleneckTitle}</span>. Judge the last question against it.</p>}
        </div>
        <label className="block text-xs text-ice/50">
          The idea, in a few words
          <input className={`${INPUT} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </label>
        <label className="block text-xs text-ice/50">
          Notes (optional)
          <textarea className={`${INPUT} mt-1 py-2`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
        </label>
        <Questions answers={answers} onChange={setAnswers} idPrefix="new" />
        <button type="submit" disabled={busy !== null || title.trim().length < 3} className="min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 text-sm font-semibold text-obsidian disabled:opacity-50">
          {busy === "add" ? "Saving..." : "Park it"}
        </button>
      </form>

      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-champagne" : "text-red-300"}`}>{msg.text}</p>}

      {groups.map((g) => {
        const list = ideas.filter((i) => i.status === g.status);
        if (list.length === 0 && g.status !== "DOING") return null;
        return (
          <section key={g.status} aria-label={g.title} className="space-y-3">
            <h2 className="text-ice">{g.title} {g.status === "DOING" && <span className="text-sm text-ice/40">({doingCount} of {max})</span>}</h2>
            {list.length === 0 && <p className="text-sm text-ice/40">Nothing in progress. That is fine.</p>}
            {list.map((i) => {
              const a = drafts[i.id] ?? i.answers;
              const assessed = assessIdea(a);
              const dirty = drafts[i.id] !== undefined;
              return (
                <article key={i.id} className="glass-panel space-y-3 rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-ice">{i.title}</p>
                      <p className="text-xs text-ice/40">{STATUS_LABEL[i.status]} · added {i.created}</p>
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-ice/60">{assessed.answered} of {QUESTIONS.length} answered</span>
                  </div>
                  {i.notes && <p className="text-sm text-ice/60">{i.notes}</p>}
                  <p className={`rounded-lg p-3 text-sm ${assessed.verdict === "not-now" ? "border border-red-300/30 bg-red-300/5 text-ice/80" : "border border-white/10 text-ice/70"}`}>{VERDICT_TEXT[assessed.verdict]}</p>
                  {assessed.reasons.length > 0 && <p className="text-xs text-ice/50">{assessed.reasons.join(". ")}.</p>}
                  {(i.status === "PARKED" || i.status === "DOING") && (
                    <details>
                      <summary className="min-h-[44px] cursor-pointer text-sm text-gold">Answer or change the questions</summary>
                      <div className="mt-3 space-y-3">
                        <Questions answers={a} onChange={(next) => setDrafts({ ...drafts, [i.id]: next })} idPrefix={i.id} />
                        {dirty && (
                          <button type="button" disabled={busy !== null} onClick={async () => { const r = await call(`ans-${i.id}`, `/api/admin/ideas/${i.id}`, "POST", { answers: drafts[i.id] }); if (r.ok) { const d = { ...drafts }; delete d[i.id]; setDrafts(d); } }} className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/80 hover:border-gold/40">
                            Save answers
                          </button>
                        )}
                      </div>
                    </details>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {i.status === "PARKED" && <button type="button" disabled={busy !== null} onClick={() => void move(i, "DOING")} className="min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian disabled:opacity-50">Start this one</button>}
                    {i.status === "DOING" && <button type="button" disabled={busy !== null} onClick={() => void move(i, "DONE")} className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/80 hover:border-gold/40">Mark done</button>}
                    {(i.status === "PARKED" || i.status === "DOING") && <button type="button" disabled={busy !== null} onClick={() => void move(i, "DROPPED")} className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/60 hover:border-red-300/50">Drop it</button>}
                    {(i.status === "DONE" || i.status === "DROPPED") && <button type="button" disabled={busy !== null} onClick={() => void move(i, "PARKED")} className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-ice/70 hover:border-gold/40">Back to parked</button>}
                    <button type="button" disabled={busy !== null} onClick={() => { if (window.confirm("Delete this idea for good?")) void call(`del-${i.id}`, `/api/admin/ideas/${i.id}`, "DELETE"); }} className="min-h-[44px] rounded-full border border-white/10 px-4 text-xs text-ice/40 hover:text-red-300">Delete</button>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
