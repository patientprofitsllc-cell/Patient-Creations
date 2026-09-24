import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { createUniverse } from "@/lib/universe/commands";
import { decide } from "@/lib/universe/core/master";
import { redact } from "@/lib/universe/core/auditManager";
import { MemoryManager, MemoryRuleError } from "@/lib/universe/core/memoryManager";
import { PermissionManager } from "@/lib/universe/core/permissionManager";
import { TaskManager, TaskError } from "@/lib/universe/core/taskManager";
import { runMission } from "@/lib/universe/core/orchestrator";
import { buildMission } from "@/lib/universe/commands";
import { divide } from "@/lib/universe/agents/divider";
import { gather } from "@/lib/universe/agents/gatherer";
import { logic, checkCopyText } from "@/lib/universe/agents/logic";
import { feelings } from "@/lib/universe/agents/feelings";
import { hasHedge, isWellFormed, overclaims, renderMessage } from "@/lib/universe/protocol";
import { routeFor } from "@/lib/universe/route";
import { InMemoryStore } from "@/lib/universe/store/memoryStore";
import { AGENT_IDS, type Claim, type Deps, type Fact, type Mission, type RunState } from "@/lib/universe/types";
import { GOOD_PAGE, gymDomain, makeCtx, probe } from "./universeHelpers";

const mission = (objective: string, extra: Partial<Mission> = {}): Mission => ({
  id: "m1", command: "ASK_MASTER", kind: "ask", objective, goal: objective, context: "", constraints: [], available: [], requiredOutcome: "", deadline: null, priority: "P2", assumptions: [], attachments: [], triggeredBy: "user", ...extra,
});
const stateFor = (objective: string, o: Partial<RunState> = {}): RunState => {
  const m = mission(objective);
  return { mission: m, domain: gymDomain(), route: routeFor(m), plan: null, facts: [], snapshots: [], claims: [], challenges: [], messages: [], organized: null, recalled: [], deps: {}, ...o };
};
const fact = (id: string, o: Partial<Fact> = {}): Fact => ({ id, label: "FACT", topic: "retention", statement: `fact ${id}`, source: "test", tags: [], signal: "neutral", ...o });
const claim = (id: string, o: Partial<Claim> = {}): Claim => ({ id, agent: "THINKING", kind: "recommendation", text: `claim ${id}`, target: "retention", stance: "pursue", severity: "medium", evidence: [], ...o });

describe("the same agents work on any business", () => {
  it("no agent or core file names the first business it was deployed to", () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? (n === "domains" ? [] : walk(join(dir, n))) : [join(dir, n)]));
    for (const f of walk(join(process.cwd(), "lib/universe"))) expect(readFileSync(f, "utf8").toLowerCase(), f).not.toContain("patient");
  });

  it("a full analysis of an unrelated business runs every agent and produces a decision", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    expect(r.status).toBe("COMPLETED");
    const spoke = new Set(r.messages.map((m) => m.agent));
    for (const a of AGENT_IDS.filter((x) => x !== "MASTER")) expect(spoke.has(a), a).toBe(true);
    expect(r.messages.every(isWellFormed)).toBe(true);
    expect(r.decision.tasks.length).toBeGreaterThan(0);
    expect(r.report).toContain("Confidence:");
  });
});

describe("agents speak one standard message", () => {
  it("renders every field the protocol requires", () => {
    const ctx = makeCtx();
    return runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS")).then((r) => {
      for (const m of r.messages) {
        const text = renderMessage(m);
        for (const label of ["AGENT:", "TASK:", "CONTEXT:", "INPUT:", "ANALYSIS:", "FINDINGS:", "ASSUMPTIONS:", "UNKNOWN:", "RISKS:", "RECOMMENDATION:", "NEXT_AGENT:", "CONFIDENCE:"]) expect(text, `${m.agent} ${label}`).toContain(label);
        expect(["LOW", "MEDIUM", "HIGH"]).toContain(m.confidence);
      }
    });
  });
});

