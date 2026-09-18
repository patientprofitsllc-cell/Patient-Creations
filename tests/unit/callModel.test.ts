import { afterEach, describe, expect, it, vi } from "vitest";

// If the SDK were ever imported or called while AI is off, this would fail the test.
const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = { create }; } }));

import { aiEnabled, callModel } from "@/lib/ai/callModel";

const saved = { key: process.env.ANTHROPIC_API_KEY, on: process.env.AI_ENABLED };
afterEach(() => {
  if (saved.key === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = saved.key;
  if (saved.on === undefined) delete process.env.AI_ENABLED;
  else process.env.AI_ENABLED = saved.on;
  create.mockReset();
});

const input = { agentKey: "test", system: "s", prompt: "p" };

describe("AI master switch", () => {
  it("never calls the model when AI_ENABLED is not set, even with a key configured", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    delete process.env.AI_ENABLED;
    const r = await callModel(input);
    expect(r.mocked).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("stays off for anything other than the exact value true", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    for (const v of ["1", "TRUE", "yes", "false", ""]) {
      process.env.AI_ENABLED = v;
      expect((await callModel(input)).mocked).toBe(true);
    }
    expect(create).not.toHaveBeenCalled();
    expect(aiEnabled({ AI_ENABLED: "true" })).toBe(true);
    expect(aiEnabled({})).toBe(false);
  });

  it("stays off when enabled but there is no key", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.AI_ENABLED = "true";
    expect((await callModel(input)).mocked).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("calls the model only when both the switch and a key are present", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.AI_ENABLED = "true";
    create.mockResolvedValueOnce({ content: [{ type: "text", text: "hello" }] });
    const r = await callModel(input);
    expect(r).toMatchObject({ text: "hello", mocked: false });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
