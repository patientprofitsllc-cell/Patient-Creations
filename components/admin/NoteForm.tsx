"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save note.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <label htmlFor="admin-note" className="sr-only">Add a note</label>
      <textarea
        id="admin-note"
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a private note about this customer…"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={loading || !body.trim()}
        className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Saving…" : "Add Note"}
      </button>
    </div>
  );
}
