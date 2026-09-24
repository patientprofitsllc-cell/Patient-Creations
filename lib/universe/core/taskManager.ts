import type { DecisionTask, UniverseTask } from "@/lib/universe/types";
import type { UniverseStore } from "@/lib/universe/store/types";

// The task board. A task from MASTER's plan is WAITING, or NEEDS_APPROVAL when it would take an action that only a person may
// approve. Tasks move only through the transitions below, so a task can never jump straight from waiting to done without being
// started, and a cancelled or failed one cannot come back by accident.

const NEXT: Record<UniverseTask["status"], UniverseTask["status"][]> = {
  WAITING: ["ACTIVE", "CANCELLED", "DONE", "FAILED"],
  NEEDS_APPROVAL: ["WAITING", "CANCELLED"],
  ACTIVE: ["DONE", "FAILED", "WAITING", "CANCELLED"],
  DONE: [],
  FAILED: ["WAITING"],
  CANCELLED: [],
};

export class TaskError extends Error {}

export class TaskManager {
  constructor(private store: UniverseStore, private domain: string) {}

  create(t: DecisionTask, missionId: string | null) {
    return this.store.addTask({
      domain: this.domain,
      missionId,
      title: t.title,
      detail: t.detail,
      priority: t.priority,
      status: t.approvalRequired ? "NEEDS_APPROVAL" : "WAITING",
      owner: t.owner,
      dependsOn: t.dependsOn,
      approvalRequired: t.approvalRequired,
      actionKinds: t.actionKinds,
      result: null,
    });
  }

  /** Creates a task straight from a person's words, at a priority they choose. */
  createManual(title: string, priority: UniverseTask["priority"], detail = "") {
    return this.store.addTask({ domain: this.domain, missionId: null, title: title.trim().slice(0, 160), detail, priority, status: "WAITING", owner: "OWNER", dependsOn: [], approvalRequired: false, actionKinds: [], result: null });
  }

  private async move(id: string, to: UniverseTask["status"], result?: string) {
    const t = await this.store.getTask(id);
    if (!t || t.domain !== this.domain) throw new TaskError("That task does not exist.");
    if (!NEXT[t.status].includes(to)) throw new TaskError(`A task that is ${t.status} cannot become ${to}.`);
    const finished = to === "DONE" || to === "FAILED" || to === "CANCELLED";
    return (await this.store.updateTask(id, { status: to, result: result ?? t.result, completedAt: finished ? new Date() : null }))!;
  }

  approve = (id: string) => this.move(id, "WAITING");
  reject = (id: string) => this.move(id, "CANCELLED", "Not approved.");
  start = (id: string) => this.move(id, "ACTIVE");
  complete = (id: string, result: string) => this.move(id, "DONE", result);
  fail = (id: string, reason: string) => this.move(id, "FAILED", reason);
  cancel = (id: string) => this.move(id, "CANCELLED");

  get(id: string) {
    return this.store.getTask(id);
  }

  /** The board: every task grouped by where it stands, most important first. */
  async board() {
    const all = await this.store.listTasks({ domain: this.domain, limit: 500 });
    const by = (s: UniverseTask["status"]) => all.filter((t) => t.status === s);
    return { active: by("ACTIVE"), waiting: by("WAITING"), needsApproval: by("NEEDS_APPROVAL"), done: by("DONE"), failed: by("FAILED"), cancelled: by("CANCELLED") };
  }
}
