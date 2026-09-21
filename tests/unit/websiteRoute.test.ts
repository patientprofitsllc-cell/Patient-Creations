import { beforeEach, describe, expect, it, vi } from "vitest";

// The owner's website controls: who may use them, and what each action is allowed to ask for.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ session: null as Row | null, calls: [] as Row[] }));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/site/build/actions", () => ({
  applyAdminPatch: async (id: string, patch: Row) => (h.calls.push({ a: "patch", id, patch }), { ok: true, detail: "version 2" }),
  launchWebsite: async (id: string, url: string, opts: Row) => (h.calls.push({ a: "launch", id, url, opts }), url.includes("blocked") ? { ok: false, status: 409, error: "The launch checklist is not finished: x." } : { ok: true }),
  setChecklistItem: async (id: string, item: string, checked: boolean) => (h.calls.push({ a: "check", id, item, checked }), { ok: true }),
}));
vi.mock("@/lib/site/build/rollback", () => ({ rollbackWebsite: async (id: string, to: number, reason: string, opts: Row) => (h.calls.push({ a: "rollback", id, to, reason, opts }), { ok: true, detail: `version ${to + 2}` }) }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/projects/[id]/website/route";

const call = (body: unknown) => POST(new NextRequest("http://localhost/x", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), { params: { id: "p1" } });
const asAdmin = () => (h.session = { user: { id: "u", role: "ADMIN" } });

beforeEach(() => {
  h.session = null;
  h.calls = [];
});

describe("the website controls", () => {
  it("are closed to a visitor and to a customer, for every action", async () => {
    const bodies = [{ action: "rollback", toVersion: 1, reason: "why" }, { action: "check", item: "facts", checked: true }, { action: "launch", liveUrl: "https://a.example" }];
    for (const b of bodies) expect((await call(b)).status).toBe(401);
    h.session = { user: { id: "u", role: "CUSTOMER" } };
    for (const b of bodies) expect((await call(b)).status).toBe(403);
    expect(h.calls).toHaveLength(0);
  });

  it("passes a rollback to the rollback step with its reason, for the owner", async () => {
    asAdmin();
    const r = await call({ action: "rollback", toVersion: 2, reason: "The change made it worse", notify: false });
    expect(r.status).toBe(200);
    expect(h.calls[0]).toEqual({ a: "rollback", id: "p1", to: 2, reason: "The change made it worse", opts: { notify: false } });
  });

  it("refuses a rollback with no reason, a bad version, or a made-up field type", async () => {
    asAdmin();
    for (const bad of [{ action: "rollback", toVersion: 2 }, { action: "rollback", toVersion: 2, reason: "  " }, { action: "rollback", toVersion: 2, reason: "ab" }, { action: "rollback", toVersion: 0, reason: "reason" }, { action: "rollback", toVersion: 1.5, reason: "reason" }, { action: "rollback", toVersion: "2", reason: "reason" }, { action: "rollback", toVersion: 2, reason: "x".repeat(301) }]) {
      expect((await call(bad)).status, JSON.stringify(bad)).toBe(400);
    }
    expect(h.calls).toHaveLength(0);
  });

  it("ticks and unticks a checklist item, and refuses a body that is not the right shape", async () => {
    asAdmin();
    expect((await call({ action: "check", item: "facts", checked: true })).status).toBe(200);
    expect(h.calls[0]).toEqual({ a: "check", id: "p1", item: "facts", checked: true });
    for (const bad of [{ action: "check", item: "facts" }, { action: "check", checked: true }, { action: "check", item: "x".repeat(41), checked: true }, { action: "check", item: "facts", checked: "yes" }]) expect((await call(bad)).status).toBe(400);
  });

  it("launches, passing along whether the checklist is being skipped, and shows why a launch was refused", async () => {
    asAdmin();
    await call({ action: "launch", liveUrl: "https://a.example", skipChecklist: true });
    expect(h.calls[0]).toMatchObject({ a: "launch", url: "https://a.example", opts: { skipChecklist: true } });
    const blocked = await call({ action: "launch", liveUrl: "https://blocked.example" });
    expect(blocked.status).toBe(409);
    expect((await blocked.json()).error).toMatch(/checklist is not finished/);
  });

  it("refuses an unknown action, and a body that is not JSON", async () => {
    asAdmin();
    expect((await call({ action: "delete-everything" })).status).toBe(400);
    expect((await call("not json")).status).toBe(400);
    expect(h.calls).toHaveLength(0);
  });
});
