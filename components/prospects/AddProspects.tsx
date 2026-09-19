"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";

export function AddProspects() {
  const router = useRouter();
  const [mode, setMode] = useState<"one" | "many">("one");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [f, setF] = useState({ businessName: "", industry: "", city: "", phone: "", email: "", website: "" });
  const [text, setText] = useState("");

  async function send(payload: unknown) {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/prospects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error ?? "That didn't work.");
    if (data.created !== undefined) {
      const bits = [`${data.created} added`, `${data.duplicates} already on the list`];
      if (data.errors?.length) bits.push(`${data.errors.length} skipped: ${data.errors.slice(0, 3).join(" | ")}`);
      if (data.truncated) bits.push("only the first 500 lines were used");
      setMessage(bits.join(", "));
      setText("");
    } else {
      setMessage(data.duplicate ? "That business is already on the list." : "Added.");
      setF({ businessName: "", industry: "", city: "", phone: "", email: "", website: "" });
    }
    router.refresh();
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-4 flex gap-4 text-sm">
        <button type="button" onClick={() => setMode("one")} className={mode === "one" ? "text-gold" : "text-ice/50 hover:text-gold"}>
          Add one
        </button>
        <button type="button" onClick={() => setMode("many")} className={mode === "many" ? "text-gold" : "text-ice/50 hover:text-gold"}>
          Paste a list
        </button>
      </div>

      {mode === "one" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input className={INPUT} placeholder="Business name *" value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} />
          <input className={INPUT} placeholder="Type, like barbershop" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} />
          <input className={INPUT} placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <input className={INPUT} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input className={INPUT} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className={INPUT} placeholder="Website (if any)" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          <div className="sm:col-span-3">
            <button
              type="button"
              disabled={busy || !f.businessName.trim()}
              onClick={() => void send({ action: "create", ...Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim())) })}
              className={BUTTON}
            >
              Add prospect
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs text-ice/50">
            One business per line: name, type, city, phone, email, website. Leave a column empty with a comma. Lines with a bad email or website are skipped and
            listed. Businesses already on the list are ignored.
          </p>
          <textarea
            className={INPUT}
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Ace Barbers, barbershop, Columbus, 555-010-1234, hello@ace.com, ace.com\n"Smith, Jones & Co", contractor, Phenix City, , , smithjones.com'}
          />
          <button type="button" disabled={busy || !text.trim()} onClick={() => void send({ action: "import", text })} className={`${BUTTON} mt-3`}>
            Import
          </button>
        </div>
      )}
      {message && <p className="mt-3 text-sm text-ice/70">{message}</p>}
    </div>
  );
}
