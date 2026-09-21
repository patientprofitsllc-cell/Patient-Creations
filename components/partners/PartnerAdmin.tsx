"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminPartnerRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  type: string;
  website: string | null;
  about: string | null;
  status: string;
  code: string | null;
  percent: number;
  applied: string;
  clicks: number;
  leads: number;
  commissions: number;
  pending: string;
  approved: string;
  approvedCents: number;
  paid: string;
  dashboardUrl: string;
}

const BTN = "min-h-[40px] rounded-full border border-white/15 px-4 text-xs text-ice/80 transition hover:border-gold/50 disabled:opacity-50";
const PRIMARY = "min-h-[40px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-4 text-xs font-semibold text-obsidian disabled:opacity-50";
const INPUT = "min-h-[40px] rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-ice";

/** The owner's partner tools: approve or decline, pause, change a percent, and record a payout made by hand. */
export function PartnerAdmin({ partners, defaultPercent }: { partners: AdminPartnerRow[]; defaultPercent: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [percent, setPercent] = useState<Record<string, string>>({});
  const [ref, setRef] = useState<Record<string, string>>({});

  async function call(key: string, url: string, body: unknown) {
    setBusy(key);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ ok: false, text: data.error ?? "That did not work." });
      else {
        setMessage({ ok: true, text: data.message ?? "Done." });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(null);
    }
  }

  const act = (p: AdminPartnerRow, action: string, extra: Record<string, unknown> = {}) => call(`${action}-${p.id}`, `/api/admin/partners/${p.id}`, { action, ...extra });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ ok: true, text: "Copied." });
    } catch {
      setMessage({ ok: false, text });
    }
  }

  const pctOf = (p: AdminPartnerRow) => {
    const raw = percent[p.id];
    return raw === undefined || raw === "" ? (p.status === "APPLIED" ? defaultPercent : p.percent) : Number(raw);
  };

  return (
    <div className="space-y-4">
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-champagne" : "text-red-300"}`}>
          {message.text}
        </p>
      )}
      {partners.length === 0 && <p className="text-sm text-ice/40">No applications yet. The public page is /partners.</p>}
      {partners.map((p) => (
        <article key={p.id} className="glass-panel space-y-3 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-ice">
                {p.name}
                {p.company ? <span className="text-ice/50"> · {p.company}</span> : null}
              </p>
              <p className="text-xs text-ice/40">
                {p.type} · {p.email}
                {p.website ? ` · ${p.website}` : ""} · applied {p.applied}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs ${p.status === "ACTIVE" ? "border-gold/50 text-gold" : "border-white/15 text-ice/60"}`}>{p.status === "APPLIED" ? "Needs a decision" : p.status.toLowerCase()}</span>
          </div>

          {p.about && <p className="rounded-xl bg-black/20 p-3 text-sm text-ice/70">{p.about}</p>}

          {p.status !== "APPLIED" && p.status !== "DECLINED" && (
            <p className="text-xs text-ice/50">
              Code {p.code} · {p.percent}% · {p.clicks} visits · {p.leads} leads · {p.commissions} commissions · pending {p.pending} · approved {p.approved} · paid {p.paid}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {(p.status === "APPLIED" || p.status === "PAUSED" || p.status === "DECLINED") && (
              <>
                <label className="text-xs text-ice/50">
                  Commission %
                  <input value={percent[p.id] ?? ""} onChange={(e) => setPercent({ ...percent, [p.id]: e.target.value })} inputMode="numeric" placeholder={String(p.status === "APPLIED" ? defaultPercent : p.percent)} className={`${INPUT} ml-2 w-16`} />
                </label>
                <button type="button" disabled={busy !== null} className={PRIMARY} onClick={() => void act(p, "approve", { percent: pctOf(p) })}>
                  {p.status === "APPLIED" ? "Approve" : "Reactivate"}
                </button>
              </>
            )}
            {p.status === "APPLIED" && (
              <button type="button" disabled={busy !== null} className={BTN} onClick={() => { if (window.confirm(`Decline ${p.name}? They will be emailed.`)) void act(p, "decline"); }}>
                Decline
              </button>
            )}
            {p.status === "ACTIVE" && (
              <>
                <label className="text-xs text-ice/50">
                  Commission %
                  <input value={percent[p.id] ?? ""} onChange={(e) => setPercent({ ...percent, [p.id]: e.target.value })} inputMode="numeric" placeholder={String(p.percent)} className={`${INPUT} ml-2 w-16`} />
                </label>
                <button type="button" disabled={busy !== null || percent[p.id] === undefined || percent[p.id] === ""} className={BTN} onClick={() => void act(p, "percent", { percent: pctOf(p) })}>
                  Change percent
                </button>
                <button type="button" disabled={busy !== null} className={BTN} onClick={() => { if (window.confirm(`Pause ${p.name}? New orders will not earn them a commission.`)) void act(p, "pause"); }}>
                  Pause
                </button>
              </>
            )}
            {p.status !== "DECLINED" && (
              <button type="button" className={BTN} onClick={() => void copy(p.dashboardUrl)}>
                Copy their dashboard link
              </button>
            )}
          </div>

          {p.approvedCents > 0 && (
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3">
              <p className="w-full text-sm text-ice/80">
                {p.approved} is approved and waiting. Pay it yourself (Zelle, PayPal, a check), then record it here so they are emailed and it is marked paid.
              </p>
              <label className="grow text-xs text-ice/50">
                How you paid
                <input value={ref[p.id] ?? ""} onChange={(e) => setRef({ ...ref, [p.id]: e.target.value })} maxLength={120} placeholder="Zelle confirmation 123456" className={`${INPUT} mt-1 w-full`} />
              </label>
              <button
                type="button"
                disabled={busy !== null || !(ref[p.id] ?? "").trim()}
                className={PRIMARY}
                onClick={() => { if (window.confirm(`Record ${p.approved} as paid to ${p.name}? Only do this after the money has been sent.`)) void call(`pay-${p.id}`, `/api/admin/partners/${p.id}/pay`, { ref: ref[p.id] }); }}
              >
                Record payment of {p.approved}
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