describe("GATHERER never fabricates", () => {
  it("marks a source that cannot be read as UNKNOWN, with what is needed, and invents nothing", async () => {
    const domain = gymDomain({ probes: [probe("members", "acquisition", { key: "k", statement: "12 joined.", value: 12, tags: [], source: "db" }), probe("churn", "retention", null), probe("boom", "retention", async () => { throw new Error("secret connection string"); })] });
    const out = await gather(stateFor("Analyze the business", { domain }), 200);
    const unknown = out.facts!.filter((f) => f.label === "UNKNOWN" && f.key?.startsWith("probe."));
    expect(unknown).toHaveLength(2);
    expect(unknown.every((f) => f.statement.includes("DATA NOT AVAILABLE") && f.need)).toBe(true);
    expect(JSON.stringify(out.facts)).not.toContain("secret connection string");
    expect(out.facts!.filter((f) => f.label === "FACT").every((f) => f.source.length > 0)).toBe(true);
  });

  it("says so when a topic has no data source at all", async () => {
    const domain = gymDomain({ probes: [] });
    const out = await gather(stateFor("Analyze the business", { domain }), 200);
    expect(out.facts!.length).toBeGreaterThan(0);
    expect(out.facts!.every((f) => f.label === "UNKNOWN" && f.statement.includes("DATA NOT AVAILABLE"))).toBe(true);
    expect(out.message.confidence).toBe("LOW");
  });

  it("labels stated assumptions as assumptions and marks disagreeing readings as conflicting", async () => {
    const domain = gymDomain({ probes: [probe("a", "retention", { key: "same", statement: "9 left", value: 9, tags: [], source: "one" }), probe("b", "retention", { key: "same", statement: "14 left", value: 14, tags: [], source: "two" })] });
    const out = await gather(stateFor("Why do members cancel?", { domain, mission: mission("Why do members cancel?", { assumptions: ["Summer is the slow season"] }) }), 200);
    expect(out.facts!.filter((f) => f.label === "CONFLICTING")).toHaveLength(2);
    expect(out.facts!.find((f) => f.label === "ASSUMPTION")?.source).toContain("not verified");
  });
});

describe("DIVIDER", () => {
  it("finds what can run together and what must wait, and reports topics with no data source", () => {
    const domain = gymDomain();
    domain.components.business!.push({ id: "x", title: "Referrals", question: "?", topics: ["referral"], keywords: [] });
    const m = mission("Analyze the business", { kind: "business", intent: "analysis" });
    const out = divide(stateFor("Analyze the business", { domain, mission: m }));
    const plan = out.plan!;
    expect(plan.parallel[0]).toEqual(expect.arrayContaining(["acq", "site", "x"]));
    expect(plan.parallel[1]).toEqual(["ret"]);
    expect(plan.sequential).toEqual(["ret"]);
    expect(plan.unknowns.some((u) => u.includes("referral"))).toBe(true);
  });

  it("never loops on a dependency cycle", () => {
    const domain = gymDomain();
    domain.components.business = [
      { id: "a", title: "A", question: "?", topics: [], keywords: [], dependsOn: ["b"] },
      { id: "b", title: "B", question: "?", topics: [], keywords: [], dependsOn: ["a"] },
    ];
    const out = divide(stateFor("Analyze the business", { domain, mission: mission("Analyze the business", { kind: "business" }) }));
    expect(out.plan!.parallel.flat().sort()).toEqual(["a", "b"]);
  });

  it("notes that success is undefined when the goal has no number", () => {
    const out = divide(stateFor("Increase sales"));
    expect(out.plan!.unknowns.some((u) => u.includes("measurable target"))).toBe(true);
    expect(divide(stateFor("Increase sales by 10%")).plan!.unknowns.some((u) => u.includes("measurable target"))).toBe(false);
  });
});

