# Implementation Status

**⚠️ Live Stripe is configured.** `.env` currently holds a real `sk_live_...` key —
checkout is NOT in mock mode. Any completed purchase on this site charges a real
card. Do not assume mock-mode behavior (e.g. in tests or demos) without first
checking `STRIPE_SECRET_KEY` in `.env`.

**Brand:** this app was rebranded from a generic "AI Creation Studio" exercise to
**Patient Creations** (Trenton, Patient Profits — Global), matching the real
site the user provided at `C:\Users\trent\Downloads\the-digital-master.html`. "The
Digital Master" is kept on as the brand's tagline/theme (hero subtitle, footer
byline, admin header eyebrow) rather than the company name — domain:
**patientcreations.com** (registered via Cloudflare). The
backend/orchestrator architecture below was originally built against
`AI_CREATION_STUDIO_MASTER_IMPLEMENTATION.md`, `VISUAL_ASSET_BIBLE.md`,
`AGENT_WORKER_CONTRACT.md`, and `QA_CHECKLIST.md` (still in this folder verbatim) —
those principles still apply, just under the real brand, catalog, and gold/dark
visual system. See `prisma/seed.ts` for the live product catalog (Cinematic
Website, AI Software/App, Multi-Agent System, Cinematic Ad, Rental Listing Film,
Payments Setup, Lead Engine, Strategy Session, Custom Build, Basic Package) with
Core/Signature/Flagship tier pricing (1x/1.6x/2.5x, rounded to $50).

It runs end-to-end with zero external accounts (aside from the live Stripe key
now present), and every remaining external integration has a documented
one-step path to going live.

## Real (not mocked)

- Full Prisma schema covering every entity in the spec's DATABASE section.
- Auth (NextAuth, credentials, bcrypt-hashed passwords), customer vs admin roles.
- Server-computed pricing — the client only ever sends product IDs; total is computed
  and re-validated server-side (`lib/payments/pricing.ts`).
- The state machine (`lib/workflows/stateMachine.ts`) — transitions are validated
  server-side against the pipeline order; nothing client-settable.
- Real progress calculation (`lib/workflows/progress.ts`) — percent is derived from
  actually-completed `ProjectTask` rows, never a timer.
- The Orchestrator (`lib/agents/orchestrator.ts`) — decomposes a paid order into tasks,
  runs every specialized agent in dependency order, drives the QA/Perception/Revision
  retry loop with `MAX_RETRIES = 5`, and escalates to `EXCEPTION` (preserving all logs)
  rather than looping forever.
- The Agent Contract (`lib/agents/contract.ts`) — every agent run is persisted
  (`AgentRun`/`AgentOutput`), time-boxed, and returns an explicit
  succeeded/failed/escalated result. No agent can silently invent completion.
- QA Agent (`lib/agents/qa.ts`) — runs real structural checks against the project's own
  DB records (bible present, no failed agent runs, core phases complete, design/offer
  defined) rather than rubber-stamping.
- Perception Agent (`lib/agents/perception.ts`) — scores 9 dimensions against a
  numeric pass threshold; a project cannot be approved on vibes alone.
- Master Editor (`lib/agents/masterEditor.ts`) — the single approve/revise/escalate
  decision point, fully derived from the latest QA + Perception reports.
- Referral system — code generation, click tracking, the full commission state machine
  (`CLICKED → … → PAID`), a 14-day pending period, and an explicit self-referral guard
  (`lib/referrals/fraud.ts`) that rejects rather than silently zeroing out.
- Event log — every event in the spec's EVENT-DRIVEN ARCHITECTURE list is written to
  `AuditLog` + `AnalyticsEvent` via `lib/analytics/events.ts`.
- Email trigger points fire at the right lifecycle moments (purchase, delivery, review
  request, etc.) via `lib/email/provider.ts`; every send is persisted to `EmailEvent`.
- Admin command center — business/production/AI/system-health widgets read live
  aggregates from the DB, including a stuck-project/exception list.
- Admin CRM (`/admin/crm`) — searchable customer list, per-customer 360° view (spend,
  orders, projects, referral stats, reviews, private notes via `CustomerNote`), and a
  unified activity timeline built by `lib/admin/customerActivity.ts`.
- Sessions & Logs (`/admin/logs`, `/admin/logs/session/[id]`) — filterable global event
  log plus a full per-project agent-run/QA/Perception/event replay.
