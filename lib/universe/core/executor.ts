import type { AuditManager } from "@/lib/universe/core/auditManager";
import type { MemoryManager } from "@/lib/universe/core/memoryManager";
import type { PermissionManager } from "@/lib/universe/core/permissionManager";
import type { TaskManager } from "@/lib/universe/core/taskManager";
import type { Decision, Deps, Mission, MissionResult } from "@/lib/universe/types";

// EXECUTE and VERIFY. MASTER only acts on things inside the Agent Universe: it records tasks, saves the decision to memory, and
// tells the owner about something urgent. Each action is checked against the permission rules first, and afterward it is read
// back to confirm it really happened. An action is never reported as done on the strength of the call returning.
// Anything with an effect outside (pricing, refunds, mass email, money, infrastructure) has no executor at all: it is a draft.

export interface ExecCtx {
  missionId: string;
  mission: Mission;
  deps: Deps;
  perm: PermissionManager;
  tasks: TaskManager;
  memory: MemoryManager;
  audit: AuditManager;
}

export async function executeDecision(ctx: ExecCtx, decision: Decision): Promise<MissionResult["executed"]> {
  const out: MissionResult["executed"] = [];
  const log = (action: string, ok: boolean, verified: boolean, detail: string) => out.push({ action, ok, verified, detail });

  const canTask = await ctx.perm.canDo("create_task");
  if (!canTask.allowed) {
    if (decision.tasks.length) log("create_task", false, false, `${decision.tasks.length} task${decision.tasks.length === 1 ? "" : "s"} left as drafts. ${canTask.reason}`);
  } else {
    for (const t of decision.tasks) {
      try {
        const made = await ctx.tasks.create(t, ctx.missionId);
        const back = await ctx.tasks.get(made.id);
        const verified = Boolean(back && back.title === t.title && back.priority === t.priority && back.domain === made.domain);
        log("create_task", true, verified, `${t.priority} ${t.title}${t.approvalRequired ? " (waiting for approval)" : ""}`);
      } catch (err) {
        log("create_task", false, false, `${t.title}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }
  }

  const canMemory = await ctx.perm.canDo("save_memory");
  if (!canMemory.allowed) log("save_memory", false, false, canMemory.reason);
  else {
    try {
      const saved = await ctx.memory.remember({
        level: "DECISION",
        kind: "DECISION",
        topic: ctx.mission.kind,
        content: `${ctx.mission.objective} -> ${decision.summary} Next: ${decision.nextActions.slice(0, 3).join(" | ") || "nothing"}`,
        source: `mission ${ctx.missionId}`,
        agent: "MASTER",
      });
      const back = (await ctx.memory.recall({ level: "DECISION", limit: 20 })).some((m) => m.id === saved.id);
      log("save_memory", true, back, "Decision saved to memory.");
    } catch (err) {
      log("save_memory", false, false, err instanceof Error ? err.message : "failed");
    }
  }

  const urgent = decision.tasks.filter((t) => t.priority === "P0");
  if (urgent.length) {
    const canNotify = await ctx.perm.canDo("notify_owner");
    if (!canNotify.allowed) log("notify_owner", false, false, canNotify.reason);
    else if (!ctx.deps.notifyOwner) log("notify_owner", false, false, "No notification channel is configured, so the owner was not told.");
    else {
      try {
        const id = await ctx.deps.notifyOwner(`Agent Universe: ${urgent.length} urgent item${urgent.length === 1 ? "" : "s"}`, urgent.map((t) => `${t.title}`).join("\n"));
        log("notify_owner", id !== null, id !== null, id ? "The owner was notified." : "The notification was not sent.");
      } catch (err) {
        log("notify_owner", false, false, err instanceof Error ? err.message : "failed");
      }
    }
  }

  for (const e of out) await ctx.audit.record({ agent: "MASTER", task: `EXECUTE ${e.action}`, input: e.detail, output: e.ok ? (e.verified ? "done and verified" : "done, NOT verified") : "not done", status: e.ok && e.verified ? "OK" : "FAILED", durationMs: 0, result: e.detail });
  return out;
}
