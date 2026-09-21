# Phase 1 audit: Patient Creations against the $100K/month master build

Recorded 2026-09-20 against commit `f801a7a` (plus the Phase 2 work in the same push). The baseline of working routes is `docs/baseline/2026-09-20-routes.json`; 355 unit tests were passing before any change.

The $100K/month figure is a business target, not a forecast. The founder framework (Life Path 11/2, Birthday 28/1, Foundation 4, Talent 6) is used only as a symbolic way to organize priorities, never to predict revenue.

## 1. What exists today

**48 pages, 34 API routes, 45 database models, 28 test files (368 tests).**

| Area | What is built | Where |
|---|---|---|
| Storefront | Home with live canvas hero, Services, Pricing, Monthly Ads, Gallery, Examples, Websites (12 industry pages), Agents, Guided Tour, legal pages (Terms, Privacy, Refunds, Acceptable Use, Copyright) | `app/*` |
| Catalog | 22 services and 9 add-ons seeded from one price list; scope panels; sourced market comparison | `prisma/seed.ts`, `lib/pricing/catalog.ts`, `lib/site/productScopes.ts`, `lib/site/marketComparison.ts` |
| Checkout | Stripe Checkout (cards; Apple Pay and Google Pay appear where Stripe enables them), coupons, order bumps, delivery speeds, NFC card mixes, manual payment methods, clickwrap terms acceptance, cart recovery offer, owner alerts | `app/api/checkout`, `lib/payments/*`, `lib/funnel/cartRecovery.ts` |
| Subscriptions | Website Care Plan and three Monthly Ads plans on Stripe subscriptions, private manage pages, billing portal | `app/api/care`, `app/api/ads`, `lib/ads/*`, `lib/care/*` |
| Customers | Portal (projects, orders, referrals), private project status pages with a concierge chat and messages, intake forms, website preview with approve/revise | `app/portal`, `app/status`, `app/intake`, `app/preview` |
| Production | Orchestrator, agent definitions, QA and perception reports, master editor, creative bible, website build with versions (PREVIEW, APPROVED, LIVE, SUPERSEDED) | `lib/agents/*`, `lib/site/build/*` |
| Sales side | Prospect pipeline (NEW, AUDITED, CONTACTED, REPLIED, CALL_BOOKED, WON, LOST), a real website audit engine that only reports what it observed, outreach drafts, customer notes | `lib/prospects/*`, `app/admin/prospects`, `app/admin/crm` |
| Referrals | Codes, click tracking, commissions with states, payouts, fraud guard, portal page | `lib/referrals/*`, `app/portal/referrals` |
| Analytics | Event tracking, funnel, attribution, growth dashboard (cart recovery, ad-plan MRR, text alert status) | `lib/analytics/*`, `app/admin/growth` |
| Security | NextAuth roles, Stripe webhook signature checks, rate limiting, private tokens, audit log, anti-scraping middleware and headers | `lib/security/*`, `middleware.ts` |
| Voice guide | Built and tested, hidden until all lines are recorded | `lib/voice/*` |

## 2. Contradictions found, and what was done

| Problem | Status |
|---|---|
| Prices typed in 12 places (seed, ad plans, care plan, offer fallback, card add-on, market table, scope text, a card carousel) | **Fixed.** One list, `lib/pricing/catalog.ts`. A test fails if any dollar amount is typed anywhere else. |
| The NFC section still said "the $25 setup fee is folded into the price" although cards are a flat $30 with no setup fee | **Fixed.** |
| AI Software tiers were $10,000 / $16,000 / $25,000 and Lead Engine $1,700 / $2,700 / $4,250, against the founder's targets of $10,000 / $15,000 / $25,000 and $1,700 / $2,500 / $4,250 | **Fixed** with two explicit tier overrides in the catalog. Live database now matches. |
| Database rows and code could drift apart | **Fixed.** `scripts/pricing/verify-db.ts` compares every live row and tier to the catalog; it passes for all 31 products. |
| The post-purchase "next step" page only ever offered the $600 Automation Add-On, and only to signed-in users | **Fixed.** It now uses the ladder and also works for signed-out visitors. |
| Prospect pipeline stages differ from the spec's 11-stage pipeline, and there is no lead value, probability, or source field | **Open.** Phase 5. |
| The portal dashboard shows only projects and orders | **Open.** Phase 3. |
| The concierge lives on the private status page, not inside the portal, and only knows one project | **Open.** Phase 7. |

