"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const input = "w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-ice placeholder:text-ice/30";
const button = "rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-40";

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return res.ok ? null : data.error ?? "Something went wrong. Try again.";
}

export function SecurityForms({ email, pinOn, locked, defaultPassword, thisDeviceTrusted }: { email: string; pinOn: boolean; locked: boolean; defaultPassword: boolean; thisDeviceTrusted: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(url: string, method: string, body: unknown, done: string) {
    setBusy(true);
    setMsg(null);
    const err = await call(url, method, body);
    setBusy(false);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: done });
    if (!err) router.refresh();
    return !err;
  }

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h2 className="font-display text-2xl text-ice">Security</h2>
        <p className="mt-1 text-sm text-ice/50">Signed in as {email}.</p>
      </div>

      {defaultPassword && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          You're still using the starter password. Anyone who has seen this site's code knows it. Change it below now.
        </p>
      )}
      {msg && <p role="status" className={`rounded-xl p-4 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-200" : "bg-red-500/10 text-red-200"}`}>{msg.text}</p>}

      <form
        className="glass-panel space-y-4 rounded-2xl p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          const ok = await run("/api/admin/security/pin", "POST", { password: f.get("password"), pin: f.get("pin"), confirm: f.get("confirm") }, "PIN saved, and this device is now trusted. Bookmark patientcreations.com/auth/pin or add it to your home screen.");
          if (ok) form.reset();
        }}
      >
        <h3 className="font-display text-xl text-ice">Quick PIN sign-in</h3>
        <p className="text-sm text-ice/60">
          {pinOn ? (locked ? "On, but locked after 5 wrong tries. Signing in with your password unlocks it." : "On.") : "Off."} {thisDeviceTrusted ? "This device is trusted." : "This device isn't trusted yet: saving a PIN here trusts it."}
        </p>
        <p className="text-sm text-ice/60">Your PIN only works on devices you've trusted here, at patientcreations.com/auth/pin. Five wrong tries lock it and alert you.</p>
        <input className={input} name="password" type="password" autoComplete="current-password" placeholder="Current password" required />
        <input className={input} name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="off" placeholder="New 4-digit PIN" required />
        <input className={input} name="confirm" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="off" placeholder="Type the PIN again" required />
        <button className={button} disabled={busy}>{pinOn ? "Change PIN and trust this device" : "Turn on PIN and trust this device"}</button>
      </form>

      <form
        className="glass-panel space-y-4 rounded-2xl p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          const ok = await run("/api/admin/security/password", "POST", { password: f.get("password"), next: f.get("next"), confirm: f.get("confirm") }, "Password changed.");
          if (ok) form.reset();
        }}
      >
        <h3 className="font-display text-xl text-ice">Password</h3>
        <input className={input} name="password" type="password" autoComplete="current-password" placeholder="Current password" required />
        <input className={input} name="next" type="password" autoComplete="new-password" minLength={12} placeholder="New password (12+ characters)" required />
        <input className={input} name="confirm" type="password" autoComplete="new-password" minLength={12} placeholder="New password again" required />
        <button className={button} disabled={busy}>Change password</button>
      </form>

      <div className="glass-panel space-y-4 rounded-2xl p-6">
        <h3 className="font-display text-xl text-ice">Devices</h3>
        <p className="text-sm text-ice/60">Lost a phone? Forget every trusted device. The PIN then works nowhere until you trust a device again.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => run("/api/admin/security/devices", "DELETE", undefined, "All devices forgotten.")} className="rounded-full border border-white/15 px-5 py-3 text-sm text-ice hover:border-gold">
            Forget all devices
          </button>
          {pinOn && (
            <button type="button" disabled={busy} onClick={() => run("/api/admin/security/pin", "DELETE", undefined, "PIN sign-in turned off.")} className="rounded-full border border-white/15 px-5 py-3 text-sm text-ice hover:border-gold">
              Turn PIN off
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
