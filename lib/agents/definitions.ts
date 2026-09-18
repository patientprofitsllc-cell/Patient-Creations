import { AgentDefinition } from "@/lib/agents/contract";
import { loadBible, mergeBibleSection, CreativeBibleData } from "@/lib/agents/bible";

export interface RoleAgentInput {
  projectId: string;
  focusPrompt: string;
}

export interface RoleAgentOutput {
  agentKey: string;
  summary: string;
  raw: string;
  mocked: boolean;
}

/**
 * Shared execution path for the "creative pipeline" agents. Each still
 * gets its own AgentDefinition (distinct mission/inputs/tools/constraints/
 * quality/budget/time/escalation per AGENT_WORKER_CONTRACT.md) — this
 * factory only removes duplicate plumbing around the model call, bible
 * read, and bible section write.
 */
function definePipelineAgent(config: {
  key: string;
  name: string;
  mission: string;
  tools: string[];
  constraints: string[];
  qualityStandard: string;
  maxBudgetCents: number;
  maxTimeMs: number;
  escalateOn: string[];
  systemPrompt: (bible: CreativeBibleData) => string;
  bibleSection?: keyof CreativeBibleData;
}): AgentDefinition<RoleAgentInput, RoleAgentOutput> {
  return {
    key: config.key,
    name: config.name,
    mission: config.mission,
    inputsDescription: "Project Bible (all sections written so far) + prior agent outputs + task focus prompt.",
    tools: config.tools,
    constraints: config.constraints,
    qualityStandard: config.qualityStandard,
    maxBudgetCents: config.maxBudgetCents,
    maxTimeMs: config.maxTimeMs,
    escalateOn: config.escalateOn,
    execute: async (input, ctx) => {
      const bible = await loadBible(input.projectId);
      if (!bible) {
        throw new Error("missing required input: Project Bible not found for project");
      }

      const system = config.systemPrompt(bible);
      const result = await ctx.callModel({
        agentKey: config.key,
        system,
        prompt: input.focusPrompt,
      });

      if (config.bibleSection) {
        // Merge into the section rather than replacing it, so what the customer
        // supplied at intake (services, pricing, links, brand) survives the agents.
        await mergeBibleSection(input.projectId, config.bibleSection, {
          ...(Array.isArray(bible[config.bibleSection]) ? {} : (bible[config.bibleSection] as Record<string, unknown>)),
          agent: config.key,
          content: result.text,
          mocked: result.mocked,
        });
      }

      return {
        agentKey: config.key,
        summary: result.text.slice(0, 400),
        raw: result.text,
        mocked: result.mocked,
      };
    },
  };
}

export const researchAgent = definePipelineAgent({
  key: "research",
  name: "Research Agent",
  mission: "Research market, competitors, audience, trends, positioning, references, and requirements for the project.",
  tools: ["callModel", "bible.read", "bible.write:references"],
  constraints: ["Must not fabricate statistics presented as verified fact.", "Must not access other projects' data."],
  qualityStandard: "Findings are specific to the customer's stated business and audience, not generic filler.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "references",
  systemPrompt: (bible) =>
    `You are the Research Agent for Patient Creations. Research the market, competitors, audience, and positioning for: ${JSON.stringify(bible.business)}. Objective: ${JSON.stringify(bible.objective)}.`,
});

export const strategyAgent = definePipelineAgent({
  key: "strategy",
  name: "Strategy Agent",
  mission: "Turn research into positioning, offer structure, user journey, and conversion strategy.",
  tools: ["callModel", "bible.read", "bible.write:offer"],
  constraints: ["Must be consistent with the Project Bible objective and audience."],
  qualityStandard: "Produces a concrete positioning statement and offer structure, not vague advice.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input", "conflicts with project bible"],
  bibleSection: "offer",
  systemPrompt: (bible) =>
    `You are the Strategy Agent. Using this research: ${JSON.stringify(bible.references)}, define positioning, offer structure, and conversion strategy for: ${JSON.stringify(bible.business)}.`,
});