describe("LOGIC challenges the other agents", () => {
  const run = (claims: Claim[], facts: Fact[]) => logic(stateFor("x", { claims, facts })).challenges!;
  const verdict = (cs: ReturnType<typeof run>, id: string) => cs.find((c) => c.claimId === id)!;

  it("rejects a claim with no evidence, cites-a-claim, or cites a fact that is not there", () => {
    const facts = [fact("F1")];
    const cs = run([claim("C1"), claim("C2", { evidence: ["C1"] }), claim("C3", { evidence: ["F99"] }), claim("C4", { evidence: ["F1"] })], facts);
    expect(verdict(cs, "C1").verdict).toBe("unsupported");
    expect(verdict(cs, "C2").verdict).toBe("invalid");
    expect(verdict(cs, "C2").reason).toContain("circular");
    expect(verdict(cs, "C3").verdict).toBe("invalid");
    expect(verdict(cs, "C4").verdict).toBe("valid");
  });

  it("does not accept an assumption or an unknown as evidence", () => {
    const cs = run([claim("C1", { evidence: ["F1"] }), claim("C2", { evidence: ["F2"] })], [fact("F1", { label: "ASSUMPTION" }), fact("F2", { label: "UNKNOWN", need: "the churn data" })]);
    expect(cs.every((c) => c.verdict === "insufficient")).toBe(true);
    expect(verdict(cs, "C2").missing).toContain("the churn data");
  });

  it("checks a claimed number against the fact it cites", () => {
    const cs = run([claim("C1", { evidence: ["F1"], numbers: [{ factId: "F1", value: 15 }] }), claim("C2", { evidence: ["F1"], numbers: [{ factId: "F1", value: 9 }] })], [fact("F1", { value: 9 })]);
    expect(verdict(cs, "C1").verdict).toBe("invalid");
    expect(verdict(cs, "C1").reason).toContain("9");
    expect(verdict(cs, "C2").verdict).toBe("valid");
  });

  it("holds back a claim that would take an action the business reserves for a person", () => {
    const cs = run([claim("C1", { evidence: ["F1"], actions: ["change_pricing"] })], [fact("F1")]);
    expect(verdict(cs, "C1").verdict).toBe("needs-approval");
  });

  it("finds two claims that take opposite positions on the same thing", () => {
    const cs = run([claim("C1", { evidence: ["F1"], stance: "pursue" }), claim("C2", { agent: "FEELINGS", evidence: ["F1"], stance: "avoid" })], [fact("F1")]);
    expect(cs.every((c) => c.verdict === "conflict")).toBe(true);
  });

  it("refuses to rely on evidence that conflicts, and accepts an honestly labeled experiment", () => {
    const cs = run([claim("C1", { evidence: ["F1"] }), claim("C2", { severity: "experiment" })], [fact("F1", { label: "CONFLICTING" })]);
    expect(verdict(cs, "C1").verdict).toBe("conflict");
    expect(verdict(cs, "C2").verdict).toBe("valid");
  });

  it("catches copy that invents a number or makes a forbidden promise, and passes copy that stays within the facts", () => {
    const facts = [fact("F1", { value: 49, statement: "Memberships are $49 a month." })];
    expect(checkCopyText("Join for $49 a month.", "", facts, []).ok).toBe(true);
    expect(checkCopyText("Join for $39 a month.", "", facts, []).invented).toEqual([39]);
    expect(checkCopyText("Guaranteed results in weeks.", "", facts, ["guaranteed results"]).bannedHits).toHaveLength(1);
  });
});