## 3. The spec against reality

Status: **Done** (works, tested), **Partial** (something real exists), **Missing**.

| # | Spec item | Status | Notes |
|---|---|---|---|
| 1 | Founder framework as symbolic operating principles | Partial | Documented here; the founder dashboard and Idea Parking Lot (33, 34) are Missing. |
| 2 | Positioning as a business growth and automation studio | Partial | Catalog and copy sell separate services; the four-layer ladder is not on the site yet. |
| 3 | Preserve existing products | Done | Nothing was removed. |
| 4 | One canonical price list | **Done** | Phase 2. |
| 5 to 6 | Entry products and the bundle | Done | Bundle shows a computed value comparison. A side-by-side "buy individually vs bundle" table is Missing. |
| 7 | Monthly Ads with deliverables, turnaround, revisions, cancel anytime | Done | Cancel anytime is supported by the Stripe billing portal and is stated. |
| 8 | Website Care $79 with a "keep your site running" offer after a website purchase | **Done** | The "your website is live" email now offers Website Care (price from the list, cancel any time, no monitoring claim); the confirmation page ladder offers it too; it starts from the project page once the site is live. |
| 9 | Lead Engine tiers | **Done** | Tiers now $1,700 / $2,500 / $4,250. Tier names are still Core / Signature / Flagship. |
| 10 | Separate high-ticket AI path with qualification | Partial | Prices and scopes exist; no qualification form. The deposit flow now exists (see item 22). |
| 11 | Customer ascension system | **Done (v1)** | `lib/journey/ladder.ts`: what someone just bought and owns decides the next one to three offers. Shown on the confirmation page and the next-step page. Lifecycle emails that use it are Phase 4. |
| 12 | Customer dashboard with full ledger and a progress bar | Partial | Projects and orders only. |
| 13 | AI Business Concierge ("Patient AI") in the customer portal | **Done (v1)** | A chat on the portal dashboard that answers only from the signed-in customer's own records: project status and timing, what they owe and how to pay it, what their package includes, how to send files, what to buy next (from the customer ladder), how to get more customers (honest: it cannot see traffic or results and promises none), and referrals. Refunds, cancellations, discounts, disputes, contracts, rush and scope changes go to Trenton (admin note plus email). The customer is taken from the session, never from the request. An optional model can rephrase non-money answers when AI is turned on; every model reply is checked for promises, invented prices, and unknown links. |
| 14 | Growth Audit lead machine | **Done (v2, paid)** | Public `/audit`: the visitor sees a free preview (real counts from their homepage), pays $19 to unlock the full audit, and the whole fee comes back as a single-use $19 credit code for their first order within 30 days. Every line labeled Observed, Recommended, or Estimated. A question-answering Audit Agent sits on the page. Paying triggers the owner's analyst briefing (see item 16). |
| 15 | Partner program and dashboard | **Done (v1)** | Public /partners page and application; the owner approves at /admin/partners (percent per partner, default 10%). A partner gets a code (PC plus six characters), a link, and a private dashboard with link visits, leads, customers and their status (first names only), pending, approved, and paid commissions, ready-made marketing words with the commission disclosure, and a form to introduce a lead. Attribution is automatic: the customer signs up through the link, or the partner registered their email as a lead first. A commission is 10% of the order total less shipping, on one-time orders, for a year after the customer's first paid order; held 14 days, approved only when the whole order is paid (a deposit order waits for its balance), voided on a refund, paid by hand and recorded. Self-referrals are refused. Partner Program Terms added as a legal page. Also fixed: customer referral commissions were never approved and ignored deposits and refunds. |
| 16 | CRM with 11-stage pipeline and founder dashboard | **Done (v1)** | /admin/crm is now the sales pipeline: eleven columns (new lead, contacted, audit sent, discovery, proposal, payment, onboarding, delivery, upsell, retained, referral). Before a sale a prospect moves on its own (you contact them, they pay for an audit, they reply or book a call) and you can set a stage, deal value, your chance estimate, the product, and the next step by hand. After a sale the stage is worked out from the real order, project, monthly plan, and referrals. Each card tracks source, product interest, value, chance, next action, last contact, lifetime paid, plan, and referrals. A prospect who pays is marked won and appears once, as a customer. Summary tiles and a "needs you today" list are the founder view; the full founder dashboard, idea parking lot, and profitability views are still Missing (items 33 and 34). |
| 17 to 18 | Revenue dashboard and planning calculator | **Done (v1)** | /admin/revenue (new "Revenue" tab): a progress bar toward the monthly target ($100,000 in `TARGET` in the price catalog, labeled a target and never a forecast); revenue by day, week, month and last month in Eastern time, cash by day and by month charts, MRR, average order, paid per customer so far, and expansion revenue; sales counts (leads, qualified, calls, proposals, new customers) and three rates with their numerators and denominators; marketing (visitors, revenue by source, and cost per lead and per customer from spend the owner enters); retention (active plans, churn, and a renewal estimate); products (most purchased, most revenue, upsell rate and share on a monthly plan, each needing three customers behind it). The planning calculator is called a Planning Scenario, starts from the plan's quantities at today's catalog prices, shows the gap to the target and what would close it, and compares to real numbers. Honest limits, stated on the page: monthly plans are billed by Stripe and appear as MRR (their payments are not recorded here); no costs are tracked, so profit is not shown. |
| 19 to 21 | Homepage rebuild, journey visual, three-choice discovery | **Done** | New hero copy and CTAs, the three-choice finder, and the five-step path, on the approved live hero. Checked at 375, 390, 430, 768, 1024, 1280, and 1440 px. |
| 22 | Checkout with personalized thank-you steps | Partial | The six-step "You just took the first step" stepper is **done** (website, project, and card variants). **Deposits and invoices are now built** (Phase 4): orders over $1,500 that ship nothing can start with a 50% deposit; production starts on the deposit; the balance is invoiced automatically when the build is ready and delivery (or a website launch) waits for it; the owner can bill extra work from /admin/invoices; customers get private pay links, receipts, and a portal Invoices page. The deposit percent and minimum live in `DEPOSIT` in the price catalog. |
| 23 | Contextual upsells | **Done (v1)** | See item 11. Never offers what is owned; consultations get none; clicks and views are counted. |
| 24 to 25 | Production pipeline with human approval and rollback | Partial | Agents, QA, and approval exist; rollback to a superseded version is not exposed. |
| 26 to 27 | Design system and mobile | Done | Tested on phone sizes; one 320px overflow fixed this week. |
| 28 | SEO and industry pages | Partial | 12 industry pages exist under `/websites/` and `/examples/`; the spec's `/industries/*` paths are Missing. |
| 29 | Analytics events | Partial | Core events tracked; the full list is not. |
| 30 | Lifecycle email and SMS | **Done (email)** | Audit follow-ups at 2 and 6 days, unfinished-checkout reminder, 7-day check-in, and 30-day "what fits next" (from the ladder). Owner-controlled queue at /admin/followups, optional secured daily trigger, one-click signed unsubscribe, mailing-address gate. SMS follow-ups are not built. |
| 31 | NFC review compliance | Partial | Copy avoids guarantees; an explicit "authentic feedback only" notice is Missing. |
| 32 | Security | Partial | Roles, signature checks, rate limits, private tokens exist; per-customer isolation tests for every route are not complete. |
| 35 to 36 | Bottleneck rule and product profitability | Missing | |
| 38 to 39 | Baseline and tests | **Done for this phase** | Baseline recorded; 13 new tests. |

