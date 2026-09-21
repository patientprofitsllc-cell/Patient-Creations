"use client";

import { useRef, useState } from "react";

interface Turn {
  from: "you" | "agent";
  text: string;
}

const STARTERS = ["What do I get?", "Why isn't it free?", "How does the credit work?", "How long does it take?"];

/** Questions about the audit, answered right on the page. Nothing is kept unless the visitor leaves an email. */
export function AuditAgentChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const bot = useRef<HTMLInputElement>(null);

  async function ask(message: string, withEmail?: string) {
    const m = message.trim();
    if (!m || busy) return;
    setBusy(true);
    setNote(null);
    if (!withEmail) setTurns((t) => [...t, { from: "you", text: m }]);
    setLastQuestion(m);
    try {
      const res = await fetch("/api/audit/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: m, email: withEmail || undefined, company_url: bot.current?.value ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        setTurns((t) => [...t, { from: "agent", text: data.error ?? "Sorry, that did not work. Please try again, or call us." }]);
      } else {
        if (!withEmail) setTurns((t) => [...t, { from: "agent", text: data.reply }]);
        setSuggestions(data.suggestions ?? []);
        setAskEmail(Boolean(data.escalate) && !data.captured);
        if (data.captured) {
          setAskEmail(false);
          setNote("Thank you. A real person will reply to your email.");
        }
      }
    } catch {
      setTurns((t) => [...t, { from: "agent", text: "We could not reach the server. Please try again." }]);
    } finally {
      setBusy(false);
      setText("");
      setTimeout(() => endRef.current?.scrollIntoView({ block: "nearest" }), 30);
    }
  }

  return (
    <section className="mx-auto mt-14 max-w-xl text-left" aria-labelledby="agent-title">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Questions?</p>
      <h2 id="agent-title" className="mt-2 font-display text-2xl text-ice">Ask about the audit</h2>
      <div className="glass-panel mt-4 rounded-2xl p-4">
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {turns.length === 0 && <p className="text-sm text-ice/50">Tap a question, or type your own. Answers come from what the audit really is, not a script.</p>}
          {turns.map((t, i) => (
            <div key={i} className={t.from === "you" ? "flex justify-end" : "flex justify-start"}>
              <p className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm ${t.from === "you" ? "bg-gold/15 text-ice" : "border border-white/10 bg-white/[0.03] text-ice/80"}`}>
                <span className="sr-only">{t.from === "you" ? "You: " : "Audit Agent: "}</span>
                {t.text}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => void ask(s)} className="min-h-[40px] rounded-full border border-white/15 px-3 text-xs text-ice/70 transition hover:border-gold/50 hover:text-gold disabled:opacity-40">
                {s}
              </button>
            ))}
          </div>
        )}

        {askEmail && (
          <form
            className="mt-3 flex flex-col gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(lastQuestion, email);
            }}
          >
            <label className="sr-only" htmlFor="agent-email">Your email so a person can reply</label>
            <input id="agent-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email, so a person can reply" className="min-h-[44px] flex-1 rounded-lg border border-white/15 bg-obsidian px-3 text-sm text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none" />
            <button type="submit" disabled={busy} className="min-h-[44px] rounded-full bg-gold px-5 text-sm font-semibold text-obsidian disabled:opacity-60">
              Have someone reply
            </button>
          </form>
        )}
        {note && (
          <p role="status" className="mt-3 text-sm text-emerald-300">
            {note}
          </p>
        )}

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(text);
          }}
        >
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input ref={bot} tabIndex={-1} autoComplete="off" name="company_url" />
          </div>
          <label className="sr-only" htmlFor="agent-q">Ask a question about the audit</label>
          <input id="agent-q" value={text} onChange={(e) => setText(e.target.value)} maxLength={400} placeholder="Ask a question" className="min-h-[44px] flex-1 rounded-lg border border-white/15 bg-obsidian px-3 text-sm text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none" />
          <button type="submit" disabled={busy || !text.trim()} className="min-h-[44px] rounded-full bg-gold px-5 text-sm font-semibold text-obsidian disabled:opacity-50">
            {busy ? "..." : "Ask"}
          </button>
        </form>
      </div>
    </section>
  );
}
