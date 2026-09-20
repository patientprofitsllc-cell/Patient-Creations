"use client";

import { useState } from "react";
import { BRIEF_FIELDS, type BriefKey } from "@/lib/ads/plans";

const BUTTON =
  "inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-50";
const FIELD = "mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30";

/** The customer's monthly brief. Saved to their plan; they can change it any time before we start the month's ads. */
export function BriefForm({ token, initial, disabled }: { token: string; initial: Partial<Record<BriefKey, string>>; disabled: boolean }) {
  const [values, setValues] = useState<Record<BriefKey, string>>(() => Object.fromEntries(BRIEF_FIELDS.map((f) => [f.key, initial[f.key] ?? ""])) as Record<BriefKey, string>);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setState("saving");
    setError(null);
    try {
      const res = await fetch(`/api/ads/${token}/brief`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("saved");
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {BRIEF_FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={`brief-${f.key}`} className="block text-sm text-ice/80">
            {f.label}
            {f.required && <span className="text-gold"> *</span>}
          </label>
          <p className="text-xs text-ice/40">{f.hint}</p>
          <textarea
            id={`brief-${f.key}`}
            rows={f.key === "offer" ? 3 : 2}
            maxLength={f.max}
            disabled={disabled}
            value={values[f.key]}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }));
              setState("idle");
            }}
            className={FIELD}
          />
        </div>
      ))}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={disabled || state === "saving"} className={BUTTON}>
          {state === "saving" ? "Saving…" : "Save this month's brief"}
        </button>
        {state === "saved" && (
          <p role="status" className="text-sm text-champagne">
            Saved. Thank you.
          </p>
        )}
      </div>
    </form>
  );
}

/** Opens Stripe's billing page (update the card, or cancel). */
export function BillingButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ads/${token}/portal`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => void open()} disabled={busy} className={BUTTON}>
        {busy ? "Opening…" : "Manage billing or cancel"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
