"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";

export interface PanelVersion {
  version: number;
  status: string;
  note: string | null;
  created: string;
}

export interface PanelChecklist {
  ready: boolean;
  lines: { id: string; text: string; kind: "auto" | "manual"; ok: boolean; required: boolean; detail?: string }[];
}

export function AdminWebsitePanel({
  projectId,
  status,
  version,
  previewUrl,
  liveUrl,
  openRevisionNote,
  warnings,
  copyMode,
  versions,
  checklist,
}: {
  versions: PanelVersion[];
  checklist: PanelChecklist | null;
  projectId: string;
  status: string;
  version: number;
  previewUrl: string | null;
  liveUrl: string | null;
  openRevisionNote: string | null;
  warnings: string[];
  copyMode: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);
  const anyLive = versions.some((v) => v.status === "LIVE");
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
        <div className="flex flex-wrap gap-4">
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:brightness-110">
              Open the customer preview →
            </a>
          )}
          <a href={`/api/admin/projects/${projectId}/website/download`} className="text-xs text-gold hover:brightness-110">
            Download the site file (.html) ↓
          </a>
        </div>
      </div>

      <p className="text-xs text-ice/50">
        Copy: {copyMode === "model" ? "written by AI (Claude) from the customer's own facts" : "the customer's own wording (AI copy wasn't used for this build)"}
      </p>

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

      {checklist && status !== "LIVE" && (
        <div className="rounded-lg border border-white/10 p-4">
          <p className="text-sm text-ice">Launch checklist for version {version}</p>
          <p className="mb-3 text-xs text-ice/50">Every required line must be true before the site goes live. The ones you tick apply to this version only, so a new or restored version has to be looked at again.</p>
          <ul className="space-y-2">
            {checklist.lines.map((l) => (
              <li key={l.id} className="flex items-start gap-3 text-sm">
                {l.kind === "manual" ? (
                  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#c39b52]" checked={l.ok} disabled={busy} aria-label={l.text} onChange={(e) => void send({ action: "check", item: l.id, checked: e.target.checked }, e.target.checked ? "Ticked." : "Unticked.")} />
                ) : (
                  <span aria-hidden="true" className={`mt-0.5 w-5 shrink-0 text-center ${l.ok ? "text-champagne" : l.required ? "text-red-300" : "text-ice/40"}`}>{l.ok ? "✓" : l.required ? "✗" : "!"}</span>
                )}
                <span className={l.ok ? "text-ice/70" : "text-ice"}>
                  {l.text}
                  {!l.required && <span className="text-ice/40"> (advisory)</span>}
                  {!l.ok && l.detail && <span className="block text-xs text-ice/50">{l.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "APPROVED" && (
        <div>
          <p className="mb-2 text-sm text-ice/70">The customer approved this version. Download the site file above, put it on your hosting, and point their domain at it. Then enter the live address here to close out the project and email them.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className={INPUT} placeholder="https://their-website.com" value={live} onChange={(e) => setLive(e.target.value)} />
            <button type="button" disabled={busy || live.trim().length < 4 || !checklist?.ready} onClick={() => void send({ action: "launch", liveUrl: live }, "Marked live. The customer has been emailed.")} className={BUTTON}>
              Mark as live
            </button>
          </div>
          {checklist && !checklist.ready && (
            <p className="mt-2 text-xs text-ice/50">
              Finish the checklist above to enable this.{" "}
              <button type="button" disabled={busy || live.trim().length < 4} className="text-red-300 underline disabled:opacity-40" onClick={() => { if (window.confirm("Launch without finishing the checklist? This is recorded.")) void send({ action: "launch", liveUrl: live, skipChecklist: true }, "Marked live without the full checklist. This was recorded."); }}>
                Launch anyway
              </button>
            </p>
          )}
        </div>
      )}

      {status === "LIVE" && liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-gold hover:brightness-110">
          {liveUrl}
        </a>
      )}

      {versions.length > 1 && (
        <div className="rounded-lg border border-white/10 p-4">
          <p className="text-sm text-ice">Version history</p>
          <p className="mb-3 text-xs text-ice/50">Nothing is ever deleted. Going back makes a new version that is a copy of the one you pick, and the customer approves it again.</p>
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.version} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                <span className="text-ice/80">
                  Version {v.version} <span className="text-gold">{v.status}</span> <span className="text-ice/40">· {v.created}</span>
                  {v.note && <span className="block text-xs text-ice/50">{v.note}</span>}
                </span>
                {v.version !== version && !anyLive && (
                  <button type="button" disabled={busy} onClick={() => setRestoring(restoring === v.version ? null : v.version)} className="min-h-[36px] rounded-full border border-white/15 px-3 text-xs text-ice/70 hover:border-gold/40">
                    Go back to this one
                  </button>
                )}
              </li>
            ))}
          </ul>
          {restoring !== null && (
            <div className="mt-3 space-y-2 rounded-lg bg-black/20 p-3">
              <input className={INPUT} placeholder="Why go back? (recorded)" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
              <label className="flex items-center gap-2 text-xs text-ice/60">
                <input type="checkbox" className="h-4 w-4 accent-[#c39b52]" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                Tell the customer to look at the new preview
              </label>
              <button
                type="button"
                disabled={busy || reason.trim().length < 3}
                className={BUTTON}
                onClick={() => {
                  if (!window.confirm(`Restore version ${restoring}? It becomes version ${version + 1}, and the customer will need to approve it again.`)) return;
                  void send({ action: "rollback", toVersion: restoring, reason, notify }, "Restored as a new version, waiting for approval.");
                  setRestoring(null);
                  setReason("");
                }}
              >
                Restore version {restoring}
              </button>
            </div>
          )}
        </div>
      )}

      {message && <p className="text-sm text-ice/70">{message}</p>}
    </div>
  );
}
