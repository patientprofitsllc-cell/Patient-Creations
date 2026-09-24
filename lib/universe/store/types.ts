import type { ActivityRecord, CommandName, Intent, MemoryEntry, MemoryKind, MemoryLevel, MissionResult, Priority, Route, TaskStatus, UniverseTask } from "@/lib/universe/types";

// Everything the Agent Universe remembers goes through this one interface, so the same core runs against an in-memory store in
// tests and simulations and against the real database in production.

export interface StoredMission {
  id: string;
  domain: string;
  command: CommandName;
  objective: string;
  intent: Intent | null;
  triggeredBy: "user" | "schedule" | "event";
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "REFUSED";
  priority: Priority;
  route: Route | null;
  result: MissionResult | null;
  report: string | null;
  createdAt: Date;
  finishedAt: Date | null;
}

export interface MemoryFilter {
  domain: string;
  level?: MemoryLevel;
  kind?: MemoryKind;
  topic?: string;
  agent?: string;
  status?: "ACTIVE" | "SUPERSEDED";
  limit?: number;
}

export interface TaskFilter {
  domain: string;
  statuses?: TaskStatus[];
  missionId?: string;
  limit?: number;
}

export interface UniverseStore {
  addMemory(e: Omit<MemoryEntry, "id" | "createdAt">): Promise<MemoryEntry>;
  getMemory(id: string): Promise<MemoryEntry | null>;
  listMemory(f: MemoryFilter): Promise<MemoryEntry[]>;
  updateMemory(id: string, patch: { status: "ACTIVE" | "SUPERSEDED" }): Promise<void>;
  deleteMemory(id: string): Promise<void>;

  addTask(t: Omit<UniverseTask, "id" | "createdAt" | "updatedAt" | "completedAt">): Promise<UniverseTask>;
  getTask(id: string): Promise<UniverseTask | null>;
  listTasks(f: TaskFilter): Promise<UniverseTask[]>;
  updateTask(id: string, patch: Partial<Pick<UniverseTask, "status" | "result" | "completedAt">>): Promise<UniverseTask | null>;

  addActivity(a: Omit<ActivityRecord, "id" | "at"> & { at?: Date }): Promise<ActivityRecord>;
  listActivity(f: { domain: string; missionId?: string; limit?: number }): Promise<ActivityRecord[]>;

  saveMission(m: StoredMission): Promise<void>;
  getMission(id: string): Promise<StoredMission | null>;
  listMissions(f: { domain: string; limit?: number }): Promise<StoredMission[]>;

  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  deleteSetting(key: string): Promise<void>;
}
