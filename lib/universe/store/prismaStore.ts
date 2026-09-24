import { db } from "@/lib/db";
import type { ActivityRecord, AgentId, CommandName, Intent, MemoryEntry, MemoryKind, MemoryLevel, MissionResult, Priority, Route, TaskStatus, UniverseTask } from "@/lib/universe/types";
import type { MemoryFilter, StoredMission, TaskFilter, UniverseStore } from "@/lib/universe/store/types";

// The Agent Universe's memory in the real database. Arrays and results are stored as JSON text; everything is keyed by domain.

const parse = <T,>(text: string | null | undefined, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

type MemoryRow = Awaited<ReturnType<typeof db.universeMemory.findFirstOrThrow>>;
type TaskRow = Awaited<ReturnType<typeof db.universeTask.findFirstOrThrow>>;
type ActivityRow = Awaited<ReturnType<typeof db.universeActivity.findFirstOrThrow>>;
type MissionRow = Awaited<ReturnType<typeof db.universeMission.findFirstOrThrow>>;

const memory = (r: MemoryRow): MemoryEntry => ({ id: r.id, domain: r.domain, level: r.level as MemoryLevel, kind: r.kind as MemoryKind, topic: r.topic, content: r.content, source: r.source, agent: (r.agent as AgentId | null) ?? null, status: r.status === "SUPERSEDED" ? "SUPERSEDED" : "ACTIVE", evidence: parse<string[]>(r.evidenceJson, []), createdAt: r.createdAt });
const task = (r: TaskRow): UniverseTask => ({ id: r.id, domain: r.domain, missionId: r.missionId, title: r.title, detail: r.detail, priority: r.priority as Priority, status: r.status as TaskStatus, owner: r.owner, dependsOn: parse<string[]>(r.dependsOnJson, []), approvalRequired: r.approvalRequired, actionKinds: parse<string[]>(r.actionKindsJson, []), result: r.result, createdAt: r.createdAt, updatedAt: r.updatedAt, completedAt: r.completedAt });
const activity = (r: ActivityRow): ActivityRecord => ({ id: r.id, domain: r.domain, missionId: r.missionId, at: r.at, agent: r.agent as AgentId, task: r.task, input: r.input, output: r.output, status: r.status as ActivityRecord["status"], durationMs: r.durationMs, error: r.error, handoff: r.handoff, result: r.result });
const mission = (r: MissionRow): StoredMission => ({ id: r.id, domain: r.domain, command: r.command as CommandName, objective: r.objective, intent: (r.intent as Intent | null) ?? null, triggeredBy: (r.triggeredBy as StoredMission["triggeredBy"]) ?? "user", status: r.status as StoredMission["status"], priority: r.priority as Priority, route: parse<Route | null>(r.routeJson, null), result: parse<MissionResult | null>(r.resultJson, null), report: r.report, createdAt: r.createdAt, finishedAt: r.finishedAt });

export const prismaStore: UniverseStore = {
  async addMemory(e) {
    return memory(await db.universeMemory.create({ data: { domain: e.domain, level: e.level, kind: e.kind, topic: e.topic.slice(0, 120), content: e.content.slice(0, 4000), source: e.source, agent: e.agent, status: e.status, evidenceJson: JSON.stringify(e.evidence) } }));
  },
  async getMemory(id) {
    const r = await db.universeMemory.findUnique({ where: { id } });
    return r ? memory(r) : null;
  },
  async listMemory(f: MemoryFilter) {
    const rows = await db.universeMemory.findMany({ where: { domain: f.domain, ...(f.level && { level: f.level }), ...(f.kind && { kind: f.kind }), ...(f.topic && { topic: f.topic }), ...(f.agent && { agent: f.agent }), ...(f.status && { status: f.status }) }, orderBy: { createdAt: "desc" }, take: f.limit ?? 100 });
    return rows.map(memory);
  },
  async updateMemory(id, patch) {
    await db.universeMemory.update({ where: { id }, data: { status: patch.status } }).catch(() => undefined);
  },
  async deleteMemory(id) {
    await db.universeMemory.delete({ where: { id } }).catch(() => undefined);
  },

  async addTask(t) {
    return task(await db.universeTask.create({ data: { domain: t.domain, missionId: t.missionId, title: t.title.slice(0, 200), detail: t.detail.slice(0, 4000), priority: t.priority, status: t.status, owner: t.owner, dependsOnJson: JSON.stringify(t.dependsOn), approvalRequired: t.approvalRequired, actionKindsJson: JSON.stringify(t.actionKinds), result: t.result } }));
  },
  async getTask(id) {
    const r = await db.universeTask.findUnique({ where: { id } });
    return r ? task(r) : null;
  },
  async listTasks(f: TaskFilter) {
    const rows = await db.universeTask.findMany({ where: { domain: f.domain, ...(f.statuses && { status: { in: f.statuses } }), ...(f.missionId && { missionId: f.missionId }) }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }], take: f.limit ?? 200 });
    return rows.map(task);
  },
  async updateTask(id, patch) {
    const r = await db.universeTask.update({ where: { id }, data: { ...(patch.status && { status: patch.status }), ...(patch.result !== undefined && { result: patch.result }), ...(patch.completedAt !== undefined && { completedAt: patch.completedAt }) } }).catch(() => null);
    return r ? task(r) : null;
  },

  async addActivity(a) {
    return activity(await db.universeActivity.create({ data: { domain: a.domain, missionId: a.missionId, ...(a.at && { at: a.at }), agent: a.agent, task: a.task.slice(0, 300), input: a.input.slice(0, 2000), output: a.output.slice(0, 2000), status: a.status, durationMs: a.durationMs, error: a.error, handoff: a.handoff, result: a.result } }));
  },
  async listActivity(f) {
    const rows = await db.universeActivity.findMany({ where: { domain: f.domain, ...(f.missionId && { missionId: f.missionId }) }, orderBy: { at: "desc" }, take: f.limit ?? 500 });
    return rows.map(activity).reverse();
  },

  async saveMission(m) {
    const data = { domain: m.domain, command: m.command, objective: m.objective.slice(0, 600), intent: m.intent, triggeredBy: m.triggeredBy, status: m.status, priority: m.priority, routeJson: m.route ? JSON.stringify(m.route) : null, resultJson: m.result ? JSON.stringify(m.result) : null, report: m.report, finishedAt: m.finishedAt };
    await db.universeMission.upsert({ where: { id: m.id }, update: data, create: { id: m.id, createdAt: m.createdAt, ...data } });
  },
  async getMission(id) {
    const r = await db.universeMission.findUnique({ where: { id } });
    return r ? mission(r) : null;
  },
  async listMissions(f) {
    const rows = await db.universeMission.findMany({ where: { domain: f.domain }, orderBy: { createdAt: "desc" }, take: f.limit ?? 50 });
    return rows.map(mission);
  },

  async getSetting(key) {
    return (await db.appSetting.findUnique({ where: { key } }))?.value ?? null;
  },
  async setSetting(key, value) {
    await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  },
  async deleteSetting(key) {
    await db.appSetting.delete({ where: { key } }).catch(() => undefined);
  },
};