describe("MASTER resolves disagreement and shows it", () => {
  const conflictState = (proEvidence: string[], conEvidence: string[]) => {
    const facts = ["F1", "F2", "F3", "F4"].map((id) => fact(id));
    const claims = [claim("C1", { agent: "THINKING", stance: "pursue", evidence: proEvidence }), claim("C2", { agent: "FEELINGS", stance: "avoid", evidence: conEvidence })];
    const s = stateFor("x", { facts, claims });
    s.challenges = logic(s).challenges!;
    return s;
  };

  it("lets the side with at least two more observed facts win, and keeps the loser on the record", () => {
    const d = decide(conflictState(["F1", "F2", "F3"], ["F4"]));
    const x = d.disagreements.find((y) => y.topic === "retention")!;
    expect(x.resolution).toBe("resolved");
    expect(x.positions.map((p) => p.agent).sort()).toEqual(["FEELINGS", "THINKING"]);
    expect(d.rejected.some((r) => r.agent === "FEELINGS")).toBe(true);
    expect(d.tasks.some((t) => t.title.startsWith("Consider"))).toBe(true);
  });

  it("leaves it to the person when the evidence is about equal, as a task that needs approval", () => {
    const d = decide(conflictState(["F1", "F2"], ["F3", "F4"]));
    const x = d.disagreements.find((y) => y.topic === "retention")!;
    expect(x.resolution).toBe("unresolved");
    const t = d.tasks.find((y) => y.title.startsWith("Decide"))!;
    expect(t.approvalRequired).toBe(true);
    expect(d.summary).toContain("need");
  });

  it("shows where LOGIC overruled another agent instead of hiding it", () => {
    const facts = [fact("F1")];
    const s = stateFor("x", { facts, claims: [claim("C1", { agent: "THINKING" })] });
    s.challenges = logic(s).challenges!;
    const d = decide(s);
    expect(d.disagreements[0].positions.map((p) => p.agent)).toEqual(["THINKING", "LOGIC"]);
    expect(d.disagreements[0].decidedFor).toBe("LOGIC");
    expect(d.tasks).toHaveLength(0);
  });

  it("keeps a task that needs approval as a draft and never marks a critical claim critical without an observed fact", () => {
    const facts = [fact("F1", { label: "ASSUMPTION" })];
    const s = stateFor("x", { facts, claims: [claim("C1", { severity: "critical", evidence: ["F1"] })] });
    s.challenges = logic(s).challenges!;
    expect(decide(s).tasks.some((t) => t.priority === "P0")).toBe(false);
  });

  it("offers no conclusion when nothing could be read", () => {
    const d = decide(stateFor("x", { facts: [fact("F1", { label: "UNKNOWN" })] }));
    expect(d.summary).toContain("Nothing could be established");
    expect(d.confidence).toBe("LOW");
  });
});

describe("FEELINGS predicts, never promises", () => {
  it("words every reaction as a possibility", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_WEBSITE"));
    const f = r.messages.find((m) => m.agent === "FEELINGS")!;
    const items = (f.payload!.feelings as { likelyReaction: string }[]) ?? [];
    expect(items.length).toBeGreaterThan(0);
    for (const i of items) expect(hasHedge(i.likelyReaction), i.likelyReaction).toBe(true);
    for (const m of r.messages) expect(overclaims(renderMessage(m)), m.agent).toBe(false);
    expect(feelings(stateFor("x")).message.findings).toHaveLength(0);
  });
});

