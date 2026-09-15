import { ProjectState } from "@/lib/types";
import { db } from "@/lib/db";

// Mirrors the example progress table in the spec. Each phase's weight is
// the cumulative percentage reached once that phase's tasks are complete.
// Real progress = sum of weights for PASSED tasks, never a timer.
export const PHASE_WEIGHTS: Record<ProjectState, { label: string; weight: number }> = {
  DRAFT: { label: "Order Received", weight: 0 },
  PAID: { label: "Order Received", weight: 5 },
  INTAKE_REQUIRED: { label: "Brief Analyzed", weight: 12 },
  QUEUED: { label: "Queued for Production", weight: 15 },
  RESEARCH: { label: "Research Complete", weight: 22 },
  STRATEGY: { label: "Strategy Set", weight: 27 },
  CONCEPT: { label: "Concept Approved", weight: 31 },
  GENERATION: { label: "Assets Generated", weight: 48 },
  BUILD: { label: "Build In Progress", weight: 62 },
  AUTOMATION: { label: "Automation Configured", weight: 76 },
  QA: { label: "Quality Assurance", weight: 88 },
  PERCEPTION: { label: "Perception Review", weight: 92 },
  REVISION: { label: "Revision In Progress", weight: 90 },
  DELIVERY_READY: { label: "Final Review", weight: 95 },
  DELIVERED: { label: "Delivery Ready", weight: 100 },
  REVIEW_REQUESTED: { label: "Review Requested", weight: 100 },
  COMPLETED: { label: "Complete", weight: 100 },
  EXCEPTION: { label: "Needs Attention", weight: -1 },
  CANCELLED: { label: "Cancelled", weight: -1 },
};

export async function getProjectProgress(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { tasks: { orderBy: { id: "asc" } } },
  });

  const completedWeight = project.tasks
    .filter((t) => t.status === "PASSED")
    .reduce((sum, t) => sum + t.weight, 0);

  const phaseInfo = PHASE_WEIGHTS[project.state as ProjectState];
  const percent = phaseInfo.weight >= 0 ? Math.max(completedWeight, phaseInfo.weight === 0 ? 0 : Math.min(completedWeight, 100)) : completedWeight;

  const activeTask = project.tasks.find((t) => t.status === "IN_PROGRESS");
  const nextTask = project.tasks.find((t) => t.status === "PENDING");

  return {
    state: project.state,
    percent: Math.min(100, Math.max(0, percent)),
    currentPhaseLabel: phaseInfo.label,
    completedPhases: project.tasks.filter((t) => t.status === "PASSED").map((t) => t.label),
    activeTask: activeTask?.label ?? null,
    nextTask: nextTask?.label ?? null,
    isException: project.state === "EXCEPTION",
    exceptionNote: project.exceptionNote,
  };
}
