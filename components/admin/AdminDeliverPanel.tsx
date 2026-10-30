"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";

/** Delivers a finished AI / software build once a person has built and tested it. */
export function AdminDeliverPanel({ projectId, balanceDue }: { projectId: string; balanceDue: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deliver(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Email the customer that this build is delivered?")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/projects/${projectId}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryUrl: url, notes }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : "Could not deliver.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={deliver} className="glass-panel space-y-3 rounded-2xl p-5 text-sm">
      <p className="text-ice/70">
        The agents wrote the plan; a person builds and tests the real thing. When the customer can use it, add where they get it and deliver.
      </p>
      {balanceDue && <p className="text-red-400">The final payment of {balanceDue} is still owed. Delivery unlocks once it is paid.</p>}
      <input className={INPUT} placeholder="Delivery link (handover doc, app URL, shared folder)" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <textarea className={INPUT} placeholder="Notes for the record (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      {error && <p className="text-red-400">{error}</p>}
      <button className={BUTTON} disabled={busy || !!balanceDue}>{busy ? "Delivering…" : "Deliver"}</button>
    </form>
  );
}