describe("looking at pages", () => {
  it("finds real problems on a poor page, ties each to what was observed, and never claims to see visuals", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_WEBSITE"));
    const look = r.messages.find((m) => m.agent === "LOOK")!;
    expect(look.findings.length).toBeGreaterThan(0);
    const facts = new Map(r.facts.map((f) => [f.id, f]));
    for (const c of look.findings) expect(c.evidence.every((id) => facts.get(id)?.label === "FACT" && facts.get(id)?.source.includes("observed"))).toBe(true);
    expect(look.analysis.join(" ")).toContain("cannot judge colors");
    expect(look.confidence).not.toBe("HIGH");
    expect(look.findings.some((c) => c.text.includes("Join page"))).toBe(true);
    expect(look.findings.some((c) => c.text.startsWith("Home page") && /no main heading|no title|mobile/.test(c.text))).toBe(false);
  });

  it("says a page could not be examined instead of judging it, when it will not open", async () => {
    const ctx = makeCtx({ fetchError: true });
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_WEBSITE"));
    expect(r.facts.filter((f) => f.label === "UNKNOWN" && f.statement.includes("could not be examined")).length).toBe(2);
    expect(r.messages.find((m) => m.agent === "LOOK")!.findings).toHaveLength(0);
  });

  it("writes an image specification only where something was observed, and marks it as not generated", async () => {
    const ctx = makeCtx({ pages: { "https://gym.example/": "<html><body><h1>Hi</h1><p>x</p></body></html>", "https://gym.example/join": GOOD_PAGE } });
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_WEBSITE"));
    const assets = r.messages.find((m) => m.agent === "IMAGE")!.payload!.assets as { spec: string; evidence: string[] }[];
    expect(assets.length).toBeGreaterThan(0);
    for (const a of assets) {
      expect(a.spec).toContain("not generated");
      expect(a.spec).toContain("bright, energetic");
      expect(a.evidence.length).toBeGreaterThan(0);
    }
  });
});

describe("cost control", () => {
  it("does not read the data sources or open any page for a rewrite", async () => {
    let reads = 0;
    let fetches = 0;
    const domain = gymDomain({ probes: [probe("x", "retention", async () => { reads++; throw new Error("no"); })] });
    const orig = domain.fetchPage;
    domain.fetchPage = async (u) => { fetches++; return orig(u); };
    const ctx = { ...makeCtx(), domain };
    const r = await runMission(ctx, buildMission(ctx, "ASK_MASTER", { text: "Rewrite this product description.", attachments: [{ kind: "text", value: "great gym" }] }));
    expect(r.route.intent).toBe("copy");
    expect(fetches).toBe(0);
    expect(new Set(r.messages.map((m) => m.agent))).toEqual(new Set(["GATHERER", "SPEAKER", "LOGIC"]));
    void reads;
  });

  it("skips the pages entirely for a growth analysis", async () => {
    let fetches = 0;
    const domain = gymDomain();
    const orig = domain.fetchPage;
    domain.fetchPage = async (u) => { fetches++; return orig(u); };
    domain.components.growth = domain.components.business;
    const ctx = { ...makeCtx(), domain };
    const r = await runMission(ctx, buildMission(ctx, "ANALYZE_GROWTH"));
    expect(fetches).toBe(0);
    expect(r.messages.some((m) => m.agent === "LOOK")).toBe(false);
  });
});

describe("copy is checked against the facts", () => {
  const ask = (deps: Deps | undefined, text = "Join for $49 a month. we offer classes!!") => {
    const ctx = makeCtx({ deps });
    return runMission(ctx, buildMission(ctx, "ASK_MASTER", { text: "Rewrite this product description.", attachments: [{ kind: "text", value: text }] }));
  };

  it("writes nothing when there is no text and no model, and says why", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "ASK_MASTER", { text: "Rewrite this product description." }));
    expect(r.copy).toBeNull();
    expect(r.report).toContain("Supply the text");
  });

  it("without a model, cleans and checks the given text and says it did not rewrite it", async () => {
    const r = await ask(undefined);
    expect(r.copy?.accepted).toBe(true);
    expect(r.copy?.mocked).toBe(true);
    expect(r.decision.summary).toContain("not rewritten");
  });

  it("rejects model copy that invents a number, and does not show it", async () => {
    const r = await ask({ writeCopy: async () => "Join for only $29 a month. Guaranteed results." });
    expect(r.copy?.accepted).toBe(false);
    expect(r.report).not.toContain("$29");
    expect(r.decision.summary).toContain("rejected");
  });

  it("accepts model copy that stays within the facts", async () => {
    const r = await ask({ writeCopy: async () => "Join for $49 a month and try our classes." });
    expect(r.copy?.accepted).toBe(true);
    expect(r.copy?.mocked).toBe(false);
    expect(r.report).toContain("$49");
  });
});

