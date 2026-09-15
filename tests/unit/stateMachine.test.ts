import { describe, it, expect } from "vitest";
import { isValidTransition, PIPELINE_ORDER } from "@/lib/workflows/stateMachine";

describe("isValidTransition", () => {
  it("allows each consecutive step in the pipeline", () => {
    for (let i = 0; i < PIPELINE_ORDER.length - 1; i++) {
      expect(isValidTransition(PIPELINE_ORDER[i], PIPELINE_ORDER[i + 1])).toBe(true);
    }
  });

  it("rejects skipping ahead in the pipeline", () => {
    expect(isValidTransition("DRAFT", "BUILD")).toBe(false);
  });

  it("rejects moving backwards", () => {
    expect(isValidTransition("BUILD", "RESEARCH")).toBe(false);
  });

  it("allows the QA <-> REVISION retry loop", () => {
    expect(isValidTransition("QA", "REVISION")).toBe(true);
    expect(isValidTransition("REVISION", "QA")).toBe(true);
    expect(isValidTransition("PERCEPTION", "REVISION")).toBe(true);
  });

  it("allows moving into EXCEPTION or CANCELLED from any non-terminal state", () => {
    expect(isValidTransition("RESEARCH", "EXCEPTION")).toBe(true);
    expect(isValidTransition("BUILD", "CANCELLED")).toBe(true);
  });

  it("never allows a transition out of a terminal state", () => {
    expect(isValidTransition("EXCEPTION", "QUEUED")).toBe(false);
    expect(isValidTransition("COMPLETED", "DELIVERED")).toBe(false);
    expect(isValidTransition("CANCELLED", "DRAFT")).toBe(false);
  });

  it("rejects a no-op transition", () => {
    expect(isValidTransition("BUILD", "BUILD")).toBe(false);
  });
});
