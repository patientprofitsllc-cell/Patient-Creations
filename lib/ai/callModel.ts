/**
 * Single seam every agent calls through. If ANTHROPIC_API_KEY is set, this
 * makes a real Claude call. Otherwise it returns deterministic, clearly
 * labeled mock output so the whole pipeline is runnable and testable with
 * zero external accounts. Swapping to real generation is a one-line env
 * var change — no code changes required in any agent.
 */
export interface ModelCallInput {
  agentKey: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}

export interface ModelCallResult {
  text: string;
  mocked: boolean;
  model: string;
}

export async function callModel({ agentKey, system, prompt, maxTokens = 1024 }: ModelCallInput): Promise<ModelCallResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      text: mockResponseFor(agentKey, prompt),
      mocked: true,
      model: "mock",
    };
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const model = "claude-sonnet-5";

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return { text, mocked: false, model };
}

function mockResponseFor(agentKey: string, prompt: string): string {
  return JSON.stringify(
    {
      agent: agentKey,
      mode: "mock",
      summary: `[MOCK OUTPUT] ${agentKey} processed the request.`,
      promptEcho: prompt.slice(0, 240),
      note: "Set ANTHROPIC_API_KEY to replace this with a real model response.",
    },
    null,
    2,
  );
}
