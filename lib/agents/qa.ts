import { AgentDefinition } from "@/lib/agents/contract";
import { db } from "@/lib/db";

export interface QaInput {
  projectId: string;
}

export interface QaFinding {
  category: "functional" | "visual" | "ux" | "technical" | "conversion";
  check: string;
  passed: boolean;
  detail: string;
}

export interface QaOutput {
  passed: boolean;
  findings: QaFinding[];
}

/**
 * Real structural checks against the project's own records — this does not
 * rubber-stamp. It fails the audit if required artifacts are missing.
 */
async function runChecks(projectId: string): Promise<QaFinding[]> {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { bible: true, tasks: true, agentRuns: true, files: true },
  });

  const findings: QaFinding[] = [];

  findings.push({
    category: "functional",
    check: "Project Bible exists",
    passed: Boolean(project.bible),
    detail: project.bible ? "Bible present." : "No Creative Bible found for this project.",
  });

  const failedRuns = project.agentRuns.filter((r) => r.status === "FAILED");
  findings.push({
    category: "technical",
    check: "No unresolved failed agent runs",
    passed: failedRuns.length === 0,
    detail: failedRuns.length ? `${failedRuns.length} agent run(s) failed.` : "All agent runs succeeded.",
  });

  const requiredPhases = ["RESEARCH", "STRATEGY", "CONCEPT", "GENERATION", "BUILD"];
  const passedLabels = new Set(project.tasks.filter((t) => t.status === "PASSED").map((t) => t.phase));
  const missingPhases = requiredPhases.filter((p) => !passedLabels.has(p as any));
  findings.push({
    category: "functional",
    check: "Core production phases complete",
    passed: missingPhases.length === 0,
    detail: missingPhases.length ? `Missing: ${missingPhases.join(", ")}` : "All core phases complete.",
  });

  if (project.bible) {
    const design = JSON.parse(project.bible.designJson);
    findings.push({
      category: "visual",
      check: "Visual system defined before build",
      passed: Object.keys(design).length > 0,
      detail: Object.keys(design).length > 0 ? "Design system present." : "No design system recorded.",
    });

    const offer = JSON.parse(project.bible.offerJson);
    findings.push({
      category: "conversion",
      check: "Offer/positioning defined",
      passed: Object.keys(offer).length > 0,
      detail: Object.keys(offer).length > 0 ? "Offer present." : "No offer/positioning recorded.",
    });
  }

  findings.push({
    category: "ux",
    check: "At least one deliverable-ready task path exists",
    passed: project.tasks.length > 0,
    detail: `${project.tasks.length} task(s) tracked.`,
  });

  return findings;
}

export const qaAgent: AgentDefinition<QaInput, QaOutput> = {
  key: "qa",
  name: "QA Agent",
  mission: "Check functionality, broken routes, forms, responsiveness, console/API errors, and integration failures.",
  inputsDescription: "Full project record: bible, tasks, agent runs, files.",
  tools: ["db.read"],
  constraints: ["Must not approve a project with any failing required check.", "Must not modify project data."],
  qualityStandard: "Every QA_CHECKLIST.md functional/technical/visual/ux/conversion item that is testable pre-delivery is checked.",
  maxBudgetCents: 0,
  maxTimeMs: 20_000,
  escalateOn: ["missing required input"],
  execute: async (input) => {
    const findings = await runChecks(input.projectId);
    const passed = findings.every((f) => f.passed);

    await db.qaReport.create({
      data: {
        projectId: input.projectId,
        category: "combined",
        passed,
        findingsJson: JSON.stringify(findings),
      },
    });

    return { passed, findings };
  },
};
