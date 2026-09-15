import { ProjectState } from "@/lib/types";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics/events";

// Ordered production pipeline. REVISION is a side-loop off QA/PERCEPTION
// (see the explicit edges below), not a mandatory step on the happy path,
// so it is deliberately excluded from this straight-line order. Terminal/
// exception states are handled separately and are reachable from any
// non-terminal state.
export const PIPELINE_ORDER: ProjectState[] = [
  "DRAFT",
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
  "DELIVERY_READY",
  "DELIVERED",
  "REVIEW_REQUESTED",
  "COMPLETED",
];

const TERMINAL_STATES: ProjectState[] = ["EXCEPTION", "CANCELLED", "COMPLETED"];

/**
 * Validates that a transition is either the next step in the pipeline,
 * a documented skip (REVISION -> QA retry loop), or a move into a
 * terminal state. Called server-side only — clients never set state.
 */
export function isValidTransition(from: ProjectState, to: ProjectState): boolean {
  if (from === to) return false;
  if (TERMINAL_STATES.includes(from)) return false;
  if (to === "EXCEPTION" || to === "CANCELLED") return true;

  // Allow the QA <-> REVISION retry loop explicitly.
  if (from === "QA" && to === "REVISION") return true;
  if (from === "REVISION" && (to === "QA" || to === "PERCEPTION")) return true;
  if (from === "PERCEPTION" && to === "REVISION") return true;

  const fromIdx = PIPELINE_ORDER.indexOf(from);
  const toIdx = PIPELINE_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1;
}

export async function transitionProject(projectId: string, to: ProjectState, note?: string) {
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId } });
  const currentState = project.state as ProjectState;

  if (!isValidTransition(currentState, to)) {
    throw new Error(`Invalid project state transition: ${currentState} -> ${to}`);
  }

  const updated = await db.project.update({
    where: { id: projectId },
    data: { state: to, exceptionNote: to === "EXCEPTION" ? note ?? null : project.exceptionNote },
  });

  await logEvent("project.state_changed", "Project", projectId, {
    from: project.state,
    to,
    note: note ?? null,
  });

  return updated;
}
