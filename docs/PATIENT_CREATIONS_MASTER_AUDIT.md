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
| ~~Object storage for customer uploads~~ | n/a | DECIDED against: too costly. Logos and photos are collected by email (patientprofitsllc@gmail.com) or a booked video call. |
| ~~Deploy target and API token for customer websites~~ | n/a | DECIDED against automatic deploys: the owner hosts customer sites and handles domains himself, so nothing customer-related is deployed to the company Netlify account. |
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
| 2 Payment + intake | IMPLEMENTED (with gaps) | Private `/intake/[token]` wizard (4 steps, autosave, skippable, noindex); production starts only when the order is paid AND the intake is complete, in either order, exactly once (atomic claim on `Project.productionStartedAt`); intake answers written into the Project Bible; agent output now merges into bible sections instead of overwriting them; funnel events `intake_started/completed`, `production_started`; status page, success page, and confirmation email link to the intake. Gaps: **no file upload, by decision** (storage cost): logo and photos come by email or a booked video call, or as pasted links; **intake reminders BUILT, manual**: Growth tab lists paid customers still waiting on their intake, with "Send reminder" and "Send all due" (at most one a day, three in total, first one a day after payment, atomic so two clicks can't double-send, rolled back if the email fails); nothing runs in the background so there is no scheduler cost; **abandoned-checkout emails NOT STARTED**; customers can't edit answers after submitting. |
| 3 Production engine | IMPLEMENTED for the one-page website (with gaps) | A completed intake now produces a real page: industry layout, copy from the customer's own facts (AI-written when a model key is set, otherwise their own wording), rendered to one self-contained static HTML file (no scripts, all text escaped). Automated QA (links, contact details, mobile viewport, contrast, size, no leaked sample text, a fidelity check that nothing the customer typed was dropped) gates every build. Customer gets a private `/preview/[token]` page to approve or use their one included revision (simple changes are applied automatically when a model key is set, otherwise routed to a person, who can apply them from the admin session page). Every AI output is validated and checked for invented claims; on any doubt the build falls back to the customer's own wording. The build runs in seconds and is awaited inside the request, so it no longer depends on a serverless function surviving after its response. Gaps: **no logo or photos on the page yet** (they arrive by email or on a call, and there is no tool yet to attach them to a build; an option is an admin field for image addresses hosted elsewhere, which costs no storage); one page layout style per industry, not bespoke design; the AI copy and AI revision paths are covered by mocked-model tests but have not been run against the live model API. |
| 4 Deployment + portal | PARTIAL | Customers see preview/approved/live state on their private project page, and the admin session page has a Website panel: apply a manual change, and "Mark as live" (requires the customer's approval first) which completes the project and emails them. **Publishing is manual, by decision**: the owner hosts each site and handles its domain, and customer sites are NOT deployed to the company Netlify account (storage and build usage would grow with every customer). The admin Website panel has a "Download the site file (.html)" button (each site is one self-contained file that works on any host) and "Mark as live", which records the address and emails the customer. |
| 5 Upsell + subscription | PARTIAL | **$79/mo Website Care Plan built**: offered on the customer's private project page once their site is live; Stripe Checkout (subscription mode, price read from the `care-plan` product row); Stripe events (`checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.paid`, `invoice.payment_failed`) keep status current, idempotently and in any order; failed payments, cancellations, and duplicate subscriptions notify the team; customer can open Stripe's billing page to update a card or cancel; admin Growth tab shows active plans and monthly recurring revenue. Plan wording promises only what exists (no uptime checks or backups). **Needs from the owner**: turn on the subscription events in the Stripe webhook settings and activate Stripe's customer billing portal (dashboard settings). Not built: enforcement of the 3-updates-a-month limit (honored by hand), refund/dispute events, other upsells (ads, Google visibility). Real Stripe subscription checkout has not been exercised end to end (it can't run from the development machine); events were tested with constructed payloads. |
| 6 Referrals + partners | PARTIAL (pre-existing) | Referral codes/commissions exist; partner program and configurable rates not built. |
| 7 Prospecting engine | PARTIAL (built to cost nothing and send nothing) | Admin **Prospects** tab: add one or paste a list (deduped by website host, else name and city; bad lines reported), stages (new, checked, contacted, replied, call booked, won, lost, do not contact), follow-up dates with a due list, notes. **Website check**: fetches a prospect's page with hard limits (public addresses only, checked at connect time, 8 seconds, 600 KB, HTML only, re-checked redirects) and records only observed facts (https, mobile layout setting, title, description, phone and tap-to-call, out-of-date footer year, page text, social page used as a website). **Message drafts** (email, short message, two follow-ups) are templates built from those findings, use the live price and the honest 72-hour target, carry an opt-out and mailing address, and make no ranking or invented claims. Nothing is ever sent automatically. "Do not contact" is final. Growth tab shows real outreach counts. **Not built**: finding prospects automatically (that needs a paid places or directory data source, or scraping, which is not done), sending, reply tracking. **Owner action**: set `OUTREACH_MAILING_ADDRESS` in Netlify (the drafts show a warning marker until it is set; the CAN-SPAM Act requires a mailing address in marketing email). |
| 8 Analytics + AI auditor | PARTIAL | Admin **Growth** tab (`/admin/growth`, admin-only): 21-day/200-customer progress (goal, current, remaining, needed per day, actual pace, all from real counts), funnel with stage-to-stage rates, revenue, unique visitors, sources, and paid orders waiting on intake. Goal/length/start come from `ACQUISITION_GOAL`, `ACQUISITION_DAYS`, `ACQUISITION_START_DATE`. Not built: the AI auditor, outreach-pipeline metrics (need Phase 7), stages that nothing records yet (preview/approve/deploy). |

### Known risk (partly resolved in Phase 3)

Website builds now run to completion inside the request that triggers them (they take seconds), so they no longer depend on a serverless function staying alive. **Non-website orders still use the original long agent pipeline, started without being awaited**, and share the original risk: the platform may freeze a function after its response is sent. That pipeline produces text output, not a deliverable, so it should move to a durable background runner before those products are sold at volume.

### AI usage

AI is OFF by default. The model is called only when `AI_ENABLED=true` is set (and a key is present), so no AI provider cost is incurred otherwise. With it off: website copy uses the customer's own wording, the chat helper uses fixed answers, and revisions go to a person.

### Email delivery (fixed in Phase 2 follow-up)

The email sender previously ignored the email service's response, so a rejected message (for example an unverified sending domain) was recorded as sent. It now records SENT or FAILED per attempt, never breaks an order, raises an admin notification (at most hourly) on failure, and sends properly formatted text plus HTML with clickable links. System Health has a "Send a test email" button. **Whether the production sending domain is verified in Resend is still unconfirmed; use that button.**

### Customer tracking screen

The private project page (`/status/[token]`) is now a package-style tracker. Website orders show five steps (Order confirmed, Your business info, Building your website, Your review, Live) with timestamps in Eastern time, a percent-of-the-way bar, who the ball is with ("Waiting on you" or "We're on it"), an action button when the customer has something to do (finish intake, view preview), and the delivery target worded as a target: the 72-hour target counts from when we received their info, it is shown as a date only while the ball is with us, it is never held against the customer while they are the ones being waited on, and it says plainly when it has passed. Other orders get a five-stage general tracker with the product's own estimate in business days. The page refreshes itself every 30 seconds while open and unfinished (visible tab only, stops after about 20 minutes). Logic lives in `lib/tracking/tracker.ts` (pure, unit tested).

### Legal documents and required agreements (IMPLEMENTED; NOT reviewed by an attorney)

Four public pages, versioned by `LEGAL_VERSION` in `lib/legal/config.ts`: **Terms of Service** (`/terms`, 31 sections), **Privacy Policy**, **Refund and Cancellation Policy** (all sales final, no returns on physical goods), and **Acceptable Use Policy**. They are linked from the footer, listed in the sitemap, and the numbering and cross-references are covered by unit tests (`tests/unit/legal.test.ts`).

Protections in the Terms: informal resolution first, then binding individual arbitration under AAA rules with a class action and jury waiver and a 30-day opt-out; governing law and venue; a one-year limit on claims; as-is disclaimer of warranties; no guarantee of rankings, sales, or accessibility compliance; liability cap; indemnity by the customer for their content; protection for the LLC's members, managers, owners, employees, and contractors ("Company Parties"); chargeback handling and license end on a reversed payment; automatic-renewal disclosure and cancellation for the care plan; AI disclosure; customer content warranty; deemed acceptance after 30 days; force majeure; severability; electronic signature.

Agreement is required and recorded, not just linked: checkout (`acceptTerms` must be `true`, server-side; recorded before payment), care-plan checkout (separate renewal and cancellation checkbox), and intake submission (customer confirms the information is theirs and accurate). Each acceptance stores version, time, IP, and browser in `TermsAcceptance`. The approval screen states that approval confirms accuracy.

**Owner must confirm** (the text makes assumptions): state of governing law (Georgia is assumed), the LLC's real formation state, mailing address, and have a licensed attorney review before relying on it. No-refund, auto-renewal, and arbitration terms are regulated differently by state and by card-network rules. Detail in the final message of this build.

### Optional extras (IMPLEMENTED)

Brand Kit, Extra Revision Package, Social Asset Pack, 3 Month Maintenance, and NFC card are shown at checkout as cards with a plain reason to add each ("why", "best if", details), and on `/pricing`. Copy is in `lib/site/addOnPitch.ts` and is tested to contain no invented popularity, statistics, or guarantees. The Extra Revision Package adds two revision rounds on the preview page. The Social Asset Pack is hidden and refused (server side too) with the $300 website, which has no hero visual to adapt. The maintenance extra no longer mentions monitoring, which does not exist.

### Order alerts, thank-you, and Cart Recovery Agent (IMPLEMENTED; text alerts need a Twilio account)

**Owner alerts** (`lib/alerts/ownerAlerts.ts`): every order sends the owner an email (to `OWNER_ALERT_EMAIL`, default the support address) and a note in the admin dashboard. A **text** is sent only when Twilio is configured (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `OWNER_ALERT_PHONE`); otherwise it is off and the Growth tab says so. Card orders alert when paid; Zelle and other manual orders alert when placed ("awaiting payment") and again when marked paid. Alerts never block or break an order, are recorded in the audit log with the outcome per channel, text is capped at 10 an hour, and orders from reserved test addresses (example.com) are skipped. The text request was checked against a mocked Twilio only; **no real text has been sent**. US texting from a Twilio number also requires carrier registration (10DLC or toll-free verification), which takes days and is Twilio's requirement, not ours.

**Thank you**: the paid confirmation email now opens with appreciation, lists what happens next, and gives one practical tip; manual-payment customers get an immediate "we have your order" thank-you with payment next steps and their intake link; the confirmation page shows a Thank You card (personalized first name, three next steps, one insight per order type). No text to customers: that needs their recorded consent (US law) and a Twilio account.

**Cart Recovery Agent** (`lib/funnel/cartRecovery.ts`, rules only, no AI cost): a visitor who opens checkout and leaves without ordering, twice, gets 5% off on visit 3. Visits are checkout views more than 30 minutes apart (a refresh does not count). The offer is a signed, expiring token bound to the visitor's random id, valid 72 hours from first shown, single use, never re-offered after it expires or is used, and enforced on the server at checkout. It is not a public coupon (typing COMEBACK5 does nothing) and does not stack with a typed coupon (the customer gets the better one). Admin Growth tab shows offers shown, used, paid, and discount given. Limits: it recognizes a visitor by a browser identifier, so clearing site data resets it; it does not know an email for people who leave before checking out, so it cannot email them.

### Motion on phones (IMPLEMENTED)

All site animation was checked on an emulated phone, a desktop, and with reduced motion, in a headless browser. Fixes: canvas movement now follows the clock instead of the frame count (a 120Hz phone used to run twice as fast, a 30fps low-power draw half as fast); the address bar sliding in and out no longer re-randomizes the scene (resize is settled for 150 ms and a height-only change keeps the particles); the agent network canvas now pauses off screen and in background tabs, shows a still frame for reduced motion, and skips the expensive glow blur on phones; data-saver mode gets the light version; the demo hero backdrop uses transform-only animation (no blur filter), pauses off screen, and only loads a video if one exists, motion is allowed, and the connection is not slow. Helpers are in `lib/motion/timing.ts` with unit tests. Not verified: a real phone (emulation is not the same as hardware), and the loop video slot is empty until a video file is added at `public/assets/hero/intelligence-layer-loop.mp4`.

### Homepage hero, new style (IMPLEMENTED)

The homepage hero now uses the glass-layers-and-community-network backdrop (`components/cinematic/HeroBackdrop.tsx`, scene in `lib/motion/networkScene.ts`). It is drawn live on a canvas, not played from a video, so it never restarts or hitches; motion is periodic by construction (unit tested). A still of the same scene is server-rendered from first paint; the animation starts 600 ms later so the page becomes usable first. Replaces the old particle cluster, which sat directly behind the headline. Phone spacing was tightened so the main button and trust row are on the first screen on every portrait phone tested. The earlier throwaway design page and its placeholder testimonial were removed, and the old canvas component deleted. Tested with device profiles for iPhone SE, iPhone 13, iPhone 14 Pro Max, Pixel 7, Galaxy S8, Galaxy S9+ and two landscape phones (Chromium engine with phone viewports and touch; **real Safari on iOS and real hardware are not tested**). A strict width check was added after the first one proved too weak (it passed while a layout bug widened the page).

### Monthly Ads plans (IMPLEMENTED; delivery is by hand)

Three subscription plans, **$300, $500 and $1,000 a month**, sold at `/monthly-ads`. What each plan includes is defined once in `lib/ads/plans.ts` (counts, wording, what is not included); the public page, checkout, product rows, the customer's plan page, the admin quota view and the tests all read from it, so they cannot disagree. Prices shown are read from the product rows (`ads-monthly-300`, `-500`, `-1000`), seeded by `prisma/seed.ts`.

| Plan | Short video ads | Creator style (of those) | Cinematic videos | 3D visual | Landing page | Revisions | Extras |
|---|---|---|---|---|---|---|---|
| Starter $300 | 10 | up to 4 | 0 | 0 | 0 | 1 | none |
| Growth $500 | 20 | up to 8 | 1 | 0 | 0 | 2 | written plan for approval |
| Scale $1,000 | 40 | up to 16 | 3 | 1 | 1 | 2 | written plan, one 30 minute call |

**Quantities were raised on 2026-09-20 after a market comparison** (about $30, $25 and $25 per short ad). They are still a proposal, not a fact about capacity. Change them in one file; confirm the owner can deliver them with the ad tools before selling at volume.

How it works: customer starts a plan (`/monthly-ads/start`, agreement with automatic-renewal wording recorded as `AD_PLAN`), pays through Stripe Checkout (subscription mode, price from the product row), and a Stripe webhook activates it (`lib/ads/events.ts`, idempotent, handles out-of-order events, cannot be revived after cancel). They get a private plan page (`/monthly-ads/manage/[token]`, noindex) with the monthly brief form, what has been delivered, and a billing button. Admin: `/admin/ads` lists plans, briefs, and quota used, and logs deliveries (link plus note); Growth shows ad-plan recurring revenue. Owner is alerted by email (and text once Twilio is set up) when a plan starts. In production a plan can only ever be activated by a paid checkout (no free path). Legal: Terms section 9, Refund policy section 4 and the privacy data list were extended (version 2026-09-20).

Not built: plan switching (done by hand on request), automatic monthly reminders to send a brief, file storage for finished ads (delivered by link, by decision), a prorated upgrade, usage counters beyond the admin log. The public copy names no tool vendors; the AI tools behind the work are the owner's to choose and each one's commercial-use terms should be checked on the plan actually used, including presenter/likeness rules and any music (music rights are excluded from the plans on purpose). Services such as an AI receptionist, text follow-up, CRM, custom AI assistants and workflow automation are shown only as "quoted separately after a call", never as included.
