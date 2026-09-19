"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BUSINESS_TYPES, WEBSITE_GOALS } from "@/lib/site/offer";
import { FONT_STYLES } from "@/lib/intake/schema";
import { CALENDLY_URL } from "@/lib/config/calendly";
import { CONTACT_EMAIL } from "@/lib/config/site";

export interface IntakeValues {
  businessName: string;
  businessType: string;
  phone: string;
  existingWebsite: string;
  description: string;
  address: string;
  hours: string;
  services: string;
  pricing: string;
  bookingUrl: string;
  socialUrls: string;
  logoUrl: string;
  colors: string;
  fontStyle: string;
  styleNotes: string;
  mediaLinks: string;
  goal: string;
  goalNotes: string;
}

const STEPS = ["Your business", "Details", "Look and feel", "Your goal"] as const;

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-ice placeholder:text-ice/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ice/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ice/40">{hint}</span>}
    </label>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function IntakeWizard({
  token,
  initial,
  statusPath,
}: {
  token: string;
  initial: IntakeValues;
  /** Private project page, when the project already exists. */
  statusPath: string | null;
}) {
  const [values, setValues] = useState<IntakeValues>(initial);
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<null | "started" | "waiting_for_payment">(null);

  const dirty = useRef<Set<keyof IntakeValues>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(values);
  latest.current = values;

  useEffect(() => {
    fetch(`/api/intake/${token}/start`, { method: "POST" }).catch(() => {});
  }, [token]);

  // Sends only the fields that changed since the last successful save.
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (dirty.current.size === 0) return true;
    const keys = [...dirty.current];
    const body: Record<string, string> = {};
    for (const k of keys) {
      const v = latest.current[k];
      // Enum fields are only sent once chosen; the server rejects an empty enum.
      if ((k === "goal" || k === "fontStyle") && !v) continue;
      body[k] = v;
    }
    dirty.current = new Set();
    setSave("saving");
    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSave("saved");
      return true;
    } catch {
      keys.forEach((k) => dirty.current.add(k));
      setSave("error");
      return false;
    }
  }, [token]);

  function set<K extends keyof IntakeValues>(key: K, value: IntakeValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    dirty.current.add(key);
    setSave("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 900);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const businessOk = Boolean(values.businessName.trim() && values.businessType && values.phone.replace(/\D/g, "").length >= 7);

  async function next() {
    setError(null);
    if (step === 0 && !businessOk) {
      setError("Please add your business name, type, and phone number.");
      return;
    }
    if (!(await flush())) {
      setError("We couldn't save just now. Check your connection and try again.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function submit() {
    setError(null);
    if (!businessOk) {
      setStep(0);
      setError("Please add your business name, type, and phone number.");
      return;
    }
    if (!values.goal) {
      setError("Pick what you'd like visitors to do on your site.");
      return;
    }
    if (!confirmed) {
      setError("Please tick the box to confirm your information.");
      return;
    }
    setSubmitting(true);
    if (!(await flush())) {
      setSubmitting(false);
      setError("We couldn't save your answers. Check your connection and try again.");
      return;
    }
    try {
      const res = await fetch(`/api/intake/${token}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: confirmed }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setResult(data.production === "started" ? "started" : "waiting_for_payment");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="font-display text-2xl text-ice">{result === "started" ? "You're all set." : "Thanks, we have your info."}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ice/60">
          {result === "started"
            ? "Your build has started. Our target is 72 hours, and you'll see each step on your private project page."
            : "We'll start building as soon as your payment is confirmed. You'll see progress on your private project page."}
        </p>
        {statusPath && (
          <Link
            href={statusPath}
            className="mt-6 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
          >
            Open my project page
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gradient-to-r from-gold-deep to-gold" : "bg-white/10"}`} />
            <p className={`mt-2 hidden text-xs sm:block ${i === step ? "text-gold" : "text-ice/40"}`}>{label}</p>
          </li>
        ))}
      </ol>
      <p className="mb-4 text-xs text-ice/40 sm:hidden">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div className="glass-panel space-y-4 rounded-2xl p-6">
        {step === 0 && (
          <>
            <Field label="Business name *">
              <input className={INPUT} value={values.businessName} maxLength={120} onChange={(e) => set("businessName", e.target.value)} autoComplete="organization" />
            </Field>
            <Field label="Business type *">
              <select className={INPUT} value={values.businessType} onChange={(e) => set("businessType", e.target.value)}>
                <option value="">Choose one</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Business phone *" hint="Shown on your site so customers can call or text.">
              <input className={INPUT} type="tel" value={values.phone} maxLength={40} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
            </Field>
            <Field label="Existing website or domain" hint="Optional. Tell us if you already own a domain.">
              <input className={INPUT} value={values.existingWebsite} maxLength={200} onChange={(e) => set("existingWebsite", e.target.value)} />
            </Field>
            <Field label="What does your business do?" hint="A sentence or two is plenty.">
              <textarea className={INPUT} rows={3} value={values.description} maxLength={1500} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Address or service area">
              <input className={INPUT} value={values.address} maxLength={300} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
            </Field>
            <Field label="Hours">
              <textarea className={INPUT} rows={2} value={values.hours} maxLength={600} placeholder="Mon to Fri 9 to 5, Sat 10 to 2" onChange={(e) => set("hours", e.target.value)} />
            </Field>
            <Field label="Services or products" hint="One per line.">
              <textarea className={INPUT} rows={4} value={values.services} maxLength={3000} onChange={(e) => set("services", e.target.value)} />
            </Field>
            <Field label="Prices" hint="Optional. Skip it if you'd rather quote in person.">
              <textarea className={INPUT} rows={3} value={values.pricing} maxLength={3000} onChange={(e) => set("pricing", e.target.value)} />
            </Field>
            <Field label="Booking or ordering link" hint="Optional. The tool you already use, like Calendly, Squire, or Square.">
              <input className={INPUT} value={values.bookingUrl} maxLength={300} onChange={(e) => set("bookingUrl", e.target.value)} />
            </Field>
            <Field label="Social media links" hint="One per line.">
              <textarea className={INPUT} rows={3} value={values.socialUrls} maxLength={1200} onChange={(e) => set("socialUrls", e.target.value)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-ice/60">
              <p>Everything here is optional.</p>
              <p className="mt-2">
                To share a logo or photos, email them to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Logo and photos for ${values.businessName || "my website"}`)}`}
                  className="break-all text-gold hover:brightness-110"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                with your business name in the subject, or{" "}
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="text-gold hover:brightness-110">
                  book a quick video call
                </a>{" "}
                and share them there. You can also paste a link below.
              </p>
            </div>
            <Field label="Logo link">
              <input className={INPUT} value={values.logoUrl} maxLength={300} onChange={(e) => set("logoUrl", e.target.value)} />
            </Field>
            <Field label="Brand colors" hint="Names or hex codes, like navy and gold.">
              <input className={INPUT} value={values.colors} maxLength={200} onChange={(e) => set("colors", e.target.value)} />
            </Field>
            <Field label="Style">
              <select className={INPUT} value={values.fontStyle} onChange={(e) => set("fontStyle", e.target.value)}>
                <option value="">No preference</option>
                {FONT_STYLES.filter((f) => f !== "No preference").map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Photos and videos" hint="Links, one per line.">
              <textarea className={INPUT} rows={3} value={values.mediaLinks} maxLength={2000} onChange={(e) => set("mediaLinks", e.target.value)} />
            </Field>
            <Field label="Anything about the look you want, or sites you like">
              <textarea className={INPUT} rows={3} value={values.styleNotes} maxLength={1500} onChange={(e) => set("styleNotes", e.target.value)} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm text-ice/80">What should visitors do on your website? *</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {WEBSITE_GOALS.map((g) => (
                  <label
                    key={g.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                      values.goal === g.value ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/70 hover:border-gold/40"
                    }`}
                  >
                    <input type="radio" name="goal" value={g.value} checked={values.goal === g.value} onChange={() => set("goal", g.value)} />
                    {g.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Anything else we should know?" hint="Optional.">
              <textarea className={INPUT} rows={3} value={values.goalNotes} maxLength={800} onChange={(e) => set("goalNotes", e.target.value)} />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ice/60 has-[:checked]:border-gold/50">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c39b52]" />
              <span>
                I confirm that the information and materials I've given are accurate, that I own them or have permission to use them, and that my website will be built from what I've provided. I'll review the preview before it goes live. See the{" "}
                <a href="/terms#your-content" target="_blank" rel="noopener noreferrer" className="text-gold underline">Terms of Service</a>.
              </span>
            </label>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-sm text-ice/50 hover:text-gold disabled:invisible"
        >
          ← Back
        </button>
        <span aria-live="polite" className="text-xs text-ice/40">
          {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : save === "error" ? "Not saved yet" : ""}
        </span>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => void next()}
            className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send to the team"}
          </button>
        )}
      </div>
    </div>
  );
}
