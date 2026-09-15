"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProjectUpdateForm({ projectId, statusUrl }: { projectId: string; statusUrl: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, notifyEmail }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("");
      router.refresh();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(statusUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — no-op, link is still visible below
    }
  }

  return (
    <div className="glass-panel space-y-3 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ice/40">Public status page (no login required)</p>
        <button
          type="button"
          onClick={copyLink}
          className="whitespace-nowrap rounded-full border border-gold/30 px-3 py-1 text-xs text-champagne hover:bg-gold/10"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <code className="block break-all rounded-lg bg-black/40 p-3 text-xs text-gold">{statusUrl}</code>

      <label htmlFor="update-message" className="sr-only">Update message</label>
      <textarea
        id="update-message"
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Post a plain-language update the customer will see (and optionally get emailed)…"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-ice/60">
          <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
          Also email the customer
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !message.trim()}
          className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? "Posting…" : "Post Update"}
        </button>
      </div>
    </div>
  );
}
