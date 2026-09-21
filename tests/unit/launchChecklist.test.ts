import { beforeEach, describe, expect, it, vi } from "vitest";

// Rolling a website back, the launch checklist, and the gate that keeps a site from going live before it is ready.
type Row = Record<string, any>;
const S = vi.hoisted(() => ({
  project: null as Row | null,
  builds: [] as Row[],
  ticks: [] as Row[],
  revisions: [] as Row[],
  events: [] as Row[],
  updates: [] as string[],
  emails: [] as Row[],
  transitions: [] as string[],
  qa: { passed: true, errors: [] as string[], warnings: [] as string[] },
}));

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findUnique: async () => (S.project ? { ...S.project } : null),
      findUniqueOrThrow: async () => ({ ...S.project }),
    },
    order: { findUnique: async () => S.project?.order ?? null },
    websiteBuild: {
      findMany: async ({ where }: Row) => S.builds.filter((b) => b.projectId === where.projectId).sort((a, b) => b.version - a.version),
      findFirst: async ({ where }: Row) => S.builds.filter((b) => b.projectId === where.projectId).sort((a, b) => b.version - a.version)[0] ?? null,
      create: async ({ data }: Row) => {
        if (S.builds.some((b) => b.projectId === data.projectId && b.version === data.version)) throw new Error("unique");
        const b = { id: `b${S.builds.length + 1}`, approvedAt: null, liveUrl: null, createdAt: new Date(), ...data };
        S.builds.push(b);
        return b;
      },
      updateMany: async ({ where, data }: Row) => {
        const rows = S.builds.filter((b) => (where.id ? b.id === where.id : true) && (where.projectId ? b.projectId === where.projectId : true) && (where.status?.in ? where.status.in.includes(b.status) : where.status ? b.status === where.status : true));
        rows.forEach((r) => Object.assign(r, data));
        return { count: rows.length };
      },
    },
    revision: { count: async () => S.revisions.filter((r) => r.status === "REQUESTED").length, updateMany: async () => ({ count: 0 }) },
    projectChecklistItem: {
      findMany: async ({ where }: Row) => S.ticks.filter((t) => t.projectId === where.projectId && t.version === where.version),
      upsert: async ({ create }: Row) => { if (!S.ticks.some((t) => t.projectId === create.projectId && t.version === create.version && t.itemId === create.itemId)) S.ticks.push(create); },
      deleteMany: async ({ where }: Row) => { S.ticks = S.ticks.filter((t) => !(t.projectId === where.projectId && t.version === where.version && t.itemId === where.itemId)); },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}));
vi.mock("@/lib/analytics/events", () => ({ logEvent: async (event: string, _t: string, _id: string, payload: Row) => void S.events.push({ event, payload }) }));
vi.mock("@/lib/analytics/funnel", () => ({ trackFunnel: async () => {} }));
vi.mock("@/lib/agents/relay", () => ({ postAgentUpdate: async (_id: string, _who: string, msg: string) => void S.updates.push(msg) }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: async (to: string, template: string, payload: Row) => void S.emails.push({ to, template, payload }) }));
vi.mock("@/lib/workflows/stateMachine", () => ({ transitionProject: async (_id: string, to: string) => void S.transitions.push(to) }));
vi.mock("@/lib/projects/statusToken", () => ({ statusUrlFor: (t: string) => `https://site.test/status/${t}`, generateStatusToken: () => "tok" }));
vi.mock("@/lib/site/build/qa", () => ({ runSiteQa: () => ({ passed: S.qa.passed, checks: [], errors: S.qa.errors, warnings: [...S.qa.warnings] }) }));

import { launchWebsite, loadLaunchChecklist, setChecklistItem } from "@/lib/site/build/actions";
import { rollbackWebsite } from "@/lib/site/build/rollback";
import { MANUAL_ITEMS, buildChecklist, isManualItem, missingSummary, type ChecklistFacts } from "@/lib/site/build/checklist";

const goodFacts = (over: Partial<ChecklistFacts> = {}): ChecklistFacts => ({ buildStatus: "APPROVED", qaPassed: true, qaErrors: [], missingFromPage: [], orderStatus: "PAID", balanceDueCents: 0, intakeComplete: true, openRevision: false, ticked: MANUAL_ITEMS.map((m) => m.id), ...over });

