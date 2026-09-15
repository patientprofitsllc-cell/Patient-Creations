import { describe, it, expect } from "vitest";
import { PHASE_WEIGHTS } from "@/lib/workflows/progress";

describe("PHASE_WEIGHTS", () => {
  it("matches the spec's example progress table for key milestones", () => {
    expect(PHASE_WEIGHTS.PAID.weight).toBe(5);
    expect(PHASE_WEIGHTS.RESEARCH.weight).toBe(22);
    expect(PHASE_WEIGHTS.CONCEPT.weight).toBe(31);
    expect(PHASE_WEIGHTS.GENERATION.weight).toBe(48);
    expect(PHASE_WEIGHTS.BUILD.weight).toBe(62);
    expect(PHASE_WEIGHTS.AUTOMATION.weight).toBe(76);
    expect(PHASE_WEIGHTS.QA.weight).toBe(88);
    expect(PHASE_WEIGHTS.DELIVERY_READY.weight).toBe(95);
    expect(PHASE_WEIGHTS.DELIVERED.weight).toBe(100);
  });

  it("never assigns a non-terminal phase 100% before delivery", () => {
    const nonTerminal = Object.entries(PHASE_WEIGHTS).filter(
      ([state]) => !["DELIVERED", "REVIEW_REQUESTED", "COMPLETED", "EXCEPTION", "CANCELLED"].includes(state),
    );
    for (const [, info] of nonTerminal) {
      expect(info.weight).toBeLessThan(100);
    }
  });
});
