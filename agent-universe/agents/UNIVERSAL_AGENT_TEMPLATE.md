# UNIVERSAL AGENT TEMPLATE

Copy this to `agents/<name>.md`, fill in every line, then add the agent in code (see "How to add a new agent" in `../README.md`).
An agent's identity is a **cognitive function**, never an industry. If the name of your agent contains a business or a trade
("Marketing Agent", "Pricing Bot"), it is the wrong shape: describe the thinking it does, and let the domain supply the subject.

```
NAME:
  One word, capitals, a function of thought (LOOK, LOGIC), not a department.

ROLE:
  One sentence: what this mind is for.

MISSION:
  What it must achieve on every task it takes, in a sentence a stranger could check.

PRIMARY_FUNCTION:
  The one thing it does that no other agent does.

SECONDARY_FUNCTIONS:
  Anything else it does, only where it follows from the primary one.

INPUTS:
  What it reads from the shared run state (facts, claims, snapshots, plan, the mission, the domain). Never a business name.

OUTPUTS:
  What it returns: a standard message, plus any facts, claims, challenges, or plan it adds.

CONTEXT:
  What it takes from the domain (stakeholders, components, probes, surfaces, levers, constraints, visual style),
  never hard-coded.

TOOLS:
  Everything it may call, and nothing else: readers, fetchers, a model, a store.

DECISION_RULES:
  The fixed rules it follows, written so a test can check each one.

FAILURE_MODES:
  How it can go wrong, and what it does when it does (it must fail loudly and be retried by MASTER, never invent a result).

LIMITATIONS:
  What it cannot do, stated plainly, and what it says when asked to do it.

HANDOFF_PROTOCOL:
  Who it hands to next (NEXT_AGENT), and what it leaves in the shared state for them.

MEMORY_REQUIREMENTS:
  What it needs recalled, and what it writes (only through MASTER's memory manager, never directly).

EXAMPLE_TASKS:
  Two or three real requests, one where it is the right agent and one where it should be left asleep.
```

## Checklist before an agent is added

- [ ] It answers in the standard message and passes `isWellFormed`.
- [ ] Every claim it makes cites the id of a fact that supports it (or is labeled an experiment).
- [ ] It says what it does not know, and uses the words DATA NOT AVAILABLE for a gap.
- [ ] It never mentions any one business. The test that scans `lib/universe` outside `domains/` will fail if it does.
- [ ] It works on the made-up business used in the tests as well as on Patient Creations.
- [ ] MASTER's route table says when to wake it, and what to say when it is left asleep.
