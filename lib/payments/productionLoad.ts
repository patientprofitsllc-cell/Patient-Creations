import { db } from "@/lib/db";

// Non-terminal states = currently occupying a production slot.
const ACTIVE_STATES = [
  "PAID",
  "INTAKE_REQUIRED",
  "QUEUED",
  "RESEARCH",
  "STRATEGY",
  "CONCEPT",
  "GENERATION",
  "BUILD",
  "AUTOMATION",
  "QA",
  "PERCEPTION",
  "REVISION",
];

/** How many builds are currently in production — the real signal behind "current wait times." Server-only (touches the DB). */
export async function getActiveProjectCount(): Promise<number> {
  return db.project.count({ where: { state: { in: ACTIVE_STATES } } });
}
