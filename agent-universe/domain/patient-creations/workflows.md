# Patient Creations: workflows

How the owner uses the Agent Universe, and what happens each time. Everything is on **Admin, then Agents**.

## Every morning: "What needs attention today?"

Run **Daily audit**. It is the lightest route: GATHERER, ORGANIZER, LOGIC, SPEAKER (four of ten agents).

1. GATHERER reads systems, customers waiting, money, and leads and partners.
2. ORGANIZER turns every observed problem into a claim, so nothing observed is lost.
3. LOGIC challenges them.
4. SPEAKER writes the answer. MASTER records the tasks.

Nothing in it is invented. If a source cannot be read, the report says DATA NOT AVAILABLE for it.
It can run by itself once a day, but only after you set a scheduler, `CRON_SECRET`, and the AUTONOMOUS level (`docs/deployment.md`).

## Every week: the review

Run **Weekly review**: the current constraint, the month against the goal, and how customers are doing. Seven agents.

## When you have a question

Type it into **Ask MASTER**. MASTER works out which agents it needs and tells you (on the mission page) which it woke and which it left asleep. Examples:

- "Should we introduce a subscription?" is a decision, so it gets three options (pilot it, commit, wait) and a recommendation. It will not simply say yes.
- "Rewrite this product description" writes nothing without a text, and without a model only cleans and checks the text you give it. Anything a model writes is checked against the facts first.
- "What's wrong with our checkout?" looks at the page and how it may feel to a buyer.

## What you do with the answer

1. Read the report. The first items are the most important, in the order of the customer path.
2. **Pending approvals** shows anything that would change a price, send email, spend money, or otherwise reach outside. Approve or reject.
3. Work the **task board**. Press **Start** when you begin, **Done** when you finish, and say what happened.
4. **What happened is remembered.** The agents see your results in later runs, so they learn what worked.

## Who does what

| You | The agents |
|---|---|
| Decide, approve, do the work | Read, analyze, rank, draft, record tasks |
| Change prices, send email, spend money | Never. They can only draft it for you |
| Say what happened when a task is done | Remember it |
| Choose how far they may go, and pause them | Stay within it |

## When something goes wrong

A failed agent is retried once, then covered by another agent if possible, and the run is marked partial with the failure at
the top of the risks. If anything urgent is found you get an admin notification. The audit trail on the Agents page and the mission page shows every step, with timing.
