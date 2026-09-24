# Patient Creations: application context

This is the result of the audit of the existing codebase that the Agent Universe was built against. It describes what is there today so the agents' domain file (`lib/universe/domains/patientCreations.ts`) matches reality. Nothing in the existing application was replaced.

## What the business is

Patient Creations is run by Patient Profits LLC. It sells cinematic AI websites, ads (one-time and monthly plans), NFC cards, software, and multi-agent systems to small businesses, starting with a flat-price one-page website. Every price comes from one file, `lib/pricing/catalog.ts`; nothing else may type a dollar amount, and a test enforces it.

## The stack

| Part | What it is |
|---|---|
| Frontend and backend | Next.js 14 (App Router), TypeScript, Tailwind |
| Database | Prisma on a Neon Postgres database, shared by development and production |
| Sign-in | NextAuth (credentials), roles CUSTOMER and ADMIN |
| Payments | Stripe Checkout and webhooks; a mock path exists only when Stripe is not configured |
| Email | Resend through `lib/email/provider.ts`; nothing sends until a domain is verified |
| Hosting | Netlify, deploying from the GitHub master branch |
| Tests | Vitest, over 900 tests, including route-by-route access rules |

## The customer flow

Awareness (homepage, `/audit`, partners, ads) → landing and offers (`/services`, product pages) → checkout (`/checkout`) with an optional 50% deposit on orders over the deposit line and optional pay-over-time methods, both in the catalog → confirmation with a step-by-step "what happens next" walkthrough → intake or kickoff call → production (agent pipeline with QA and perception checks) → private preview and approval, with a launch checklist and rollback for websites → delivery, balance invoice if a deposit was taken → care plan or monthly ads offer → partner and customer referral.

## What already runs on its own (and the Agent Universe must not duplicate)

| Existing piece | Where |
|---|---|
| Production pipeline agents for customer builds (research, strategy, copy, QA, perception, master editor) | `lib/agents/` |
| Patient AI, the customer's assistant in the portal | `lib/agents/patientAi*.ts` |
| The audit agent and the concierge | `lib/agents/auditAgent*.ts`, `concierge*.ts` |
| Follow-up emails, unfinished-checkout reminders | `lib/followups/`, `lib/reminders/` |
| The founder dashboard, bottleneck rule, morning brief | `lib/founder/`, `/admin/founder`, `/api/cron/founder-brief` |
| Revenue, CRM, partners, invoices | `lib/revenue/`, `lib/crm/`, `lib/partners/`, `lib/payments/` |

The Agent Universe sits above these. It does not run builds, talk to customers, or send email. It reads what these produce, and
its GATHERER uses the same loaders the founder dashboard uses, so the two never disagree about a number.

## Data the agents can read today

| Topic | Source | Note |
|---|---|---|
| acquisition, conversion, fulfillment, retention, expansion | The founder dashboard's bottleneck rule | Each stage says whether there is enough data to judge it |
| cash | Month-to-date cash, monthly plans, the monthly goal; open and overdue invoices | The goal is labeled a target, not a forecast |
| systems | Failed agent runs, QA failures, failed emails, stuck builds; which services are switched on | Only email, mailing address, daily jobs, and card payments count as problems when off |
| experience | Reviews, messages waiting for the owner | |
| funnel | Landing, offer, checkout, intake, and audit events over 30 days | A step is called a leak only where at least 5 entered and 10% or fewer continued |
| catalog | Active products: price, delivery estimate, description | |
| partners | Applications waiting, commissions ready to pay | |
| pages | The home, services, audit, and checkout pages, examined by LOOK, IMAGE, FEELINGS | Markup only |

## What the agents cannot see yet

- **Traffic sources and ad spend**, beyond what the founder dashboard records. If spend is not entered there, it is not known.
- **Product margins**, unless the owner has entered costs on the profitability page.
- **How pages actually render.** LOOK reads markup; it cannot see colors, spacing, or imagery.
- **Real customer sentiment** beyond ratings and messages waiting.
- **Competitors and the market.** No research tool is connected.

Each of these is reported as DATA NOT AVAILABLE when it matters, never estimated.

## Rules the owner has set, held as constraints

- Only the owner changes prices, issues refunds, changes payment settings, sends mass email, spends money, changes infrastructure, or deletes customer data.
- Customer files, logos, and photos are never stored on the site.
- No wording may guarantee rankings, traffic, leads, sales, ratings, or reviews.
- Customer-facing wording says Patient Profits LLC, not a personal name.
- Numerology and symbolic frameworks are never used to predict or prioritize.

## Known facts about the environment at the time of the build

- The public domain `patientcreations.com` did not answer from the build machine; the Netlify address did. Set `UNIVERSE_SITE_URL` if the domain is not serving the site.
- The email domain is not verified, so no email leaves the app.
- `CRON_SECRET` was not set on the server, so no scheduled job runs.
