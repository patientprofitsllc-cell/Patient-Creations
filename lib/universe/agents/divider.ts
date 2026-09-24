import { message } from "@/lib/universe/protocol";
import { selectComponents } from "@/lib/universe/agents/scope";
import type { AgentOutput, Plan, PlanComponent, RunState } from "@/lib/universe/types";

// DIVIDER breaks a large objective into parts, finds what depends on what, says what is not known, and marks what can be done
// at the same time. It does not decide anything: it builds the structure the others work inside.

export function divide(state: RunState): AgentOutput {
  const { mission, domain } = state;
  const chosen = selectComponents(domain, mission);
  // Data can come from a connected source or from something already observed directly, such as a page that was examined.
  const topicsWithData = new Set([...domain.probes.map((p) => p.topic), ...state.facts.filter((f) => f.label === "FACT").map((f) => f.topic)]);
  const ids = new Set(chosen.map((c) => c.id));

  const components: PlanComponent[] = chosen.map((c) => ({
    id: c.id,
    title: c.title,
    question: c.question,
    topics: c.topics,
    dependsOn: (c.dependsOn ?? []).filter((d) => ids.has(d)),
    unknownTopics: c.topics.filter((t) => !topicsWithData.has(t)),
  }));

  // Layers: everything with no unmet dependency can run together; the rest waits for the layer before.
  const placed = new Set<string>();
  const parallel: string[][] = [];
  let remaining = [...components];
  while (remaining.length) {
    const layer = remaining.filter((c) => c.dependsOn.every((d) => placed.has(d)));
    if (!layer.length) {
      // A dependency cycle. Never loop: put what is left in one last layer and say so.
      parallel.push(remaining.map((c) => c.id));
      break;
    }
    parallel.push(layer.map((c) => c.id));
    layer.forEach((c) => placed.add(c.id));
    remaining = remaining.filter((c) => !placed.has(c.id));
  }

  const unknowns = components.flatMap((c) => c.unknownTopics.map((t) => `No data source is connected for "${t}" (needed for ${c.title}).`));
  const stated = `${mission.objective} ${mission.goal}`;
  if (/\b(increase|improve|grow|raise|reduce|lower)\b/i.test(stated) && !/\d|\btarget\b/i.test(stated)) {
    unknowns.push("No measurable target was given, so success is not defined yet.");
  }

  const resources = [...new Set(domain.probes.filter((p) => components.some((c) => c.topics.includes(p.topic))).map((p) => p.id))];
  const wordCount = mission.objective.trim().split(/\s+/).length;
  const plan: Plan = {
    components,
    parallel,
    sequential: components.filter((c) => c.dependsOn.length > 0).map((c) => c.id),
    unknowns,
    resources,
    complexity: components.length <= 2 && wordCount <= 14 ? "simple" : "complex",
  };

  return {
    plan,
    message: message({
      agent: "DIVIDER",
      task: "Break the objective into components, dependencies, and unknowns",
      context: `${domain.name}: ${mission.goal}`,
      input: mission.objective,
      analysis: [
        `The objective divides into ${components.length} component${components.length === 1 ? "" : "s"}: ${components.map((c) => c.title).join(", ")}.`,
        `${parallel[0]?.length ?? 0} can start at once; ${plan.sequential.length} must wait for another.`,
        `${resources.length} data source${resources.length === 1 ? "" : "s"} can be read for these parts.`,
      ],
      unknown: unknowns,
      recommendation: `Gather from ${resources.length} source${resources.length === 1 ? "" : "s"} for ${components.length} component${components.length === 1 ? "" : "s"}. Treat the ${plan.complexity} shape of this problem accordingly.`,
      nextAgent: "GATHERER",
      confidence: unknowns.length === 0 ? "HIGH" : unknowns.length <= 2 ? "MEDIUM" : "LOW",
      payload: { plan },
    }),
  };
}
