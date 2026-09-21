"use client";

import Link from "next/link";
import { useState } from "react";

const field = "mt-1 block w-full rounded-xl border border-white/15 bg-obsidian px-4 py-3 text-base text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

export function PartnerApplyForm({ types }: { types: { key: string; label: string }[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          company: f.get("company"),
          type: f.get("type"),
          website: f.get("website"),
          about: f.get("about"),
          agree: f.get("agree") === "on",
          fax: f.get("fax"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setDone(true);
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-2xl border border-gold/40 bg-gold/5 p-6 text-center">
        <p className="font-display text-2xl text-ice">Thank you. We have your application.</p>
        <p className="mt-2 text-sm text-ice/70">We read every one and will email you once we have decided. Check your spam folder if you do not see our confirmation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-panel space-y-4 rounded-2xl p-5 sm:p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-ice/70">
          Your name
          <input name="name" required maxLength={80} autoComplete="name" className={field} />
        </label>
        <label className="block text-sm text-ice/70">
          Email
          <input name="email" type="email" required maxLength={120} autoComplete="email" inputMode="email" className={field} />
        </label>
        <label className="block text-sm text-ice/70">
          Company or brand (optional)
          <input name="company" maxLength={100} autoComplete="organization" className={field} />
        </label>
        <label className="block text-sm text-ice/70">
          Website (optional)
          <input name="website" maxLength={200} autoComplete="url" inputMode="url" placeholder="example.com" className={field} />
        </label>
      </div>
      <label className="block text-sm text-ice/70">
        What kind of partner are you?
        <select name="type" required defaultValue="" className={field}>
          <option value="" disabled>
            Choose one
          </option>
          {types.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-ice/70">
        How would you send customers our way? (a sentence or two)
        <textarea name="about" required minLength={20} maxLength={600} rows={4} className={field} placeholder="For example: I build websites for local restaurants and would recommend you to clients who need ads or review cards." />
      </label>
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Leave this empty
          <input name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ice/60 has-[:checked]:border-gold/50">
        <input name="agree" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#c39b52]" />
        <span>
          I have read and agree to the{" "}
          <Link href="/partner-terms" target="_blank" className="text-gold underline">
            Partner Program Terms
          </Link>
          , including that I will say I may earn a commission and will not promise results.
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 text-base font-semibold text-obsidian shadow-gold-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto">
        {busy ? "Sending..." : "Apply to be a partner"}
      </button>
    </form>
  );
}
