# Patient Creations: objectives

These are held in the domain file (`objectives`) and are what a mission is judged against. They are the owner's, not the agents'.

1. **Reach the monthly revenue goal** set in `lib/pricing/catalog.ts`, by working on the current biggest constraint.
2. **Get every paid customer through intake, preview, approval, and launch** without confusion or delay.
3. **Keep customers on a plan** and offer them the next fitting step.
4. **Keep the website, checkout, and follow-up honest, clear, and working.**

## The rule the agents use to rank problems

The business works on its biggest constraint. The founder dashboard finds it by walking the customer's path from the top and
stopping at the first broken stage:

`getting found` → `turning interest into customers` → `delivering what was sold` → `keeping customers` → `selling them more`

The Agent Universe uses the same order. It is stored as each lever's `rank` in the domain file and as the rank on each
bottleneck fact. Within one severity, the earliest broken stage is listed first, so a cosmetic problem on a page never outranks
"not enough people are arriving". A stage with too little data to judge is reported as such and is not called a problem.

## What "important" means here

| Severity | In this business |
|---|---|
| critical (P0) | Kept only when an observed fact stands behind it. None of the current levers is critical on its own. |
| high (P1) | A broken stage of the customer path; a service the business depends on being off; a customer waiting for an answer |
| medium (P2) | Overdue money, page and trust gaps, catalog gaps, a month behind its goal, a stale lead |
| low (P3) | Partner applications waiting, image gaps |
| experiment (P4) | An idea with no evidence yet: a customer referral month, a bundle price test, a local business partnership |

Two of the three experiments would spend money or change a price, so they are always drafts that need the owner's approval.
