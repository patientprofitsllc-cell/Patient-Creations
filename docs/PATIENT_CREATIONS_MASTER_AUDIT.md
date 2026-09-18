# Patient Creations Master Audit

Written 2026-09-18 from a direct inspection of the repository, the database schema,
the production build output, and the live Netlify configuration (variable names only).
Statuses use the definitions IMPLEMENTED / PARTIAL / BLOCKED / NOT STARTED and are
updated at the bottom as phases land.

## 1. Current architecture

| Layer | What exists |
|---|---|
| Framework | Next.js 14 App Router, TypeScript, Tailwind. Server components by default, ISR (`revalidate = 60`) on the homepage and `/services`. |
| Database | Postgres on Neon via Prisma. One database shared by local dev and production. Schema changes go through `prisma db push` (no migration history yet). |
| Auth | NextAuth credentials (email + password, bcrypt). Roles: `CUSTOMER`, `ADMIN` only. No partner role. |
| Payments | Stripe Checkout sessions built per order with inline `price_data` (no Stripe Price IDs, so prices live only in the database). Payment state is set only by the signed webhook. Manual methods (Zelle, Apple Pay) stay `PENDING` until an admin marks them paid. |
| Email | Resend (`RESEND_API_KEY` set in production). Eight templates. Console provider locally. |
| AI | `callModel` seam: real Claude when `ANTHROPIC_API_KEY` is set (it is in production), deterministic mock otherwise. |
| Hosting | Netlify, auto-deploy from GitHub `master` (site `patientcreations.com`). Production `APP_BASE_URL` is the real domain. |
| Scheduling | Calendly inline embed after service-build checkout. |
| Tests | 57 Vitest unit tests (pricing rules, delivery windows, concierge, state machine, commissions). One Playwright smoke spec. |

## 2. Current features (verified, not assumed)

- Catalog of 22 products in Postgres (services, NFC merch, specials, order bumps) with tiers (Core / Signature / Flagship).
- Checkout with tiers, add-ons, quantity (merch, ads), delivery-speed rush pricing, coupon, US shipping calculator, three payment methods.
- Order-bump rules: NFC card add-on ($45 with the website, free on a $1,000+ video tier, $75 otherwise, $50 each at 10+), bundle, per-design card mix.
- Post-purchase NFC card questionnaire, live inventory ledger with admin controls.
- Project pipeline: orchestrator with 14 role agents, QA and perception review loops (max 5 retries), state machine, per-project progress.
- Per-customer private status page (`/status/[token]`, 128-bit token) with agent-posted progress notes and a two-way concierge thread (added 2026-09-18).
- Customer portal (dashboard, project detail, referrals, reviews, invoices), admin console (Business, CRM, Inventory, Production, Sessions & Logs, System Health).
- Referral program: unique codes, click tracking, 10% commission with a 14-day pending window and self-referral guard.
- SEO groundwork: sitemap, robots, canonical, Open Graph, Organization structured data, keyword block.

## 3. Current customer journey

Traffic → homepage (leads with "the machine that builds your wealth", specials grid, NFC cards) →
services or specials → checkout (account creation with password) → Stripe or manual payment →
confirmation page (private link, Calendly, NFC questionnaire) → pipeline starts immediately →
status page / portal → delivery email → review request.

Missing between payment and delivery: any collection of the customer's business information,
any real website output, preview, revision, approval, and deployment. The pipeline currently
produces agent notes and a placeholder deliverable path, not a website.

## 4. Conversion weaknesses

1. The homepage leads with technical, agent-flavored language and sells about ten things with near-equal weight; the $300 website is one card among several.
2. No proof section, no examples by industry, no FAQ, no explicit "what you get" checklist on the main offer.
3. Checkout asks for a password before payment and collects no phone number, business name, or business type, so the business can't start work or follow up from the order alone.
4. No funnel measurement: only server lifecycle events are recorded, so conversion by stage is unknowable today.
5. No abandoned-checkout recovery and no intake reminders.
6. The offer language ("Delivery: 3-5 business days") doesn't match the intended "72-hour target after we have your info".

