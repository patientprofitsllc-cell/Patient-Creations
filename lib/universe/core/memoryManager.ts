import type { AgentId, MemoryEntry, MemoryKind, MemoryLevel } from "@/lib/universe/types";
import type { UniverseStore } from "@/lib/universe/store/types";

// Seven levels of memory, and six kinds of thing that can be remembered. The rule that matters: an assumption never quietly
// becomes a fact. A FACT must name its source, an ASSUMPTION may not claim evidence, and the only way from one to the other is
// promote(), which needs a source and evidence and leaves the assumption on record as superseded.
//
//   SHORT_TERM  the current task (kept in memory only, gone when the task ends)
//   WORKING     the current project or session
//   LONG_TERM   lasting knowledge about the application
//   DOMAIN      knowledge about the business the agents serve
//   AGENT       what one agent has learned from its own work
//   DECISION    important decisions and why they were made
//   RESULT      what actually happened after an action

export class MemoryRuleError extends Error {}

export interface RememberInput {
  level: MemoryLevel;
  kind: MemoryKind;
  topic: string;
  content: string;
  source?: string | null;
  agent?: AgentId | null;
  evidence?: string[];
}

export class MemoryManager {
  private shortTerm: MemoryEntry[] = [];
  private n = 0;

  constructor(private store: UniverseStore, private domain: string) {}

  async remember(input: RememberInput): Promise<MemoryEntry> {
    const content = input.content.trim();
    if (!content) throw new MemoryRuleError("Nothing to remember: the content is empty.");
    if (input.kind === "FACT" && !input.source?.trim()) throw new MemoryRuleError("A fact must name where it came from. Store it as an ASSUMPTION if it cannot.");
    if (input.kind === "ASSUMPTION" && (input.evidence?.length ?? 0) > 0) throw new MemoryRuleError("An assumption cannot carry evidence. If it has evidence, promote it to a fact.");
    if (input.kind === "DECISION" && input.level !== "DECISION" && input.level !== "LONG_TERM" && input.level !== "WORKING") throw new MemoryRuleError("Decisions belong in DECISION, WORKING, or LONG_TERM memory.");

    const row = { domain: this.domain, level: input.level, kind: input.kind, topic: input.topic, content, source: input.source?.trim() || null, agent: input.agent ?? null, status: "ACTIVE" as const, evidence: input.evidence ?? [] };
    if (input.level === "SHORT_TERM") {
      const entry: MemoryEntry = { ...row, id: `short_${++this.n}`, createdAt: new Date() };
      this.shortTerm.push(entry);
      return entry;
    }
    return this.store.addMemory(row);
  }

  /** Turns an assumption into a fact, only with a source and evidence. The assumption stays on record, marked superseded. */
  async promote(assumptionId: string, proof: { source: string; evidence: string[] }): Promise<MemoryEntry> {
    const a = await this.store.getMemory(assumptionId);
    if (!a || a.domain !== this.domain) throw new MemoryRuleError("That assumption does not exist.");
    if (a.kind !== "ASSUMPTION") throw new MemoryRuleError("Only an assumption can be promoted.");
    if (a.status !== "ACTIVE") throw new MemoryRuleError("That assumption has already been replaced.");
    if (!proof.source.trim() || proof.evidence.length === 0) throw new MemoryRuleError("Promoting an assumption to a fact needs a source and at least one piece of evidence.");
    const fact = await this.store.addMemory({ domain: this.domain, level: a.level, kind: "FACT", topic: a.topic, content: a.content, source: proof.source.trim(), agent: a.agent, status: "ACTIVE", evidence: proof.evidence });
    await this.store.updateMemory(a.id, { status: "SUPERSEDED" });
    return fact;
  }

  async supersede(id: string): Promise<void> {
    await this.store.updateMemory(id, { status: "SUPERSEDED" });
  }

  async recall(f: { level?: MemoryLevel; kind?: MemoryKind; topic?: string; agent?: string; limit?: number; includeSuperseded?: boolean } = {}): Promise<MemoryEntry[]> {
    const stored = await this.store.listMemory({ domain: this.domain, level: f.level, kind: f.kind, topic: f.topic, agent: f.agent, status: f.includeSuperseded ? undefined : "ACTIVE", limit: f.limit });
    const short = this.shortTerm.filter((m) => (!f.level || m.level === f.level) && (!f.kind || m.kind === f.kind) && (!f.topic || m.topic === f.topic));
    return [...short, ...stored].slice(0, f.limit ?? 100);
  }

  /** Ends the current task's short-term memory. */
  clearShortTerm(): void {
    this.shortTerm = [];
  }

  /** Recent decisions and results that touch the words of a request, so a new mission can start from what is already known. */
  async relevantTo(text: string, limit = 5): Promise<MemoryEntry[]> {
    const w = new Set(text.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []);
    const pool = [...(await this.recall({ level: "DECISION", limit: 40 })), ...(await this.recall({ level: "RESULT", limit: 40 }))];
    return pool.filter((m) => [...(m.topic + " " + m.content).toLowerCase().matchAll(/[a-z][a-z-]{3,}/g)].some((x) => w.has(x[0]))).slice(0, limit);
  }
}
