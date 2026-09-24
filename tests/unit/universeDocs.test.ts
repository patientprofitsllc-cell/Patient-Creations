import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { AGENT_IDS, type CommandName } from "@/lib/universe/types";
import { agentsIn, routeFor } from "@/lib/universe/route";
import { buildMission, COMMANDS } from "@/lib/universe/commands";
import { agentTable } from "@/lib/universe/agents";
import { makeCtx } from "./universeHelpers";

// The written specification must not drift from the code. Every agent has a file with every section, every file names code that
// exists, and the audits document's table of which agents wake for which command is checked against the real routes.

const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), "utf8");
const SECTIONS = ["NAME", "ROLE", "PURPOSE", "RESPONSIBILITIES", "INPUTS", "OUTPUTS", "WHEN TO USE", "WHEN NOT TO USE", "TOOLS", "DECISION RULES", "LIMITATIONS", "EXAMPLES", "COMMUNICATION FORMAT"];

describe("the agent specifications", () => {
  it("has a file for each of the eleven agents, with every section the spec asks for", () => {
    for (const a of AGENT_IDS) {
      const f = `agent-universe/agents/${a.toLowerCase()}.md`;
      expect(existsSync(join(root, f)), f).toBe(true);
      const text = read(f);
      for (const s of SECTIONS) expect(text, `${f} ## ${s}`).toMatch(new RegExp(`^## ${s}$`, "m"));
      expect(text).toMatch(new RegExp(`^## NAME\n${a}$`, "m"));
      expect(text).toContain("CONFIDENCE");
    }
  });

  it("names, for each agent, code files that exist", () => {
    for (const a of AGENT_IDS) {
      const text = read(`agent-universe/agents/${a.toLowerCase()}.md`);
      const files = (/## WHERE THE CODE IS\n(.+)/.exec(text)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      expect(files.length, a).toBeGreaterThan(0);
      for (const f of files) expect(existsSync(join(root, f)), `${a}: ${f}`).toBe(true);
    }
  });

  it("has an agent in code for every agent on paper, and no agent in code that is not on paper", () => {
    const inCode = new Set(Object.keys(agentTable()));
    for (const a of AGENT_IDS.filter((x) => x !== "MASTER")) expect(inCode.has(a), a).toBe(true);
    expect(inCode.size).toBe(AGENT_IDS.length - 1);
  });

  it("provides the reusable template and the required documents", () => {
    const t = read("agent-universe/agents/UNIVERSAL_AGENT_TEMPLATE.md");
    for (const k of ["NAME:", "ROLE:", "MISSION:", "PRIMARY_FUNCTION:", "SECONDARY_FUNCTIONS:", "INPUTS:", "OUTPUTS:", "CONTEXT:", "TOOLS:", "DECISION_RULES:", "FAILURE_MODES:", "LIMITATIONS:", "HANDOFF_PROTOCOL:", "MEMORY_REQUIREMENTS:", "EXAMPLE_TASKS:"]) expect(t, k).toContain(k);
    for (const f of ["README.md", "docs/architecture.md", "docs/agent-protocol.md", "docs/deployment.md", "docs/security.md", "domain/patient-creations/context.md", "domain/patient-creations/objectives.md", "domain/patient-creations/workflows.md", "domain/patient-creations/audits.md"]) expect(existsSync(join(root, "agent-universe", f)), f).toBe(true);
  });

  it("tells the truth in the audits table about which agents wake for which command", () => {
    const rows = read("agent-universe/domain/patient-creations/audits.md").split("\n").filter((l) => /^\| (AUDIT|ANALYZE|GENERATE|RUN)_/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(8);
    const ctx = makeCtx();
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim());
      const command = cells[1] as CommandName;
      expect(COMMANDS).toContain(command);
      const woken = new Set(agentsIn(routeFor(buildMission(ctx, command))).filter((a) => a !== "MASTER"));
      const documented = /^All ten/i.test(cells[2]) ? new Set(AGENT_IDS.filter((a) => a !== "MASTER")) : new Set(cells[2].split(",").map((s) => s.trim()));
      expect([...documented].sort(), command).toEqual([...woken].sort());
    }
  });

  it("documents the three routes the owner asked for exactly as they are coded", () => {
    const readme = read("agent-universe/README.md");
    expect(readme).toContain("LOOK → FEELINGS → PERSPECTIVE → ORGANIZER → MASTER");
    expect(readme).toContain("GATHERER → SPEAKER → LOGIC → MASTER");
    expect(readme).toContain("MASTER wakes only the minds a request needs");
  });
});
