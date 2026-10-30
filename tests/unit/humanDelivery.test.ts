import { readFileSync } from "fs";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// AI / software builds: the agents only plan them, so a person must deliver. Nothing may email "delivered" on its own.
type Row = Record<string, any>;
const store = vi.hoisted(() => ({ projects: [] as Row[], logs: [] as Row[], notifications: [] as Row[], updates: [] as Row[], deliverables: [] as Row[], emails: [] as Row[] }));

vi.mock("@/lib/db", () => {
  const find = (id: string) => store.projects.find((p) => p.id === id);
  return {
    db: {
      project: {
        findUnique: async ({ where }: Row) => {
          const p = find(where.id);
          return p ? { ...p, order: { balanceDueCents: p.balanceDueCents ?? 0 }, websiteBuilds: p.website ? [{ id: "b1" }] : [], customer: { user: { email: "buyer@firm.example" } } } : null;
        },
        findUniqueOrThrow: async ({ where }: Row) => ({ ...find(where.id)!, customer: { user: { email: "buyer@firm.example" } } }),
        updateMany: async ({ where, data }: Row) => {
          const p = find(where.id);
          if (!p || (where.state && p.state !== where.state)) return { count: 0 };
          Object.assign(p, data);
          return { count: 1 };
        },
        update: async ({ where, data }: Row) => Object.assign(find(where.id)!, data),
      },
      auditLog: { findFirst: async ({ where }: Row) => store.logs.find((l) => l.event === where.event && l.entityId === where.entityId) ?? null },
      notification: { create: async ({ data }: Row) => void store.notifications.push(data) },
      deliverable: { create: async ({ data }: Row) => (store.deliverables.push(data), { id: "d1", ...data }) },
    },
  };
});
vi.mock("@/lib/analytics/events", () => ({ logEvent: vi.fn(async (event: string, _t: string, entityId: string) => void store.logs.push({ event, entityId })) }));
vi.mock("@/lib/email/provider", () => ({ sendEmail: vi.fn(async (to: string, template: string) => void store.emails.push({ to, template })) }));
vi.mock("@/lib/agents/relay", () => ({
  announce: vi.fn(async () => {}),
  postAgentUpdate: vi.fn(async (projectId: string, agent: string, message: string) => void store.updates.push({ projectId, agent, message })),
}));
vi.mock("@/lib/workflows/stateMachine", () => ({
  transitionProject: vi.fn(async (id: string, to: string) => {
    const p = store.projects.find((x) => x.id === id)!;
    p.state = to;
    return p;
  }),
}));

const { deliverProject, requestHumanFulfillment } = await import("@/lib/agents/orchestrator");

beforeEach(() => {
  for (const k of Object.keys(store) as (keyof typeof store)[]) store[k].length = 0;
  store.projects.push({ id: "p1", name: "AI Receptionist", state: "DELIVERY_READY", statusToken: "tok", orderId: "o1" });
});

describe("AI and software builds wait for a person", () => {
  it("the agent pipeline hands approved builds to the team instead of delivering them", () => {
    const src = readFileSync(join(process.cwd(), "lib/agents/orchestrator.ts"), "utf8");
    const pipeline = src.slice(src.indexOf("async function runPipeline"), src.indexOf("export async function requestHumanFulfillment"));
    expect(pipeline).toMatch(/return requestHumanFulfillment\(projectId\)/);
    expect(pipeline).not.toMatch(/finalizeDelivery\(/);
    expect(pipeline).not.toMatch(/holdDeliveryForBalance\(projectId, "hold"\)/);
  });

  it("tells the team and the customer once, honestly, without emailing 'delivered'", async () => {
    await requestHumanFulfillment("p1");
    await requestHumanFulfillment("p1");
    expect(store.notifications).toHaveLength(1);
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0].message).toMatch(/Nothing is marked delivered until you can use it/);
    expect(store.emails).toHaveLength(0);
    expect(store.projects[0].state).toBe("DELIVERY_READY");
  });

  it("needs a real delivery link", async () => {
    expect(await deliverProject("p1", "not a link", "")).toMatchObject({ ok: false, status: 400 });
    expect(await deliverProject("p1", "javascript:alert(1)", "")).toMatchObject({ ok: false, status: 400 });
    expect(store.emails).toHaveLength(0);
  });

  it("refuses while a balance is owed, for website projects, and before the build is ready", async () => {
    store.projects[0].balanceDueCents = 300_000;
    expect(await deliverProject("p1", "https://drive.example.com/x", "")).toMatchObject({ ok: false, status: 402 });
    store.projects[0].balanceDueCents = 0;
    store.projects[0].website = true;
    expect(await deliverProject("p1", "https://drive.example.com/x", "")).toMatchObject({ ok: false, status: 409 });
    store.projects[0].website = false;
    store.projects[0].state = "BUILD";
    expect(await deliverProject("p1", "https://drive.example.com/x", "")).toMatchObject({ ok: false, status: 409 });
    expect(store.emails).toHaveLength(0);
  });

  it("delivers exactly once with the real link, then completes the project", async () => {
    const [a, b] = await Promise.all([
      deliverProject("p1", "handover.example.com/receptionist", "Tested 5 calls"),
      deliverProject("p1", "handover.example.com/receptionist", "Tested 5 calls"),
    ]);
    expect([a.ok, b.ok]).toEqual([true, true]);
    expect(store.deliverables).toEqual([{ projectId: "p1", version: 1, path: "https://handover.example.com/receptionist", notes: "Tested 5 calls" }]);
    expect(store.emails.filter((e) => e.template === "delivery")).toHaveLength(1);
    expect(store.projects[0].state).toBe("COMPLETED");
  });
});
