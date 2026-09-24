import type { ActivityRecord, MemoryEntry, UniverseTask } from "@/lib/universe/types";
import type { MemoryFilter, StoredMission, TaskFilter, UniverseStore } from "@/lib/universe/store/types";

/** A store that lives in memory. Used by tests and by simulations, so nothing is written anywhere real. */
export class InMemoryStore implements UniverseStore {
  memory: MemoryEntry[] = [];
  tasks: UniverseTask[] = [];
  activity: ActivityRecord[] = [];
  missions = new Map<string, StoredMission>();
  settings = new Map<string, string>();
  private n = 0;
  // Ids look like the real ones (letters and digits only) so the routes that check an id's shape accept them.
  private id = (p: string) => `c${p}${String(++this.n).padStart(10, "0")}`;

  async addMemory(e: Omit<MemoryEntry, "id" | "createdAt">) {
    const row: MemoryEntry = { ...e, id: this.id("mem"), createdAt: new Date() };
    this.memory.push(row);
    return row;
  }
  async getMemory(id: string) {
    return this.memory.find((m) => m.id === id) ?? null;
  }
  async listMemory(f: MemoryFilter) {
    return this.memory
      .filter((m) => m.domain === f.domain && (!f.level || m.level === f.level) && (!f.kind || m.kind === f.kind) && (!f.topic || m.topic === f.topic) && (!f.agent || m.agent === f.agent) && (!f.status || m.status === f.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, f.limit ?? 100);
  }
  async updateMemory(id: string, patch: { status: "ACTIVE" | "SUPERSEDED" }) {
    const m = this.memory.find((x) => x.id === id);
    if (m) m.status = patch.status;
  }
  async deleteMemory(id: string) {
    this.memory = this.memory.filter((m) => m.id !== id);
  }

  async addTask(t: Omit<UniverseTask, "id" | "createdAt" | "updatedAt" | "completedAt">) {
    const now = new Date();
    const row: UniverseTask = { ...t, id: this.id("task"), createdAt: now, updatedAt: now, completedAt: null };
    this.tasks.push(row);
    return row;
  }
  async getTask(id: string) {
    return this.tasks.find((t) => t.id === id) ?? null;
  }
  async listTasks(f: TaskFilter) {
    return this.tasks
      .filter((t) => t.domain === f.domain && (!f.statuses || f.statuses.includes(t.status)) && (!f.missionId || t.missionId === f.missionId))
      .sort((a, b) => a.priority.localeCompare(b.priority) || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, f.limit ?? 200);
  }
  async updateTask(id: string, patch: Partial<Pick<UniverseTask, "status" | "result" | "completedAt">>) {
    const t = this.tasks.find((x) => x.id === id);
    if (!t) return null;
    Object.assign(t, patch, { updatedAt: new Date() });
    return t;
  }

  async addActivity(a: Omit<ActivityRecord, "id" | "at"> & { at?: Date }) {
    const row: ActivityRecord = { ...a, id: this.id("act"), at: a.at ?? new Date() };
    this.activity.push(row);
    return row;
  }
  async listActivity(f: { domain: string; missionId?: string; limit?: number }) {
    return this.activity
      .filter((a) => a.domain === f.domain && (!f.missionId || a.missionId === f.missionId))
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(-(f.limit ?? 500));
  }

  async saveMission(m: StoredMission) {
    this.missions.set(m.id, m);
  }
  async getMission(id: string) {
    return this.missions.get(id) ?? null;
  }
  async listMissions(f: { domain: string; limit?: number }) {
    return [...this.missions.values()]
      .filter((m) => m.domain === f.domain)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, f.limit ?? 50);
  }

  async getSetting(key: string) {
    return this.settings.get(key) ?? null;
  }
  async setSetting(key: string, value: string) {
    this.settings.set(key, value);
  }
  async deleteSetting(key: string) {
    this.settings.delete(key);
  }
}
