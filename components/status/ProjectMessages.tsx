"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  sender: "CUSTOMER" | "AGENT" | "ADMIN";
  authorName: string;
  body: string;
  createdAt: string;
}

const POLL_MS = 20_000;

export function ProjectMessages({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${token}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      setMessages(data.messages);
    } finally {
      setLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function send() {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/status/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't send your message. Please try again.");
        return;
      }
      setMessages((prev) => [...prev, ...(data.messages as Message[])]);
      setText("");
    } catch {
      setError("Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-10" aria-labelledby="message-heading">
      <h2 id="message-heading" className="mb-1 text-ice/70">
        Message your agent team
      </h2>
      <p className="mb-4 text-xs text-ice/40">
        Your concierge agent answers right away and passes anything it can&apos;t handle to Trenton, who replies here.
      </p>

      <div className="glass-panel rounded-2xl p-4">
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {loaded && messages.length === 0 && (
            <p className="text-sm text-ice/40">No messages yet. Ask about progress, timing, or anything else.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={m.sender === "CUSTOMER" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender === "CUSTOMER" ? "bg-gold/15 text-ice" : "border border-white/10 bg-white/[0.03] text-ice/80"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wide text-ice/40">
                  {m.authorName} · {new Date(m.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="status-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="status-message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Ask a question or share an update…"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-ice/30">{text.length}/1000</span>
            <button
              type="submit"
              disabled={sending || text.trim().length === 0}
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-2 text-sm font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </section>
  );
}