describe("the checklist rules", () => {
  it("is ready only when every required line is true", () => {
    expect(buildChecklist(goodFacts()).ready).toBe(true);
    expect(buildChecklist(goodFacts()).missing).toEqual([]);
  });

  it("blocks on each thing that must be true, and says which", () => {
    const blocks: [Partial<ChecklistFacts>, string][] = [
      [{ buildStatus: "PREVIEW" }, "approved this version"],
      [{ openRevision: true }, "change request"],
      [{ qaPassed: false, qaErrors: ["Phone number looks valid"] }, "automated checks"],
      [{ intakeComplete: false }, "intake"],
      [{ balanceDueCents: 500_000 }, "paid in full"],
      [{ orderStatus: "PENDING" }, "paid in full"],
      [{ ticked: [] }, "opened the preview on a phone"],
      [{ ticked: MANUAL_ITEMS.filter((m) => m.id !== "phone-call").map((m) => m.id) }, "dialed the right number"],
    ];
    for (const [over, text] of blocks) {
      const c = buildChecklist(goodFacts(over));
      expect(c.ready, JSON.stringify(over)).toBe(false);
      expect(missingSummary(c), JSON.stringify(over)).toContain(text);
    }
  });

  it("shows an advisory line without blocking on it", () => {
    const c = buildChecklist(goodFacts({ missingFromPage: ['service "Fades"'] }));
    expect(c.ready).toBe(true);
    const line = c.lines.find((l) => l.id === "fidelity")!;
    expect(line).toMatchObject({ ok: false, required: false });
    expect(line.detail).toContain("Fades");
  });

  it("lets only the four manual items be ticked by hand", () => {
    for (const m of MANUAL_ITEMS) expect(isManualItem(m.id)).toBe(true);
    for (const id of ["approved", "paid", "qa", "intake", "no-revision", "nonsense", "", null]) expect(isManualItem(id)).toBe(false);
    expect(MANUAL_ITEMS).toHaveLength(4);
  });

  it("treats an already-live version as approved", () => {
    expect(buildChecklist(goodFacts({ buildStatus: "LIVE" })).lines.find((l) => l.id === "approved")!.ok).toBe(true);
  });
});

const build = (version: number, status: string, over: Row = {}) => ({ id: `b${version}`, projectId: "p1", version, status, siteJson: JSON.stringify({ businessName: `v${version}` }), html: `<html>v${version}</html>`, qaJson: JSON.stringify({ passed: true, errors: [], warnings: [] }), copyMode: "template", note: null, createdAt: new Date(), ...over });

beforeEach(() => {
  S.project = { id: "p1", name: "Joe's Cuts site", state: "DELIVERY_READY", orderId: "o1", previewToken: "prevtoken0123456789", statusToken: "stat1", customerId: "c1", customer: { user: { email: "joe@joescuts.example" } }, order: { id: "o1", status: "PAID", balanceDueCents: 0, websiteIntake: { status: "COMPLETE" } } };
  S.builds = [build(1, "SUPERSEDED"), build(2, "SUPERSEDED"), build(3, "APPROVED")];
  S.ticks = [];
  S.revisions = [];
  S.events = [];
  S.updates = [];
  S.emails = [];
  S.transitions = [];
  S.qa = { passed: true, errors: [], warnings: [] };
});

