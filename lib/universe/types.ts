// The Agent Universe: shared vocabulary.
//
// Everything here is domain-independent. A domain (the first business it is deployed to) plugs in through the `Domain` interface at the
// bottom and supplies data, vocabulary, and constraints. The agents themselves never mention any one business.

export const AGENT_IDS = ["MASTER", "PERSPECTIVE", "LOOK", "IMAGE", "FEELINGS", "THINKING", "LOGIC", "DIVIDER", "GATHERER", "ORGANIZER", "SPEAKER"] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export type Confidence = "LOW" | "MEDIUM" | "HIGH";
/** P0 immediate or system-critical, P1 important, P2 normal, P3 optional, P4 future experiment. */
export type Priority = "P0" | "P1" | "P2" | "P3" | "P4";
export type Severity = "critical" | "high" | "medium" | "low" | "experiment";
export type FactLabel = "FACT" | "ASSUMPTION" | "UNKNOWN" | "CONFLICTING";
export type Signal = "positive" | "negative" | "neutral";
export type Stance = "pursue" | "avoid" | "fix" | "investigate" | "keep";

// ---------------------------------------------------------------------------------------------------------------------
// Facts and claims

export interface Fact {
  id: string;
  label: FactLabel;
  /** Which part of the problem this belongs to (a component topic like "acquisition"). */
  topic: string;
  /** Two facts with the same key describe the same thing; if their values differ both become CONFLICTING. */
  key?: string;
  statement: string;
  value?: number | string | null;
  /** Where it came from. A FACT always has one. */
  source: string;
  tags: string[];
  signal: Signal;
  /** For UNKNOWN: what would be needed to know. */
  need?: string;
  /** How serious a problem this fact shows, when its signal is negative. Defaults to medium. */
  severity?: Severity;
  /** The domain's own order of importance among problems of the same severity. Lower comes first. */
  rank?: number;
}

export interface Claim {
  id: string;
  agent: AgentId;
  kind: "observation" | "recommendation" | "risk" | "opportunity";
  text: string;
  /** What it is about, so two claims about the same thing can be compared. */
  target: string;
  stance: Stance;
  severity: Severity;
  /** Fact ids that support it. A claim with none is UNSUPPORTED. */
  evidence: string[];
  /** Kinds of action it would take, checked against the domain's constraints and the permission rules. */
  actions?: string[];
  /** Numbers the claim states, so LOGIC can check them against the facts. */
  numbers?: { factId: string; value: number }[];
  /** The domain's own order of importance among claims of the same severity. Lower comes first. */
  rank?: number;
}

export type Verdict = "valid" | "unsupported" | "insufficient" | "invalid" | "conflict" | "needs-approval";