## 4. Technical debt and risks noticed

- The default admin password is still `change-me-now`. It should be rotated.
- The upsell page is signed-in only and reads a single product type, so most customers never see an upsell.
- The prospect pipeline and the customer CRM are two separate systems.
- Tier names (Core, Signature, Flagship) are generic; the founder's spec uses product-specific names (Starter, Growth, Scale) for Lead Engine.
- The voice guide is complete in code but 41 of its 44 lines are not recorded.

## 5. Order of work from here

1. Phase 3, customer journey: the ladder-based next-step offers, the six-step "what happens next" page, homepage hierarchy and three-choice discovery, the business journey visual.
2. Phase 6, growth audit: a public form that reuses the existing safe audit engine, labels every finding observed, recommended, or estimated, and feeds the pipeline.
3. Phases 4, 5, 7 to 10 follow, each behind its own baseline and tests, and driven by the current biggest constraint rather than by feature count.

## 6. Progress log

| Date | Phase | Result |
|---|---|---|
| 2026-09-20 | 1. Audit | This document and the route baseline. |
| 2026-09-20 | 2. Pricing consolidation | One price list, tiers at the founder's targets, a live-database checker, and a test that fails if a price is typed anywhere else. |
| 2026-09-20 | 3. Customer journey (first slice) | Homepage hierarchy, three-choice finder, business path, six-step post-purchase stepper, the ladder on the confirmation and next-step pages. |
| 2026-09-20 | 6. Growth audit (v1) | Public audit, lead capture into the prospect list, owner and visitor emails, rate limits, honeypot, consent, safe website fetching. |

