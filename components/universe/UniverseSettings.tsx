"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LEVELS: { value: string; help: string }[] = [
  { value: "READ", help: "Look at what is stored. Nothing is analyzed." },
  { value: "ANALYZE", help: "Run audits and analyses. Nothing is recorded." },
  { value: "RECOMMEND", help: "Also produce recommendations. Nothing is recorded." },
  { value: "DRAFT", help: "Also prepare work for approval. Nothing is recorded." },
  { value: "EXECUTE", help: "Also record tasks and decisions for you. This is the normal setting." },
  { value: "AUTONOMOUS", help: "Also start work on its own, from a schedule or an event. Off unless you choose it." },
];

/** How far the agents may go. Only the owner can change it, and the page shows what the server says it is now. */
export function UniverseSettings({ level, paused }: { level: string; paused: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/universe/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) setMessage(data.error ?? "The change could not be confirmed.");
      else {
        setMessage("Saved and confirmed.");
        router.refresh();
      }
    } catch {
      setMessage("The request did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const help = LEVELS.find((l) => l.value === level)?.help;
  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">How far the agents may go</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select aria-label="Permission level" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice" value={level} disabled={busy} onChange={(e) => void send({ action: "level", level: e.target.value })}>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.value}
            </option>
          ))}
        </select>
        <button type="button" disabled={busy} onClick={() => void send({ action: "pause", paused: !paused })} className="min-h-[40px] rounded-full border border-white/15 px-4 text-sm text-ice/80 hover:border-gold/40 disabled:opacity-50">
          {paused ? "Resume autonomous actions" : "Pause autonomous actions"}
        </button>
        {message && <span className="text-xs text-ice/60">{message}</span>}
      </div>
      {help && <p className="mt-3 text-xs text-ice/50">{help}</p>}
      <p className="mt-2 text-xs text-ice/40">
        {paused ? "Paused: nothing will start on its own." : level === "AUTONOMOUS" ? "Nothing starts on its own until a scheduler calls the daily address. See the deployment notes." : "Nothing starts on its own at this level."} Prices, refunds, payment settings, mass email, spending, and deleting data are never done by an agent; they stay drafts for you to approve.
      </p>
    </div>
  );
}
