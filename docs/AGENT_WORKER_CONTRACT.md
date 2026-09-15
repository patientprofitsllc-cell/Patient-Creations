# AI WORKER CONTRACT

Every AI worker must use this contract.

## Mission
State the single responsibility of the worker.

## Inputs
Define the Project Bible data, previous outputs, references, and task context.

## Tools
List only the tools necessary for the task.

## Constraints
Define what the worker may not change or access.

## Output
Return structured, machine-readable output whenever possible.

## Quality Standard
Define measurable acceptance criteria.

## Budget
Define maximum model/tool cost where supported.

## Time
Define maximum execution duration.

## Failure
Return explicit failure status rather than pretending success.

## Escalation
Escalate when:
- required input is missing
- output conflicts with Project Bible
- repeated failures occur
- permissions are insufficient
- task exceeds budget
- safety/security issue appears

## Rule
An agent must never silently invent completion.
