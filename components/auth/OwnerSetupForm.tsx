"use client";

import Link from "next/link";
import { useState } from "react";

const input = "w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-pc-cream placeholder:text-pc-mute/60";

export function OwnerSetupForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"created" | "reset" | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/owner-setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: f.get("key"), email: f.get("email"), password: f.get("password"), confirm: f.get("confirm") }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; result?: "created" | "reset" };
    setBusy(false);
    if (res.ok && data.result) setDone(data.result);
    else setError(data.error ?? "Something went wrong. Try again.");
  }

  if (done)
    return (
      <div className="mt-8 max-w-sm text-center">
        <p className="text-pc-sand">{done === "created" ? "Your owner account is ready." : "Your password was changed."}</p>
        <p className="mt-3 text-sm text-pc-mute">Sign in with your email and the password you just chose. Then delete OWNER_SETUP_KEY from Netlify so this page turns off.</p>
        <Link href="/auth/login" className="mt-6 inline-flex min-h-[52px] items-center rounded-xl bg-pc-sand px-6 font-semibold text-pc-ink">
          Sign in
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="mt-8 w-full max-w-sm space-y-3">
      <p className="text-sm text-pc-mute">Creates your owner account, or sets a new password if it already exists.</p>
      <input className={input} name="key" type="password" autoComplete="off" placeholder="Setup key (from Netlify)" required />
      <input className={input} name="email" type="email" autoComplete="email" placeholder="Your email" required />
      <input className={input} name="password" type="password" autoComplete="new-password" minLength={12} placeholder="New password (12+ characters)" required />
      <input className={input} name="confirm" type="password" autoComplete="new-password" minLength={12} placeholder="New password again" required />
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button disabled={busy} className="min-h-[52px] w-full rounded-xl bg-pc-sand font-semibold text-pc-ink disabled:opacity-50">
        {busy ? "Working…" : "Set up my account"}
      </button>
    </form>
  );
}
