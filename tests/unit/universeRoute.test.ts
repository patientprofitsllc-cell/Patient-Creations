import { describe, expect, it } from "vitest";
import { agentsIn, classifyIntent, inferKind, routeFor } from "@/lib/universe/route";
import { AGENT_IDS, type AgentId, type Mission } from "@/lib/universe/types";
import { buildMission } from "@/lib/universe/commands";
import { makeCtx } from "./universeHelpers";

const mission = (objective: string, extra: Partial<Mission> = {}): Mission => ({
  id: "m1", command: "ASK_MASTER", kind: "ask", objective, goal: objective, context: "", constraints: [], available: [], requiredOutcome: "", deadline: null, priority: "P2", assumptions: [], attachments: [], triggeredBy: "user", ...extra,
});
const set = (r: ReturnType<typeof routeFor>) => new Set<AgentId>(agentsIn(r));
const same = (a: Set<AgentId>, b: AgentId[]) => expect([...a].sort()).toEqual([...b].sort());

describe("MASTER wakes only the minds a request needs", () => {
  it("a screenshot question wakes LOOK, FEELINGS, PERSPECTIVE, ORGANIZER, and MASTER, and nothing else", () => {
    const r = routeFor(mission("Look at this screenshot and tell me what's wrong."));
    expect(r.intent).toBe("visual");
    same(set(r), ["LOOK", "FEELINGS", "PERSPECTIVE", "ORGANIZER", "MASTER"]);
  });

  it("a strategic decision wakes GATHERER, PERSPECTIVE, THINKING, LOGIC, FEELINGS, ORGANIZER, and MASTER", () => {
    const r = routeFor(mission("Should Patient Creations introduce a subscription?"));
    expect(r.intent).toBe("decision");
    same(set(r), ["GATHERER", "PERSPECTIVE", "THINKING", "LOGIC", "FEELINGS", "ORGANIZER", "MASTER"]);
  });

  it("a rewrite wakes only GATHERER, SPEAKER, LOGIC, and MASTER", () => {
    const r = routeFor(mission("Rewrite this product description."));
    expect(r.intent).toBe("copy");
    same(set(r), ["GATHERER", "SPEAKER", "LOGIC", "MASTER"]);
  });

  it("a whole-business analysis wakes the full chain", () => {
    const r = routeFor(mission("Analyze Patient Creations and identify the most important areas that should be investigated to improve the business."));
    expect(r.intent).toBe("analysis");
    same(set(r), [...AGENT_IDS]);
  });

  it("LOGIC always runs after the agents whose claims it must challenge", () => {
    for (const text of ["Should we add a subscription?", "Analyze the business", "Look at this screenshot"]) {
      const r = routeFor(mission(text));
      const order = r.steps.flat();
      if (order.includes("LOGIC")) for (const a of ["PERSPECTIVE", "THINKING", "FEELINGS", "LOOK", "IMAGE"] as AgentId[]) if (order.includes(a)) expect(order.indexOf(a), `${a} before LOGIC in "${text}"`).toBeLessThan(order.indexOf("LOGIC"));
    }
  });

  it("MASTER always comes last, and every skipped agent is listed with a reason", () => {
    for (const text of ["Look at this screenshot", "Should we launch a plan?", "Rewrite this headline", "What needs attention today?", "Research competitors"]) {
      const r = routeFor(mission(text));
      expect(r.steps[r.steps.length - 1]).toEqual(["MASTER"]);
      const woken = set(r);
      for (const a of AGENT_IDS.filter((x) => x !== "MASTER" && !woken.has(x))) expect(r.skipped.find((s) => s.agent === a)?.why.length, `${a} skipped in "${text}"`).toBeGreaterThan(10);
      expect(r.skipped.every((s) => !woken.has(s.agent))).toBe(true);
    }
  });

  it("does not wake every agent for a simple lookup or a daily audit", () => {
    expect(agentsIn(routeFor(mission("What needs attention today?"))).length).toBeLessThanOrEqual(3);
    const daily = routeFor(mission("Daily audit", { kind: "daily", intent: "analysis" }));
    expect(agentsIn(daily).length).toBeLessThan(6);
    expect(daily.steps.flat().indexOf("ORGANIZER")).toBeLessThan(daily.steps.flat().indexOf("LOGIC"));
  });

  it("an attachment means something is to be looked at", () => {
    expect(classifyIntent("What do you think?", true)).toBe("visual");
  });

  it("a command with a fixed shape uses its own route, whatever the words say", () => {
    const ctx = makeCtx();
    const r = routeFor(buildMission(ctx, "AUDIT_WEBSITE"));
    expect(r.intent).toBe("audit-website");
    for (const a of ["LOOK", "IMAGE", "FEELINGS", "PERSPECTIVE", "THINKING", "LOGIC", "ORGANIZER"] as AgentId[]) expect(set(r).has(a), a).toBe(true);
    expect(agentsIn(routeFor(buildMission(ctx, "ANALYZE_GROWTH"))).includes("LOOK")).toBe(false);
  });

  it("works out which part of the business a free-text request is about", () => {
    expect(inferKind("How is the homepage doing?")).toBe("website");
    expect(inferKind("Is our pricing right?")).toBe("products");
    expect(inferKind("Why do customers leave?")).toBe("customers");
    expect(inferKind("Tell me something")).toBe("business");
  });

  it("names no business anywhere in the routing rules", () => {
    // The route file is universal: it must not mention the first business it was deployed to.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const src = require("fs").readFileSync("lib/universe/route.ts", "utf8") as string;
    expect(src.toLowerCase()).not.toContain("patient");
  });
});