describe("going back to an earlier version", () => {
  const versions = () => S.builds.map((b) => `${b.version}:${b.status}`);

  it("makes a new version that is a copy of the one chosen, and keeps every version that was there", async () => {
    const r = await rollbackWebsite("p1", 2, "The change made it worse");
    expect(r).toEqual({ ok: true, detail: "version 4 (a copy of version 2)" });
    expect(versions()).toEqual(["1:SUPERSEDED", "2:SUPERSEDED", "3:SUPERSEDED", "4:PREVIEW"]);
    const v4 = S.builds[3];
    expect(v4.html).toBe("<html>v2</html>");
    expect(v4.siteJson).toBe(S.builds[1].siteJson);
    expect(v4.note).toBe("Restored from version 2: The change made it worse");
    expect(v4.approvedAt).toBeNull();
  });

  it("withdraws an approval: what the customer had approved goes back to waiting for them", async () => {
    await rollbackWebsite("p1", 1, "Going back");
    expect(S.builds.find((b) => b.version === 3)!.status).toBe("SUPERSEDED");
    expect(S.builds.at(-1)!.status).toBe("PREVIEW");
    const c = await loadLaunchChecklist("p1");
    expect(c!.lines.find((l) => l.id === "approved")!.ok).toBe(false);
  });

  it("also retires a version that was still waiting for the customer", async () => {
    S.builds[2].status = "PREVIEW";
    await rollbackWebsite("p1", 1, "Going back");
    expect(versions()).toEqual(["1:SUPERSEDED", "2:SUPERSEDED", "3:SUPERSEDED", "4:PREVIEW"]);
  });

  it("records who, what, and why in the log", async () => {
    await rollbackWebsite("p1", 2, "The change made it worse");
    expect(S.events.find((e) => e.event === "website.rolled_back")!.payload).toMatchObject({ fromVersion: 3, toVersion: 2, newVersion: 4, reason: "The change made it worse", hadApproval: true });
  });

  it("tells the customer to look again, unless the owner says not to", async () => {
    await rollbackWebsite("p1", 2, "Going back");
    expect(S.updates[0]).toMatch(/earlier version/);
    expect(S.emails[0]).toMatchObject({ to: "joe@joescuts.example", template: "preview_ready" });
    expect(S.emails[0].payload.previewUrl).toContain("prevtoken0123456789");
    S.updates = [];
    S.emails = [];
    await rollbackWebsite("p1", 1, "Again", { notify: false });
    expect(S.updates).toHaveLength(0);
    expect(S.emails).toHaveLength(0);
  });

  it("carries over the note about anything the customer wrote that did not reach the page", async () => {
    S.builds[1].qaJson = JSON.stringify({ passed: true, errors: [], warnings: ["Missing from the page: service \"Fades\"", "Title is a sensible length"] });
    await rollbackWebsite("p1", 2, "Going back");
    const qa = JSON.parse(S.builds.at(-1)!.qaJson);
    expect(qa.warnings).toContain('Missing from the page: service "Fades"');
    expect(qa.warnings).not.toContain("Title is a sensible length");
  });

  it("refuses without a reason, for a missing or current version, and when there is nothing to go back to", async () => {
    expect(await rollbackWebsite("p1", 2, "  ")).toMatchObject({ ok: false, status: 400 });
    expect(await rollbackWebsite("p1", 0, "reason here")).toMatchObject({ ok: false, status: 400 });
    expect(await rollbackWebsite("p1", 99, "reason here")).toMatchObject({ ok: false, status: 404 });
    expect(await rollbackWebsite("p1", 3, "reason here")).toMatchObject({ ok: false, status: 409 });
    S.project = null;
    expect(await rollbackWebsite("p1", 1, "reason here")).toMatchObject({ ok: false, status: 404 });
    S.project = { id: "p2", customer: { user: { email: "x@x" } } };
    S.builds = [];
    expect(await rollbackWebsite("p1", 1, "reason here")).toMatchObject({ ok: false, status: 409 });
    expect(S.builds).toHaveLength(0);
  });

  it("refuses to roll back a site that has been launched", async () => {
    S.builds[2].status = "LIVE";
    expect(await rollbackWebsite("p1", 1, "reason here")).toMatchObject({ ok: false, status: 409 });
    expect(versions()).toEqual(["1:SUPERSEDED", "2:SUPERSEDED", "3:LIVE"]);
  });

  it("will not bring back a version that no longer passes the checks, and changes nothing", async () => {
    S.qa = { passed: false, errors: ["No sample-design text leaked in"], warnings: [] };
    const r = await rollbackWebsite("p1", 1, "reason here");
    expect(r).toMatchObject({ ok: false, status: 422 });
    expect(versions()).toEqual(["1:SUPERSEDED", "2:SUPERSEDED", "3:APPROVED"]);
    expect(S.events.some((e) => e.event === "website.rolled_back")).toBe(false);
  });
});

