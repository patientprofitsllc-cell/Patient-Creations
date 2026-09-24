import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUniverse, COMMANDS } from "@/lib/universe/commands";
import { EVENT_ROUTES, MAX_AUTONOMOUS_PER_DAY } from "@/lib/universe/core/eventManager";
import type { CommandName } from "@/lib/universe/types";
import { makeCtx } from "./universeHelpers";

// The twenty commands, the event manager, and the routes the dashboard calls. The routes use a stand-in for the real universe
// so that nothing touches the database.

type Row = Record<string, any>;
const h = vi.hoisted(() => ({ session: null as Row | null, universe: null as any }));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/universe/domains/instance", () => ({ patientCreationsUniverse: () => h.universe }));

import { NextRequest } from "next/server";
import { POST as command } from "@/app/api/admin/universe/command/route";
import { POST as taskAction } from "@/app/api/admin/universe/tasks/[id]/route";
import { POST as settings } from "@/app/api/admin/universe/settings/route";
import { GET as cron } from "@/app/api/cron/universe/route";

const SPEC_COMMANDS = [
  "ASK_MASTER", "AUDIT_WEBSITE", "AUDIT_PRODUCTS", "AUDIT_CUSTOMER_JOURNEY", "AUDIT_BUSINESS", "ANALYZE_GROWTH", "ANALYZE_CUSTOMERS", "ANALYZE_CONVERSION", "GENERATE_STRATEGY", "CREATE_TASKS",
  "RUN_RESEARCH", "RUN_DAILY_AUDIT", "RUN_WEEKLY_REVIEW", "SHOW_AGENT_ACTIVITY", "SHOW_ACTIVE_TASKS", "SHOW_DECISIONS", "SHOW_MEMORY", "RUN_SYSTEM_CHECK", "PAUSE_AUTONOMOUS_ACTIONS", "RESUME_AUTONOMOUS_ACTIONS",
];

const fresh = () => {
  const ctx = makeCtx();
  const u = createUniverse(ctx);
  h.universe = { ...u, domain: ctx.domain };
  return { ctx, u };
};

beforeEach(() => {
  h.session = null;
});

describe("the twenty commands", () => {
  it("are exactly the ones in the spec", () => {
    expect([...COMMANDS].sort()).toEqual([...SPEC_COMMANDS].sort());
  });

  it("every mission command runs and every view command answers, on a fresh business", async () => {
    const { u } = fresh();
    for (const c of SPEC_COMMANDS as CommandName[]) {
      const input = c === "ASK_MASTER" ? { text: "How is the website doing?" } : c === "CREATE_TASKS" ? { text: "P1: Call the gym\nOrder towels" } : {};
      const r = await u.run(c, input);
      expect(r.kind, c).not.toBe("refused");
    }
  });

  it("refuses a command that does not exist, an empty question, and a style that is not one of the ten", async () => {
    const { u } = fresh();
    expect((await u.run("DROP_TABLES" as CommandName)).kind).toBe("refused");
    expect((await u.run("ASK_MASTER", { text: "  " })).kind).toBe("refused");
    expect((await u.run("ASK_MASTER", { text: "Analyze the business", style: "sarcastic" as never })).kind).toBe("refused");
  });

  it("creates tasks from a person's own words at the priority they give, and confirms each one", async () => {
    const { ctx, u } = fresh();
    const r = await u.run("CREATE_TASKS", { text: "P0: Fix the door\nP4: Paint the wall\nBuy chalk" });
    expect(r.kind === "view" && r.text).toContain("3 of 3 tasks created and confirmed");
    expect(ctx.store.tasks.map((t) => t.priority).sort()).toEqual(["P0", "P2", "P4"]);
    expect((await u.run("CREATE_TASKS", { text: "" })).kind).toBe("refused");
  });

  it("shows the task board, the activity, the decisions, and the memory after a run", async () => {
    const { u } = fresh();
    await u.run("AUDIT_BUSINESS");
    const board = await u.run("SHOW_ACTIVE_TASKS");
    expect(board.kind === "view" && board.text).toMatch(/Waiting \(\d+\)/);
    expect((await u.run("SHOW_AGENT_ACTIVITY")).kind === "view" && true).toBe(true);
    const dec = await u.run("SHOW_DECISIONS");
    expect(dec.kind === "view" && dec.text).toContain("Audit the whole business");
    const mem = await u.run("SHOW_MEMORY");
    expect(mem.kind === "view" && mem.text).toContain("DECISION: 1");
  });

  it("pauses and resumes autonomy, and confirms each by reading it back", async () => {
    const { u } = fresh();
    const p = await u.run("PAUSE_AUTONOMOUS_ACTIONS");
    expect(p.kind === "view" && p.text).toContain("paused");
    expect(await u.permissions.paused()).toBe(true);
    await u.run("RESUME_AUTONOMOUS_ACTIONS");
    expect(await u.permissions.paused()).toBe(false);
  });

  it("checks the system: agents, storage, permissions, data sources, and recent failures", async () => {
    const { ctx, u } = fresh();
    const r = await u.run("RUN_SYSTEM_CHECK");
    expect(r.kind === "view" && r.text).toContain("All required checks passed");
    for (const name of ["Agents", "Storage", "Permissions", "Data sources", "Recent runs"]) expect(r.kind === "view" && r.text).toContain(name);
    // The storage check writes a test record and must remove it again.
    expect(ctx.store.memory).toHaveLength(0);
    expect([...ctx.store.settings.keys()].some((k) => k.endsWith("selfcheck"))).toBe(false);
  });

  it("refuses commands the current level does not allow", async () => {
    const { u } = fresh();
    await u.permissions.setLevel("READ");
    expect((await u.run("AUDIT_BUSINESS")).kind === "mission" && true).toBe(true); // missions are refused inside the run, as a recorded refusal
    const r = await u.run("AUDIT_BUSINESS");
    expect(r.kind === "mission" && r.result.status).toBe("FAILED");
    expect((await u.run("CREATE_TASKS", { text: "x task" })).kind).toBe("refused");
    expect((await u.run("SHOW_ACTIVE_TASKS")).kind).toBe("view");
  });
});

