import { describe, expect, it } from "vitest";
import { acquisitionProgress, funnelRows, getAcquisitionConfig } from "@/lib/analytics/growth";

const cfg = { goal: 200, days: 21, start: new Date("2026-09-18T00:00:00") };
const at = (offsetDays: number, hours = 12) => new Date(cfg.start.getTime() + offsetDays * 86_400_000 + hours * 3_600_000);

describe("acquisitionProgress", () => {
  it("on day 1 with no customers needs the full goal spread over all 21 days", () => {
    const p = acquisitionProgress(cfg, 0, at(0));
    expect(p.dayNumber).toBe(1);
    expect(p.daysLeft).toBe(21);
    expect(p.remaining).toBe(200);
    expect(p.requiredPerDay).toBe(10); // ceil(200 / 21)
    expect(p.projected).toBe(0);
  });

  it("recomputes the required daily pace from what is actually left", () => {
    const p = acquisitionProgress(cfg, 20, at(6)); // day 7, 15 days left
    expect(p.dayNumber).toBe(7);
    expect(p.daysLeft).toBe(15);
    expect(p.remaining).toBe(180);
    expect(p.requiredPerDay).toBe(12);
  });

  it("projects only from the real pace so far", () => {
    const p = acquisitionProgress(cfg, 14, at(6)); // 14 customers in 7 days = 2/day
    expect(p.actualPerDay).toBe(2);
    expect(p.projected).toBe(42);
  });

  it("never reports a negative remainder once the goal is met", () => {
    const p = acquisitionProgress(cfg, 250, at(10));
    expect(p.remaining).toBe(0);
    expect(p.requiredPerDay).toBe(0);
  });

  it("handles before the start date and after the window", () => {
    expect(acquisitionProgress(cfg, 0, at(-2)).notStarted).toBe(true);
    const ended = acquisitionProgress(cfg, 5, at(25));
    expect(ended.ended).toBe(true);
    expect(ended.daysLeft).toBe(0);
    expect(ended.dayNumber).toBe(21);
  });
});

describe("getAcquisitionConfig", () => {
  it("uses configured values and falls back to safe defaults for bad ones", () => {
    const c = getAcquisitionConfig({ ACQUISITION_GOAL: "50", ACQUISITION_DAYS: "14", ACQUISITION_START_DATE: "2026-10-01" });
    expect(c.goal).toBe(50);
    expect(c.days).toBe(14);
    const d = getAcquisitionConfig({ ACQUISITION_GOAL: "nope", ACQUISITION_DAYS: "-3", ACQUISITION_START_DATE: "garbage" });
    expect(d.goal).toBe(200);
    expect(d.days).toBe(21);
    expect(Number.isNaN(d.start.getTime())).toBe(false);
  });
});

describe("funnelRows", () => {
  it("computes each stage as a share of the previous one", () => {
    const rows = funnelRows({ landing_page_view: 1000, offer_view: 400, checkout_started: 100, checkout_completed: 25 });
    const byEvent = Object.fromEntries(rows.map((r) => [r.event, r]));
    expect(byEvent.landing_page_view.rateFromPrevious).toBeNull();
    expect(byEvent.offer_view.rateFromPrevious).toBe(40);
    expect(byEvent.checkout_started.rateFromPrevious).toBe(25);
    expect(byEvent.checkout_completed.rateFromPrevious).toBe(25);
  });

  it("reports every funnel stage as recorded, so a zero means zero", () => {
    const rows = funnelRows({});
    expect(rows.every((r) => r.instrumented)).toBe(true);
    expect(rows.find((r) => r.event === "checkout_completed")?.instrumented).toBe(true);
    expect(rows.find((r) => r.event === "approved")?.instrumented).toBe(true);
  });

  it("does not divide by zero when an earlier stage has no traffic", () => {
    const rows = funnelRows({ landing_page_view: 0, offer_view: 5 });
    expect(rows.find((r) => r.event === "offer_view")?.rateFromPrevious).toBeNull();
  });
});
