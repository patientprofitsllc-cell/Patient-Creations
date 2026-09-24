import type { Component, Domain, Mission } from "@/lib/universe/types";

/** The words in a request, lowercased and split, for matching against a component's keywords. */
const words = (text: string) => text.toLowerCase().match(/[a-z][a-z-]+/g) ?? [];

/**
 * Which parts of the problem a request touches. A command fixes the set outright; a free-text request is matched to the
 * domain's components by their keywords, and when nothing matches the whole business set is used (never a guess at a subset).
 */
export function selectComponents(domain: Domain, mission: Mission): Component[] {
  const fixed = mission.kind !== "ask" ? domain.components[mission.kind] : undefined;
  if (fixed && fixed.length) return fixed;
  const all = domain.components.business ?? Object.values(domain.components).flat().filter((c): c is Component => Boolean(c));
  const text = new Set(words(`${mission.objective} ${mission.goal}`));
  const scored = all
    .map((c) => ({ c, score: c.keywords.filter((k) => text.has(k.toLowerCase())).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.length ? scored.map((x) => x.c) : all;
}

/** Every topic the chosen components need data for. */
export const topicsOf = (components: { topics: string[] }[]) => [...new Set(components.flatMap((c) => c.topics))];