## 5. Technical weaknesses and risks

- Stripe webhook handles only `checkout.session.completed`. No failed payment, refund, dispute, or subscription events. Refunds don't reverse referral commissions automatically.
- No subscription flow: Checkout is `mode: "payment"` only; the recurring product rows are unused.
- Pipeline starts at payment, not after intake; there is no intake to wait for.
- Deliverable is a placeholder; no template library, builder, preview, or deploy step.
- Prices and commission rate are configurable only by editing `prisma/seed.ts` and reseeding. Commission rate is a code constant. No admin pricing UI, no feature flags.
- Rate limiting is in-memory (not shared across serverless instances), so limits are best-effort.
- Checkout creates a user before pricing is validated, so a rejected request can leave an orphan account.
- Schema managed with `db push`; no migration history.
- File upload has no storage backend; nothing can be uploaded today.
- Local dev cannot reach Stripe or Google Fonts (machine-level TLS trust); production is unaffected.

## 6. Missing functionality (against the master spec)

Homepage restructure around the $300 website; problem/offer/proof/examples/FAQ sections; industry demo
engine and landing pages; checkout fields (phone, business name/type, domain); website intake wizard;
funnel analytics events and dashboard; production engine (templates, component library, design tokens,
structured agent I/O, mobile QA, preview, revision, approval); deployment tracking; customer website dashboard;
upsell sequence; Care subscription and Stripe subscription events; refund and dispute handling; configurable
commission and partner program (role, dashboard, commissions); prospecting CRM, website auditor, outreach
generator, sales pipeline; 21-day acquisition tracker; abandoned-checkout and reminder automation;
admin pricing and feature flags; master AI auditor.

## 7. Recommended architecture

- Keep the current stack. It already supports everything requested; nothing needs replacing.
- Treat `starter-website` (renamed "Quick Business Website") as the acquisition product; keep its slug so existing links and orders stay valid.
- Add a `WebsiteIntake` table keyed by order, with an unguessable token (same pattern as the status link) so the wizard needs no login.
- Gate production on intake completion using one atomic claim so it starts exactly once regardless of whether payment or intake finishes first.
- Build the demo/landing/production surface on one data-driven component library (`SiteRenderer`) with design tokens, so examples, previews, and eventually delivered sites share code.
- Add funnel events to the existing `AnalyticsEvent` table through a whitelisted `/api/track` endpoint.
- Move commission rate and prices into an admin-editable settings table before launching partners.

## 8. Dependencies and external inputs needed

| Need | Where it goes | Status |
|---|---|---|
| Stripe secret, publishable, webhook secret | Netlify env (present) | Present |
| Stripe webhook endpoint subscribed to `invoice.*`, `charge.refunded`, `charge.dispute.*`, `customer.subscription.*` | Stripe dashboard | Needed for Phase 5 |
| Resend key and verified sending domain | Netlify env (key present) | Domain verification unconfirmed |
| Object storage for customer uploads (S3 or Netlify Blobs) | New env vars | Needed for file upload |
| Site build/deploy target for customer websites (per-customer Netlify site or subdomain) and API token | Netlify env | Needed for Phase 4 |
| Scheduler for reminders and abandoned-checkout emails (Netlify scheduled function) | Netlify config | Needed for Phase 2/5 |
| Real case studies and testimonials | Database (`CaseStudy`) | None yet, so none are shown |

## 9. Implementation phases

0 Audit → 1 Conversion funnel → 2 Payment + intake → 3 Production engine → 4 Deployment + portal →
5 Upsell + subscription → 6 Referrals + partners → 7 Prospecting engine → 8 Analytics + AI auditor.

## 10. Highest-impact immediate changes

1. Rebuild the homepage around the $300 website and remove competing offers from the first screens.
2. Collect phone, business name, and business type at checkout.
3. Add the intake wizard and hold production until it's complete.
4. Track the funnel so conversion by stage is measurable from day one.
5. Publish honest examples (clearly labeled samples), not invented testimonials.

## Rules applied throughout

No fabricated testimonials, reviews, statistics, awards, or integrations. Delivery is described as a
"72-hour target", not a guarantee. Nothing claims control over Google rankings.

