# Architecture

## The layers

```
                     the owner  (final authority)
                          |
        /admin/universe   |   /api/admin/universe/*    /api/cron/universe (optional)
                          v
   commands.ts   ASK_MASTER, AUDIT_*, ANALYZE_*, SHOW_*, ...   (each checked against the permission level)
                          |
                          v
   core/orchestrator.ts   MASTER
        |   route.ts decides which agents this request needs
        |   agents run in order; agents in one step run at the same time
        |   core/master.ts decides;  core/executor.ts acts and verifies
        v
   agents/*   DIVIDER GATHERER ORGANIZER PERSPECTIVE LOOK IMAGE FEELINGS THINKING LOGIC SPEAKER
        |         they know nothing about any one business; they read the Domain
        v
   domains/patientCreations.ts   the ONLY place that knows the business
        |   probes read real records:  founder dashboard loader, funnel events, invoices, products
        |   surfaces are pages LOOK examines (through the SSRF-safe fetcher)
        v
   store/   UniverseStore  ->  InMemoryStore (tests, simulations)  |  prismaStore (production)
```

## The loop

Every request follows the same loop. MASTER does not run every step for every request: the route says which agents run.

| Step | What happens | Who |
|---|---|---|
| OBSERVE | Read the request; recall earlier decisions and results on the subject | MASTER |
| ROUTE | Choose the agents; record the ones skipped and why | MASTER |
| (look) | Fetch the pages once, turn what is seen into facts that name the page | MASTER, for LOOK, IMAGE, FEELINGS |
| DIVIDE | Break the objective into components | DIVIDER |
| GATHER | Read real data, label it | GATHERER |
| THINK / ANALYZE | Options, viewpoints, what is visible, likely reactions, asset gaps (in parallel) | THINKING, PERSPECTIVE, LOOK, FEELINGS, IMAGE |
| CHALLENGE | Test every claim against the evidence | LOGIC |
| ORGANIZE | Merge, rank, and keep what nobody claimed | ORGANIZER |
| SPEAK | Say the findings plainly | SPEAKER |
| DECIDE | Weigh claims and challenges; settle or surface disagreements | MASTER |
| EXECUTE | Record tasks, save the decision, notify the owner if urgent (inside permission) | MASTER |
| VERIFY | Read each action back before calling it done | MASTER |
| LEARN | Remember the decision; results are remembered when the owner reports them | MASTER |

The spec lists GATHER before DIVIDE in the loop and DIVIDER before GATHERER in the delegation protocol. This build follows
the delegation protocol (DIVIDER first, because the plan decides what is worth gathering, which keeps cost down) and
puts LOGIC after the claim-making agents rather than beside them, because it cannot challenge a claim that does not exist yet.

## Routing (the cost-control rule)

`route.ts` classifies a request by its words and what came with it (an attached page or text means something is to be looked
at), then picks a route. Commands with a fixed shape (AUDIT_WEBSITE, ANALYZE_GROWTH, RUN_DAILY_AUDIT) use their own route.
A route is a list of steps; an inner list runs at the same time. It always ends in MASTER. It records every agent left
asleep with the reason. The daily audit is deliberately light (GATHERER, ORGANIZER, LOGIC, SPEAKER).

MASTER may add one mind mid-run, once: if LOGIC finds evidence missing and no one gathered any, it wakes GATHERER and asks
LOGIC to check again. It cannot do this twice.

## Memory

Seven levels, six kinds. The rule that matters: **an assumption never quietly becomes a fact.**

| Level | What it holds | Stored |
|---|---|---|
| SHORT_TERM | The current task | In memory only, gone when the task ends |
| WORKING | The current project or session | Database |
| LONG_TERM | Lasting knowledge about the application | Database |
| DOMAIN | Knowledge about the business | Database |
| AGENT | What one agent has learned | Database |
| DECISION | Important decisions and why | Database |
| RESULT | What actually happened after an action | Database |

Kinds: FACT (must name a source), DECISION, PREFERENCE, ASSUMPTION (may not claim evidence), EXPERIMENT, RESULT.
`promote()` is the only way from ASSUMPTION to FACT, and it needs a source and evidence and leaves the assumption on record as
superseded. Decisions are recalled at the start of a later mission on the same subject. When the owner finishes a task and says
what happened, that becomes a RESULT.

## Storage

Everything is keyed by `domain`.

| Table | Holds |
|---|---|
| `UniverseMission` | One request: the route, the whole result, the report |
| `UniverseTask` | The task board |
| `UniverseMemory` | The seven levels of memory |
| `UniverseActivity` | The audit trail: one row per agent step |
| `AppSetting` (existing) | The permission level, the pause switch, and any grant, under `universe.<domain>.*` |

## The event-driven part

`core/eventManager.ts` maps events to missions. Only `daily_audit`, `weekly_review`, and `monitoring_alert` start one; every
other event is recorded and does nothing more, on purpose. A scheduled or event-driven run needs the AUTONOMOUS level, is
refused while paused, runs each daily command at most once a day, and is capped at four autonomous runs a day. Nothing in
the running site calls it: see `deployment.md` for what would.

## What runs without a model

Everything, including the eleven agents. They reason over real data with fixed, testable rules. A writing model is an
optional add-on for SPEAKER only (`AI_ENABLED=true` plus a key), and whatever it writes is checked by LOGIC before it is shown.
This is a deliberate choice: an agent that cannot be tested cannot be trusted with a business.
