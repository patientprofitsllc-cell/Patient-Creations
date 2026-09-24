# Agent protocol

## The standard message

Every agent answers in this shape, and a message missing any field is treated as a failure and retried (`isWellFormed`).

```
AGENT:           which agent
TASK:            what it was asked to do
CONTEXT:         the business and the goal
INPUT:           what it was given, in a line
ANALYSIS:        what it worked out
FINDINGS:        claims, each with a severity and the fact ids that support it
ASSUMPTIONS:     what it took as given
UNKNOWN:         what it could not find out
RISKS:           what could go wrong
RECOMMENDATION:  what it advises MASTER
NEXT_AGENT:      who should look at this next
CONFIDENCE:      LOW | MEDIUM | HIGH
```

Confidence is a statement about how much real evidence stands behind the work, not a probability. It is LOW with nothing read,
MEDIUM when about half is known, and HIGH only when most is known and enough was read. LOOK, IMAGE, and FEELINGS are never HIGH:
reading markup, or estimating a reaction, is a partial view.

## Facts

Every fact has an id (F1, O7), a label, a topic, a statement, a source, tags, and a signal.

| Label | Meaning |
|---|---|
| FACT | Read, and it says where from. |
| ASSUMPTION | Stated in the request, not verified. |
| UNKNOWN | Could not be read. Says what would be needed. The statement begins DATA NOT AVAILABLE. |
| CONFLICTING | Two sources disagree on the same thing. Neither is trusted. |

Ids beginning F come from GATHERER; ids beginning O were observed on a page.

## Claims

A claim is what an agent asserts: `agent`, `kind`, `text`, `target` (what it is about), `stance` (pursue, avoid, fix,
investigate, keep), `severity` (critical, high, medium, low, experiment), `evidence` (fact ids), and optionally `actions`
(what it would do), `numbers` (numbers it states, for LOGIC to check), and `rank` (the business's own order of importance).

**A claim with no evidence is UNSUPPORTED.** The only exception is an honestly labeled experiment.

## LOGIC's verdicts

| Verdict | Means | What MASTER does |
|---|---|---|
| valid | Supported by observed facts | Accepts |
| unsupported | Cites nothing | Sets aside, with the reason |
| insufficient | Only assumptions or unknowns behind it | Sets aside, lists what is missing |
| invalid | Cites something that does not exist, states a wrong number, or is circular | Sets aside |
| conflict | Contradicts another claim, or rests on conflicting facts | Settles by rule, or hands to the owner |
| needs-approval | Would take an action reserved for a person | Keeps as a draft awaiting approval |

## How disagreement is handled

Disagreement is not hidden. MASTER's report has a section for it, and the mission page shows both sides.

1. Where LOGIC would not accept another agent's claim, both positions are listed (for example THINKING and LOGIC).
2. Where two claims take opposite positions on the same subject, the side with at least **two more observed facts** wins,
   and the loser is listed under "Set aside".
3. Where the evidence is about equal, or the evidence itself conflicts, nobody wins: a task "Decide: ..." is created for the
   owner and marked as needing approval.
4. PERSPECTIVE reports tensions between viewpoints (for example, the owner wants upselling and the customer is wary of it) as
   trade-offs, not errors.

## Priorities

| Priority | From severity | Meaning |
|---|---|---|
| P0 | critical | Immediate or system-critical. Kept only when an observed fact stands behind it. |
| P1 | high | Important |
| P2 | medium | Normal |
| P3 | low | Optional |
| P4 | experiment | A future idea with no evidence yet |

Within one severity, the business's own order of importance decides (for Patient Creations, the earliest broken stage of the
customer's path comes first), then the amount of evidence.

## The words

- Anything not known is written **DATA NOT AVAILABLE**. It is never replaced with an estimate.
- Predictions about people use **likely, may, could, potentially**, and never a certainty. This is checked in code and by test.
- An idea with no evidence is called an **experiment**, in the report and in memory.
