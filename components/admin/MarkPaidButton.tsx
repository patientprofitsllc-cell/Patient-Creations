"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not mark this order paid.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Confirming…" : "Mark as Paid"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
