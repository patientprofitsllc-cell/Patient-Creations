"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";
const GHOST = "rounded-full border border-white/15 px-5 py-2 text-sm text-ice/70 transition hover:border-gold/40 hover:text-gold disabled:opacity-50";

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  AUDITED: "Website checked",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  CALL_BOOKED: "Call booked",
  WON: "Won (became a customer)",
  LOST: "Lost",
  DO_NOT_CONTACT: "Do not contact",
};

export function ProspectControls({
  id,
  status,
  nextFollowUp,
  hasWebsite,
  phone,
  email,
  website,
}: {
  id: string;
  status: string;
  nextFollowUp: string;
  hasWebsite: boolean;
  phone: string;
  email: string;
  website: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(nextFollowUp);
  const [contact, setContact] = useState({ phone, email, website });
  const closed = status === "DO_NOT_CONTACT";

  async function call(path: string, method: string, body: unknown, ok: string) {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/admin/prospects/${id}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(typeof data.error === "string" ? data.error : "That didn't work.");
    setMessage(ok);
    router.refresh();
  }

  return (
    <div className="glass-panel space-y-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => void call("/audit", "POST", null, "Website checked.")} className={BUTTON}>
          {hasWebsite ? "Check their website" : "Record: no website"}
        </button>
        <button type="button" disabled={busy || closed || ["WON", "LOST"].includes(status)} onClick={() => void call("", "PATCH", { markContacted: 3 }, "Marked as contacted. Follow-up set for 3 days.")} className={GHOST}>
          I sent them a message
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs text-ice/50">
          Stage
          <select
            className={`${INPUT} mt-1`}
            value={status}
            disabled={busy || closed}
            onChange={(e) => void call("", "PATCH", { status: e.target.value }, "Stage updated.")}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ice/50">
          Next follow-up
          <div className="mt-1 flex gap-2">
            <input type="date" className={INPUT} value={followUp} disabled={closed} onChange={(e) => setFollowUp(e.target.value)} />
            <button
              type="button"
              disabled={busy || closed}
              onClick={() => void call("", "PATCH", { nextFollowUpAt: followUp ? new Date(`${followUp}T09:00:00`).toISOString() : null }, "Follow-up saved.")}
              className={GHOST}
            >
              Save
            </button>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input className={INPUT} placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
        <input className={INPUT} placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
        <input className={INPUT} placeholder="Website" value={contact.website} onChange={(e) => setContact({ ...contact, website: e.target.value })} />
        <div className="sm:col-span-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void call("", "PATCH", { phone: contact.phone || null, email: contact.email || null, website: contact.website || null }, "Contact details saved.")}
            className={GHOST}
          >
            Save contact details
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <input className={INPUT} placeholder="Add a note (what they said, what to do next)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        <button
          type="button"
          disabled={busy || !note.trim()}
          onClick={() => {
            void call("", "PATCH", { note }, "Note added.");
            setNote("");
          }}
          className={GHOST}
        >
          Add
        </button>
      </div>

      {closed && <p className="text-xs text-ice/50">This business asked not to be contacted. Its stage is locked and no follow-up will be scheduled.</p>}
      {message && <p className="text-sm text-ice/70">{message}</p>}
    </div>
  );
}
