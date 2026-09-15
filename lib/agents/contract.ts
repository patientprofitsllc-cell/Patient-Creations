import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";
import { callModel } from "@/lib/ai/callModel";

/**
 * Every agent implements this exact contract (AGENT_WORKER_CONTRACT.md):
 * mission, inputs, tools, constraints, output, quality standard, budget,
 * time, failure, escalation. An agent must never silently invent
 * completion — `run()` always returns an explicit AgentResult.
 */
export interface AgentDefinition<TInput, TOutput> {
  key: string;
  name: string;
  mission: string;
  inputsDescription: string;
  tools: string[];
  constraints: string[];
  qualityStandard: string;
  maxBudgetCents: number;
  maxTimeMs: number;
  escalateOn: string[];
  /** Builds the model prompt and validates/produces the structured output. */
  execute: (input: TInput, ctx: AgentExecContext) => Promise<TOutput>;
}

export interface AgentExecContext {
  projectId: string;
  taskId?: string;
  callModel: typeof callModel;
}

export type AgentResult<TOutput> =
  | { status: "succeeded"; output: TOutput; costCents: number; durationMs: number }
  | { status: "failed"; reason: string; durationMs: number }
  | { status: "escalated"; reason: string; durationMs: number };

async function ensureAgentRow(def: AgentDefinition<any, any>) {
  return db.agent.upsert({
    where: { key: def.key },
    update: { name: def.name, mission: def.mission, maxTimeMs: def.maxTimeMs, budgetCents: def.maxBudgetCents },
    create: {
      key: def.key,
      name: def.name,
      mission: def.mission,
      maxTimeMs: def.maxTimeMs,
      budgetCents: def.maxBudgetCents,
    },
  });
}

/**
 * Runs an agent under its contract: persists the AgentRun, enforces the
 * time budget, logs start/succeed/fail/escalate events, and never lets a
 * thrown error masquerade as success.
 */
export async function runAgent<TInput, TOutput>(
  def: AgentDefinition<TInput, TOutput>,
  input: TInput,
  ctx: { projectId: string; taskId?: string },
): Promise<AgentResult<TOutput>> {
  const agentRow = await ensureAgentRow(def);
  const startedAt = Date.now();

  const run = await db.agentRun.create({
    data: {
      agentId: agentRow.id,
      projectId: ctx.projectId,
      taskId: ctx.taskId ?? null,
      status: "RUNNING",
      inputJson: JSON.stringify(input),
    },
  });

  await logEvent("agent.run_started", "AgentRun", run.id, { agentKey: def.key });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Agent ${def.key} exceeded max time of ${def.maxTimeMs}ms`)), def.maxTimeMs),
  );

  try {
    const output = await Promise.race([
      def.execute(input, { projectId: ctx.projectId, taskId: ctx.taskId, callModel }),
      timeout,
    ]);

    const durationMs = Date.now() - startedAt;

    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCEEDED",
        outputJson: JSON.stringify(output),
        durationMs,
        finishedAt: new Date(),
      },
    });

    await logEvent("agent.run_succeeded", "AgentRun", run.id, { agentKey: def.key, durationMs });

    return { status: "succeeded", output, costCents: 0, durationMs };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const reason = err instanceof Error ? err.message : String(err);

    const shouldEscalate = def.escalateOn.some((trigger) =>
      reason.toLowerCase().includes(trigger.toLowerCase()),
    );

    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: shouldEscalate ? "ESCALATED" : "FAILED",
        failureReason: reason,
        durationMs,
        finishedAt: new Date(),
      },
    });

    await logEvent(shouldEscalate ? "agent.escalated" : "agent.run_failed", "AgentRun", run.id, {
      agentKey: def.key,
      reason,
    });

    return shouldEscalate
      ? { status: "escalated", reason, durationMs }
      : { status: "failed", reason, durationMs };
  }
}
