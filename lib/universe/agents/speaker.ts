import { message } from "@/lib/universe/protocol";
import { numbersIn } from "@/lib/universe/agents/logic";
import type { AgentOutput, Decision, Fact, RunState } from "@/lib/universe/types";

// SPEAKER turns internal findings into communication. It may change how something is said (length, order, tone of the wrapper)
// but never what it means: every number and claim it writes comes from the structured findings it was handed, and LOGIC checks
// copy against the facts afterwards. Without a model it cannot rewrite prose, and it says so instead of pretending.

export const STYLES = ["professional", "friendly", "technical", "concise", "persuasive", "educational", "executive", "casual", "customer-service", "developer-facing"] as const;
export type Style = (typeof STYLES)[number];

const FILLER = /\b(very|really|just|basically|actually|literally|simply)\b\s*/gi;

/** A deterministic cleanup: spacing, doubled punctuation, sentence capitals, filler words. Meaning and numbers are untouched. */
export function tidy(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(FILLER, "")
    .replace(/\s+([,.;:!?])/g, (_m, mark: string) => mark)
    .replace(/([!?.])\1+/g, (_m, mark: string) => mark)
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase())
    .trim();
}

/** Things that are worth a second look in a piece of copy, from its own words. */
export function copyNotes(text: string, banned: string[]): string[] {
  const notes: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const long = sentences.filter((s) => s.split(/\s+/).length > 30).length;
  if (long) notes.push(`${long} sentence${long === 1 ? " is" : "s are"} over 30 words and may be hard to read.`);
  if ((text.match(/!/g) ?? []).length > 1) notes.push("More than one exclamation mark may read as pushy.");
  if (/\b[A-Z]{4,}\b/.test(text)) notes.push("Words in all capitals may read as shouting.");
  for (const b of banned) if (new RegExp(b, "i").test(text)) notes.push(`Uses wording the business does not allow (matches ${b}).`);
  return notes;
}