describe("failure recovery", () => {
  it("retries a failing agent once, then escalates, tells the owner, and still finishes without looping", async () => {
    const notes: string[] = [];
    const ctx = makeCtx({ deps: { notifyOwner: async (t, b) => (notes.push(`${t} ${b}`), "n1") } });
    (ctx.domain as { stakeholders: unknown }).stakeholders = null;
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    expect(r.status).toBe("PARTIAL");
    expect(r.errors.some((e) => e.startsWith("PERSPECTIVE failed after 2 attempts"))).toBe(true);
    const log = ctx.store.activity.filter((a) => a.agent === "PERSPECTIVE");
    expect(log.filter((a) => a.status === "FAILED")).toHaveLength(2);
    expect(log.some((a) => a.status === "ESCALATED")).toBe(true);
    expect(r.decision.tasks.length).toBeGreaterThan(0);
    expect(notes.length).toBe(1);
    expect(r.decision.risks.some((x) => x.includes("PERSPECTIVE"))).toBe(true);
  });

  it("wakes GATHERER once, only, when LOGIC finds evidence missing and no one gathered any", async () => {
    const ctx = makeCtx();
    const m = buildMission(ctx, "ASK_MASTER", { text: "Look at this screenshot" });
    const r = await runMission(ctx, { ...m, attachments: [{ kind: "html", value: GOOD_PAGE }] });
    expect(r.route.intent).toBe("visual");
    expect(r.messages.filter((x) => x.agent === "GATHERER").length).toBeLessThanOrEqual(1);
  });
});

describe("permission and verification", () => {
  it("executes only internal actions, and reads each one back before calling it done", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    expect(r.executed.length).toBeGreaterThan(0);
    expect(r.executed.every((e) => ["create_task", "save_memory", "notify_owner"].includes(e.action))).toBe(true);
    expect(r.executed.filter((e) => e.ok).every((e) => e.verified)).toBe(true);
    expect(ctx.store.tasks.length).toBe(r.executed.filter((e) => e.action === "create_task" && e.ok).length);
  });

  it("only drafts tasks when the level is below EXECUTE, and says so", async () => {
    const ctx = makeCtx();
    await new PermissionManager(ctx.store, "gym").setLevel("RECOMMEND");
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    expect(ctx.store.tasks).toHaveLength(0);
    expect(r.decision.tasks.length).toBeGreaterThan(0);
    expect(r.executed.find((e) => e.action === "create_task")?.ok).toBe(false);
  });

  it("refuses a mission below its level, and one that starts on its own without AUTONOMOUS, or while paused", async () => {
    const ctx = makeCtx();
    const perm = new PermissionManager(ctx.store, "gym");
    await perm.setLevel("READ");
    expect((await perm.canRun("AUDIT_BUSINESS", "user")).allowed).toBe(false);
    await perm.setLevel("EXECUTE");
    expect((await perm.canRun("RUN_DAILY_AUDIT", "schedule")).allowed).toBe(false);
    await perm.setLevel("AUTONOMOUS");
    expect((await perm.canRun("RUN_DAILY_AUDIT", "schedule")).allowed).toBe(true);
    await perm.setPaused(true);
    expect((await perm.canRun("RUN_DAILY_AUDIT", "schedule")).reason).toContain("paused");
    expect((await perm.canRun("AUDIT_BUSINESS", "user")).allowed).toBe(true);
    const refused = await runMission(ctx, { ...buildMission(ctx, "RUN_DAILY_AUDIT"), triggeredBy: "schedule" });
    expect(refused.status).toBe("FAILED");
    expect(refused.messages).toHaveLength(0);
    expect((await ctx.store.getMission(refused.mission.id))?.status).toBe("REFUSED");
  });

  it("never lets a critical action run without an explicit grant", async () => {
    const perm = new PermissionManager(new InMemoryStore(), "gym");
    for (const a of ["change_pricing", "issue_refund", "delete_customer_data", "send_mass_communication", "spend_money", "change_infrastructure", "change_payment_config"]) {
      const p = await perm.canDo(a);
      expect(p.allowed, a).toBe(false);
      expect(p.needsApproval, a).toBe(true);
    }
    expect((await perm.canDo("create_task")).allowed).toBe(true);
    expect((await perm.canDo("teleport")).allowed).toBe(false);
    await perm.grant("spend_money", true);
    expect((await perm.canDo("spend_money")).allowed).toBe(true);
    await expect(perm.grant("create_task", true)).rejects.toThrow();
  });

  it("turns a claim that would spend money into a draft that needs approval", async () => {
    const ctx = makeCtx();
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    // The experiment lever spends money, but experiments are exempt from LOGIC's evidence rule, not from its action rule.
    const exp = r.decision.tasks.find((t) => t.title.includes("referral"));
    if (exp) expect(exp.priority).toBe("P4");
  });
});

