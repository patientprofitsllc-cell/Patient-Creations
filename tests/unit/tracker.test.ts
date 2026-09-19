import { describe, expect, it } from "vitest";
import { TARGET_HOURS, generalTracker, websiteTracker, type WebsiteTrackerInput } from "@/lib/tracking/tracker";

const t = (iso: string) => new Date(iso);
const HOUR = 3_600_000;
const paid = t("2026-09-18T15:00:00Z");
const info = t("2026-09-18T16:00:00Z");

const base: WebsiteTrackerInput = {
  orderPaid: true,
  paidAt: paid,
  intakeStatus: "COMPLETE",
  intakeCompletedAt: info,
  productionStartedAt: info,
  projectState: "DELIVERY_READY",
  builds: [],
  openRevision: false,
  liveAt: null,
  now: new Date(info.getTime() + 2 * HOUR),
};
const build = (status: string, extra: Partial<WebsiteTrackerInput["builds"][number]> = {}) => ({
  status,
  version: 1,
  createdAt: new Date(info.getTime() + 60_000),
  approvedAt: null,
  ...extra,
});
const states = (tr: ReturnType<typeof websiteTracker>) => tr.steps.map((s) => s.state).join(",");

describe("websiteTracker", () => {
  it("before payment is confirmed: on step 1, nothing to do", () => {
    const tr = websiteTracker({ ...base, orderPaid: false, paidAt: null, intakeStatus: "STARTED", intakeCompletedAt: null, productionStartedAt: null, projectState: "PAID" });
    expect(states(tr)).toBe("current,upcoming,upcoming,upcoming,upcoming");
    expect(tr.headline).toBe("Confirming your payment");
    expect(tr.action).toBeNull();
    expect(tr.stepNumber).toBe(1);
  });

  it("paid but no intake: the customer is the one being waited on, with an intake button", () => {
    const tr = websiteTracker({ ...base, intakeStatus: "STARTED", intakeCompletedAt: null, productionStartedAt: null, projectState: "INTAKE_REQUIRED" });
    expect(states(tr)).toBe("done,attention,upcoming,upcoming,upcoming");
    expect(tr.action).toEqual({ kind: "intake", label: "Finish your intake" });
    expect(tr.waitingOn).toBe("you");
    expect(tr.stepNumber).toBe(2);
    expect(tr.target?.at).toBeNull();
    expect(tr.target?.text).toContain("starts when we receive your business info");
  });

  it("while building: we are the ones working, with a dated target 72 hours after we got their info", () => {
    const tr = websiteTracker({ ...base, projectState: "GENERATION" });
    expect(states(tr)).toBe("done,done,current,upcoming,upcoming");
    expect(tr.waitingOn).toBe("us");
    expect(tr.headline).toBe("Your website is being built");
    expect(tr.target?.at?.getTime()).toBe(info.getTime() + TARGET_HOURS * HOUR);
  });

  it("when the preview is ready: the ball moves to the customer, with a preview button and no date pressure", () => {
    const tr = websiteTracker({ ...base, builds: [build("PREVIEW")] });
    expect(states(tr)).toBe("done,done,done,attention,upcoming");
    expect(tr.action).toEqual({ kind: "preview", label: "View my preview" });
    expect(tr.waitingOn).toBe("you");
    expect(tr.target?.at).toBeNull();
    expect(tr.stepNumber).toBe(4);
  });

  it("while a change request is open: no button, and we are working again", () => {
    const tr = websiteTracker({ ...base, builds: [build("PREVIEW")], openRevision: true });
    expect(states(tr)).toBe("done,done,done,current,upcoming");
    expect(tr.action).toBeNull();
    expect(tr.waitingOn).toBe("us");
    expect(tr.headline).toBe("Your change is being made");
  });

  it("after approval: going live, when it's on us", () => {
    const tr = websiteTracker({ ...base, builds: [build("APPROVED", { approvedAt: t("2026-09-18T18:00:00Z") })] });
    expect(states(tr)).toBe("done,done,done,done,current");
    expect(tr.headline).toBe("Approved, going live");
    expect(tr.steps[3].at).toEqual(t("2026-09-18T18:00:00Z"));
    expect(tr.action).toBeNull();
  });

  it("when live: every step done, 100 percent, complete, no target", () => {
    const tr = websiteTracker({ ...base, builds: [build("LIVE", { approvedAt: t("2026-09-18T18:00:00Z"), liveUrl: "https://ace.com/" })], liveAt: t("2026-09-18T20:00:00Z") });
    expect(states(tr)).toBe("done,done,done,done,done");
    expect(tr.percent).toBe(100);
    expect(tr.complete).toBe(true);
    expect(tr.target).toBeNull();
    expect(tr.steps[4].note).toBe("https://ace.com/");
    expect(tr.stepNumber).toBe(5);
  });

  it("says plainly when our own target has passed, instead of hiding it", () => {
    const tr = websiteTracker({ ...base, projectState: "BUILD", now: new Date(info.getTime() + 80 * HOUR) });
    expect(tr.target?.text).toMatch(/target has passed/);
    expect(tr.target?.text).toMatch(/Message us/);
  });

  it("never blames the customer for a passed target while the ball is with them", () => {
    const tr = websiteTracker({ ...base, builds: [build("PREVIEW")], now: new Date(info.getTime() + 200 * HOUR) });
    expect(tr.target?.text).not.toMatch(/passed/);
    expect(tr.waitingOn).toBe("you");
  });

  it("shows a personal-check message without alarming detail when the build needs a person", () => {
    const tr = websiteTracker({ ...base, projectState: "EXCEPTION" });
    expect(tr.headline).toMatch(/personal check/);
    expect(tr.steps[2].note).toMatch(/person on our team/);
    expect(JSON.stringify(tr)).not.toMatch(/exception|failed|error/i);
  });

  it("progress rises with every step and never goes backwards", () => {
    const stages = [
      websiteTracker({ ...base, orderPaid: false, paidAt: null, intakeStatus: "STARTED", intakeCompletedAt: null }),
      websiteTracker({ ...base, intakeStatus: "STARTED", intakeCompletedAt: null }),
      websiteTracker({ ...base }),
      websiteTracker({ ...base, builds: [build("PREVIEW")] }),
      websiteTracker({ ...base, builds: [build("APPROVED", { approvedAt: info })] }),
      websiteTracker({ ...base, builds: [build("LIVE", { approvedAt: info })], liveAt: info }),
    ].map((x) => x.percent);
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
    expect(new Set(stages).size).toBe(stages.length);
    expect(stages[stages.length - 1]).toBe(100);
  });

  it("always reports a step number between 1 and the total", () => {
    for (const b of [[], [build("PREVIEW")], [build("APPROVED")], [build("LIVE")]]) {
      const tr = websiteTracker({ ...base, builds: b });
      expect(tr.stepNumber).toBeGreaterThanOrEqual(1);
      expect(tr.stepNumber).toBeLessThanOrEqual(tr.total);
    }
  });
});

