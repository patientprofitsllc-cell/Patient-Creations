# The Agent Universe

A small organization of specialized minds, led by one, that reads a business's real records and pages, argues with itself,
and hands its owner a ranked, evidence-backed plan. It is built so that **the intelligence layer is universal and only the
business is swapped**. Patient Creations is the first business plugged in.

> A new domain + a new objective + the same Agent Universe, without rebuilding the intelligence layer.

## The one idea that matters most

**MASTER wakes only the minds a request needs.** Waking all eleven for every question would be slow, expensive, and noisy.

| Ask | Minds woken |
|---|---|
| "Look at this screenshot and tell me what's wrong." | LOOK → FEELINGS → PERSPECTIVE → ORGANIZER → MASTER |
| "Should we introduce a subscription?" | GATHERER → PERSPECTIVE, THINKING, FEELINGS → LOGIC → ORGANIZER → MASTER |
| "Rewrite this product description." | GATHERER → SPEAKER → LOGIC → MASTER |
| "What needs attention today?" | GATHERER → ORGANIZER → MASTER |
| "Analyze the business and find what to investigate." | The full chain, all eleven |

LOGIC runs right after the agents whose claims it must challenge, not beside them. Everything left asleep is listed with the
reason, on the owner's mission page. The route table is `lib/universe/route.ts`.

## The eleven

| Agent | What it is for | Spec |
|---|---|---|
| MASTER | Decides. Routes, weighs, resolves disagreements, records, and verifies. | [master.md](agents/master.md) |
| DIVIDER | Breaks a big objective into parts and dependencies. | [divider.md](agents/divider.md) |
| GATHERER | Reads what is really available, and labels it FACT, ASSUMPTION, UNKNOWN, or CONFLICTING. | [gatherer.md](agents/gatherer.md) |
| ORGANIZER | Structures and prioritizes. | [organizer.md](agents/organizer.md) |
| PERSPECTIVE | Sees the facts through each viewpoint involved. | [perspective.md](agents/perspective.md) |
| LOOK | Reports what is visible on a page. | [look.md](agents/look.md) |
| IMAGE | Plans visual assets and writes their specifications. | [image.md](agents/image.md) |
| FEELINGS | Estimates how people are likely to react. | [feelings.md](agents/feelings.md) |
| THINKING | Explores possibilities and strategies. | [thinking.md](agents/thinking.md) |
| LOGIC | Tests every claim against the evidence. Not the same as THINKING. | [logic.md](agents/logic.md) |
| SPEAKER | Says it clearly without changing what it means. | [speaker.md](agents/speaker.md) |

## Where everything is

The spec asked for an `/agent-universe/` tree. This project already has a code layout, so the specification lives here and
the code lives beside the rest of the app, rather than a second copy of anything.

| The spec's folder | Where it is in this project |
|---|---|
| `agents/*.md`, `UNIVERSAL_AGENT_TEMPLATE.md` | `agent-universe/agents/` (here) |
| `docs/` | `agent-universe/docs/` (here) |
| `domain/patient-creations/*.md` | `agent-universe/domain/patient-creations/` (here) |
| `core/` orchestrator, task, memory, event, permission, audit managers | `lib/universe/core/` |
| the agents themselves | `lib/universe/agents/` |
| the routing rules | `lib/universe/route.ts` |
| the domain plug-in for Patient Creations | `lib/universe/domains/patientCreations.ts` |
| commands | `lib/universe/commands.ts` |
| `memory/`, `tasks/`, `results/`, `logs/` | database tables `UniverseMemory`, `UniverseTask`, `UniverseMission`, `UniverseActivity` (see `docs/architecture.md`) |
| the master dashboard | `/admin/universe` (the "Agents" tab) |

Every file in `agents/` is generated from one table (`scripts/universe/write-agent-docs.js`), and a test checks that each one
has all thirteen sections and that each names a code file that exists.

## Running it

- **From the dashboard:** Admin, then the **Agents** tab. Pick a command, add words if it takes them, and press Run.
- **The final test from the build spec, against your real records, writing nothing:**

```bash
NODE_OPTIONS=--use-system-ca npx tsx scripts/universe/final-test.ts
```

- **Daily and weekly runs on their own:** off until you turn them on. See `docs/deployment.md`.

## How to add a new domain

A domain is one file implementing `Domain` (`lib/universe/types.ts`). Nothing in `lib/universe/agents` or `lib/universe/core`
changes.

1. Copy `lib/universe/domains/patientCreations.ts` to `lib/universe/domains/<name>.ts`.
2. Fill in, for the new business: `id`, `name`, `description`, `objectives`; `stakeholders` (who is affected, what each wants and is wary of); `components` (how each kind of request breaks down); `probes` (how to read real data; a probe that cannot read returns `null` or throws, and the agents report DATA NOT AVAILABLE); `surfaces` (pages to look at); `levers` (what the business can do about a problem, with its own severity and order); `constraints` (actions no agent may take, and wording it may not use); `visualStyle`.
3. Add a small factory next to `lib/universe/domains/instance.ts` that calls `createUniverse` with the new domain.
4. Run the test suite. `tests/unit/universeHelpers.ts` shows a complete made-up domain (a gym) in about 70 lines.

Memory, tasks, and the audit trail are keyed by `domain`, so two businesses can share the same tables and never see each other.

## How to add a new agent

1. Write `agents/<name>.md` from `agents/UNIVERSAL_AGENT_TEMPLATE.md`.
2. Add the name to `AGENT_IDS` in `lib/universe/types.ts`.
3. Write `lib/universe/agents/<name>.ts` exporting a function `(state: RunState) => AgentOutput`. Return a standard message built with `message()` from `protocol.ts`, and make every claim cite fact ids.
4. Register it in `agentTable` in `lib/universe/agents/index.ts`.
5. Say when to wake it: add it to the routes in `lib/universe/route.ts`, and write the reason it is left asleep in `WHY_NOT`.
6. Add a test. The test that scans `lib/universe` outside `domains/` fails if the agent names any one business.