describe("events", () => {
  it("only three kinds of event start a mission; everything else is recorded and does nothing", async () => {
    expect(Object.keys(EVENT_ROUTES).sort()).toEqual(["daily_audit", "monitoring_alert", "weekly_review"]);
    const { ctx, u } = fresh();
    await u.permissions.setLevel("AUTONOMOUS");
    const r = await u.handleEvent({ type: "new_order", payload: { total: 5 } });
    expect(r.handled).toBe(false);
    expect(ctx.store.missions.size).toBe(0);
    expect(ctx.store.activity.some((a) => a.task === "Event: new_order")).toBe(true);
  });

  it("will not start on its own unless the level is AUTONOMOUS, and never while paused", async () => {
    const { ctx, u } = fresh();
    const refused = await u.handleEvent({ type: "daily_audit" });
    expect(refused.handled).toBe(false);
    expect(!refused.handled && refused.reason).toContain("AUTONOMOUS");
    await u.permissions.setLevel("AUTONOMOUS");
    await u.permissions.setPaused(true);
    const paused = await u.handleEvent({ type: "daily_audit" });
    expect(!paused.handled && paused.reason).toContain("paused");
    expect(ctx.store.missions.size).toBe(0);
    await u.permissions.setPaused(false);
    const ok = await u.handleEvent({ type: "daily_audit" });
    expect(ok.handled).toBe(true);
    expect([...ctx.store.missions.values()][0].triggeredBy).toBe("schedule");
  });

  it("runs the daily audit at most once a day, and caps autonomous runs", async () => {
    const { u } = fresh();
    await u.permissions.setLevel("AUTONOMOUS");
    expect((await u.handleEvent({ type: "daily_audit" })).handled).toBe(true);
    const again = await u.handleEvent({ type: "daily_audit" });
    expect(!again.handled && again.reason).toContain("already run today");
    let handled = 1;
    for (let i = 0; i < 6; i++) if ((await u.handleEvent({ type: "monitoring_alert" })).handled) handled++;
    expect(handled).toBe(MAX_AUTONOMOUS_PER_DAY);
    const last = await u.handleEvent({ type: "monitoring_alert" });
    expect(!last.handled && last.reason).toContain("limit");
  });
});

