"use client";

import { useState } from "react";

interface NfcIntakeExisting {
  socialMediaPage: string | null;
  nfcContent: string;
  targetLink: string;
  cardColor: string | null;
  phone: string;
  email: string;
}

export function NfcIntakeForm({
  orderId,
  existing,
  showColorChoice,
  cardCount = 1,
}: {
  orderId: string;
  existing: NfcIntakeExisting | null;
  showColorChoice: boolean;
  cardCount?: number;
}) {
  const multi = cardCount > 1;
  const [socialMediaPage, setSocialMediaPage] = useState(existing?.socialMediaPage ?? "");
  const [nfcContent, setNfcContent] = useState(existing?.nfcContent ?? "");
  const [targetLink, setTargetLink] = useState(existing?.targetLink ?? "");
  const [cardColor, setCardColor] = useState<"black" | "white" | "">((existing?.cardColor as "black" | "white") ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [saved, setSaved] = useState(Boolean(existing));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/nfc-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          socialMediaPage: socialMediaPage || undefined,
          nfcContent,
          targetLink,
          cardColor: cardColor || undefined,
          phone,
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Couldn't save your answers");
        setLoading(false);
        return;
      }
      setSaved(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <div className="glass-panel mt-10 rounded-2xl p-6 text-left">
        <p className="text-sm text-gold">Card specs received.</p>
        <p className="mt-1 text-sm text-ice/50">Trenton will program your card exactly as described and reach out if anything needs a closer look.</p>
        <button onClick={() => setSaved(false)} className="mt-4 text-xs text-ice/40 hover:text-gold">
          Edit your answers →
        </button>
      </div>
    );
  }

  const canSubmit = nfcContent && targetLink && phone && email && (!showColorChoice || cardColor);

  return (
    <div className="glass-panel mt-10 rounded-2xl p-6 text-left">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Card Setup</p>
      <h2 className="mt-2 font-display text-2xl text-ice">Tell us what to put on your card</h2>
      <p className="mt-2 text-sm text-ice/50">
        A few quick details so your NFC card is programmed exactly the way you want it.
      </p>
      <div className="mt-6 space-y-4">
        {showColorChoice && (
          <div>
            <label className="mb-1 block text-xs text-ice/40">Which card color?</label>
            <div className="flex gap-3">
              {(["black", "white"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCardColor(c)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm capitalize transition ${
                    cardColor === c ? "border-gold bg-gold/10 text-ice" : "border-white/10 text-ice/60 hover:border-gold/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="intake-social" className="mb-1 block text-xs text-ice/40">
            What is your social media page?
          </label>
          <input
            id="intake-social"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="e.g. instagram.com/yourbusiness"
            value={socialMediaPage}
            onChange={(e) => setSocialMediaPage(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="intake-content" className="mb-1 block text-xs text-ice/40">
            {multi ? `What do you want your ${cardCount} NFC cards to show? List each one.` : "What do you want the NFC to show?"}
          </label>
          <input
            id="intake-content"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder={multi ? "e.g. Google review, menu, WiFi" : "e.g. Google review page, menu, contact card"}
            value={nfcContent}
            onChange={(e) => setNfcContent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="intake-link" className="mb-1 block text-xs text-ice/40">
            What link do you want it to show?
          </label>
          <input
            id="intake-link"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="https://…"
            value={targetLink}
            onChange={(e) => setTargetLink(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="intake-phone" className="mb-1 block text-xs text-ice/40">
            What is the best number to reach you?
          </label>
          <input
            id="intake-phone"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="(555) 555-5555"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="intake-email" className="mb-1 block text-xs text-ice/40">
            What is your preferred email?
          </label>
          <input
            id="intake-email"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !canSubmit}
        className="mt-6 w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Saving…" : "Submit card details"}
      </button>
    </div>
  );
}
