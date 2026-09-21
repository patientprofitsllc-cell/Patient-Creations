"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SMALL = "rounded-full border border-white/15 px-3 py-1 text-xs text-ice/70 transition hover:border-gold/40 hover:text-gold disabled:opacity-40";

export function FollowupRow({ id, label, email, why, subject, blockedReason }: { id: string; label: string; email: string; why: string; subject: string; blockedReason: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send", id }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error ?? "That did not work.");
    setMessage("Sent.");
    router.refresh();
  }

  return (
    <li className="border-t border-white/5 px-5 py-3 text-sm first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ice/80">
            {label} <span className="text-ice/40">to {email}</span>
          </p>
          <p className="text-xs text-ice/40">{why}. Subject: &ldquo;{subject}&rdquo;</p>
          {(message || blockedReason) && <p className={`mt-1 text-xs ${blockedReason && !message ? "text-amber-300/80" : "text-ice/60"}`}>{message ?? blockedReason}</p>}
        </div>
        <button type="button" disabled={busy || Boolean(blockedReason)} onClick={() => void send()} className={SMALL}>
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </li>
  );
}

export function SendAllFollowups({ readyCount }: { readyCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendAll() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sendAll" }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error ?? "That did not work.");
    setMessage(`${data.sent} sent${data.failures?.length ? `, ${data.failures.length} failed: ${data.failures.slice(0, 2).join(" | ")}` : ""}.`);
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy || readyCount === 0} onClick={() => void sendAll()} className={SMALL}>
        {busy ? "Sending..." : `Send everything that is ready (${readyCount})`}
      </button>
      {message && <span className="text-xs text-ice/60">{message}</span>}
    </div>
  );
}
