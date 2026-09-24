"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SMALL = "min-h-[36px] rounded-full border border-white/15 px-3 text-xs text-ice/80 hover:border-gold/40 disabled:opacity-50";
const GOLD = "min-h-[36px] rounded-full bg-gold px-3 text-xs font-medium text-obsidian hover:brightness-110 disabled:opacity-50";

/** The buttons a person has for one task, which depend on where the task stands. Finishing one asks what actually happened. */
export function TaskActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState<"complete" | "fail" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(body: Record<string, string>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/universe/tasks/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "That did not work.");
      else {
        setAsking(null);
        setNote("");
        router.refresh();
      }
    } catch {
      setError("The request did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {status === "NEEDS_APPROVAL" && (
        <>
          <button type="button" disabled={busy} className={GOLD} onClick={() => void send({ action: "approve" })}>
            Approve
          </button>
          <button type="button" disabled={busy} className={SMALL} onClick={() => void send({ action: "reject" })}>
            Reject
          </button>
        </>
      )}
      {status === "WAITING" && (
        <button type="button" disabled={busy} className={SMALL} onClick={() => void send({ action: "start" })}>
          Start
        </button>
      )}
      {(status === "ACTIVE" || status === "WAITING") && !asking && (
        <>
          <button type="button" disabled={busy} className={GOLD} onClick={() => setAsking("complete")}>
            Done
          </button>
          <button type="button" disabled={busy} className={SMALL} onClick={() => setAsking("fail")}>
            Failed
          </button>
        </>
      )}
      {asking && (
        <div className="flex w-full flex-wrap items-center gap-2">
          <input
            aria-label={asking === "complete" ? "What happened" : "Why it failed"}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-ice placeholder:text-ice/30"
            placeholder={asking === "complete" ? "What happened? (the agents learn from this)" : "Why did it fail?"}
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="button" disabled={busy || note.trim().length < 1} className={GOLD} onClick={() => void send(asking === "complete" ? { action: "complete", result: note } : { action: "fail", reason: note })}>
            Save
          </button>
          <button type="button" className={SMALL} onClick={() => setAsking(null)}>
            Cancel
          </button>
        </div>
      )}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
