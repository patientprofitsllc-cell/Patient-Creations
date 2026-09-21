"use client";

import { useState } from "react";

export function UnsubscribeForm({ e, t }: { e: string; t: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function go() {
    setState("busy");
    try {
      const res = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ e, t }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "That did not work. Reply to any of our emails and we will stop them.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setMessage("We could not reach the server. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-8 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-emerald-200">
        Done. You will not get follow-up emails from us again.
      </p>
    );
  }
  return (
    <div className="mt-8">
      <button type="button" onClick={() => void go()} disabled={state === "busy"} className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-8 text-sm font-semibold text-obsidian transition hover:brightness-110 disabled:opacity-60">
        {state === "busy" ? "Working..." : "Yes, stop the emails"}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {message}
        </p>
      )}
    </div>
  );
}
