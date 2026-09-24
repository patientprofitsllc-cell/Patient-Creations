import type { Deps, Domain, PageResult, Probe, ProbeResult } from "@/lib/universe/types";
import { InMemoryStore } from "@/lib/universe/store/memoryStore";
import type { UniverseCtx } from "@/lib/universe/core/orchestrator";

// A made-up business used only by the tests. It has nothing to do with Patient Creations, which is the point: the same agents
// must work on it without a line of their own changing.

export const GOOD_PAGE = `<html lang="en"><head><title>Iron Works Gym</title><meta name="viewport" content="width=device-width"><meta name="description" content="A friendly neighborhood gym with classes for every level."><link rel="icon" href="/f.ico"><meta property="og:image" content="/og.png"></head>
<body><nav><a href="/">Home</a><a href="/classes">Classes</a><a href="/join">Join</a></nav><h1>Get strong, your way</h1>
<p>Classes for every level. Reviews from members say it feels like a community. Call (555) 123-4567.</p>
<a href="/join">Join now</a><a href="/privacy">Privacy policy</a><img src="/a.jpg" alt="Members in a class" width="600" height="400"><p>Memberships from $49 a month.</p></body></html>`;

export const BAD_PAGE = `<html><head></head><body><a href="/a">Buy now</a><a href="/b">Order today</a><a href="/c">Start now</a><a href="/d">Book a call</a><a href="/e">Sign up</a><a href="/f">Get started</a>
<form><input name="a"><input name="b"><input name="c"><input name="d"><input name="e"><input name="f"><input name="g"></form><img src="/x.jpg"><p>${"word ".repeat(200)}</p></body></html>`;

export function probe(id: string, topic: string, result: ProbeResult | ProbeResult[] | null | (() => Promise<never>)): Probe {
  return { id, topic, need: `The ${id} numbers`, read: typeof result === "function" ? result : async () => result };
}

export interface GymOptions {
  pages?: Record<string, string>;
  probes?: Probe[];
  fetchError?: boolean;
}

export function gymDomain(o: GymOptions = {}): Domain {
  const pages = o.pages ?? { "https://gym.example/": GOOD_PAGE, "https://gym.example/join": BAD_PAGE };
  const fetchPage = async (url: string): Promise<PageResult> => {
    if (o.fetchError) throw new Error("network down");
    const html = pages[url];
    return html === undefined ? { status: 404, html: "", finalUrl: url, bytes: 0 } : { status: 200, html, finalUrl: url, bytes: html.length };
  };
  return {
    id: "gym",
    name: "Iron Works Gym",
    description: "A neighborhood gym selling memberships and classes.",
    objectives: ["Grow membership"],
    stakeholders: [
      { id: "member", name: "Member", wants: ["price", "trust", "clarity"], wary: ["upsell", "contract"] },
      { id: "owner", name: "Owner", wants: ["revenue", "upsell", "retention"], wary: ["cost", "churn"] },
    ],
    components: {
      business: [
        { id: "acq", title: "Getting members", question: "How do people find the gym?", topics: ["acquisition"], keywords: ["members", "traffic", "leads"] },
        { id: "ret", title: "Keeping members", question: "Do members stay?", topics: ["retention"], keywords: ["churn", "retention", "cancel"], dependsOn: ["acq"] },
        { id: "site", title: "The website", question: "Does the site work?", topics: ["presentation", "conversion", "trust"], keywords: ["website", "site"] },
      ],
      website: [{ id: "site", title: "The website", question: "Does the site work?", topics: ["presentation", "conversion", "trust"], keywords: ["website"] }],
      daily: [{ id: "today", title: "Today", question: "What needs attention?", topics: ["retention", "acquisition"], keywords: [] }],
    },
    probes: o.probes ?? [
      probe("members", "acquisition", { key: "members.new30", statement: "12 new members joined in the last 30 days.", value: 12, tags: ["revenue"], signal: "neutral", source: "the member database" }),
      probe("churn", "retention", { key: "members.churn30", statement: "9 members cancelled in the last 30 days.", value: 9, tags: ["churn", "retention"], signal: "negative", source: "the member database", severity: "high" }),
    ],
    surfaces: [
      { id: "home", name: "Home page", url: "https://gym.example/", expects: ["contact"] },
      { id: "join", name: "Join page", url: "https://gym.example/join", expects: ["price", "form", "contact"] },
    ],
    levers: [
      { id: "winback", title: "Win back cancelled members", component: "retention", triggerTags: ["churn"], when: "negative", rationale: "Cancelled members already know the gym.", expectedEffect: "Could recover some members at low cost.", dependencies: ["A list of who cancelled and why"], risks: ["May feel pushy"], secondOrder: ["Reasons for cancelling become visible"] },
      { id: "referral", title: "Member referral month", component: "acquisition", triggerTags: [], when: "any", rationale: "Members bring friends.", expectedEffect: "Might add members without ad spend.", dependencies: [], risks: ["Free months cost money"], secondOrder: [], experiment: true, actions: ["spend_money"] },
    ],
    constraints: [
      { id: "no-price", text: "Prices are never changed by an agent.", forbidsActions: ["change_pricing"] },
      { id: "no-promises", text: "No promise of results.", forbidsActions: [], bannedPhrases: ["guaranteed results", "lose \\d+ pounds"] },
    ],
    visualStyle: "bright, energetic, real members",
    fetchPage,
  };
}

export function makeCtx(o: GymOptions & { deps?: Deps } = {}): UniverseCtx & { store: InMemoryStore } {
  const store = new InMemoryStore();
  return { store, domain: gymDomain(o), deps: o.deps ?? {}, probeTimeoutMs: 500, snapshotTimeoutMs: 500, agentTimeoutMs: 2000 };
}