- Public build-status pages (`/status/[token]`, no login) — every project gets a random
  token (`lib/projects/statusToken.ts`) at creation; the link is embedded in every
  project-related email (purchase, QA entry, delivery, review request) via
  `lib/email/templates.ts`'s `statusLine()`. Admins post plain-language updates from a
  project's session page (optionally emailing the customer) via `ProjectUpdate` —
  this is the fix for customers not knowing how close a build is to completion.

## Stubbed, with a one-step path to real

| Subsystem | Mock behavior | To go live |
|---|---|---|
| AI model calls (`lib/ai/callModel.ts`) | Returns structured placeholder JSON | Set `ANTHROPIC_API_KEY` |
| Payments (`lib/payments/stripe.ts`) | "Simulate Payment" button runs the exact same server-side order/project code | Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` |
| Email delivery (`lib/email/provider.ts`) | Logs to console + `EmailEvent` table | Set `RESEND_API_KEY` |
| Database | SQLite file, zero setup | Set `DATABASE_URL` to Postgres and change the `provider` in `prisma/schema.prisma` |
| Visual assets | CSS/gradient/canvas-particle system per the Visual Asset Bible | Generate real hero/character/gallery assets (see the prompt library referenced below) and drop them into `public/assets/*` |
| Ad engine | Campaign/creative/guardrail data model exists; no real ad-platform spend calls | Wire a specific ad platform's API behind `lib/agents/marketing.ts`-equivalent |
| Job queue | In-process (`runOrchestrator` runs synchronously after payment) | Swap for Inngest/Trigger.dev if scaling beyond a single instance |

When generating real cinematic visuals for this project, the user maintains a personal
prompt library at `C:\Users\trent\Downloads\docmo-prompt-library\` (image/video generation
formulas + canvas interaction patterns) — check there before writing new prompts from
scratch.

## Setup

```bash
npm install
cp .env.example .env   # already done for local dev
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Seeded admin login: value of `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `.env`.

## QA_CHECKLIST.md walkthrough (testable without live integrations)

- [x] Navigation works
- [x] All CTAs work (homepage, gallery, services, checkout)
- [x] Forms validate (checkout account fields, revision/review forms via zod)
- [x] Authentication works (NextAuth credentials, role-gated portal/admin)
- [x] Checkout works (mock-payment path exercises the real order/project code)
- [x] Payment webhook verified server-side (Stripe signature verification implemented;
      untestable live without a real Stripe account)
- [x] Order created after verified payment
- [x] Project created
- [x] Production workflow starts (orchestrator runs synchronously after payment)
- [x] Progress reflects real state (derived from ProjectTask rows)
- [x] Portal loads
- [x] Deliverables are accessible (portal project detail page)
- [x] Reviews work
- [x] Referrals work (code, click tracking, commission state machine)
- [x] Commission states work
- [ ] Emails trigger correctly — trigger points fire and log to `EmailEvent`, but actual
      delivery is untested against a real provider (console-mocked by default)
- [x] No console errors on the smoke-tested pages (see `tests/e2e/smoke.spec.ts`)
- [x] No exposed secrets (all keys read from env, never sent to the client)
- [x] Permissions scoped (customer vs admin; agents cannot touch refunds/payments/secrets
      — see `lib/security/permissions.ts`)
- [x] Rate limits present (`lib/security/rateLimit.ts`, applied to checkout)
- [x] Retry limits present (`MAX_RETRIES = 5` in the orchestrator)
- [x] Mobile responsive layout verified (homepage, services, checkout, portal, admin)
      including a mobile nav menu (the header previously had no way to reach
      Fleet/Services/Pricing/Agent Network below the `md` breakpoint — fixed).
- [x] Form accessibility pass: every input/textarea has a real `<label>` (not just a
      placeholder), the star-rating control has `aria-label`s per star, autocomplete
      attributes added to account/login fields. Not done: a full Lighthouse/axe
      automated audit or a contrast-ratio check — this was a manual pass only.

## Not yet built (explicitly out of scope for this pass)

- Live ad-platform spend automation.
- A scheduled worker for `approveMaturedCommissions()` / retention emails (the functions
  exist in `lib/referrals/commissions.ts`; nothing calls them on a timer yet).
- Payout execution (bank/PayPal transfer) — `Payout` records exist, no transfer API call.
