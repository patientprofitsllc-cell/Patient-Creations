"use client";

import { useState } from "react";

export function EmailTestButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/email-test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data.ok && data.provider === "resend") setResult({ ok: true, text: `Sent to ${data.to}. Check that inbox (and spam). If it doesn't arrive, your domain setup in Resend needs attention.` });
    else if (data.ok) setResult({ ok: false, text: "No email service is configured here (RESEND_API_KEY is missing), so nothing was actually sent." });
    else setResult({ ok: false, text: data.error ?? "That didn't work." });
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-ice">Email sending</p>
      <p className="mt-1 text-xs text-ice/50">Customers get their intake link, preview link, and reminders by email. This sends a test to your own address and shows the exact result.</p>
      <button type="button" disabled={busy} onClick={() => void run()} className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50">
        {busy ? "Sending…" : "Send a test email"}
      </button>
      {result && <p className={`mt-3 text-sm ${result.ok ? "text-ice/80" : "text-red-400"}`}>{result.text}</p>}
    </div>
  );
}
