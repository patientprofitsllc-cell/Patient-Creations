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

## Sources

- Human and AI UGC, agencies and retainers: [Sepia, How Much Does UGC Cost in 2026](https://sepia-lab.com/en/blog/how-much-does-ugc-cost), [agent-media, AI UGC pricing comparison 2026](https://agent-media.ai/blog/ai-ugc-pricing-comparison-2026), [Arcads pricing 2026 (eesel)](https://www.eesel.ai/blog/arcads-ai-pricing), [Sparkiz, UGC ads cost 2026](https://sparkiz.ai/blog/ugc-ads-cost/)
- Video editing subscriptions: [ProductizeHub, Unlimited Video Editing Subscriptions 2026](https://productizehub.com/blog/unlimited-video-editing-subscriptions)
- Video ad production: [Vidico, Promo Video Cost 2026](https://vidico.com/news/promo-video-pricing/), [Sovran, Video Ad Production Cost 2026](https://sovran.ai/benchmarks/video-ad-production-cost), [D-MAK, Social Media Video Pricing 2026](https://dmakproductions.com/blog/social-media-video-pricing/)
- Websites: [Jim, Small Business Website Cost](https://www.jim.com/blog/small-business-website-cost), [eSEOspace, Custom Landing Page Cost](https://eseospace.com/blog/how-much-does-a-custom-landing-page-cost-pricing-for-freelance-agency-and-diy/)
- Apps and SaaS: [Purrweb, SaaS Development Costs 2026](https://www.purrweb.com/blog/saas-development-cost/), [URLaunched, MVP Development Cost 2026](https://www.urlaunched.com/blog/development-cost-for-startups)
- AI automation: [Taskip, AI Automation Agency Cost](https://taskip.net/ai-automation-agency-cost/), [Parix, How Much Does AI Automation Cost](https://parix.ai/blog/how-much-does-ai-automation-cost/)
- Rental and real estate video: [RoomLift, Real Estate Videography Pricing 2026](https://www.roomlift.ai/blog/real-estate-videography-pricing), [TourKit, Real Estate Videographer Cost](https://tourkitapp.com/blog/real-estate-videographer-cost)
- NFC review cards: [Etsy, Google review cards](https://www.etsy.com/market/google_review_cards), [TAPiTAG Google Review Card](https://tapitag.co/products/google-review-nfc-card-increase-your-reviews)
- Stripe integration: [Techconcepts, Stripe Integration Cost](https://techconcepts.org/blog/stripe-payment-integration-cost), [Cadence, Cost to integrate Stripe](https://cadence.withremote.ai/blog/cost-to-integrate-stripe)
- Website maintenance: [Ueni, Website Maintenance Cost 2026](https://ueni.com/blog/website-maintenance-cost/), [WebFX, Website Maintenance Pricing](https://www.webfx.com/web-development/pricing/website-maintenance/)
- Logo and brand identity: [ManyPixels, Logo Design Cost 2026](https://www.manypixels.co/blog/brand-design/logo-design-cost-guide), [Brand Identity Design Cost 2026](https://www.joaoqueiros.com/blog-how-much-does-brand-identity-cost.html)
- Lead generation: [NewMedia, Lead Generation Cost 2026](https://newmedia.com/blog/lead-generation-cost)
- Consulting rates: [Strategic Pete, Marketing Consultant Rates 2026](https://strategicpete.com/blog/marketing-consultant-rates/), [Outer Box Design, Marketing Consultant Cost](https://www.outerboxdesign.com/articles/digital-marketing/marketing-consultant-cost/)

Price guides are published by companies that sell related services, so treat the ranges as directional. Re-check them before a price change.