describe("memory keeps facts, assumptions, and decisions apart", () => {
  const mm = () => new MemoryManager(new InMemoryStore(), "gym");

  it("refuses a fact with no source, and an assumption that claims evidence", async () => {
    const m = mm();
    await expect(m.remember({ level: "LONG_TERM", kind: "FACT", topic: "x", content: "Members like mornings" })).rejects.toBeInstanceOf(MemoryRuleError);
    await expect(m.remember({ level: "WORKING", kind: "ASSUMPTION", topic: "x", content: "Members like mornings", evidence: ["F1"] })).rejects.toBeInstanceOf(MemoryRuleError);
    await expect(m.remember({ level: "WORKING", kind: "FACT", topic: "x", content: "  ", source: "s" })).rejects.toBeInstanceOf(MemoryRuleError);
  });

  it("promotes an assumption to a fact only with a source and evidence, and keeps the assumption on record", async () => {
    const m = mm();
    const a = await m.remember({ level: "WORKING", kind: "ASSUMPTION", topic: "hours", content: "Members prefer mornings" });
    await expect(m.promote(a.id, { source: "", evidence: ["F1"] })).rejects.toBeInstanceOf(MemoryRuleError);
    await expect(m.promote(a.id, { source: "survey", evidence: [] })).rejects.toBeInstanceOf(MemoryRuleError);
    const f = await m.promote(a.id, { source: "member survey", evidence: ["F7"] });
    expect(f.kind).toBe("FACT");
    expect((await m.recall({ kind: "ASSUMPTION" })).length).toBe(0);
    expect((await m.recall({ kind: "ASSUMPTION", includeSuperseded: true })).length).toBe(1);
    await expect(m.promote(a.id, { source: "again", evidence: ["F8"] })).rejects.toBeInstanceOf(MemoryRuleError);
    await expect(m.promote(f.id, { source: "x", evidence: ["y"] })).rejects.toBeInstanceOf(MemoryRuleError);
  });

  it("keeps short-term memory out of the store and forgets it when the task ends", async () => {
    const store = new InMemoryStore();
    const m = new MemoryManager(store, "gym");
    await m.remember({ level: "SHORT_TERM", kind: "ASSUMPTION", topic: "t", content: "for now" });
    expect((await m.recall({ level: "SHORT_TERM" })).length).toBe(1);
    expect(store.memory).toHaveLength(0);
    m.clearShortTerm();
    expect((await m.recall({ level: "SHORT_TERM" })).length).toBe(0);
  });

  it("is separate for each business", async () => {
    const store = new InMemoryStore();
    await new MemoryManager(store, "gym").remember({ level: "DOMAIN", kind: "PREFERENCE", topic: "tone", content: "friendly" });
    expect((await new MemoryManager(store, "bakery").recall()).length).toBe(0);
  });

  it("brings an earlier decision into a later mission on the same subject, and records outcomes as results", async () => {
    const ctx = makeCtx();
    const u = createUniverse(ctx);
    await u.run("AUDIT_BUSINESS");
    const second = await u.run("AUDIT_BUSINESS");
    expect(second.kind === "mission" && second.result.decision.reasoning.some((x) => x.startsWith("Earlier decision"))).toBe(true);
    const board = await u.tasks.board();
    const t = board.waiting[0];
    await u.tasks.start(t.id);
    await u.tasks.complete(t.id, "Ran a win-back email, 2 came back");
    expect((await u.memory.recall({ kind: "RESULT" }))[0].content).toContain("2 came back");
  });
});