export const creativeDirectorAgent = definePipelineAgent({
  key: "creative_director",
  name: "Creative Director",
  mission: "Define the creative concept, visual direction, and experience narrative for the project.",
  tools: ["callModel", "bible.read", "bible.write:brand"],
  constraints: ["Must avoid generic AI clichés (per Visual Asset Bible negative prompt list)."],
  qualityStandard: "Concept is specific and original, not a generic template description.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "brand",
  systemPrompt: (bible) =>
    `You are the Creative Director. Define the creative concept and visual direction for: ${JSON.stringify(bible.business)}, using strategy: ${JSON.stringify(bible.offer)}. Avoid generic cyberpunk, neon overload, and AI clichés.`,
});

export const visualDirectorAgent = definePipelineAgent({
  key: "visual_director",
  name: "Visual Director",
  mission: "Maintain visual consistency, image direction, composition, and asset consistency.",
  tools: ["callModel", "bible.read", "bible.write:design"],
  constraints: ["Must follow the established color/material system once set; no unmotivated new visual elements."],
  qualityStandard: "Every visual decision traces back to a defined system, not ad hoc choices.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "design",
  systemPrompt: (bible) =>
    `You are the Visual Director. Define the visual system (color, material, composition rules) for: ${JSON.stringify(bible.brand)}.`,
});

export const uxAgent = definePipelineAgent({
  key: "ux",
  name: "UX Agent",
  mission: "Design information architecture, user journeys, flows, and reduce friction.",
  tools: ["callModel", "bible.read", "bible.write:requirements"],
  constraints: ["Must keep the primary conversion path to 3 steps or fewer where feasible."],
  qualityStandard: "Every screen/step maps to a clear user goal.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "requirements",
  systemPrompt: (bible) =>
    `You are the UX Agent. Design the information architecture and user journey for: ${JSON.stringify(bible.business)}, audience: ${JSON.stringify(bible.audience)}.`,
});

export const uiAgent = definePipelineAgent({
  key: "ui",
  name: "UI Agent",
  mission: "Define typography, spacing, components, states, and responsive behavior.",
  tools: ["callModel", "bible.read", "bible.write:design"],
  constraints: ["Must reuse the Visual Director's established system rather than inventing a new one."],
  qualityStandard: "Component spec is implementable without further clarification.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "design",
  systemPrompt: (bible) =>
    `You are the UI Agent. Define the component/typography/spacing system consistent with: ${JSON.stringify(bible.design)}.`,
});

export const copyAgent = definePipelineAgent({
  key: "copy",
  name: "Copy Agent",
  mission: "Create headlines, body copy, CTAs, product copy, and onboarding content.",
  tools: ["callModel", "bible.read", "bible.write:content"],
  constraints: ["Must not fabricate case-study statistics.", "Must match the defined brand voice."],
  qualityStandard: "Copy is specific to the offer, not generic marketing filler.",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "content",
  systemPrompt: (bible) =>
    `You are the Copy Agent. Write headline, subhead, and CTA copy for: ${JSON.stringify(bible.offer)}, voice: ${JSON.stringify(bible.voice)}.`,
});

export const developmentAgent = definePipelineAgent({
  key: "development",
  name: "Development Agent",
  mission: "Build frontend, backend, API, and integration tasks required by the project spec.",
  tools: ["callModel", "bible.read", "bible.write:technology"],
  constraints: ["Must not introduce unreviewed production credentials.", "Must not perform destructive database operations."],
  qualityStandard: "Output maps to concrete, buildable tasks with acceptance criteria.",
  maxBudgetCents: 75,
  maxTimeMs: 60_000,
  escalateOn: ["missing required input", "insufficient permissions"],
  bibleSection: "technology",
  systemPrompt: (bible) =>
    `You are the Development Agent. Break down the build tasks required for: ${JSON.stringify(bible.requirements)}.`,
});

export const imageAgent = definePipelineAgent({
  key: "image",
  name: "Image Agent",
  mission: "Create and manage image asset direction consistent with the Visual Asset Bible.",
  tools: ["callModel", "bible.read", "bible.write:assets"],
  constraints: ["Must preserve reference identity, lighting, and color universe across generations."],
  qualityStandard: "Asset briefs are specific enough to hand to a generation tool without further clarification.",
  maxBudgetCents: 100,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "assets",
  systemPrompt: (bible) =>
    `You are the Image Agent. Produce image asset briefs consistent with: ${JSON.stringify(bible.design)}.`,
});

