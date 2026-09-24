# Security and safety

## Who can do what

| Surface | Who | How it is enforced |
|---|---|---|
| `/admin/universe` and the mission pages | The owner | The admin layout redirects anyone who is not an admin |
| `POST /api/admin/universe/command` | The owner | `requireAdmin()`; 401 signed out, 403 not the owner |
| `POST /api/admin/universe/tasks/[id]` | The owner | Same, and the task id must look like an id |
| `POST /api/admin/universe/settings` | The owner | Same. Each change is read back before it is reported. |
| `/api/cron/universe` | A scheduler | A `CRON_SECRET` of 24 or more characters, compared in constant time. Without it the address answers 404, so it does not reveal that it exists. |

A test (`tests/unit/routeGuards.test.ts`) requires every API route to declare which of these it is and checks that the file
contains the matching check. A new route with no decision fails the build.

The owner cannot use the command route to pretend to be the scheduler: whatever the request says, the run is recorded as started
by a person. The scheduler cannot use it at all.

## What the agents may do

Six permission levels: **READ, ANALYZE, RECOMMEND, DRAFT, EXECUTE, AUTONOMOUS.** The default is EXECUTE. The level is stored
per business and changed only by the owner.

| Level | Adds |
|---|---|
| READ | Looking at what is stored |
| ANALYZE | Running audits and analyses |
| RECOMMEND | Producing recommendations |
| DRAFT | Preparing work for approval |
| EXECUTE | Recording tasks and decisions on their own (internal bookkeeping) |
| AUTONOMOUS | Starting work without being asked, from a schedule or an event |

Below EXECUTE a run still produces its decision, but tasks are shown as drafts and nothing is recorded. A run that starts on its
own is refused unless the level is AUTONOMOUS and autonomy is not paused. **Pause** is a single switch that stops everything
that starts by itself.

### Critical actions

Changing pricing, deleting customer data, issuing a refund, sending mass communication, changing production infrastructure,
spending money, and changing payment configuration are critical. **None has an executor**: an agent can only draft it, as a
task that needs the owner's approval. Even if one were built later, it would need an explicit grant per action, and without
one it stays a draft.

The only actions an agent performs are: record a task, save to memory, and notify the owner about something urgent. Each is
checked against the permission rules first, and read back afterward. An action is never reported as done because the call
returned.

## Honesty rules (enforced in code, and tested)

- **No fabrication.** A fact must name its source. A source that cannot be read is DATA NOT AVAILABLE, never a guess. With nothing
  read, MASTER offers no conclusion and no tasks.
- **No overclaiming.** A claim with no evidence is set aside. A number a claim states is checked against the fact it cites. A
  claim is critical (P0) only when an observed fact stands behind it.
- **No certainties about people.** Predictions are worded as possibilities.
- **No unverified success.** An action counts as done only after it is read back.
- **Guaranteed wording is refused** in copy: no promises of rankings, traffic, leads, sales, ratings, or reviews.
- **No personal name** in customer-facing wording, and **no numerology** or symbolic framework used to predict or prioritize.
- **Copy is checked.** Every number in it must appear in the facts or the original text, or it is rejected and not shown.

## Secrets and personal information

- The audit trail is cleaned before it is written: connection strings, API keys and secrets, bearer tokens, long token-like
  strings, email addresses, and phone numbers are replaced. Nothing is longer than 2,000 characters.
- The data sources return counts and totals, never customer names, emails, or messages.
- An error from a data source is never copied into a fact. The agents say the data is not available, and the audit trail keeps
  the cause, cleaned.
- Pages are fetched with the app's SSRF-safe fetcher, which refuses private and internal addresses at connection time.

## Failure

An agent that fails is retried once. If it fails again MASTER records it as escalated, asks a fallback agent to cover what it
can if there is one, marks the run PARTIAL, adds the failure to the risks in the report, and notifies the owner. It never loops:
there are two attempts and one fallback, and one extra mind may be added, once, per run.

## What this does not protect against

- A wrong source produces a wrong fact, and LOGIC will accept it. LOGIC checks that a claim is supported, not that a fact is true.
- The route is chosen from the words of the request. The route is shown so a mistake can be seen and corrected.
- Anyone who can sign in as the owner can change the permission level. Protect the admin password.