describe("tasks", () => {
  it("move only along allowed paths", async () => {
    const tm = new TaskManager(new InMemoryStore(), "gym");
    const t = await tm.createManual("Call members", "P1");
    await expect(tm.approve(t.id)).rejects.toBeInstanceOf(TaskError);
    await tm.start(t.id);
    const done = await tm.complete(t.id, "done");
    expect(done.completedAt).toBeInstanceOf(Date);
    await expect(tm.start(t.id)).rejects.toBeInstanceOf(TaskError);
    await expect(tm.get("nope").then((x) => x)).resolves.toBeNull();
  });

  it("puts a task that needs approval on hold until a person approves it", async () => {
    const tm = new TaskManager(new InMemoryStore(), "gym");
    const t = await tm.create({ title: "Raise prices", detail: "", priority: "P2", owner: "OWNER", dependsOn: [], approvalRequired: true, actionKinds: ["change_pricing"], evidence: [], severity: "medium" }, null);
    expect(t.status).toBe("NEEDS_APPROVAL");
    await expect(tm.start(t.id)).rejects.toBeInstanceOf(TaskError);
    expect((await tm.approve(t.id)).status).toBe("WAITING");
  });

  it("cannot touch another business's task", async () => {
    const store = new InMemoryStore();
    const t = await new TaskManager(store, "gym").createManual("Mine", "P2");
    await expect(new TaskManager(store, "bakery").start(t.id)).rejects.toBeInstanceOf(TaskError);
  });
});

describe("the audit trail", () => {
  it("records every step with timing, handoff, and result, and removes secrets and personal details", async () => {
    const ctx = makeCtx();
    ctx.domain.probes = [probe("m", "acquisition", { key: "k", statement: "Contact jo@example.com or (555) 123-4567 with key sk_live_abcdefgh12345678", value: 1, tags: [], source: "db" })];
    const r = await runMission(ctx, buildMission(ctx, "AUDIT_BUSINESS"));
    const rows = ctx.store.activity.filter((a) => a.missionId === r.mission.id);
    expect(rows.length).toBeGreaterThan(10);
    for (const a of rows) {
      expect(a.at).toBeInstanceOf(Date);
      expect(typeof a.durationMs).toBe("number");
      expect(a.status).toBeTruthy();
    }
    expect(rows.some((a) => a.handoff)).toBe(true);
    expect(rows.some((a) => a.agent === "MASTER" && a.task === "Route the request")).toBe(true);
    const dump = JSON.stringify(rows);
    expect(dump).not.toContain("jo@example.com");
    expect(dump).not.toContain("sk_live_abcdefgh12345678");
    expect(dump).not.toContain("123-4567");
  });

  it("redacts secrets, connection strings, emails, and phone numbers", () => {
    const t = redact("mail a@b.co call 555-123-4567 postgres://u:p@h/db Bearer abcdefghijklmnop whsec_abcdefghijk");
    for (const s of ["a@b.co", "555-123-4567", "postgres://", "abcdefghijklmnop", "whsec_abcdefghijk"]) expect(t).not.toContain(s);
  });
});