describe("generalTracker", () => {
  const g = (state: string, extra = {}) => generalTracker({ orderPaid: true, paidAt: paid, projectState: state, turnaround: "2-3 weeks", ...extra });

  it("maps the internal stages to plain ones", () => {
    expect(g("RESEARCH").headline).toBe("Your order is in production");
    expect(g("QA").headline).toBe("Running quality checks");
    expect(g("DELIVERY_READY").headline).toBe("Final review");
    expect(g("COMPLETED").headline).toBe("Delivered");
  });

  it("marks earlier steps done and the current one active", () => {
    expect(g("QA").steps.map((s) => s.state).join(",")).toBe("done,done,current,upcoming,upcoming");
    expect(g("COMPLETED").steps.every((s) => s.state === "done")).toBe(true);
    expect(g("COMPLETED").percent).toBe(100);
  });

  it("shows the product's own estimate in business days, and drops it once delivered", () => {
    expect(generalTracker({ orderPaid: true, paidAt: paid, projectState: "BUILD", turnaround: "3-5 days" }).target?.text).toBe("Estimated delivery: 3-5 business days");
    expect(g("COMPLETED").target).toBeNull();
    expect(generalTracker({ orderPaid: true, paidAt: paid, projectState: "BUILD", turnaround: null }).target).toBeNull();
  });

  it("waits on payment when unpaid", () => {
    const tr = generalTracker({ orderPaid: false, paidAt: null, projectState: "DRAFT", turnaround: null });
    expect(tr.headline).toBe("Confirming your payment");
    expect(tr.stepNumber).toBe(1);
  });

  it("never leaks the word exception to the customer", () => {
    expect(JSON.stringify(g("EXCEPTION"))).not.toMatch(/exception/i);
    expect(g("EXCEPTION").headline).toMatch(/personal check/);
  });
});