---

## Phase status

Updated as work lands; see the end of the build summary for the final state.

| Phase | Status | Notes |
|---|---|---|
| 0 Audit | IMPLEMENTED | This document. |
| 1 Conversion funnel | IMPLEMENTED (with gaps) | Homepage rebuilt around the offer; `/pricing`, `/examples`, `/websites` + 12 industry pages; sitemap; checkout collects business name/type/phone/existing site and creates a `WebsiteIntake` with a private token; funnel events stored via whitelisted `/api/track`; attribution (`ref`, `utm_*`) saved and credited to the order. Gaps: password is still required at checkout (no guest checkout); no case studies exist until a real one is published. |
| 2 Payment + intake | IMPLEMENTED (with gaps) | Private `/intake/[token]` wizard (4 steps, autosave, skippable, noindex); production starts only when the order is paid AND the intake is complete, in either order, exactly once (atomic claim on `Project.productionStartedAt`); intake answers written into the Project Bible; agent output now merges into bible sections instead of overwriting them; funnel events `intake_started/completed`, `production_started`; status page, success page, and confirmation email link to the intake. Gaps: **file upload BLOCKED** (needs a storage choice: S3 or Netlify Blobs), so logo/photos are pasted links; **reminders and abandoned-checkout emails NOT STARTED** (need a scheduler); customers can't edit answers after submitting. |
| 3 Production engine | IMPLEMENTED for the one-page website (with gaps) | A completed intake now produces a real page: industry layout, copy from the customer's own facts (AI-written when a model key is set, otherwise their own wording), rendered to one self-contained static HTML file (no scripts, all text escaped). Automated QA (links, contact details, mobile viewport, contrast, size, no leaked sample text, a fidelity check that nothing the customer typed was dropped) gates every build. Customer gets a private `/preview/[token]` page to approve or use their one included revision (simple changes are applied automatically when a model key is set, otherwise routed to a person, who can apply them from the admin session page). Every AI output is validated and checked for invented claims; on any doubt the build falls back to the customer's own wording. The build runs in seconds and is awaited inside the request, so it no longer depends on a serverless function surviving after its response. Gaps: **no logo or photos on the page yet** (customers can only paste links; embedding needs file upload storage, which is BLOCKED); one page layout style per industry, not bespoke design; the AI copy and AI revision paths are covered by mocked-model tests but have not been run against the live model API. |
| 4 Deployment + portal | PARTIAL | Customers see preview/approved/live state on their private project page, and the admin session page has a Website panel: apply a manual change, and "Mark as live" (requires the customer's approval first) which completes the project and emails them. **Publishing the site is still manual**: nobody's site is deployed automatically. Decided to use Netlify (deploy by API, no repo per customer); still needs an API token and a subdomain or custom-domain plan. |
| 5 Upsell + subscription | NOT STARTED | Needs Stripe subscription/refund/dispute webhook events. |
| 6 Referrals + partners | PARTIAL (pre-existing) | Referral codes/commissions exist; partner program and configurable rates not built. |
| 7 Prospecting engine | NOT STARTED | |
| 8 Analytics + AI auditor | PARTIAL | Admin **Growth** tab (`/admin/growth`, admin-only): 21-day/200-customer progress (goal, current, remaining, needed per day, actual pace, all from real counts), funnel with stage-to-stage rates, revenue, unique visitors, sources, and paid orders waiting on intake. Goal/length/start come from `ACQUISITION_GOAL`, `ACQUISITION_DAYS`, `ACQUISITION_START_DATE`. Not built: the AI auditor, outreach-pipeline metrics (need Phase 7), stages that nothing records yet (preview/approve/deploy). |

### Known risk (partly resolved in Phase 3)

Website builds now run to completion inside the request that triggers them (they take seconds), so they no longer depend on a serverless function staying alive. **Non-website orders still use the original long agent pipeline, started without being awaited**, and share the original risk: the platform may freeze a function after its response is sent. That pipeline produces text output, not a deliverable, so it should move to a durable background runner before those products are sold at volume.
