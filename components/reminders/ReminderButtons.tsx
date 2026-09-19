"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SMALL = "rounded-full border border-white/15 px-3 py-1 text-xs text-ice/70 transition hover:border-gold/40 hover:text-gold disabled:opacity-40";

export function ReminderRow({ id, businessName, meta, blockedReason }: { id: string; businessName: string; meta: string; blockedReason: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send", intakeId: id }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error ?? "That didn't work.");
    setMessage(`Reminder ${data.number} sent.`);
    router.refresh();
  }

  return (
    <div className="border-t border-white/5 px-5 py-3 text-sm first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-ice/80">{businessName}</p>
          <p className="text-xs text-ice/40">{message ?? blockedReason ?? meta}</p>
        </div>
        <button type="button" disabled={busy || Boolean(blockedReason)} onClick={() => void send()} className={SMALL}>
          {busy ? "Sending…" : "Send reminder"}
        </button>
      </div>
    </div>
  );
}

export function SendAllReminders({ dueCount }: { dueCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendAll() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sendAll" }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error ?? "That didn't work.");
    setMessage(`${data.sent} sent${data.failures?.length ? `, ${data.failures.length} failed: ${data.failures.slice(0, 2).join(" | ")}` : ""}.`);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy || dueCount === 0} onClick={() => void sendAll()} className={SMALL}>
        {busy ? "Sending…" : `Send all due reminders (${dueCount})`}
      </button>
      {message && <span className="text-xs text-ice/60">{message}</span>}
    </div>
  );
}
