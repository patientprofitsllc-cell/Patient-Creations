import type { AgentId, AgentMessage, Claim, Confidence, Fact, Severity, Priority } from "@/lib/universe/types";

// The one message shape every agent speaks, the words that keep predictions honest, and small helpers the agents share.

/** Words that keep a prediction a prediction. FEELINGS and any forecast must use one of these and never state a certainty. */
export const HEDGES = ["likely", "may", "could", "potentially", "might"] as const;
const CERTAINTIES = /\b(will definitely|definitely|certainly|guaranteed|always will|is sure to|cannot fail)\b/i;

export const hasHedge = (text: string) => HEDGES.some((h) => new RegExp(`\\b${h}\\b`, "i").test(text));
export const overclaims = (text: string) => CERTAINTIES.test(text);

export function message(m: Partial<AgentMessage> & Pick<AgentMessage, "agent" | "task">): AgentMessage {
  return {
    context: "",
    input: "",
    analysis: [],
    findings: [],
    assumptions: [],
    unknown: [],
    risks: [],
    recommendation: "",
    nextAgent: "NONE",
    confidence: "MEDIUM",
    ...m,
  };
}

/** The message in the exact format the protocol asks for. */
export function renderMessage(m: AgentMessage): string {
  const list = (items: string[]) => (items.length ? items.map((i) => `\n  - ${i}`).join("") : " none");
  return [
    `AGENT: ${m.agent}`,
    `TASK: ${m.task}`,
    `CONTEXT: ${m.context || "none"}`,
    `INPUT: ${m.input || "none"}`,
    `ANALYSIS:${list(m.analysis)}`,
    `FINDINGS:${list(m.findings.map((f) => `[${f.severity}] ${f.text} (evidence: ${f.evidence.join(", ") || "none"})`))}`,
    `ASSUMPTIONS:${list(m.assumptions)}`,
    `UNKNOWN:${list(m.unknown)}`,
    `RISKS:${list(m.risks)}`,
    `RECOMMENDATION: ${m.recommendation || "none"}`,
    `NEXT_AGENT: ${m.nextAgent}`,
    `CONFIDENCE: ${m.confidence}`,
  ].join("\n");
}

const REQUIRED_KEYS: (keyof AgentMessage)[] = ["agent", "task", "context", "input", "analysis", "findings", "assumptions", "unknown", "risks", "recommendation", "nextAgent", "confidence"];

/** True when a message has every field the protocol requires. */
export function isWellFormed(m: unknown): m is AgentMessage {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return (
    REQUIRED_KEYS.every((k) => k in o) &&
    ["LOW", "MEDIUM", "HIGH"].includes(o.confidence as string) &&
    Array.isArray(o.analysis) &&
    Array.isArray(o.findings) &&
    Array.isArray(o.unknown)
  );
}

/** Confidence from how much real evidence stands behind the work. Not a probability. */
export function confidenceFrom(known: number, unknown: number): Confidence {
  if (known === 0) return "LOW";
  const share = known / (known + unknown);
  if (share >= 0.8 && known >= 4) return "HIGH";
  if (share >= 0.5) return "MEDIUM";
  return "LOW";
}

export const UNKNOWN_TEXT = "DATA NOT AVAILABLE";

/** Only a fact that was really read counts as evidence. */
export const isKnown = (f: Fact) => f.label === "FACT";

// Severity and priority: CRITICAL needs real evidence behind it, and P0 is kept for what is actually critical.
export const SEVERITY_TO_PRIORITY: Record<Severity, Priority> = { critical: "P0", high: "P1", medium: "P2", low: "P3", experiment: "P4" };
export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "experiment"];

/** Most important first: severity, then the domain's own rank, then how much evidence stands behind it. */
export function byImportance(a: Claim, b: Claim): number {
  return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || (a.rank ?? 99) - (b.rank ?? 99) || b.evidence.length - a.evidence.length;
}

/** A claim may only be `critical` when at least one supporting fact was really observed. Otherwise it is shown as `high`. */
export function honestSeverity(claim: Claim, facts: Map<string, Fact>): Severity {
  if (claim.severity !== "critical") return claim.severity;
  const grounded = claim.evidence.some((id) => facts.get(id)?.label === "FACT");
  return grounded ? "critical" : "high";
}

/** Ids are per run: a prefix and a running number, so a claim reads as TH2 or LK5 and never collides with another agent's. */
export function idMaker(prefix: string): () => string {
  let n = 0;
  return () => `${prefix}${++n}`;
}

export type { AgentId };