/** The copy step: write from the facts if a model is available, otherwise clean and check what was given. */
export async function speakCopy(state: RunState): Promise<AgentOutput> {
  const source = state.mission.attachments.filter((a) => a.kind === "text").map((a) => a.value).join("\n\n").trim();
  const banned = state.domain.constraints.flatMap((c) => c.bannedPhrases ?? []);
  const factSheet = state.facts.filter((f) => f.label === "FACT").slice(0, 25);
  const sheetText = factSheet.map((f) => `- ${f.statement}`).join("\n");
  const notes: string[] = [];
  let text = "";
  let mocked = true;

  if (!source && !state.deps.writeCopy) {
    notes.push("No text was supplied to rewrite, and no writing model is configured, so nothing was written. The fact sheet below is what any copy must stay within.");
  } else if (state.deps.writeCopy) {
    const system = `You write for ${state.domain.name}. Use ONLY the facts listed. Do not add numbers, prices, dates, guarantees, or claims that are not in the facts or the original text. Keep the meaning.`;
    const prompt = `Task: ${state.mission.objective}\n\nOriginal text:\n${source || "(none supplied)"}\n\nFacts you may use:\n${sheetText || "(none)"}`;
    try {
      text = tidy(await state.deps.writeCopy(system, prompt));
      mocked = false;
    } catch {
      notes.push("The writing model did not answer, so nothing was written.");
    }
  } else {
    text = tidy(source);
    notes.push("No writing model is configured, so this is a cleanup and check of the text you gave, not a rewrite.");
  }
  if (text) notes.push(...copyNotes(text, banned));

  return {
    message: message({
      agent: "SPEAKER",
      task: "Write or check copy against the facts",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: source ? `${source.length} characters of original text` : "no original text",
      analysis: notes,
      assumptions: text && !mocked ? ["The wording is model-written and must be read by a person before it is used."] : [],
      unknown: source ? [] : ["The text to be rewritten."],
      recommendation: text ? "LOGIC will check every number and promise in this copy against the facts before it is offered." : "Supply the text to rewrite, or connect a writing model.",
      nextAgent: "LOGIC",
      confidence: text && !mocked ? "MEDIUM" : "LOW",
      payload: { copy: text ? { text, source, mocked } : null, factSheet: factSheet.map((f) => f.statement), numbersInSource: numbersIn(source) },
    }),
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Reports

const evidenceRefs = (ids: string[], facts: Map<string, Fact>) => ids.map((id) => (facts.get(id)?.label === "FACT" ? id : `${id}?`)).join(", ") || "none";

/** The decision as readable text. The style changes how much is shown, never what any line says. */
export function renderReport(d: Decision, opts: { style?: Style; title: string; facts?: Fact[]; route?: string }): string {
  const style = opts.style ?? "professional";
  const facts = new Map((opts.facts ?? []).map((f) => [f.id, f]));
  const limit = style === "concise" ? 3 : style === "executive" ? 5 : 100;
  const technical = style === "technical" || style === "developer-facing";
  const lines: string[] = [opts.title, "", d.summary];
  if (opts.route && (technical || style === "professional")) lines.push("", `Route: ${opts.route}`);

  const findings = d.tasks.filter((t) => t.severity !== "experiment");
  const ideas = d.tasks.filter((t) => t.severity === "experiment");
  if (findings.length) {
    lines.push("", style === "executive" ? "Priorities" : "What to do, in order");
    findings.slice(0, limit).forEach((t, i) => {
      lines.push(`${i + 1}. [${t.priority}] ${t.title}${t.approvalRequired ? " (needs your approval)" : ""}`);
      if (style !== "concise") lines.push(`   ${t.detail}`);
      if (technical) lines.push(`   evidence: ${evidenceRefs(t.evidence, facts)} | severity: ${t.severity} | owner: ${t.owner}`);
    });
    if (findings.length > limit) lines.push(`(${findings.length - limit} more not shown in this view.)`);
  } else lines.push("", "Nothing to do on the evidence read.");
  if (ideas.length && style !== "concise") {
    lines.push("", "Ideas worth testing (experiments: no evidence yet, not findings)");
    ideas.forEach((t) => lines.push(`- [${t.priority}] ${t.title.replace(/^Consider: /, "")}${t.approvalRequired ? " (needs your approval)" : ""}`));
  }

  if (d.disagreements.length) {
    lines.push("", "Where the agents disagreed");
    for (const x of d.disagreements) {
      lines.push(`- ${x.topic}: ${x.positions.map((p) => `${p.agent} said "${p.text}"`).join(" / ")}`);
      lines.push(`  ${x.resolution === "resolved" ? `Resolved for: ${x.decidedFor}. ` : "Not resolved: your decision is needed. "}Rule used: ${x.rule}`);
    }
  }
  if (style !== "concise") {
    if (d.reasoning.length && style !== "executive") lines.push("", "Why", ...d.reasoning.map((r) => `- ${r}`));
    if (d.risks.length) lines.push("", "Risks", ...d.risks.slice(0, technical ? 20 : 5).map((r) => `- ${r}`));
    if (d.rejected.length && technical) lines.push("", "Set aside", ...d.rejected.map((r) => `- (${r.agent}) ${r.text}: ${r.why}`));
  }
  if (d.nextActions.length) lines.push("", "Next", ...d.nextActions.slice(0, style === "concise" ? 2 : 6).map((n) => `- ${n}`));
  if (d.unknowns.length) lines.push("", "Not known (DATA NOT AVAILABLE)", ...d.unknowns.slice(0, style === "concise" ? 2 : 10).map((u) => `- ${u}`));
  lines.push("", `Confidence: ${d.confidence}`);
  return lines.join("\n");
}

/** SPEAKER's findings pass, before MASTER decides: what was found, in plain words, from the organized findings. */
export function speakFindings(state: RunState, style: Style = "professional"): AgentOutput {
  const rows = state.organized?.table ?? [];
  const facts = new Map(state.facts.map((f) => [f.id, f]));
  const top = rows.slice(0, style === "concise" ? 3 : 8);
  const text = [
    `${rows.length} finding${rows.length === 1 ? "" : "s"} were organized.`,
    ...top.map((r, i) => `${i + 1}. [${r.priority}/${r.severity}] ${r.text} (evidence: ${evidenceRefs(r.evidence, facts)}${r.verdict === "unchallenged" ? "; not yet challenged" : `; LOGIC: ${r.verdict}`})`),
    ...(state.facts.some((f) => f.label === "UNKNOWN") ? [`${state.facts.filter((f) => f.label === "UNKNOWN").length} thing(s) could not be read: DATA NOT AVAILABLE.`] : []),
  ].join("\n");
  return {
    message: message({
      agent: "SPEAKER",
      task: "Say the findings plainly",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${rows.length} organized findings`,
      analysis: [`Style: ${style}. Only what the findings say is written; nothing is added.`],
      recommendation: "MASTER decides what to do about these.",
      nextAgent: "NONE",
      confidence: "MEDIUM",
      payload: { text, style },
    }),
  };
}
