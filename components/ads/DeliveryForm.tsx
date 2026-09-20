"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FIELD = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";

/** Admin: logs a batch of finished work against a customer's plan. The customer sees it on their plan page. */
export function DeliveryForm({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [items, setItems] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ads/${subscriptionId}/deliveries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsCount: Number(items), note, url: url || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setBusy(false);
        return;
      }
      setItems("");
      setNote("");
      setUrl("");
      setBusy(false);
      router.refresh();
    } catch {
      setError("Could not save.");
      setBusy(false);
    }
  }

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[90px_1fr]">
        <input aria-label="Number of items delivered" className={FIELD} inputMode="numeric" placeholder="How many" value={items} onChange={(e) => setItems(e.target.value.replace(/\D/g, "").slice(0, 3))} />
        <input aria-label="What was delivered" className={FIELD} placeholder="What was delivered (shown to the customer)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      </div>
      <input aria-label="Link to the files (https only)" className={FIELD} placeholder="Link to the files (https://…), optional" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} />
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || items === "" || note.trim().length < 3} className="rounded-full bg-gold px-5 py-2 text-xs font-semibold text-obsidian disabled:opacity-40">
        {busy ? "Saving…" : "Log delivery"}
      </button>
    </form>
  );
}
