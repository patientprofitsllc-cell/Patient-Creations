"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminMessageReply({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/admin/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, notifyEmail }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not send your reply.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-2">
      <label htmlFor="admin-reply" className="sr-only">
        Reply to the customer
      </label>
      <textarea
        id="admin-reply"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Reply into the customer's private thread…"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-ice/50">
          <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
          Also email them a link to the thread
        </label>
        <button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          className="rounded-full bg-gold px-5 py-2 text-xs font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send reply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
