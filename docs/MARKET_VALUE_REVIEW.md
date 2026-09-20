# Market value review, all products (2026-09-20)

**Method.** For each product: (1) what the customer pays and what the product says they receive, (2) the going market price for the same deliverable, from published 2026 price guides, (3) a verdict on value, and (4) an action on **what the customer receives** (not the price, which is the owner's decision). Prices below are ranges other businesses publish, not quotes. This review measures price against stated scope. It cannot measure **quality**, because there are no delivered customer projects yet to judge. Where a product's scope is undefined, the verdict is "cannot be weighed until scope is written".

## Summary

| Product | Your price | Market range | Verdict | Action taken or recommended |
|---|---|---|---|---|
| Quick Business Website | $300 | freelance custom landing page $500 to $3,000; agency $1,500+ | **Well below market** (strong value) | Keep. |
| Cinematic AI Website | $2,000 / $3,200 / $5,000 | typical small business site $2,000 to $8,000; professional $3,000 to $15,000 | Bottom of market at the base tier; **scope undefined** | Write the scope (pages, features, revisions) before selling at volume. |
| AI Software / App | $4,000 / $6,400 / $10,000 | SaaS or app MVP $15,000 to $60,000 (freelance basic MVP $20,000 to $60,000) | **4 to 15 times below market**; high risk of unprofitable projects | Tighten scope hard (one core workflow, stated screens) or raise the price. |
| Multi-Agent System | $6,000 / $9,600 / $15,000 | small business AI automation $1,500 to $5,000 simple, $7,000 to $12,000 medium; typical setup $2,000 to $12,000 | In market | Define the number of workflows or agents included. |
| Cinematic Ad Special (per ad) | $400 | social video ad $1,000 to $5,000 (freelancer); performance ad $100 to $500; brand video $5,000+ | Below brand-video market, fair against performance ads | **Done:** each ad now states up to 30 seconds, wide and vertical, with caption and headline options. |
| UGC Ad Special (per ad) | $250 | human UGC $150 to $450 (fully loaded $200 to $450 per variation); agency $300 to $1,000; AI UGC $3 to $25 | At human-creator price | **Done:** each ad now includes an AI presenter and **3 opening-hook variations** (the market prices per variation), vertical and square. See conflict note below. |
| All-in-One Launch Bundle | $1,299 | equivalent pieces $3,000+ at market | **Strong value** | **Done:** UGC ads in the bundle now listed with 3 hook variations each. |
| Rental Listing Film | $500 | basic listing video $150 to $500; cinematic $500 to $1,500 | In market | State length and how it is made (photos or filmed). |
| Basic Package (drone-style tour) | $1,000 | real drone video $1,000 to $2,500 per project, or $150 to $400 as an add-on | At real-drone price | **Needs your confirmation:** if it is generated from photos rather than filmed by a drone, say so plainly. |
| Payments Setup | $900 | Stripe integration $500 to $20,000; a one-time checkout is about one engineer-week | Below typical | Keep; state what "setup" covers. |
| Lead Engine | $1,700 | lead generation for small business $1,000 to $3,000 a month | In market for a one-time setup | **Done:** wording changed from "finds new customers" (a result nobody can promise) to "a system to capture new leads and send them straight to you". Write the scope. |
| Strategy Session | $150 / 60 min, credited to a build | independent consultants $75 to $250 an hour; experienced $150 to $300 | At market, strong with the credit | Keep. |
| Custom Build Consultation | $100, fully credited | same | Fine | Keep. |
| **NFC cards** | $75 each ($55 add-on, $50 at 10 or more) | a single custom Google review NFC card about $20 to $25 retail | **2 to 4 times the single-card retail price** (biggest value gap) | Your decision: lower toward $30 to $45, or state what makes each card worth more (custom design, programming, setup). |
| Website Care Plan | $79 a month | typical small business plan $95 to $195; DIY $20 to $50 | Below typical | Keep. It includes less than a full-service plan (no backups or security monitoring promised). |
| Brand Kit | $250 | logo $300 to $2,500 freelance; full identity $1,100 to $5,500; style guide about $180 | **Below market** | Keep. |
| Extra Revision Package / Social Asset Pack / 3-Month Maintenance | $150 / $120 / $250 | no direct benchmark found | Reasonable | Keep. |
| Automation Add-On | $600 | one or two workflows $500 to $1,500 | Low end of market | Keep; state how many workflows. |
| Monthly Optimization | $400 a month | agency retainers $500 to $5,000 | **Promise not built** ("we keep watch on how the site performs" has no monitoring behind it) | **Done:** taken off the shelf (deactivated). |
| **Monthly Ads plans** | $300 / $500 / $1,000 a month | see below | Strong value | **Done:** raised to 10, 20 and 40 short ads. |

### Monthly Ads, the reasoning
Market: human UGC $60 to $450 per video, agencies $300 to $1,000 per video or $2,000 to $10,000 a month (about $333 per finished video at a $4,000 retainer), human video-editing subscriptions $495 to $750 a month for about 10 to 12 videos and $995 to $1,500 for 10 to 20 (editing only, from the customer's footage), AI tools alone about $3 to $25 per video (self-serve, no strategy or review). At 10 / 20 / 40 short ads the plans work out to about **$30, $25 and $25 per ad**, with the cinematic videos, 3D visual and landing page on top. That is far under human and agency prices and about double the video count of editing subscriptions at the same price, while staying above raw AI-tool cost so there is margin for the strategy, writing, review and revisions.

## Things that need your decision (found while weighing)

1. **Crossed-out "was" prices on the homepage specials.** The Quick Business Website shows "was $500" and the Cinematic AI Website shows "was $5,000". They are typed into `components/home/SpecialsGrid.tsx`. A former price shown as a discount must be a price you actually charged, openly, for a real period (FTC guidance on former-price claims). If those were never your prices, remove the strikethroughs or replace them with a sourced market comparison. I did **not** change them.
2. **Monthly Ads plans versus the per-ad specials.** At $30 or $25 per ad in a plan, a $250 UGC special looks 8 to 10 times more expensive for a similar-looking ad. The specials are justified only if they are more directed (custom concept, more variations, higher effort). The card now says what a special includes; consider saying on the plan page and the special card how they differ.
3. **NFC card price** (above). This is where a customer comparing to Etsy will notice first.
4. **Basic Package** wording (drone-style versus real drone) and whether the UGC and Monthly Ads presenters are AI (they are described as AI; confirm).
5. **Undefined scopes** for the Cinematic AI Website, AI Software or App, Multi-Agent System, Payments Setup, Lead Engine and Automation Add-On. Every one of these reads as a single sentence, so a customer cannot see what they receive and you cannot be held to a scope. Write a bulleted "includes" for each, as done for Monthly Ads.

## Decisions applied (owner answers, 2026-09-20)

| # | Decision | What changed |
|---|---|---|
| 3 | Raise AI Software / App to $10,000 | Base $10,000; the tier rule (1.6x and 2.5x, rounded to $50) makes Signature **$16,000** and Flagship **$25,000**. Now 33% below the low end of the $15,000 to $100,000 MVP range instead of 73% below. |
| 4 | Set per-ad prices by value | **UGC Ad Special $250 to $99**: an AI presenter, 30 seconds, and 3 hook variations, so about $33 per variation (about 3 plan ads at $30). **Cinematic Ad Special $400 to $249**: about 8 plan short ads of effort, a directed 30 second piece in two shapes, and under half the $500 Cinematic Ad. Because the specials dropped, the **All-in-One Launch Bundle went $1,299 to $899**: bought separately its parts are $1,086, so it had become more expensive than its own contents. It is now 17% under. |
| 5 | Define the undefined scopes, like the Monthly Ads plans | Written includes, not-included, and tier adds for the Cinematic AI Website, AI Software / App, Multi-Agent System, Payments Setup, Lead Engine, Automation Add-On, Rental Listing Film, and Basic Package (`lib/site/productScopes.ts`). Shown on each service card and on checkout. **These counts are my proposal**: confirm you can deliver them. |
| 6 | Confirm AI-made | The drone-style tour and the UGC presenters are AI-generated, so the copy now says so ("made with AI from your photos, not filmed by a real drone"). |
| 2 | Price NFC cards at $30 | Every NFC card product and the add-on are a flat **$30**, no setup fee, no volume special, no separate website price. The first card stays free with a $1,000+ cinematic video tier. |
| 1 | Remove the invented "was" prices | The "was $500" and "was $5,000" strikethroughs and the word "now" are gone. The only crossed-out price left is the bundle's own total of its parts at current prices ($1,086), which is true by arithmetic. |

Also fixed while doing this: the public "Your price, next to the market" table on /services used hard-coded agency ranges and claimed every build was below the market floor, "$198,000 mid-market", "$36k+ saved", and "40 to 60% faster to ship". None of that was sourced or true against the ranges above. The table now uses the sourced ranges, works out for each row whether the price is below, at the low end of, or within the range, adds up its totals from the rows, links its sources, and drops the unsourced claims. Lead Engine is not in the table because its market figure is a monthly retainer and its price is one time.

### Catalog prune, then owner corrections (2026-09-20)

First pass: Basic Package, Custom Build Consultation, Cinematic Ad, 3-Month Maintenance and Monthly Optimization were taken off the shelf as overlapping or unbuilt. The owner then answered: nobody ever bought 3-Month Maintenance, so **delete it**; **turn the rest back on** (Basic Package, Custom Build Consultation, Cinematic Ad); he can deliver the Monthly Ads counts of 10, 20 and 40; Stripe is live.

Final state:

| Product | State |
|---|---|
| 3-Month Maintenance | **Deleted** (no orders referenced it). Its extra, pitch, and the sentences about it in the Terms and Refund Policy are gone. |
| Basic Package ($1,000), Custom Build Consultation ($100), Cinematic Ad ($500) | **On sale again**, back on the homepage and in the market table. |
| Monthly Optimization ($400) | Stays off. Monthly Ads plans replaced it, and it promised monitoring that was never built. Nothing to restore unless you want it. |

Kept from the first pass: the seven single-design NFC cards are hidden from the /services grid (the "NFC Cards, Mix & Match" card is the front door) but stay buyable by link; the invented crossed-out $500 on the homepage stays gone; a checkout link to any inactive product redirects to /services. The seed now sets `active: true` for every product it lists, so a product is on sale if it is listed and off the shelf if it is in `LEGACY_SLUGS`.

**Still open:** Basic Package ($1,000) and Rental Listing Film ($500) are both AI videos from photos, so the $1,000 tier needs a reason or a price change.
