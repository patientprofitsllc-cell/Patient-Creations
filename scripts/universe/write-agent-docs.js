// Writes agent-universe/agents/*.md from one table, so every agent file has the same sections and none drifts from the others.
//   node scripts/universe/write-agent-docs.js
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "..", "agent-universe", "agents");
fs.mkdirSync(dir, { recursive: true });

const FORMAT = "Every agent answers in the standard message: AGENT, TASK, CONTEXT, INPUT, ANALYSIS, FINDINGS, ASSUMPTIONS, UNKNOWN, RISKS, RECOMMENDATION, NEXT_AGENT, CONFIDENCE (LOW, MEDIUM, or HIGH). See docs/agent-protocol.md.";

const agents = [
  {
    file: "master",
    NAME: "MASTER",
    ROLE: "Executive orchestrator. The only agent that decides.",
    PURPOSE: "Turn a request into a decision and a plan by waking the smallest set of agents that can answer it, weighing what they say, resolving where they disagree, having the work recorded, and checking that it really happened.",
    RESPONSIBILITIES: [
      "Understand the request and what is already remembered about it.",
      "Choose the route: which agents to wake, in what order, and which to leave asleep (and why). Waking all eleven for every question is deliberately avoided.",
      "Run the route: agents in a step that do not depend on each other work at the same time.",
      "Retry a failing agent once, hand its work to a fallback if there is one, and tell the owner if it still fails. Never loop without a limit.",
      "Wake one more mind, once, if LOGIC finds evidence missing and nobody gathered any.",
      "Decide: set aside what LOGIC rejects, keep as drafts what needs a person's approval, settle disagreements by a fixed rule or hand them to the owner.",
      "Execute only internal actions within permission, then read each one back to verify it.",
      "Remember the decision, and learn from results when the owner reports them.",
    ],
    INPUTS: ["A mission: goal, context, constraints, available information, required outcome, deadline, priority.", "Every agent's message, facts, claims, and LOGIC's challenges.", "Memory: earlier decisions and results on the same subject.", "The permission level."],
    OUTPUTS: ["The route it chose, with the reason and the skipped agents.", "A decision: summary, reasoning, ranked tasks with owners and dependencies, risks, next actions, disagreements, what was set aside, what is unknown, confidence.", "The final report, written by SPEAKER.", "Recorded tasks and a saved decision, each verified."],
    WHEN: ["Always. Every request goes through MASTER."],
    WHEN_NOT: ["MASTER does not do the analysis itself. It never replaces an agent."],
    TOOLS: ["The route table (lib/universe/route.ts).", "The decision rules (lib/universe/core/master.ts).", "The task, memory, permission, audit, and event managers.", "The executor (lib/universe/core/executor.ts)."],
    RULES: [
      "Never trust one agent. Every claim passes LOGIC, or a plain gate that requires real evidence.",
      "A claim LOGIC finds unsupported, insufficient, or invalid is set aside with the reason.",
      "A claim that would take a reserved action is a draft that needs the owner's approval.",
      "Opposite claims on the same subject: the side with at least two more observed facts wins. Otherwise the owner decides, as a task.",
      "Priority follows severity, then the business's own order of importance, then the amount of evidence. CRITICAL is kept only when an observed fact stands behind it.",
      "With nothing read, offer no conclusion and no tasks. Ideas are shown separately as experiments, never as findings.",
    ],
    LIMITS: ["It can only act inside the Agent Universe: record tasks, save memory, notify the owner. It cannot change prices, send email, or spend money.", "Its route is chosen from the words of the request, so an oddly worded request may be routed to more or fewer agents than ideal. The route is shown so it can be corrected."],
    EXAMPLES: ["\"Look at this screenshot and tell me what's wrong\" wakes LOOK, FEELINGS, PERSPECTIVE, ORGANIZER.", "\"Should we introduce a subscription?\" wakes GATHERER, PERSPECTIVE, THINKING, FEELINGS, LOGIC, ORGANIZER.", "\"Rewrite this product description\" wakes GATHERER, SPEAKER, LOGIC."],
    CODE: "lib/universe/core/orchestrator.ts, lib/universe/core/master.ts, lib/universe/route.ts",
  },
  {
    file: "divider",
    NAME: "DIVIDER",
    ROLE: "Decomposes a large objective into parts.",
    PURPOSE: "Give the others a structure to work inside. It does not decide anything.",
    RESPONSIBILITIES: ["Break the objective into components using the domain's own breakdown.", "Find dependencies between components.", "Mark what can run at the same time and what must wait. A dependency cycle is placed in one final group, never looped on.", "Say which topics have no data source.", "Note when no measurable target was given, so success is not defined.", "Name the data sources needed and whether the problem is simple or complex."],
    INPUTS: ["The mission.", "The domain's components for this kind of request.", "Which topics can be read (a connected source or something already observed)."],
    OUTPUTS: ["A plan: components, parallel groups, sequential ones, unknowns, resources, complexity."],
    WHEN: ["The request has several parts, or spans the business."],
    WHEN_NOT: ["A single question, a rewrite, a decision between options, or a screenshot."],
    TOOLS: ["The domain's component list."],
    RULES: ["A component with no unmet dependency starts in the first group; the rest wait for the group before.", "Never invent a component the domain does not define."],
    LIMITS: ["It cannot judge whether the domain's breakdown is the right one.", "Free-text requests are matched to components by keyword; when nothing matches, the whole business set is used rather than a guess at a subset."],
    EXAMPLES: ["\"Improve the business\" divides into getting found, the website, conversion, products, delivery, customer experience, keeping customers, money, systems, partners."],
    CODE: "lib/universe/agents/divider.ts",
  },
  {
    file: "gatherer",
    NAME: "GATHERER",
    ROLE: "Collects information and labels how much it can be trusted.",
    PURPOSE: "Read what is really available and never fill a gap with a guess.",
    RESPONSIBILITIES: ["Read each connected data source that the plan needs, in parallel, each with a time limit.", "Label every item: FACT (read, with its source), ASSUMPTION (stated in the request, not verified), UNKNOWN (could not be read, with what is needed), CONFLICTING (two sources disagree).", "Report a topic with no data source as DATA NOT AVAILABLE.", "Read only what the request needs, to keep cost down."],
    INPUTS: ["The plan, or the components matched to the request.", "The domain's data sources (probes).", "Assumptions stated in the request."],
    OUTPUTS: ["A list of labeled facts with ids, and timings for each source."],
    WHEN: ["Anything that depends on the business's real data."],
    WHEN_NOT: ["A question about a screenshot or a pasted page. Something already in front of the agents needs no gathering."],
    TOOLS: ["The domain's probes. In Patient Creations these read the founder dashboard's loader, the funnel events, invoices, and products."],
    RULES: ["Never fabricate. An unreadable source becomes UNKNOWN with the words DATA NOT AVAILABLE.", "An error message from a source is never copied into a fact.", "Two readings of the same thing that disagree are both CONFLICTING; neither is trusted."],
    LIMITS: ["It can only read what the domain connects. It does no outside research."],
    EXAMPLES: ["If the database is unreachable every database-backed source becomes UNKNOWN, and the decision says nothing could be established."],
    CODE: "lib/universe/agents/gatherer.ts",
  },
  {
    file: "organizer",
    NAME: "ORGANIZER",
    ROLE: "Turns findings into something MASTER can read.",
    PURPOSE: "Structure and prioritize. It sorts; it does not decide what is true or what to do.",
    RESPONSIBILITIES: ["Group facts by topic.", "Merge duplicate claims, keeping the evidence of both.", "Give every claim an honest severity and a priority. A claim marked critical without an observed fact is shown as high.", "Turn observed problems that no agent claimed into claims, so nothing observed is lost (this is how the daily audit works).", "Sort by severity, then the business's own order of importance, then evidence."],
    INPUTS: ["Facts, claims, and LOGIC's challenges."],
    OUTPUTS: ["Organized findings: facts by topic, distinct claims, a priority table."],
    WHEN: ["More than a handful of findings, or when observed problems may not have been claimed."],
    WHEN_NOT: ["A rewrite. There is nothing to organize."],
    TOOLS: ["The severity-to-priority table (critical P0, high P1, medium P2, low P3, experiment P4)."],
    RULES: ["Never drop a claim except an exact duplicate.", "Never raise a severity."],
    LIMITS: ["Merging is by the same subject, stance, and words; two differently worded claims about the same thing both stay."],
    EXAMPLES: ["Ten page facts and three system facts become thirteen ranked rows."],
    CODE: "lib/universe/agents/organizer.ts",
  },
  {
    file: "perspective",
    NAME: "PERSPECTIVE",
    ROLE: "Looks at the same facts through each viewpoint involved.",
    PURPOSE: "Show what each person or group sees, what the others miss, and where their interests pull against each other.",
    RESPONSIBILITIES: ["Decide which viewpoints are relevant to the facts; leave out a viewpoint the facts say nothing about.", "For each: what it cares about, what it sees, what other viewpoints may miss, its conflicts with others, its opportunities.", "Report each pair of viewpoints in tension once per subject.", "Make one claim per problem fact, naming every viewpoint it touches. A problem several viewpoints share ranks higher."],
    INPUTS: ["Facts.", "The domain's stakeholders: what each wants and what each is wary of."],
    OUTPUTS: ["Per-viewpoint findings and claims."],
    WHEN: ["A decision or analysis where different people are affected differently."],
    WHEN_NOT: ["A rewrite, or a lookup."],
    TOOLS: ["The domain's stakeholder list."],
    RULES: ["It reports what a viewpoint sees in the facts, not what the viewpoint is guessed to feel. Feelings are FEELINGS' job.", "Tension is a trade-off to decide, not an error to remove."],
    LIMITS: ["It can only see viewpoints the domain defines, and only through facts tagged to them."],
    EXAMPLES: ["The owner wants upselling; the customer is wary of it. Both are reported, neither is dismissed."],
    CODE: "lib/universe/agents/perspective.ts",
  },
  {
    file: "look",
    NAME: "LOOK",
    ROLE: "Observes what is visible on a page or interface.",
    PURPOSE: "Say what is visible, what appears confusing, what appears missing, and what could improve, each with the reason.",
    RESPONSIBILITIES: ["Read the markup of the domain's pages, or a page or text attached to the request: title, headings, mobile layout, navigation, calls to action, forms, text amount, long paragraphs.", "Turn each observation into a fact that names the page it came from.", "Report a page that would not open as UNKNOWN, never as fine.", "Cite those facts in its claims."],
    INPUTS: ["Page snapshots, fetched once and shared with IMAGE and FEELINGS.", "What each page is expected to show."],
    OUTPUTS: ["Findings tied to observed facts: what is visible, confusing, missing, and what to improve, and why."],
    WHEN: ["A page, a screenshot description, or a website audit."],
    WHEN_NOT: ["Anything that is not something to look at."],
    TOOLS: ["A safe page fetcher that refuses private and internal addresses.", "A reader of HTML markup."],
    RULES: ["Never claim to know invisible implementation details.", "Confidence is never HIGH: reading markup is a partial view of a visual thing."],
    LIMITS: ["It reads HTML. It cannot see colors, spacing, imagery, or how a page really renders, and it says so every time. A picture needs a person or an image-capable model."],
    EXAMPLES: ["\"Checkout page: no main heading (h1).\" is observed. \"The checkout looks ugly\" is never said."],
    CODE: "lib/universe/agents/look.ts, lib/universe/agents/observe.ts, lib/universe/pageSignals.ts",
  },
  {
    file: "image",
    NAME: "IMAGE",
    ROLE: "Plans visual assets and visual communication.",
    PURPOSE: "Work out what image is needed, why, where, what it should say, and in what style, and write a specification for it.",
    RESPONSIBILITIES: ["Find image gaps from observed facts: no images, no share image, missing alt text, images with no stated size.", "For a needed image, write WHAT IS NEEDED, WHY, WHERE, WHAT IT COMMUNICATES, and the house style, as a ready-to-use specification.", "For a request that is only about assets, write the specification from the words given and mark what was not stated as UNKNOWN."],
    INPUTS: ["Observed image facts.", "The domain's house visual style."],
    OUTPUTS: ["A list of asset specifications, each tied to an observation, and claims for alt-text and size fixes."],
    WHEN: ["A website audit, or a request about images or creative direction."],
    WHEN_NOT: ["Wording, numbers, or decisions."],
    TOOLS: ["The domain's visual style."],
    RULES: ["Every specification is marked \"not generated\". Nothing is invented without an observation behind it."],
    LIMITS: ["It does not generate images. When an image tool is connected, its specifications are the prompts. It cannot judge whether an existing image is good."],
    EXAMPLES: ["\"A share image for the home page: no share image is set, so a shared link may show no picture.\""],
    CODE: "lib/universe/agents/image.ts",
  },
  {
    file: "feelings",
    NAME: "FEELINGS",
    ROLE: "Estimates how people are likely to react.",
    PURPOSE: "Explain why a visitor or customer might hesitate even when everything technically works.",
    RESPONSIBILITIES: ["Read signals of trust (contact, proof, policies), friction (many actions, long forms, walls of text), clarity (headings, prices), and waiting.", "For each problem signal, give the emotional signal, the likely reaction, the possible cause, and a potential improvement.", "Note reassuring signals too."],
    INPUTS: ["Observed page facts and facts about customers waiting."],
    OUTPUTS: ["A list of possible reactions, each pointing at the fact behind it."],
    WHEN: ["A screenshot, a website audit, a decision that customers will feel."],
    WHEN_NOT: ["Pure numbers or wording."],
    TOOLS: ["A table of readings, one per kind of signal."],
    RULES: ["The system does not experience emotion; this is a reading of signals.", "Every prediction is worded as a possibility (likely, may, could, potentially), never a certainty. This is enforced in code and tested."],
    LIMITS: ["It has no real feedback to read (reviews, messages, recordings), and says so. Its output is an estimate, never a measurement."],
    EXAMPLES: ["\"A visitor may hesitate to buy when they cannot see how to reach a person.\""],
    CODE: "lib/universe/agents/feelings.ts",
  },
  {
    file: "thinking",
    NAME: "THINKING",
    ROLE: "The strategic and creative mind.",
    PURPOSE: "Explore several possibilities before narrowing: why each might work, what it depends on, what could go wrong, and what it may set off next. Not the same as LOGIC.",
    RESPONSIBILITIES: ["Wake the domain's levers where the facts show a problem they answer.", "For a decision, always lay out three options: pilot it small, commit fully, defer until the open questions are answered.", "Add labeled experiments, when needed, until at least three options exist to compare.", "For each option: rationale, expected effect (worded as a possibility), dependencies, risks, second-order effects."],
    INPUTS: ["Facts.", "The domain's levers, each with its own severity and order of importance."],
    OUTPUTS: ["An option list and claims. Severity comes from the business's own judgment of the problem, not from how many facts happen to be cited."],
    WHEN: ["A decision, a strategy, or an analysis that needs options."],
    WHEN_NOT: ["A rewrite, or a lookup."],
    TOOLS: ["The domain's levers."],
    RULES: ["An idea with no evidence is always an experiment, never above P4.", "It proposes. It never verifies (LOGIC) or decides (MASTER)."],
    LIMITS: ["Without a model it explores the domain's known levers plus the three decision options. It cannot invent strategies the domain has not described."],
    EXAMPLES: ["A triggered acquisition problem produces \"Put the audit, the offers, and the partner link in front of more of the right people\", with its risks and what it may set off."],
    CODE: "lib/universe/agents/thinking.ts",
  },
  {
    file: "logic",
    NAME: "LOGIC",
    ROLE: "Guards the integrity of the reasoning. Not the same as THINKING.",
    PURPOSE: "Test every claim against the evidence. It is expected to disagree with the others and never softens a verdict.",
    RESPONSIBILITIES: ["Check that each claim has evidence, that the evidence exists, and that it is a real observed FACT, not an assumption or an unknown.", "Reject circular reasoning (a claim cited as evidence).", "Check numbers a claim states against the fact it cites.", "Refuse to rely on CONFLICTING facts.", "Find claims that take opposite positions on the same subject.", "Flag any claim that would take an action the business reserves for a person.", "List the missing information.", "For copy: check every number and promise in it against the facts and the original text, and against the business's forbidden wording."],
    INPUTS: ["All claims and facts.", "The domain's constraints."],
    OUTPUTS: ["A verdict for every claim: valid, unsupported, insufficient, invalid, conflict, or needs-approval, with the reason, what is missing, and a recommendation to MASTER."],
    WHEN: ["Whenever agents make claims that will drive a decision, and always for copy."],
    WHEN_NOT: ["A plain lookup, where nothing is claimed."],
    TOOLS: ["The domain's constraints and forbidden wording."],
    RULES: ["An honestly labeled experiment is not penalized for having no evidence.", "It runs after the agents whose claims it must challenge, not beside them."],
    LIMITS: ["It checks that a claim is supported and consistent, not that a fact is true. A wrong source produces a wrong fact that LOGIC will accept."],
    EXAMPLES: ["A claim stating 15 where the cited fact says 9 is invalid. Copy that says $29 when no fact says $29 is rejected."],
    CODE: "lib/universe/agents/logic.ts",
  },
  {
    file: "speaker",
    NAME: "SPEAKER",
    ROLE: "Turns internal findings into communication.",
    PURPOSE: "Say things clearly in the right style without changing what they mean.",
    RESPONSIBILITIES: ["Write the final report from the decision, in a chosen style (professional, friendly, technical, concise, persuasive, educational, executive, casual, customer-service, developer-facing). Style changes how much is shown, never what any line says.", "For a copy request: write from the facts if a writing model is configured; otherwise clean and check the text supplied and say plainly that it did not rewrite it.", "Say the findings plainly before MASTER decides."],
    INPUTS: ["Organized findings, the decision, the requested style, the text to work on, and optionally a writing model."],
    OUTPUTS: ["A report, or checked copy."],
    WHEN: ["Anything a person will read."],
    WHEN_NOT: ["A screenshot review, where MASTER's decision is enough."],
    TOOLS: ["A writing model, only when the owner has turned AI on (AI_ENABLED) and a key is set."],
    RULES: ["Never change factual meaning to sound better.", "Model-written copy is checked by LOGIC, and copy LOGIC rejects is not shown, only the reason."],
    LIMITS: ["Without a model it cannot rewrite prose. It cleans spacing and punctuation, flags long sentences and forbidden wording, and provides the fact sheet to write from."],
    EXAMPLES: ["\"Join for $29\" written by a model when the facts say $49 is rejected and not shown."],
    CODE: "lib/universe/agents/speaker.ts",
  },
];

const bullets = (a) => a.map((x) => `- ${x}`).join("\n");
for (const a of agents) {
  const text = `# ${a.NAME}

## NAME
${a.NAME}

## ROLE
${a.ROLE}

## PURPOSE
${a.PURPOSE}

## RESPONSIBILITIES
${bullets(a.RESPONSIBILITIES)}

## INPUTS
${bullets(a.INPUTS)}

## OUTPUTS
${bullets(a.OUTPUTS)}

## WHEN TO USE
${bullets(a.WHEN)}

## WHEN NOT TO USE
${bullets(a.WHEN_NOT)}

## TOOLS
${bullets(a.TOOLS)}

## DECISION RULES
${bullets(a.RULES)}

## LIMITATIONS
${bullets(a.LIMITS)}

## EXAMPLES
${bullets(a.EXAMPLES)}

## COMMUNICATION FORMAT
${FORMAT}

## WHERE THE CODE IS
${a.CODE}
`;
  fs.writeFileSync(path.join(dir, `${a.file}.md`), text);
}
console.log(`wrote ${agents.length} agent files`);
