"use client";

import Link from "next/link";
import { useRef, useState } from "react";

interface Msg {
  from: "you" | "ai";
  text: string;
  links?: { label: string; href: string }[];
  escalated?: boolean;
}

const START = ["Where is my project?", "What do I owe?", "What does my package include?", "What should I buy next?"];

/** Patient AI: a small assistant on the customer's own dashboard. It only ever sees the signed-in customer's account. */
export function PatientAI({ firstName }: { firstName: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(START);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setText("");
    setMessages((m) => [...m, { from: "you", text: q }]);
    try {
      const res = await fetch("/api/portal/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessages((m) => [...m, { from: "ai", text: typeof data.error === "string" ? data.error : "Something went wrong. Please try again." }]);
      else {
        setMessages((m) => [...m, { from: "ai", text: data.reply, links: data.links, escalated: data.escalate }]);
        if (Array.isArray(data.suggestions)) setSuggestions(data.suggestions);
      }
    } catch {
      setMessages((m) => [...m, { from: "ai", text: "I could not reach the server. Please try again." }]);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    }
  }

  return (
    <section aria-labelledby="patient-ai-title" className="glass-panel rounded-2xl p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Ask anything</p>
      <h2 id="patient-ai-title" className="mt-1 font-display text-2xl text-ice">Patient AI</h2>
      <p className="mt-1 text-sm text-ice/50">
        {firstName ? `${firstName}, ` : ""}I can tell you where your project stands, what you owe, what your package includes, and what to do next. I only see your own account, and I pass money questions to a person.
      </p>

      <div role="log" aria-live="polite" className="mt-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "you" ? "text-right" : ""}>
            <p className={`inline-block max-w-full rounded-2xl px-4 py-2.5 text-left text-sm ${m.from === "you" ? "bg-gold/15 text-ice" : "border border-white/10 bg-white/[0.03] text-ice/90"}`}>{m.text}</p>
            {m.links && m.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="inline-flex min-h-[44px] items-center rounded-full border border-gold/40 px-4 text-xs text-gold hover:bg-gold/10">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
            {m.escalated && <p className="mt-1 text-xs text-champagne">Sent to Trenton. He will reply by email.</p>}
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" disabled={busy} onClick={() => void ask(s)} className="min-h-[44px] rounded-full border border-white/15 px-4 text-xs text-ice/70 transition hover:border-gold/40 hover:text-gold disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(text);
        }}
        className="mt-4 flex gap-2"
      >
        <label htmlFor="patient-ai-q" className="sr-only">Ask Patient AI a question</label>
        <input id="patient-ai-q" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type your question" className="min-h-[44px] min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-ice placeholder:text-ice/30" />
        <button type="submit" disabled={busy || !text.trim()} className="min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian disabled:opacity-50">
          {busy ? "..." : "Ask"}
        </button>
      </form>
    </section>
  );
}
