"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usd } from "@/lib/pricing/catalog";
import { REWARD_CARD_CENTS } from "@/lib/reviews/rewardPrice";

export function ReviewForm({ projectId, existingRating, reward }: { projectId: string; existingRating?: number; reward?: { code: string; used: boolean } | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(existingRating ?? 5);
  const [text, setText] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(Boolean(existingRating));
  const [code, setCode] = useState<string | null>(reward?.used ? null : reward?.code ?? null);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/portal/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, rating, text, canPublish }),
    });
    const data = (await res.json().catch(() => ({}))) as { rewardCode?: string };
    if (data.rewardCode) setCode(data.rewardCode);
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  if (done)
    return (
      <div className="space-y-3">
        <p className="text-sm text-gold">Thanks for your feedback.</p>
        {code && (
          <div className="glass-panel rounded-xl p-4 text-sm">
            <p className="text-ice">Your thank-you: one Business Card for {usd(REWARD_CARD_CENTS)}, plus shipping and tax.</p>
            <p className="mt-2 text-ice/60">
              Use code <span className="select-all font-mono text-gold">{code}</span> at checkout. One card, one time.
            </p>
            <a href={`/checkout?product=nfc-cards&code=${code}`} className="mt-3 inline-block text-gold underline">Get my {usd(REWARD_CARD_CENTS)} card →</a>
          </div>
        )}
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-ice/60">
        Tell us honestly how it went, good or bad. Every review gets a thank-you: one Business Card for {usd(REWARD_CARD_CENTS)} (plus shipping and tax).
      </p>
      <div className="flex gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === rating}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => setRating(n)}
            className={n <= rating ? "text-champagne" : "text-ice/20"}
          >
            ★
          </button>
        ))}
      </div>
      <label htmlFor="review-text" className="sr-only">Your review</label>
      <textarea
        id="review-text"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
        rows={3}
        placeholder="What was your experience like?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-ice/60">
        <input type="checkbox" checked={canPublish} onChange={(e) => setCanPublish(e.target.checked)} />
        You may publish this review publicly.
      </label>
      <button
        onClick={submit}
        disabled={loading}
        className="rounded-full bg-gold px-5 py-2 text-sm text-obsidian transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}
