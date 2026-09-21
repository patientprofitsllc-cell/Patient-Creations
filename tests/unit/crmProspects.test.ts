import { beforeEach, describe, expect, it, vi } from "vitest";

// The prospect record's pipeline fields, and the moment a prospect becomes a customer. The database is faked.
type Row = Record<string, any>;
const store = vi.hoisted(() => ({ prospects: [] as Row[] }));

vi.mock("@/lib/db", () => ({
  db: {
    prospect: {
      findUnique: async ({ where }: Row) => store.prospects.find((p) => p.id === where.id) ?? null,
      update: async ({ where, data }: Row) => {
        const p = store.prospects.find((r) => r.id === where.id)!;
        Object.assign(p, data);
        return p;
      },
      updateMany: async ({ where, data }: Row) => {
        const rows = store.prospects.filter((p) => p.email === where.email && !where.status.notIn.includes(p.status));
        rows.forEach((r) => Object.assign(r, data));
        return { count: rows.length };
      },
    },
  },
}));

import { markContacted, markProspectWon, updateProspect } from "@/lib/prospects/service";

const seed = (over: Row = {}) => store.prospects.push({ id: "p1", status: "NEW", email: "joe@joescuts.example", notes: null, contactedAt: null, lastContactAt: null, stage: null, valueCents: null, probability: null, productInterest: null, nextAction: null, nextFollowUpAt: null, ...over });

beforeEach(() => {
  store.prospects.length = 0;
});

describe("setting the pipeline fields", () => {
  it("saves a stage, a value, a chance, a product, and a next step", async () => {
    seed();
    await updateProspect("p1", { stage: "PROPOSAL", valueCents: 250_000, probability: 60, productInterest: "lead-engine", nextAction: "  Send the proposal Friday  " });
    expect(store.prospects[0]).toMatchObject({ stage: "PROPOSAL", valueCents: 250_000, probability: 60, productInterest: "lead-engine", nextAction: "Send the proposal Friday" });
  });

  it("clears a field when given null, and treats a blank next step as none", async () => {
    seed({ stage: "PROPOSAL", valueCents: 1, probability: 5, productInterest: "site", nextAction: "x" });
    await updateProspect("p1", { stage: null, valueCents: null, probability: null, productInterest: null, nextAction: "   " });
    expect(store.prospects[0]).toMatchObject({ stage: null, valueCents: null, probability: null, productInterest: null, nextAction: null });
  });

  it("refuses a stage that is not yours to set, a made-up product, and numbers out of range", async () => {
    seed();
    await expect(updateProspect("p1", { stage: "UPSELL" })).rejects.toThrow(/Unknown sales stage/);
    await expect(updateProspect("p1", { stage: "nonsense" })).rejects.toThrow(/Unknown sales stage/);
    await expect(updateProspect("p1", { productInterest: "free-money" })).rejects.toThrow(/Unknown product/);
    await expect(updateProspect("p1", { probability: 101 })).rejects.toThrow(/Unknown chance/);
    await expect(updateProspect("p1", { probability: 12.5 })).rejects.toThrow(/Unknown chance/);
    await expect(updateProspect("p1", { valueCents: -1 })).rejects.toThrow(/Unknown value/);
    await expect(updateProspect("p1", { valueCents: 1.5 })).rejects.toThrow(/Unknown value/);
    expect(store.prospects[0].stage).toBeNull();
  });

  it("never changes a business that asked not to be contacted", async () => {
    seed({ status: "DO_NOT_CONTACT" });
    await expect(updateProspect("p1", { stage: "PROPOSAL" })).rejects.toThrow(/asked not to be contacted/);
    await updateProspect("p1", { logContact: true, valueCents: 100 });
    expect(store.prospects[0].lastContactAt).toBeNull();
  });

  it("records that you just talked to them", async () => {
    seed();
    const before = Date.now();
    await updateProspect("p1", { logContact: true });
    expect(store.prospects[0].lastContactAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("stamps the last contact when you mark them contacted", async () => {
    seed();
    await markContacted("p1", 3);
    expect(store.prospects[0].lastContactAt).toBeInstanceOf(Date);
    expect(store.prospects[0].status).toBe("CONTACTED");
  });
});

describe("a prospect who pays", () => {
  it("becomes a win, with no follow-up left, matched on email in any letter case", async () => {
    seed({ status: "CALL_BOOKED", nextFollowUpAt: new Date() });
    expect(await markProspectWon("  Joe@JoesCuts.example ")).toBe(1);
    expect(store.prospects[0]).toMatchObject({ status: "WON", nextFollowUpAt: null });
  });

  it("leaves someone who asked not to be contacted alone, and does nothing for an unknown or empty email", async () => {
    seed({ status: "DO_NOT_CONTACT" });
    expect(await markProspectWon("joe@joescuts.example")).toBe(0);
    expect(store.prospects[0].status).toBe("DO_NOT_CONTACT");
    expect(await markProspectWon("nobody@else.example")).toBe(0);
    expect(await markProspectWon("")).toBe(0);
    expect(await markProspectWon(null)).toBe(0);
  });

  it("does not fail an order if the tidy-up fails", async () => {
    store.prospects.length = 0;
    const svc = await import("@/lib/prospects/service");
    // an email that makes the fake throw
    const original = store.prospects.filter;
    store.prospects.filter = (() => {
      throw new Error("db down");
    }) as never;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(svc.markProspectWon("joe@joescuts.example")).resolves.toBe(0);
    store.prospects.filter = original;
    spy.mockRestore();
  });
});