export const videoAgent = definePipelineAgent({
  key: "video",
  name: "Video Agent",
  mission: "Create and manage video asset direction consistent with the Visual Asset Bible.",
  tools: ["callModel", "bible.read", "bible.write:assets"],
  constraints: ["Must avoid disconnected shots; must maintain continuity from master stills."],
  qualityStandard: "Shot list includes camera, motion, and continuity requirements.",
  maxBudgetCents: 150,
  maxTimeMs: 60_000,
  escalateOn: ["missing required input"],
  bibleSection: "assets",
  systemPrompt: (bible) =>
    `You are the Video Agent. Produce a shot list consistent with: ${JSON.stringify(bible.design)}.`,
});

export const characterAgent = definePipelineAgent({
  key: "character",
  name: "Character Agent",
  mission: "Maintain character identity consistency across generated assets.",
  tools: ["callModel", "bible.read", "bible.write:assets"],
  constraints: ["Must never change identity, wardrobe, or environment between generations without explicit request."],
  qualityStandard: "Character card includes identity, face, wardrobe, lighting, camera, and signature pose/expression.",
  maxBudgetCents: 75,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input"],
  bibleSection: "assets",
  systemPrompt: (bible) =>
    `You are the Character Agent. Produce a Master Character Card consistent with: ${JSON.stringify(bible.brand)}.`,
});

export const marketingAgent = definePipelineAgent({
  key: "marketing",
  name: "Marketing Agent",
  mission: "Create campaign concepts, ad concepts, landing page messaging, and email campaigns.",
  tools: ["callModel", "bible.read", "bible.write:content"],
  constraints: ["Must stay within documented campaign budget guardrails."],
  qualityStandard: "Every concept ties to a measurable goal (clicks, leads, purchases).",
  maxBudgetCents: 50,
  maxTimeMs: 45_000,
  escalateOn: ["missing required input", "exceeds budget"],
  systemPrompt: (bible) =>
    `You are the Marketing Agent. Propose campaign concepts for: ${JSON.stringify(bible.offer)}.`,
});

export const seoAgent = definePipelineAgent({
  key: "seo",
  name: "SEO Agent",
  mission: "Handle metadata, schema, semantic structure, internal linking, and indexing readiness.",
  tools: ["callModel", "bible.read", "bible.write:technology"],
  constraints: ["Must not use deceptive metadata or keyword stuffing."],
  qualityStandard: "Metadata is accurate and specific to the page content.",
  maxBudgetCents: 25,
  maxTimeMs: 30_000,
  escalateOn: ["missing required input"],
  systemPrompt: (bible) =>
    `You are the SEO Agent. Produce metadata and schema recommendations for: ${JSON.stringify(bible.business)}.`,
});

export const analyticsAgentDef = definePipelineAgent({
  key: "analytics",
  name: "Analytics Agent",
  mission: "Define acquisition, conversion, revenue, and funnel tracking for the project.",
  tools: ["callModel", "bible.read", "bible.write:technology"],
  constraints: ["Must be privacy-conscious; must not track PII beyond what is necessary."],
  qualityStandard: "Every tracked event maps to a business decision.",
  maxBudgetCents: 25,
  maxTimeMs: 30_000,
  escalateOn: ["missing required input"],
  systemPrompt: (bible) =>
    `You are the Analytics Agent. Define the tracking plan for: ${JSON.stringify(bible.objective)}.`,
});

export const marketingSeoAnalyticsAgents = [marketingAgent, seoAgent, analyticsAgentDef];

export const ALL_PIPELINE_AGENTS = [
  researchAgent,
  strategyAgent,
  creativeDirectorAgent,
  visualDirectorAgent,
  uxAgent,
  uiAgent,
  copyAgent,
  developmentAgent,
  imageAgent,
  videoAgent,
  characterAgent,
  marketingAgent,
  seoAgent,
  analyticsAgentDef,
];
