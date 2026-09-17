"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryAdjust({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function adjust(delta: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/inventory/${itemId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => adjust(-1)}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ice hover:border-gold/40 disabled:opacity-40"
        aria-label="Decrease stock"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => adjust(1)}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ice hover:border-gold/40 disabled:opacity-40"
        aria-label="Increase stock"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => adjust(10)}
        disabled={loading}
        className="rounded-full border border-white/10 px-3 py-1 text-xs text-ice/60 hover:border-gold/40 disabled:opacity-40"
      >
        +10
      </button>
    </div>
  );
}
