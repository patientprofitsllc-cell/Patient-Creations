"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const BTN = "min-h-[40px] rounded-full border border-white/15 px-4 text-sm text-ice/80 transition hover:border-gold/50 hover:text-gold disabled:opacity-40";

export function CopyMessage({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  return (
    <button
      type="button"
      className={BTN}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("copied");
        } catch {
          setState("error");
        }
        setTimeout(() => setState("idle"), 2500);
      }}
    >
      {state === "copied" ? "Copied" : state === "error" ? "Could not copy: select the text instead" : "Copy the message"}
    </button>
  );
}

export function MarkContacted({ auditId, done }: { auditId: string; done: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (done) return <span className="text-sm text-emerald-300">Marked as contacted</span>;
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        className={BTN}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await fetch(`/api/admin/audits/${auditId}/contacted`, { method: "POST" });
          setBusy(false);
          if (!res.ok) return setMsg("That did not work.");
          router.refresh();
        }}
      >
        {busy ? "Saving..." : "Mark as contacted"}
      </button>
      {msg && <span className="text-xs text-red-300">{msg}</span>}
    </span>
  );
}