**Not started, in this order of value:** Phase 4 revenue engine (deposits and invoices), Phase 5 CRM (the 11-stage pipeline with value, probability, and source; merge with the prospect list), Phase 7 customer AI in the portal, Phase 9 partner program, Phase 10 revenue and retention dashboard with the planning scenario, then the founder dashboard, idea parking lot, bottleneck rule, and product profitability. The production-agent pipeline (Phase 8) already exists and needs rollback and the QA checklist from the spec.

| 2026-09-21 | 10. Revenue dashboard and planning | Revenue, sales, marketing, retention and product sections, business-time windows (Eastern, daylight saving aware), marketing spend entry, and the Planning Scenario calculator. 40 new tests, 751 in all. |
| 2026-09-21 | 9. Partner program | Applications, approval, links and dashboard, lead introduction, held and approved commissions with safe payment conditions, payout recording, terms page, admin tab. Legal version 2026-09-23. 69 new tests. |
| 2026-09-21 | 4. Klarna and Afterpay | Pay-later methods at card checkout for amounts from the catalog floor to each provider's limit, off until BNPL_ENABLED=true, card-only retry if Stripe refuses, never on the audit or small orders. 20 new tests. |
| 2026-09-21 | 7. Patient AI | Portal assistant for signed-in customers, scoped to their own account, with hand-off to the owner for money and scope questions. Also: deposits now apply to orders over $1,500. 54 new tests, 618 in all. |
| 2026-09-21 | 5. CRM | Eleven-stage sales pipeline board at /admin/crm merging prospects and customers, deal fields on the prospect page (stage, value, chance, product, next step, last contact), automatic stage movement, won-on-payment, customer list moved to /admin/crm/customers. Chances are labeled as your own estimate, and defaults are labeled as defaults. 45 new tests, 564 in all. |
| 2026-09-21 | 4. Deposits and invoices | Deposit option at checkout for big builds, balance invoiced when the build is ready, delivery held until it is paid, extra-work invoices, private pay links and receipts, admin Invoices tab, portal Invoices page, revenue reports now count cash collected (not bare order totals). Terms and Refund Policy updated (legal version 2026-09-22). 34 new tests, 519 in all. |
| 2026-09-21 | 6. Growth audit v2 | Audit made paid ($19, credited in full toward the first order for 30 days), free preview before payment, credit code that works as a coupon and is used up once, Audit Agent chat, and the owner's Audit Analyst dashboard. Terms and Refund Policy updated (legal version 2026-09-21). |
| 2026-09-21 | 4. Revenue engine (lifecycle slice) | Follow-up queue and five follow-up emails, opt-out list and signed unsubscribe, secured optional daily trigger, Website Care offer in the website-live email. |

**Test and check counts:** 751 unit tests; homepage, finder, audit, and confirmation page also checked in a real browser at phone and desktop widths.
