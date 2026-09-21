"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const field = "mt-1 block w-full min-h-[44px] rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-base text-ice placeholder:text-ice/30 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

/** A partner introduces a business from their own dashboard. The dashboard link is the credential. */
export function PartnerLeadForm({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/partners/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          businessName: f.get("businessName"),
          contactName: f.get("contactName") || undefined,
          email: f.get("email"),
          phone: f.get("phone") || undefined,
          note: f.get("note") || undefined,
          permission: f.get("permission") === "on",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ ok: false, text: data.error ?? "That did not work. Please try again." });
      else {
        setMessage({ ok: true, text: "Thank you. We have their details and will reach out ourselves." });
        form.reset();
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: "We could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass-panel space-y-4 rounded-2xl p-5 sm:p-6">
      <div>
        <h3 className="text-ice">Introduce a business</h3>
        <p className="mt-1 text-xs text-ice/40">Already talked to someone who needs us? Give us their details and we will reach out. If they order, the commission is yours. We never contact anyone automatically.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-ice/70">Business name<input name="businessName" required maxLength={120} className={field} /></label>
        <label className="block text-sm text-ice/70">Contact name (optional)<input name="contactName" maxLength={80} className={field} /></label>
        <label className="block text-sm text-ice/70">Their email<input name="email" type="email" required maxLength={120} inputMode="email" className={field} /></label>
        <label className="block text-sm text-ice/70">Their phone (optional)<input name="phone" maxLength={40} inputMode="tel" className={field} /></label>
      </div>
      <label className="block text-sm text-ice/70">
        What do they need? (optional)
        <textarea name="note" maxLength={300} rows={3} className={field} />
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ice/60 has-[:checked]:border-gold/50">
        <input name="permission" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#c39b52]" />
        <span>They expect to hear from Patient Creations, and they agreed to me sharing their details.</span>
      </label>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-champagne" : "text-red-300"}`}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={busy} className="min-h-[44px] rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 text-sm font-semibold text-obsidian disabled:opacity-50">
        {busy ? "Sending..." : "Send to Patient Creations"}
      </button>
    </form>
  );
}
