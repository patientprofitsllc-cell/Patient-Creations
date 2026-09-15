"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RevisionForm({ projectId, remaining }: { projectId: string; remaining: number }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (remaining <= 0) {
    return <p className="text-sm text-ice/40">You've used all included revisions for this project.</p>;
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/portal/revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, notes }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit revision");
      return;
    }
    setNotes("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <label htmlFor="revision-notes" className="sr-only">Revision notes</label>
      <textarea
        id="revision-notes"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
        rows={3}
        placeholder="Describe what you'd like changed…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !notes}
        className="rounded-full bg-gold px-5 py-2 text-sm text-obsidian transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Submitting…" : `Request Revision (${remaining} left)`}
      </button>
    </div>
  );
}
