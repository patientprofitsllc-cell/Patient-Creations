import { confidenceFrom, idMaker, message } from "@/lib/universe/protocol";
import type { AgentOutput, Claim, RunState } from "@/lib/universe/types";

// IMAGE works out what visual assets are needed, why, where, and what each should say. It writes a specification a person or an
// image tool can follow. It does not generate anything, and every item is tied to something observed, never invented.

interface AssetNeed {
  needed: string;
  why: string;
  where: string;
  communicates: string;
  style: string;
  /** A ready-to-use brief. Marked as a specification: no image has been made. */
  spec: string;
  evidence: string[];
}

export function image(state: RunState): AgentOutput {
  const nextId = idMaker("IM");
  const style = state.domain.visualStyle;
  const imageFacts = state.facts.filter((f) => f.tags.includes("image") && f.tags.includes("observed"));
  const needs: AssetNeed[] = [];
  const claims: Claim[] = [];

  const pageOf = (key?: string) => state.snapshots.find((s) => key?.startsWith(`obs.${s.id}.`))?.name ?? "the page";
  const need = (n: Omit<AssetNeed, "style" | "spec">, severity: Claim["severity"], target: string) => {
    const spec = `IMAGE SPECIFICATION (not generated). Subject: ${n.needed}. Purpose: ${n.why} Placement: ${n.where}. It should communicate: ${n.communicates}. House style: ${style}.`;
    needs.push({ ...n, style, spec });
    claims.push({ id: nextId(), agent: "IMAGE", kind: "recommendation", text: `${n.needed}, because ${n.why.charAt(0).toLowerCase()}${n.why.slice(1)}`, target, stance: "fix", severity, evidence: n.evidence });
  };

  for (const f of imageFacts.filter((f) => f.label === "FACT" && f.signal === "negative")) {
    const page = pageOf(f.key);
    if (f.key?.endsWith(".images")) need({ needed: `A main image for ${page}`, why: "The page has no images, so it may feel like plain text to a first-time visitor.", where: `Near the top of ${page}`, communicates: "What the business does and who it is for, at a glance.", evidence: [f.id] }, "medium", "imagery");
    else if (f.key?.endsWith(".og")) need({ needed: `A share image for ${page}`, why: "No share image is set, so a link posted to social media or a message may appear without a picture.", where: "The page's share (og:image) setting", communicates: "The name and the one thing the business offers, readable when small.", evidence: [f.id] }, "medium", "imagery");
    else if (f.key?.endsWith(".alt")) claims.push({ id: nextId(), agent: "IMAGE", kind: "recommendation", text: `${f.statement} Alt text is a writing task, not a new image.`, target: "imagery", stance: "fix", severity: "medium", evidence: [f.id] });
    else if (f.key?.endsWith(".size")) claims.push({ id: nextId(), agent: "IMAGE", kind: "recommendation", text: f.statement, target: "imagery", stance: "fix", severity: "low", evidence: [f.id] });
  }

  // A request that is only about assets (no page examined) still gets a specification, with what is not known clearly marked.
  if (state.route.intent === "assets" && needs.length === 0) {
    const ask = state.mission.objective.trim();
    needs.push({ needed: ask, why: "This is what was asked for.", where: "Not specified in the request (UNKNOWN)", communicates: "Not specified in the request (UNKNOWN)", style, spec: `IMAGE SPECIFICATION (not generated). Request: "${ask}". Placement and message were not stated and must be confirmed. House style: ${style}.`, evidence: [] });
  }

  const known = imageFacts.filter((f) => f.label === "FACT").length;
  const unknown = state.facts.filter((f) => f.label === "UNKNOWN" && f.tags.includes("observed")).length;
  return {
    claims,
    message: message({
      agent: "IMAGE",
      task: "Work out which visual assets are needed",
      context: `${state.domain.name}: ${state.mission.goal}`,
      input: `${imageFacts.length} image observations`,
      analysis: [needs.length ? `${needs.length} asset${needs.length === 1 ? " is" : "s are"} needed, each tied to an observation.` : "Nothing observed calls for a new image.", "IMAGE writes specifications only. No image has been generated."],
      findings: claims,
      unknown: ["Whether existing images are good, on brand, or the right ones cannot be judged from markup. That needs a person or a screenshot review."],
      risks: [],
      recommendation: needs.length ? "Commission or generate the specified assets, then re-run this audit to confirm the gap is closed." : "No asset gap was observed.",
      nextAgent: "LOGIC",
      confidence: confidenceFrom(known, unknown) === "HIGH" ? "MEDIUM" : confidenceFrom(known, unknown),
      payload: { assets: needs },
    }),
  };
}
