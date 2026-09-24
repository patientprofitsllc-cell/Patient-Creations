import { db } from "@/lib/db";
import { createUniverse } from "@/lib/universe/commands";
import { gymDomain } from "../../tests/unit/universeHelpers";
import { prismaStore } from "@/lib/universe/store/prismaStore";

// Proves the database-backed store works end to end, using a made-up business named with a marker so it can never be mistaken for
// real data, and removes every row it wrote. Run: npx tsx scripts/universe/verify-store.ts

const MARK = `verify-${Date.now().toString(36)}`;

async function main() {
  const domain = { ...gymDomain(), id: MARK };
  const u = createUniverse({ store: prismaStore, domain, deps: {}, probeTimeoutMs: 2000, snapshotTimeoutMs: 2000, agentTimeoutMs: 5000 });
  const out: string[] = [];
  const check = (name: string, ok: boolean) => {
    out.push(`${ok ? "PASS" : "FAIL"}  ${name}`);
    if (!ok) process.exitCode = 1;
  };
  try {
    const r = await u.run("AUDIT_BUSINESS");
    check("mission ran and completed", r.kind === "mission" && r.result.status === "COMPLETED");
    const id = r.kind === "mission" ? r.result.mission.id : "";
    const stored = await prismaStore.getMission(id);
    check("mission saved with its route and full result", Boolean(stored?.route && stored.result && stored.report && stored.status === "COMPLETED"));
    check("result survives the round trip (decision tasks intact)", (stored?.result?.decision.tasks.length ?? 0) > 0);

    const tasks = await prismaStore.listTasks({ domain: MARK });
    check("tasks recorded and read back", tasks.length > 0 && tasks.every((t) => t.domain === MARK));
    const waiting = tasks.find((t) => t.status === "WAITING");
    if (waiting) {
      await u.tasks.start(waiting.id);
      const done = await u.tasks.complete(waiting.id, "Ran a win-back email, 2 came back");
      check("task moved WAITING -> ACTIVE -> DONE with a result", done.status === "DONE" && done.result?.includes("2 came back") === true);
    }
    const results = await prismaStore.listMemory({ domain: MARK, kind: "RESULT" });
    check("finishing a task wrote a RESULT to memory", results.some((m) => m.content.includes("2 came back")));
    const decisions = await prismaStore.listMemory({ domain: MARK, level: "DECISION" });
    check("the decision was saved to memory", decisions.length === 1);

    const activity = await prismaStore.listActivity({ domain: MARK, missionId: id });
    check("audit trail recorded with timing and handoffs", activity.length > 10 && activity.some((a) => a.handoff) && activity.every((a) => a.durationMs >= 0));

    await u.permissions.setLevel("AUTONOMOUS");
    check("permission level saved and read back", (await u.permissions.level()) === "AUTONOMOUS");
    await u.permissions.setPaused(true);
    check("pause saved and read back", (await u.permissions.paused()) === true);

    const other = await prismaStore.listTasks({ domain: `${MARK}-other` });
    check("another business sees none of it", other.length === 0);

    const sys = await u.run("RUN_SYSTEM_CHECK");
    check("system check passes against the real database", sys.kind === "view" && sys.text.includes("All required checks passed"));
  } finally {
    const [m, t, a, mem, s] = await Promise.all([
      db.universeMission.deleteMany({ where: { domain: MARK } }),
      db.universeTask.deleteMany({ where: { domain: MARK } }),
      db.universeActivity.deleteMany({ where: { domain: MARK } }),
      db.universeMemory.deleteMany({ where: { domain: MARK } }),
      db.appSetting.deleteMany({ where: { key: { startsWith: `universe.${MARK}.` } } }),
    ]);
    const left = (await db.universeMission.count({ where: { domain: MARK } })) + (await db.universeTask.count({ where: { domain: MARK } })) + (await db.universeActivity.count({ where: { domain: MARK } })) + (await db.universeMemory.count({ where: { domain: MARK } }));
    out.push(`CLEANUP  removed ${m.count} missions, ${t.count} tasks, ${a.count} activity rows, ${mem.count} memory rows, ${s.count} settings. Rows left: ${left}`);
    if (left !== 0) process.exitCode = 1;
    console.log(out.join("\n"));
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
