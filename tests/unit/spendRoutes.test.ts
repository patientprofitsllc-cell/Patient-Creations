import { beforeEach, describe, expect, it, vi } from "vitest";

// The owner's marketing-spend entries: who may add or remove one, and what is accepted.
type Row = Record<string, any>;
const h = vi.hoisted(() => ({ session: null as Row | null, rows: [] as Row[] }));

vi.mock("next-auth", () => ({ getServerSession: async () => h.session }));
vi.mock("@/lib/security/authOptions", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    marketingSpend: {
      create: async ({ data }: Row) => void h.rows.push({ id: `s${h.rows.length + 1}`, ...data }),
      deleteMany: async ({ where }: Row) => {
        const before = h.rows.length;
        h.rows = h.rows.filter((r) => r.id !== where.id);
        return { count: before - h.rows.length };
      },
    },
  },
}));

import { NextRequest } from "next/server";
import { POST as add } from "@/app/api/admin/spend/route";
import { DELETE as remove } from "@/app/api/admin/spend/[id]/route";

const post = (body: unknown) => add(new NextRequest("http://localhost/api/admin/spend", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const del = (id: string) => remove(new NextRequest(`http://localhost/api/admin/spend/${id}`, { method: "DELETE" }), { params: { id } });
const good = { month: "2026-09", channel: "Facebook ads", amountCents: 30_000, note: "September test" };
const asAdmin = () => (h.session = { user: { id: "u", role: "ADMIN" } });

beforeEach(() => {
  h.session = null;
  h.rows = [];
});

describe("recording spend", () => {
  it("is closed to a visitor and to a customer", async () => {
    expect((await post(good)).status).toBe(401);
    h.session = { user: { id: "u", role: "CUSTOMER" } };
    expect((await post(good)).status).toBe(403);
    expect((await del("s1")).status).toBe(403);
    expect(h.rows).toHaveLength(0);
  });

  it("saves a good entry for the owner", async () => {
    asAdmin();
    expect((await post(good)).status).toBe(200);
    expect(h.rows[0]).toMatchObject({ month: "2026-09", channel: "Facebook ads", amountCents: 30_000, note: "September test" });
  });

  it("refuses a bad month, an empty channel, a zero or fractional or huge amount, and a bad body", async () => {
    asAdmin();
    for (const bad of [{ ...good, month: "2026-13" }, { ...good, month: "Sept" }, { ...good, channel: "  " }, { ...good, amountCents: 0 }, { ...good, amountCents: -5 }, { ...good, amountCents: 12.5 }, { ...good, amountCents: 100_000_001 }, { ...good, channel: "x".repeat(61) }, {}]) {
      expect((await post(bad)).status).toBe(400);
    }
    expect((await post("not json")).status).toBe(400);
    expect(h.rows).toHaveLength(0);
  });

  it("removes an entry, and says so when it is not there", async () => {
    asAdmin();
    await post(good);
    expect((await del("s1")).status).toBe(200);
    expect(h.rows).toHaveLength(0);
    expect((await del("s1")).status).toBe(404);
  });
});
