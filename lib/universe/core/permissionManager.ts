import { PERMISSION_LEVELS, type CommandName, type PermissionLevel } from "@/lib/universe/types";
import type { UniverseStore } from "@/lib/universe/store/types";

// The user is the final authority. Six levels say how far the agents may go:
//
//   READ         look at what is stored
//   ANALYZE      run analyses and audits
//   RECOMMEND    produce recommendations
//   DRAFT        prepare work for approval
//   EXECUTE      do internal bookkeeping (record tasks, memory, notes) on their own
//   AUTONOMOUS   start work without being asked (a schedule or an event)
//
// Actions with an effect outside the Agent Universe are "critical". None has an executor, so agents can only draft them. Even
// if one is later built, it needs an explicit grant here, and without one it stays a draft that a person must approve.

export interface ActionSpec {
  level: PermissionLevel;
  critical: boolean;
  label: string;
}

export const ACTIONS: Record<string, ActionSpec> = {
  create_task: { level: "EXECUTE", critical: false, label: "Record a task" },
  save_memory: { level: "EXECUTE", critical: false, label: "Save to memory" },
  notify_owner: { level: "EXECUTE", critical: false, label: "Notify the owner" },
  change_pricing: { level: "EXECUTE", critical: true, label: "Change pricing" },
  delete_customer_data: { level: "EXECUTE", critical: true, label: "Delete customer data" },
  issue_refund: { level: "EXECUTE", critical: true, label: "Issue a refund" },
  send_mass_communication: { level: "EXECUTE", critical: true, label: "Send mass communication" },
  change_infrastructure: { level: "EXECUTE", critical: true, label: "Change production infrastructure" },
  spend_money: { level: "EXECUTE", critical: true, label: "Spend money" },
  change_payment_config: { level: "EXECUTE", critical: true, label: "Change payment configuration" },
};

export const CRITICAL_ACTIONS = Object.entries(ACTIONS).filter(([, a]) => a.critical).map(([k]) => k);

/** The least level each command needs. Reading and pausing are always allowed. */
export const COMMAND_LEVEL: Record<CommandName, PermissionLevel> = {
  ASK_MASTER: "ANALYZE",
  AUDIT_WEBSITE: "ANALYZE",
  AUDIT_PRODUCTS: "ANALYZE",
  AUDIT_CUSTOMER_JOURNEY: "ANALYZE",
  AUDIT_BUSINESS: "ANALYZE",
  ANALYZE_GROWTH: "ANALYZE",
  ANALYZE_CUSTOMERS: "ANALYZE",
  ANALYZE_CONVERSION: "ANALYZE",
  GENERATE_STRATEGY: "RECOMMEND",
  CREATE_TASKS: "EXECUTE",
  RUN_RESEARCH: "ANALYZE",
  RUN_DAILY_AUDIT: "ANALYZE",
  RUN_WEEKLY_REVIEW: "ANALYZE",
  SHOW_AGENT_ACTIVITY: "READ",
  SHOW_ACTIVE_TASKS: "READ",
  SHOW_DECISIONS: "READ",
  SHOW_MEMORY: "READ",
  RUN_SYSTEM_CHECK: "ANALYZE",
  PAUSE_AUTONOMOUS_ACTIONS: "READ",
  RESUME_AUTONOMOUS_ACTIONS: "READ",
};

export const DEFAULT_LEVEL: PermissionLevel = "EXECUTE";
export const levelAtLeast = (have: PermissionLevel, need: PermissionLevel) => PERMISSION_LEVELS.indexOf(have) >= PERMISSION_LEVELS.indexOf(need);

export interface Permit {
  allowed: boolean;
  needsApproval: boolean;
  reason: string;
}

export class PermissionManager {
  constructor(private store: UniverseStore, private domain: string) {}

  private key = (k: string) => `universe.${this.domain}.${k}`;

  async level(): Promise<PermissionLevel> {
    const v = await this.store.getSetting(this.key("level"));
    return (PERMISSION_LEVELS as readonly string[]).includes(v ?? "") ? (v as PermissionLevel) : DEFAULT_LEVEL;
  }
  async setLevel(level: PermissionLevel): Promise<void> {
    await this.store.setSetting(this.key("level"), level);
  }
  async paused(): Promise<boolean> {
    return (await this.store.getSetting(this.key("paused"))) === "true";
  }
  async setPaused(paused: boolean): Promise<void> {
    await this.store.setSetting(this.key("paused"), paused ? "true" : "false");
  }
  async grant(action: string, granted: boolean): Promise<void> {
    if (!ACTIONS[action]?.critical) throw new Error("Only a critical action can be granted or revoked.");
    if (granted) await this.store.setSetting(this.key(`grant.${action}`), "granted");
    else await this.store.deleteSetting(this.key(`grant.${action}`));
  }

  /** May this command start, and who started it? Anything not started by a person needs the AUTONOMOUS level and no pause. */
  async canRun(command: CommandName, triggeredBy: "user" | "schedule" | "event"): Promise<Permit> {
    const level = await this.level();
    if (triggeredBy !== "user") {
      if (await this.paused()) return { allowed: false, needsApproval: false, reason: "Autonomous actions are paused." };
      if (!levelAtLeast(level, "AUTONOMOUS")) return { allowed: false, needsApproval: false, reason: `This started on its own (${triggeredBy}), which needs the AUTONOMOUS level. The level is ${level}.` };
    }
    if (!levelAtLeast(level, COMMAND_LEVEL[command])) return { allowed: false, needsApproval: false, reason: `${command} needs the ${COMMAND_LEVEL[command]} level. The level is ${level}.` };
    return { allowed: true, needsApproval: false, reason: "Allowed." };
  }

  /** May an agent do this action? Critical actions are never allowed on their own without an explicit grant. */
  async canDo(action: string): Promise<Permit> {
    const spec = ACTIONS[action];
    if (!spec) return { allowed: false, needsApproval: false, reason: `"${action}" is not a known action.` };
    const level = await this.level();
    if (!levelAtLeast(level, spec.level)) return { allowed: false, needsApproval: true, reason: `${spec.label} needs the ${spec.level} level. The level is ${level}.` };
    if (spec.critical && (await this.store.getSetting(this.key(`grant.${action}`))) !== "granted") return { allowed: false, needsApproval: true, reason: `${spec.label} is a critical action and has not been granted. A person must approve it.` };
    return { allowed: true, needsApproval: false, reason: "Allowed." };
  }
}
