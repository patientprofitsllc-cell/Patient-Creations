"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ice placeholder:text-ice/30";
const BUTTON = "rounded-full bg-gold px-5 py-2 text-sm font-medium text-obsidian transition hover:brightness-110 disabled:opacity-50";

export interface CommandOption {
  name: string;
  label: string;
  hint: string;
  /** "required" for a command that needs words, "optional" when they refine it, "none" when it takes none. */
  text: "required" | "optional" | "none";
}

export interface CommandGroup {
  title: string;
  items: CommandOption[];
}

type Outcome = { ok: boolean; kind?: "view" | "mission"; title?: string; text?: string; report?: string; missionId?: string; status?: string; tasks?: number; errors?: string[]; error?: string };

/** Where the owner talks to MASTER. Everything typed here is sent as a request from a person, and the answer is shown as it came back. */
export function UniverseConsole({ groups }: { groups: CommandGroup[] }) {
  const router = useRouter();
  const all = groups.flatMap((g) => g.items);
  const [command, setCommand] = useState(all[0]?.name ?? "ASK_MASTER");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Outcome | null>(null);
  const chosen = all.find((c) => c.name === command);

  async function run() {
    setBusy(true);
    setOut(null);
    try {
      const res = await fetch("/api/admin/universe/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command, ...(text.trim() ? { text: text.trim() } : {}) }) });
      const data = (await res.json().catch(() => ({}))) as Outcome;
      setOut({ ...data, ok: res.ok && data.ok !== false });
      if (res.ok) router.refresh();
    } catch {
      setOut({ ok: false, error: "The request did not go through. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || (chosen?.text === "required" && text.trim().length < 3);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Ask MASTER</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,18rem)_1fr_auto]">
        <select aria-label="Command" className={INPUT} value={command} onChange={(e) => setCommand(e.target.value)}>
          {groups.map((g) => (
            <optgroup key={g.title} label={g.title}>
              {g.items.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <input
          aria-label="What to ask or list"
          className={INPUT}
          value={text}
          maxLength={2000}
          disabled={chosen?.text === "none"}
          placeholder={chosen?.text === "none" ? "Nothing to add for this command" : chosen?.text === "required" ? "Type your request" : "Optional: narrow it down"}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) void run();
          }}
        />
        <button type="button" disabled={disabled} onClick={() => void run()} className={BUTTON}>
          {busy ? "Working..." : "Run"}
        </button>
      </div>
      {chosen && <p className="mt-2 text-xs text-ice/50">{chosen.hint}</p>}

      {out && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4" role="status">
          {!out.ok ? (
            <p className="text-sm text-red-300">{out.error ?? "That did not work."}</p>
          ) : out.kind === "view" ? (
            <>
              <p className="text-sm text-ice">{out.title}</p>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-ice/70">{out.text}</pre>
            </>
          ) : (
            <>
              <p className="text-sm text-ice">
                {out.status === "COMPLETED" ? "Finished." : out.status === "PARTIAL" ? "Finished with problems." : "Did not finish."} {out.tasks ?? 0} task{out.tasks === 1 ? "" : "s"} recorded.
                {out.missionId && (
                  <Link href={`/admin/universe/missions/${out.missionId}`} className="ml-2 text-gold underline">
                    See every agent's work
                  </Link>
                )}
              </p>
              {out.errors && out.errors.length > 0 && <p className="mt-1 text-xs text-red-300">{out.errors.join(" | ")}</p>}
              <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words text-xs text-ice/70">{out.report}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
