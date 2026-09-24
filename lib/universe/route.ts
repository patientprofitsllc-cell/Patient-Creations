import { AGENT_IDS, type AgentId, type Intent, type Mission, type MissionKind, type Route } from "@/lib/universe/types";

// MASTER decides which minds a request needs. Waking all eleven for every question would be slow, costly, and noisy, so the
// route is the smallest set that can answer well, in the order they can work. Everything skipped is listed with the reason.
//
//   "Look at this screenshot and tell me what's wrong"   LOOK, FEELINGS, PERSPECTIVE, ORGANIZER, MASTER
//   "Should we introduce a subscription?"                GATHERER, PERSPECTIVE, THINKING, FEELINGS, LOGIC, ORGANIZER, MASTER
//   "Rewrite this product description"                   GATHERER, SPEAKER, LOGIC, MASTER
//
// One deliberate detail: LOGIC challenges what the other agents claim, so it runs right after the agents that make claims,
// not beside them. An inner list in `steps` means those agents work at the same time.

const RX = {
  copy: /\b(rewrite|reword|rephrase|proofread|copy ?edit|write (a|an|the|me)|draft (a|an|the)|tagline|headline|caption|description|email (to|for)|newsletter|script|blurb|announcement)\b/i,
  assets: /\b(images?|photos?|photography|graphics?|banners?|thumbnails?|assets?|logo|creative direction|product imagery|shot list)\b/i,
  visual: /\b(screenshots?|screen shot|layout|looks?|looking|design|homepage|home page|this page|landing page|ui|ux|mobile view|interface|visual|first impression|what'?s wrong)\b/i,
  /** Nouns that mean the thing being examined is something to look at. */
  visualNoun: /\b(screenshots?|screen shot|layout|design|page|homepage|home page|ui|ux|interface)\b/i,
  /** Verbs that ask for a diagnosis of the business itself. */
  strongAnalysis: /\b(analy[sz]e|audit|investigate|diagnose)\b/i,
  /** A sentence that opens with "should" is a decision; "areas that should be investigated" is not. */
  decision: /((^|[.?!]\s*)should\b|\b(whether|introduce|launch|start (offering|selling)|add(ing)? (a|an)|pricing|raise (the )?price|lower (the )?price|subscription|worth it|decide|choose between|versus|vs\.?)\b)/i,
  research: /\b(research|find out|competitors?|market|trends?|benchmark|what are others|industry)\b/i,
  weakAnalysis: /\b(identify|improve|increase|grow(th)?|review|bottleneck|most important)\b/i,
  lookup: /\b(what needs attention|show me|how many|list|status|today)\b/i,
};

const has = (text: string, rx: RegExp) => rx.test(text);

/** What the request is, from its words and what came with it. Order matters: writing first, then a thing to look at, then diagnosis. */
export function classifyIntent(text: string, hasAttachments: boolean): Intent {
  if (has(text, RX.copy)) return "copy";
  if (hasAttachments) return "visual";
  if (has(text, RX.assets) && !has(text, RX.visual)) return "assets";
  if (has(text, RX.strongAnalysis) && !has(text, RX.visualNoun)) return "analysis";
  if (has(text, RX.visual)) return "visual";
  if (has(text, RX.decision)) return "decision";
  if (has(text, RX.research)) return "research";
  if (has(text, RX.weakAnalysis)) return "analysis";
  if (has(text, RX.lookup)) return "lookup";
  return "analysis";
}

/** Which part of the business a free-text request is about. Used to pick components and how many agents an analysis needs. */
export function inferKind(text: string): MissionKind {
  if (/\b(website|homepage|home page|site|page|navigation|mobile)\b/i.test(text)) return "website";
  if (/\b(products?|catalog|pricing|price|offers?|packages?)\b/i.test(text)) return "products";
  if (/\b(journey|funnel|checkout flow|customer path)\b/i.test(text)) return "journey";
  if (/\b(conversion|convert|checkout|cart)\b/i.test(text)) return "conversion";
  if (/\bcustomers?|retention|churn|repeat\b/i.test(text)) return "customers";
  if (/\b(growth|grow|acquisition|traffic|leads?)\b/i.test(text)) return "growth";
  if (/\bstrateg(y|ies)\b/i.test(text)) return "strategy";
  if (/\bresearch\b/i.test(text)) return "research";
  return "business";
}

const ANALYSIS_BY_KIND: Record<MissionKind, AgentId[][]> = {
  // Everything: the full chain, used for a whole-business look.
  business: [["DIVIDER"], ["GATHERER"], ["PERSPECTIVE", "THINKING", "LOOK", "IMAGE", "FEELINGS"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  website: [["GATHERER"], ["LOOK", "PERSPECTIVE", "FEELINGS", "IMAGE", "THINKING"], ["LOGIC"], ["ORGANIZER"]],
  products: [["DIVIDER"], ["GATHERER"], ["LOOK", "PERSPECTIVE", "FEELINGS", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  journey: [["DIVIDER"], ["GATHERER"], ["LOOK", "PERSPECTIVE", "FEELINGS", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  conversion: [["DIVIDER"], ["GATHERER"], ["LOOK", "PERSPECTIVE", "FEELINGS", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  customers: [["DIVIDER"], ["GATHERER"], ["PERSPECTIVE", "FEELINGS", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  growth: [["DIVIDER"], ["GATHERER"], ["PERSPECTIVE", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  strategy: [["GATHERER"], ["PERSPECTIVE", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  research: [["DIVIDER"], ["GATHERER"], ["THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  // The daily audit is light on purpose: read the facts, sort them, check them, say them. ORGANIZER goes first here so that the
  // problems it surfaces from the facts are the ones LOGIC challenges.
  daily: [["GATHERER"], ["ORGANIZER"], ["LOGIC"], ["SPEAKER"]],
  weekly: [["DIVIDER"], ["GATHERER"], ["PERSPECTIVE", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  ask: [["DIVIDER"], ["GATHERER"], ["PERSPECTIVE", "THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
};

const STEPS_BY_INTENT: Record<Exclude<Intent, "analysis">, AgentId[][]> = {
  visual: [["LOOK"], ["FEELINGS"], ["PERSPECTIVE"], ["ORGANIZER"]],
  decision: [["GATHERER"], ["PERSPECTIVE", "THINKING", "FEELINGS"], ["LOGIC"], ["ORGANIZER"]],
  copy: [["GATHERER"], ["SPEAKER"], ["LOGIC"]],
  assets: [["GATHERER"], ["IMAGE"], ["LOGIC"], ["ORGANIZER"]],
  "audit-website": [["GATHERER"], ["LOOK", "PERSPECTIVE", "FEELINGS", "IMAGE", "THINKING"], ["LOGIC"], ["ORGANIZER"]],
  research: [["DIVIDER"], ["GATHERER"], ["THINKING"], ["LOGIC"], ["ORGANIZER"], ["SPEAKER"]],
  lookup: [["GATHERER"], ["ORGANIZER"]],
};

const WHY: Record<Intent, string> = {
  visual: "This is about how something looks, so LOOK examines it, FEELINGS says how it may land with people, and PERSPECTIVE shows who sees it differently. Nothing here needs data gathering or strategy.",
  decision: "This is a decision between options, so the evidence is gathered, seen from several viewpoints, weighed by THINKING and FEELINGS, and then challenged by LOGIC.",
  copy: "This is about wording, so the facts are gathered, SPEAKER writes, and LOGIC checks that the words do not change the facts. No analysis agents are needed.",
  assets: "This is about visual assets, so IMAGE works out what is needed and LOGIC checks it. Strategy and emotion analysis are not needed.",
  analysis: "This is an analysis, so the problem is divided, the evidence gathered, the relevant minds analyze it, LOGIC challenges the result, and it is organized and said plainly.",
  "audit-website": "A website audit looks at the page (LOOK, IMAGE), how people may feel about it (FEELINGS), who sees it differently (PERSPECTIVE), and what to try (THINKING), then LOGIC challenges the findings.",
  research: "This is research, so the question is divided, what is already known is gathered, THINKING proposes what to look into, and LOGIC keeps unknowns from being presented as findings.",
  lookup: "This is a simple lookup, so the data is gathered and sorted. No deeper analysis is worth the cost.",
};

const WHY_NOT: Partial<Record<AgentId, string>> = {
  DIVIDER: "the request is a single question, so there is nothing to break apart",
  GATHERER: "no outside information is needed for this",
  PERSPECTIVE: "no competing viewpoints are involved",
  LOOK: "nothing visual is being examined",
  IMAGE: "no images or visual assets are involved",
  FEELINGS: "how people may feel is not the question",
  THINKING: "no options need to be generated",
  LOGIC: "nothing here makes a claim that needs testing",
  ORGANIZER: "there is too little to organize",
  SPEAKER: "the answer does not need to be written up",
};

/** Puts the final MASTER step on, and works out what was skipped and why. */
function finish(intent: Intent, steps: AgentId[][], reason: string): Route {
  const used = new Set(steps.flat());
  const skipped = AGENT_IDS.filter((a) => a !== "MASTER" && !used.has(a)).map((a) => ({ agent: a, why: WHY_NOT[a] ?? "not needed for this request" }));
  return { intent, steps: [...steps, ["MASTER"]], reason, skipped };
}

export function routeFor(mission: Mission): Route {
  const text = `${mission.objective} ${mission.goal}`;
  const intent = mission.intent ?? classifyIntent(text, mission.attachments.length > 0);
  if (intent === "analysis") {
    const kind = mission.kind === "ask" ? inferKind(text) : mission.kind;
    return finish("analysis", ANALYSIS_BY_KIND[kind], `${WHY.analysis} (Scope: ${kind}.)`);
  }
  return finish(intent, STEPS_BY_INTENT[intent], WHY[intent]);
}

/** The distinct agents a route wakes, MASTER included. */
export const agentsIn = (r: Route): AgentId[] => [...new Set(r.steps.flat())];
