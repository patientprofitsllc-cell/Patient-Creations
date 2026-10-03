"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

/** Four dots and a phone-style keypad. Signs in on the 4th digit; a wrong PIN shakes and shows the tries left. */
export function PinPad({ triesLeft }: { triesLeft: number }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);

  const press = (k: string) => {
    if (busy) return;
    setWrong(false);
    if (k === "⌫") setPin((p) => p.slice(0, -1));
    else if (k && pin.length < 4) setPin((p) => p + k);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("⌫");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (pin.length !== 4) return;
    setBusy(true);
    signIn("owner-pin", { pin, redirect: false }).then((res) => {
      if (res?.ok && !res.error) {
        router.replace("/admin/dashboard");
        return;
      }
      setWrong(true);
      setPin("");
      setBusy(false);
      router.refresh(); // picks up the new tries-left count, or the lock
    });
  }, [pin, router]);

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className={`flex gap-4 ${wrong ? "animate-[pinShake_0.4s]" : ""}`} aria-live="polite" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-4 w-4 rounded-full border border-pc-sand transition ${i < pin.length ? "bg-pc-sand" : ""}`} />
        ))}
      </div>
      <p className="mt-4 h-5 text-sm text-red-300" role="alert">
        {wrong ? `Wrong PIN. ${Math.max(0, triesLeft)} ${triesLeft === 1 ? "try" : "tries"} left.` : busy ? "Checking…" : ""}
      </p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {KEYS.map((k, i) =>
          k ? (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              aria-label={k === "⌫" ? "Delete" : k}
              disabled={busy}
              className="h-[72px] w-[72px] rounded-full border border-white/10 bg-pc-panel text-2xl font-light text-pc-cream transition active:scale-95 active:bg-pc-raised disabled:opacity-50"
            >
              {k}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}
