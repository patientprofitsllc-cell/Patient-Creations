"use client";

import { useState } from "react";

export function CopyBox({ label, text, hint }: { label: string; text: string; hint?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: the text is still selectable below */
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ice/80">{label}</p>
        <button type="button" onClick={() => void copy()} className="text-xs text-gold hover:brightness-110">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-ice/40">{hint}</p>}
      <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-ice/70">{text}</pre>
    </div>
  );
}
