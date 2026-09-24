import type { CommandName, MissionResult, Priority } from "@/lib/universe/types";
import type { UniverseStore } from "@/lib/universe/store/types";
import type { PermissionManager } from "@/lib/universe/core/permissionManager";

// The Agent Universe is event driven: something happens, MASTER decides whether it deserves a mission, and if so runs the
// lightest one that fits. Nothing here runs by itself. A scheduler or a webhook has to call handleEvent, and it only proceeds
// when the AUTONOMOUS level is set and autonomy is not paused. Most events are only recorded, on purpose, to keep cost down.

export const EVENT_TYPES = ["user_request", "scheduled_task", "website_event", "new_customer", "new_order", "payment", "form_submission", "email", "analytics_event", "api_webhook", "database_change", "monitoring_alert", "agent_task", "daily_audit", "weekly_review"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface UniverseEvent {
  type: EventType;
  /** Small, non-personal details about what happened. */
  payload?: Record<string, string | number | boolean | null>;
}

interface EventRoute {
  command: CommandName;
  priority: Priority;
  /** At most once per day, however many times it fires. */
  oncePerDay: boolean;
}

/** Only these events start a mission. Every other event is recorded and does nothing more. */
export const EVENT_ROUTES: Partial<Record<EventType, EventRoute>> = {
  daily_audit: { command: "RUN_DAILY_AUDIT", priority: "P2", oncePerDay: true },
  weekly_review: { command: "RUN_WEEKLY_REVIEW", priority: "P2", oncePerDay: true },
  monitoring_alert: { command: "RUN_DAILY_AUDIT", priority: "P1", oncePerDay: false },
};

export const MAX_AUTONOMOUS_PER_DAY = 4;

export type EventOutcome =
  | { handled: true; result: MissionResult }
  | { handled: false; reason: string };

const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export class EventManager {
  constructor(private store: UniverseStore, private domain: string, private perm: PermissionManager) {}

  /** Decides whether an event starts a mission, and if it does, runs it through `run`. */
  async handle(event: UniverseEvent, run: (command: CommandName, priority: Priority, triggeredBy: "schedule" | "event") => Promise<MissionResult>, now = new Date()): Promise<EventOutcome> {
    const route = EVENT_ROUTES[event.type];
    if (!route) return { handled: false, reason: `No mission is defined for "${event.type}". It is recorded only.` };

    const triggeredBy = event.type === "daily_audit" || event.type === "weekly_review" || event.type === "scheduled_task" ? "schedule" : "event";
    const permit = await this.perm.canRun(route.command, triggeredBy);
    if (!permit.allowed) return { handled: false, reason: permit.reason };

    const missions = await this.store.listMissions({ domain: this.domain, limit: 100 });
    const today = missions.filter((m) => sameDay(m.createdAt, now) && m.triggeredBy !== "user" && m.status !== "REFUSED");
    if (today.length >= MAX_AUTONOMOUS_PER_DAY) return { handled: false, reason: `The limit of ${MAX_AUTONOMOUS_PER_DAY} autonomous missions a day has been reached.` };
    if (route.oncePerDay && today.some((m) => m.command === route.command)) return { handled: false, reason: `${route.command} has already run today.` };

    return { handled: true, result: await run(route.command, route.priority, triggeredBy) };
  }
}