describe("the ticks apply to one version only", () => {
  it("counts a tick for the newest version and not for an older one", async () => {
    S.ticks.push({ projectId: "p1", version: 2, itemId: "phone-layout" });
    expect((await loadLaunchChecklist("p1"))!.lines.find((l) => l.id === "phone-layout")!.ok).toBe(false);
    expect(await setChecklistItem("p1", "phone-layout", true)).toEqual({ ok: true });
    expect((await loadLaunchChecklist("p1"))!.lines.find((l) => l.id === "phone-layout")!.ok).toBe(true);
    expect(await setChecklistItem("p1", "phone-layout", false)).toEqual({ ok: true });
    expect((await loadLaunchChecklist("p1"))!.lines.find((l) => l.id === "phone-layout")!.ok).toBe(false);
  });

  it("means a restored version has to be looked at again", async () => {
    for (const m of MANUAL_ITEMS) await setChecklistItem("p1", m.id, true);
    expect((await loadLaunchChecklist("p1"))!.lines.filter((l) => l.kind === "manual").every((l) => l.ok)).toBe(true);
    await rollbackWebsite("p1", 1, "Going back");
    expect((await loadLaunchChecklist("p1"))!.lines.filter((l) => l.kind === "manual").some((l) => l.ok)).toBe(false);
  });

  it("refuses to tick a line the system checks, a made-up line, or anything on a live site", async () => {
    expect(await setChecklistItem("p1", "paid", true)).toMatchObject({ ok: false, status: 400 });
    expect(await setChecklistItem("p1", "bogus", true)).toMatchObject({ ok: false, status: 400 });
    S.builds[2].status = "LIVE";
    expect(await setChecklistItem("p1", "phone-layout", true)).toMatchObject({ ok: false, status: 409 });
    expect(S.ticks).toHaveLength(0);
  });

  it("records each tick in the log", async () => {
    await setChecklistItem("p1", "facts", true);
    expect(S.events.find((e) => e.event === "website.checklist")!.payload).toMatchObject({ version: 3, itemId: "facts", checked: true });
  });
});

describe("the launch gate", () => {
  const tickAll = async () => { for (const m of MANUAL_ITEMS) await setChecklistItem("p1", m.id, true); };

  it("refuses to launch while the checklist is unfinished, and names what is missing", async () => {
    const r = await launchWebsite("p1", "https://joescuts.example");
    expect(r).toMatchObject({ ok: false, status: 409 });
    if (!r.ok) expect(r.error).toMatch(/checklist is not finished.*opened the preview on a phone/);
    expect(S.builds[2].status).toBe("APPROVED");
    expect(S.emails).toHaveLength(0);
  });

  it("launches once every line is true, and marks the version live", async () => {
    await tickAll();
    const r = await launchWebsite("p1", "https://joescuts.example");
    expect(r).toEqual({ ok: true });
    expect(S.builds[2]).toMatchObject({ status: "LIVE", liveUrl: "https://joescuts.example/" });
    expect(S.emails.map((e) => e.template)).toContain("website_live");
    expect(S.events.some((e) => e.event === "website.launched_without_checklist")).toBe(false);
  });

  it("blocks on the system's own lines too: an open change request, or a balance still owed", async () => {
    await tickAll();
    S.revisions.push({ status: "REQUESTED" });
    expect(await launchWebsite("p1", "https://joescuts.example")).toMatchObject({ ok: false, status: 409 });
    S.revisions = [];
    S.project!.order.balanceDueCents = 500_000;
    expect(await launchWebsite("p1", "https://joescuts.example")).toMatchObject({ ok: false });
    expect(S.builds[2].status).toBe("APPROVED");
  });

  it("lets the owner skip the checklist on purpose, and records that they did and what was missing", async () => {
    const r = await launchWebsite("p1", "https://joescuts.example", { skipChecklist: true });
    expect(r).toEqual({ ok: true });
    const ev = S.events.find((e) => e.event === "website.launched_without_checklist")!;
    expect(ev.payload.version).toBe(3);
    expect(ev.payload.missing).toEqual(expect.arrayContaining(["phone-layout", "phone-call", "facts", "live-opens"]));
    expect(S.builds[2].status).toBe("LIVE");
  });

  it("does not count ticks from an earlier version toward launching a restored one", async () => {
    await tickAll();
    await rollbackWebsite("p1", 1, "Going back");
    S.builds.at(-1)!.status = "APPROVED";
    const r = await launchWebsite("p1", "https://joescuts.example");
    expect(r).toMatchObject({ ok: false, status: 409 });
  });
});