export interface Challenge {
  claimId: string;
  verdict: Verdict;
  reason: string;
  missing: string[];
  recommendationToMaster: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// The standard message every agent sends

export interface AgentMessage {
  agent: AgentId;
  task: string;
  context: string;
  input: string;
  analysis: string[];
  findings: Claim[];
  assumptions: string[];
  unknown: string[];
  risks: string[];
  recommendation: string;
  nextAgent: AgentId | "NONE";
  confidence: Confidence;
  /** Agent-specific structured output (the plan, the option list, the challenge list, and so on). */
  payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Missions, routes, plans

export type CommandName =
  | "ASK_MASTER"
  | "AUDIT_WEBSITE"
  | "AUDIT_PRODUCTS"
  | "AUDIT_CUSTOMER_JOURNEY"
  | "AUDIT_BUSINESS"
  | "ANALYZE_GROWTH"
  | "ANALYZE_CUSTOMERS"
  | "ANALYZE_CONVERSION"
  | "GENERATE_STRATEGY"
  | "CREATE_TASKS"
  | "RUN_RESEARCH"
  | "RUN_DAILY_AUDIT"
  | "RUN_WEEKLY_REVIEW"
  | "SHOW_AGENT_ACTIVITY"
  | "SHOW_ACTIVE_TASKS"
  | "SHOW_DECISIONS"
  | "SHOW_MEMORY"
  | "RUN_SYSTEM_CHECK"
  | "PAUSE_AUTONOMOUS_ACTIONS"
  | "RESUME_AUTONOMOUS_ACTIONS";

/** Which set of components the domain breaks the problem into. */
export type MissionKind = "website" | "products" | "journey" | "business" | "growth" | "customers" | "conversion" | "strategy" | "research" | "daily" | "weekly" | "ask";

/** What kind of request it is. This, not the command name, decides which agents wake up. */
export type Intent = "visual" | "decision" | "copy" | "assets" | "analysis" | "audit-website" | "research" | "lookup";

export interface Attachment {
  kind: "url" | "html" | "text";
  value: string;
}

export interface Mission {
  id: string;
  command: CommandName;
  kind: MissionKind;
  objective: string;
  goal: string;
  context: string;
  constraints: string[];
  available: string[];
  requiredOutcome: string;
  deadline: string | null;
  priority: Priority;
  assumptions: string[];
  attachments: Attachment[];
  triggeredBy: "user" | "schedule" | "event";
  /** When set, MASTER uses this intent instead of working it out from the words. Commands with a fixed shape use it. */
  intent?: Intent;
}

/** The agents MASTER decided to wake for this request, in order. An inner list runs at the same time. */
export interface Route {
  intent: Intent;
  steps: AgentId[][];
  reason: string;
  skipped: { agent: AgentId; why: string }[];
}

export interface PlanComponent {
  id: string;
  title: string;
  question: string;
  topics: string[];
  dependsOn: string[];
  /** Topics with no data source connected. */
  unknownTopics: string[];
}

export interface Plan {
  components: PlanComponent[];
  parallel: string[][];
  sequential: string[];
  unknowns: string[];
  resources: string[];
  complexity: "simple" | "complex";
}

// ---------------------------------------------------------------------------------------------------------------------
// What was observed on a page or document

export interface Snapshot {
  id: string;
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  html: string;
  error?: string;
}

export interface PageResult {
  status: number;
  html: string;
  finalUrl: string;
  bytes: number;
}

// ---------------------------------------------------------------------------------------------------------------------
// The domain plug-in

export interface Stakeholder {
  id: string;
  name: string;
  wants: string[];
  wary: string[];
}

export interface Component {
  id: string;
  title: string;
  question: string;
  topics: string[];
  keywords: string[];
  dependsOn?: string[];
}

export interface ProbeResult {
  key: string;
  statement: string;
  value?: number | string | null;
  tags: string[];
  signal?: Signal;
  source: string;
  severity?: Severity;
  rank?: number;
}

export interface Probe {
  id: string;
  topic: string;
  /** What is needed to know this, shown when the data is not available. */
  need: string;
  read: () => Promise<ProbeResult | ProbeResult[] | null>;
}

export interface Surface {
  id: string;
  name: string;
  url: string;
  /** What this page is expected to show, so a missing one is a finding and an unexpected absence is not. */
  expects?: ("price" | "form" | "cta" | "contact")[];
}

export interface Lever {
  id: string;
  title: string;
  component: string;
  /** Wakes up when a fact carrying one of these tags has this signal ("any" wakes on any). */
  triggerTags: string[];
  when: "negative" | "any";
  rationale: string;
  expectedEffect: string;
  dependencies: string[];
  risks: string[];
  secondOrder: string[];
  actions?: string[];
  /** An idea with no evidence behind it yet: always labeled an experiment and never above P4. */
  experiment?: boolean;
  /** How serious the problem this lever answers is, in this business's own judgment. Defaults to medium. */
  severity?: Severity;
  /** Where this lever sits in the business's own order of importance. Lower comes first. */
  rank?: number;
}

export interface Constraint {
  id: string;
  text: string;
  /** Action kinds no agent may take on its own. A claim that would take one needs a person's approval. */
  forbidsActions: string[];
  /** Wording no agent may produce (as regular expression sources), such as promises the business cannot keep. */
  bannedPhrases?: string[];
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  stakeholders: Stakeholder[];
  components: Partial<Record<MissionKind, Component[]>>;
  probes: Probe[];
  surfaces: Surface[];
  levers: Lever[];
  constraints: Constraint[];
  /** The house look, used when IMAGE writes a specification. */
  visualStyle: string;
  fetchPage: (url: string) => Promise<PageResult>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Working state for one run

export interface Organized {
  factsByTopic: Record<string, Fact[]>;
  claims: Claim[];
  dropped: { claim: Claim; why: string }[];
  table: { claimId: string; priority: Priority; severity: Severity; agent: AgentId; text: string; evidence: string[]; verdict: Verdict | "unchallenged" }[];
}

/** What the outside world provides to a run. Everything here is optional and replaceable, which keeps runs testable. */
export interface Deps {
  /** Writes copy from a prompt. Absent when no model is configured, in which case SPEAKER only checks and cleans. */
  writeCopy?: (system: string, prompt: string) => Promise<string>;
  now?: () => Date;
  /** Tells the owner something needs attention. Returns an id, or null when nothing was sent. Absent when no channel is configured. */
  notifyOwner?: (title: string, body: string) => Promise<string | null>;
}

export interface RunState {
  mission: Mission;
  domain: Domain;
  route: Route;
  plan: Plan | null;
  facts: Fact[];
  snapshots: Snapshot[];
  claims: Claim[];
  challenges: Challenge[];
  messages: AgentMessage[];
  organized: Organized | null;
  recalled: MemoryEntry[];
  deps: Deps;
}

export interface AgentOutput {
  message: AgentMessage;
  facts?: Fact[];
  plan?: Plan;
  claims?: Claim[];
  challenges?: Challenge[];
  snapshots?: Snapshot[];
  organized?: Organized;
}

// ---------------------------------------------------------------------------------------------------------------------
// Memory, tasks, activity, decisions

export const MEMORY_LEVELS = ["SHORT_TERM", "WORKING", "LONG_TERM", "DOMAIN", "AGENT", "DECISION", "RESULT"] as const;
export type MemoryLevel = (typeof MEMORY_LEVELS)[number];
export const MEMORY_KINDS = ["FACT", "DECISION", "PREFERENCE", "ASSUMPTION", "EXPERIMENT", "RESULT"] as const;
export type MemoryKind = (typeof MEMORY_KINDS)[number];

export interface MemoryEntry {
  id: string;
  domain: string;
  level: MemoryLevel;
  kind: MemoryKind;
  /** What it is about, for recall. */
  topic: string;
  content: string;
  /** Required for a FACT. */
  source: string | null;
  agent: AgentId | null;
  status: "ACTIVE" | "SUPERSEDED";
  evidence: string[];
  createdAt: Date;
}

export type TaskStatus = "WAITING" | "ACTIVE" | "NEEDS_APPROVAL" | "DONE" | "FAILED" | "CANCELLED";

export interface UniverseTask {
  id: string;
  domain: string;
  missionId: string | null;
  title: string;
  detail: string;
  priority: Priority;
  status: TaskStatus;
  owner: string;
  dependsOn: string[];
  approvalRequired: boolean;
  actionKinds: string[];
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface ActivityRecord {
  id: string;
  domain: string;
  missionId: string | null;
  at: Date;
  agent: AgentId;
  task: string;
  input: string;
  output: string;
  status: "OK" | "FAILED" | "SKIPPED" | "RETRIED" | "ESCALATED";
  durationMs: number;
  error: string | null;
  handoff: string | null;
  result: string | null;
}

export interface Disagreement {
  topic: string;
  positions: { agent: AgentId; text: string; stance: Stance; evidence: string[] }[];
  resolution: "resolved" | "unresolved";
  rule: string;
  decidedFor: string | null;
}

export interface DecisionTask {
  title: string;
  detail: string;
  priority: Priority;
  owner: string;
  dependsOn: string[];
  approvalRequired: boolean;
  actionKinds: string[];
  evidence: string[];
  severity: Severity;
}

export interface Decision {
  summary: string;
  reasoning: string[];
  tasks: DecisionTask[];
  risks: string[];
  nextActions: string[];
  disagreements: Disagreement[];
  rejected: { text: string; agent: AgentId; why: string }[];
  unknowns: string[];
  confidence: Confidence;
}

export interface MissionResult {
  mission: Mission;
  route: Route;
  messages: AgentMessage[];
  facts: Fact[];
  claims: Claim[];
  challenges: Challenge[];
  decision: Decision;
  report: string;
  executed: { action: string; ok: boolean; verified: boolean; detail: string }[];
  /** For a copy request: what was written, and whether LOGIC accepted it. */
  copy: { text: string; mocked: boolean; accepted: boolean; reason: string } | null;
  status: "COMPLETED" | "PARTIAL" | "FAILED";
  errors: string[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Permissions

export const PERMISSION_LEVELS = ["READ", "ANALYZE", "RECOMMEND", "DRAFT", "EXECUTE", "AUTONOMOUS"] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];
