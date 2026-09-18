"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const BUTTON =
  "rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-50";

export function PreviewActions({ token, canRevise }: { token: string; canRevise: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "revise">("idle");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: "approve" | "revise", body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/preview/${token}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (mode === "revise") {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <label htmlFor="revision-note" className="block text-sm text-ice/80">
          What would you like changed?
        </label>
        <p className="mt-1 text-xs text-ice/40">
          Things like wording, hours, phone number, address, services, or a color. You have one included revision, so put everything in one message.
        </p>
        <textarea
          id="revision-note"
          rows={4}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setMode("idle")} disabled={busy} className="text-sm text-ice/50 hover:text-gold">
            Cancel
          </button>
          <button type="button" onClick={() => void call("revise", { note })} disabled={busy || note.trim().length < 5} className={BUTTON}>
            {busy ? "Sending…" : "Send my change request"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => void call("approve")} disabled={busy} className={BUTTON}>
          {busy ? "Approving…" : "Approve my website"}
        </button>
        {canRevise && (
          <button
            type="button"
            onClick={() => setMode("revise")}
            disabled={busy}
            className="champagne-border rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10 disabled:opacity-50"
          >
            Request my revision
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
