"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";

export function AdminWebsitePanel({
  projectId,
  status,
  version,
  previewUrl,
  liveUrl,
  openRevisionNote,
  warnings,
}: {
  projectId: string;
  status: string;
  version: number;
  previewUrl: string | null;
  liveUrl: string | null;
  openRevisionNote: string | null;
  warnings: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const [f, setF] = useState({ tagline: "", about: "", hours: "", address: "", phone: "", accent: "" });

  async function send(payload: unknown, okText: string) {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/admin/projects/${projectId}/website`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(typeof data.error === "string" ? data.error : "That didn't work. Check the fields and try again.");
      return;
    }
    setMessage(okText);
    router.refresh();
  }

  function applyPatch() {
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(f)) if (v.trim()) patch[k] = v.trim();
    if (Object.keys(patch).length === 0) {
      setMessage("Fill in at least one field to change.");
      return;
    }
    void send({ action: "patch", patch }, "Saved as a new version and sent to the customer.");
    setF({ tagline: "", about: "", hours: "", address: "", phone: "", accent: "" });
  }

  return (
    <div className="glass-panel space-y-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-ice">
          Version {version} · <span className="text-gold">{status}</span>
        </p>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:brightness-110">
            Open the customer preview →
          </a>
        )}
      </div>

      {warnings.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-xs text-ice/50">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      {openRevisionNote && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
          <p className="text-xs uppercase tracking-wide text-gold/70">Revision requested</p>
          <p className="mt-1 whitespace-pre-line">{openRevisionNote}</p>
        </div>
      )}

      {status === "PREVIEW" && (
        <div>
          <p className="mb-2 text-xs text-ice/50">Apply a change (leave a field blank to keep it). Sends a new preview to the customer.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={INPUT} placeholder="Headline" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} />
            <input className={INPUT} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input className={INPUT} placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            <input className={INPUT} placeholder="Accent color, like #1a2b3c" value={f.accent} onChange={(e) => setF({ ...f, accent: e.target.value })} />
            <textarea className={`${INPUT} sm:col-span-2`} rows={2} placeholder="Intro text" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} />
            <textarea className={`${INPUT} sm:col-span-2`} rows={2} placeholder="Hours" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} />
          </div>
          <button type="button" disabled={busy} onClick={applyPatch} className={`${BUTTON} mt-3`}>
            Apply change
          </button>
        </div>
      )}

      {status === "APPROVED" && (
        <div>
          <p className="mb-2 text-sm text-ice/70">The customer approved this version. After you publish it, enter where it lives to close out the project.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className={INPUT} placeholder="https://their-website.com" value={live} onChange={(e) => setLive(e.target.value)} />
            <button type="button" disabled={busy || live.trim().length < 4} onClick={() => void send({ action: "launch", liveUrl: live }, "Marked live. The customer has been emailed.")} className={BUTTON}>
              Mark as live
            </button>
          </div>
        </div>
      )}

      {status === "LIVE" && liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-gold hover:brightness-110">
          {liveUrl}
        </a>
      )}

      {message && <p className="text-sm text-ice/70">{message}</p>}
    </div>
  );
}