describe("the dashboard's routes", () => {
  const post = (handler: (r: NextRequest, c: any) => Promise<Response>, body: unknown, params: Row = {}) => handler(new NextRequest("http://localhost/x", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), { params });
  const asAdmin = () => (h.session = { user: { id: "u", role: "ADMIN" } });

  it("are closed to a visitor and to a customer", async () => {
    fresh();
    const calls = [() => post(command, { command: "AUDIT_BUSINESS" }), () => post(taskAction, { action: "approve" }, { id: "abcdefghij12" }), () => post(settings, { action: "pause", paused: true })];
    for (const c of calls) expect((await c()).status).toBe(401);
    h.session = { user: { id: "u", role: "CUSTOMER" } };
    for (const c of calls) expect((await c()).status).toBe(403);
  });

  it("run a command for the owner, and always record it as started by a person", async () => {
    const { ctx } = fresh();
    asAdmin();
    const r = await post(command, { command: "RUN_DAILY_AUDIT", assumptions: ["x"], triggeredBy: "schedule" });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.kind).toBe("mission");
    expect(ctx.store.missions.get(body.missionId)?.triggeredBy).toBe("user");
  });

  it("refuse a command that is not one of the twenty, and a body that is not JSON", async () => {
    fresh();
    asAdmin();
    expect((await post(command, { command: "DELETE_EVERYTHING" })).status).toBe(400);
    expect((await post(command, "not json")).status).toBe(400);
    expect((await post(command, { command: "ASK_MASTER", text: "x".repeat(2001) })).status).toBe(400);
  });

  it("move a task, refuse a move that is not allowed, and answer 404 for a task that does not exist", async () => {
    const { ctx, u } = fresh();
    asAdmin();
    await u.run("CREATE_TASKS", { text: "Call the gym" });
    expect(ctx.store.tasks[0].id).toMatch(/^[a-z0-9]{10,40}$/i);
    const real = await ctx.store.addTask({ domain: "gym", missionId: null, title: "Approve me", detail: "", priority: "P2", status: "NEEDS_APPROVAL", owner: "OWNER", dependsOn: [], approvalRequired: true, actionKinds: [], result: null });
    const id = real.id;
    expect((await post(taskAction, { action: "start" }, { id })).status).toBe(409);
    expect((await post(taskAction, { action: "approve" }, { id })).status).toBe(200);
    expect((await post(taskAction, { action: "complete", result: "Done, 2 came back" }, { id })).status).toBe(200);
    expect((await post(taskAction, { action: "complete" }, { id })).status).toBe(400);
    expect((await post(taskAction, { action: "approve" }, { id: "../etc/passwd" })).status).toBe(404);
    expect((await post(taskAction, { action: "approve" }, { id: "abcdefghijkl" })).status).toBe(404);
    expect((await ctx.store.listMemory({ domain: "gym", kind: "RESULT" }))[0].content).toContain("2 came back");
  });

  it("change the level and the pause switch, and report what the server now says", async () => {
    const { u } = fresh();
    asAdmin();
    const a = await (await post(settings, { action: "level", level: "AUTONOMOUS" })).json();
    expect(a).toEqual({ ok: true, level: "AUTONOMOUS" });
    expect(await u.permissions.level()).toBe("AUTONOMOUS");
    expect((await (await post(settings, { action: "pause", paused: true })).json()).paused).toBe(true);
    expect((await post(settings, { action: "level", level: "GOD" })).status).toBe(400);
    expect((await post(settings, { action: "grant", name: "create_task", granted: true })).status).toBe(400);
  });

  it("keep the scheduled address invisible without the secret, and run only with it", async () => {
    fresh();
    const call = (auth?: string) => cron(new NextRequest("http://localhost/api/cron/universe", { headers: auth ? { authorization: auth } : {} }));
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    expect((await call("Bearer whatever-whatever-whatever-1234")).status).toBe(404);
    process.env.CRON_SECRET = "s".repeat(32);
    expect((await call()).status).toBe(404);
    expect((await call("Bearer wrong-wrong-wrong-wrong-wrong-1")).status).toBe(404);
    const ok = await call(`Bearer ${"s".repeat(32)}`);
    expect(ok.status).toBe(200);
    // At the default level it refuses to start on its own, and says so.
    expect((await ok.json()).daily).toContain("AUTONOMOUS");
    if (saved === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = saved;
  });
});
