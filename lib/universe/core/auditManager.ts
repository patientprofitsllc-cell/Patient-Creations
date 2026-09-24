import type { ActivityRecord, AgentId } from "@/lib/universe/types";
import type { UniverseStore } from "@/lib/universe/store/types";

// Every agent step is written to an activity log: when, which agent, what it was asked, what came back, how long, whether it
// failed, who it handed to, and the result. The log is the audit trail. What goes into it is cleaned first: no secrets, no email
// addresses or phone numbers, and nothing longer than it needs to be.

const MAX = 2_000;

export function redact(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[secret]")
    .replace(/\b(?:sk|pk|rk|whsec)_(?:live|test)?_?[A-Za-z0-9]{8,}\b/g, "[secret]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/g, "Bearer [secret]")
    .replace(/\b[A-Za-z0-9+/_-]{40,}\b/g, "[secret]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, "[phone]")
    .slice(0, MAX);
}

export interface StepOutcome {
  output: string;
  handoff?: string | null;
  result?: string | null;
}

export class AuditManager {
  constructor(private store: UniverseStore, private domain: string, private missionId: string | null) {}

  async record(rec: { agent: AgentId; task: string; input: string; output: string; status: ActivityRecord["status"]; durationMs: number; error?: string | null; handoff?: string | null; result?: string | null }): Promise<void> {
    await this.store.addActivity({
      domain: this.domain,
      missionId: this.missionId,
      agent: rec.agent,
      task: redact(rec.task),
      input: redact(rec.input),
      output: redact(rec.output),
      status: rec.status,
      durationMs: Math.max(0, Math.round(rec.durationMs)),
      error: rec.error ? redact(rec.error) : null,
      handoff: rec.handoff ?? null,
      result: rec.result ? redact(rec.result) : null,
    });
  }

  /** Runs a step, times it, and records how it went. It never throws: the caller gets the outcome and decides what to do. */
  async timed<T>(agent: AgentId, task: string, input: string, fn: () => Promise<T>, describe: (v: T) => StepOutcome, status: ActivityRecord["status"] = "OK"): Promise<{ ok: true; value: T; ms: number } | { ok: false; error: string; ms: number }> {
    const started = Date.now();
    try {
      const value = await fn();
      const ms = Date.now() - started;
      const o = describe(value);
      await this.record({ agent, task, input, output: o.output, status, durationMs: ms, handoff: o.handoff, result: o.result });
      return { ok: true, value, ms };
    } catch (err) {
      const ms = Date.now() - started;
      const error = err instanceof Error ? err.message : "failed";
      await this.record({ agent, task, input, output: "", status: "FAILED", durationMs: ms, error });
      return { ok: false, error, ms };
    }
  }
}
