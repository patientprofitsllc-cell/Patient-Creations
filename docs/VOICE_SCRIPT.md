# Voice guide script

Every line the voice guide can speak, one per page or product, plus two chat lines. The words below are what is recorded. Lines are recorded once (never generated live), so the timing of each one is known before a visitor arrives.

Voice: **Xavier** (preset voice `43173c95-3ec8-446a-a162-6504332c578b`). Recorded: **3 of 25** lines. The guide button stays hidden on the site until every line is recorded.

Rules for the words: no digits, dollar signs, or percent signs (prices, counts, and times change and a recording cannot; the screen always shows the real numbers), no promised results, no tool names, no dashes used as punctuation. Editing a line here without recording it again is caught by the tests.

| Line | Plays on | Words | Length |
|---|---|---|---|
| home | Home page | Welcome to Patient Creations. We build cinematic websites, ads, and AI tools for small businesses. Look around, and tap any card to see what it includes. | not recorded yet |
| services | Services page | This is everything we build, from a simple website to full AI systems. Each card lists what is included and what is not, so there are no surprises. | not recorded yet |
| pricing | Pricing page | Here is how our pricing works. Every price is shown up front, and each optional extra says exactly what it adds. | 7.7 s |
| monthly-ads | Monthly Ads page | Monthly Ads gives you a fresh batch of ads every month. Pick the plan that fits, and you can cancel any time. | 7.6 s |
| showcase | Gallery, Examples, and Websites pages | Here are examples of our work. Browse them for ideas, and picture how they could look for your business. | not recorded yet |
| checkout | Checkout, for a product without its own line | You are almost done. Check your order, add any extras you like, and pay securely. | not recorded yet |
| success | Order confirmation page | Thank you. Your order is in. Follow the next step on screen, and we will take it from there. | 5.8 s |
| site | Cinematic AI Website | The Cinematic AI Website is a multi page site with a motion hero, built around your business. Pick the tier that fits. | not recorded yet |
| saas | AI Software and App | AI Software turns your idea into a working app. What is included, and what each tier adds, is listed on screen. | not recorded yet |
| agents | Multi Agent System, and the Agents page | The Multi Agent System builds a team of AI helpers that work together on your tasks. What is included is listed on screen. | not recorded yet |
| ad | Cinematic Ad | The Cinematic Ad is a short, scroll stopping video made for social media, in the tier you choose. | not recorded yet |
| rental-listing-film | Rental Listing Film | The Rental Listing Film is a cinematic video tour of your rental, made with AI from your listing photos. | not recorded yet |
| lead-engine | Lead Engine | The Lead Engine is built to help you capture new leads. See exactly what is included, and what is not, on screen. | not recorded yet |
| payments-setup | Payments Setup | Payments Setup gets you ready to take payments online. The steps we handle are listed on screen. | not recorded yet |
| basic-package | Basic Package | The Basic Package gives you drone style videos of your building and storefront, made with AI from your photos, plus NFC cards. | not recorded yet |
| starter-website | Quick Business Website | The Quick Business Website is a one page site with your services, contact details, and a call button, built from your own words. | not recorded yet |
| strategy-session | Strategy Session | The Strategy Session is a live call to map out what to build first for your business. | not recorded yet |
| custom-build | Custom Build Consultation | The Custom Build Consultation is a call about anything beyond our menu, and the fee is credited toward the build. | not recorded yet |
| cinematic-ad-special | Cinematic Ad Special | The Cinematic Ad Special is one polished video ad for a single product or offer, at a special price. | not recorded yet |
| ugc-ad-special | UGC Ad Special | The UGC Ad Special is a creator style ad with an AI presenter, with a few opening hooks for you to test. | not recorded yet |
| all-in-one-bundle | All in One Launch Bundle | The All in One Launch Bundle packs a website, ads, and NFC cards into one fixed price, so you can launch everything at once. | not recorded yet |
| nfc-cards | NFC cards, every design | NFC cards let a customer tap their phone to open your review page, menu, or link. You pick your designs after checkout. | not recorded yet |
| ads-plan | Monthly Ads plan, on the start page | You are starting a Monthly Ads plan. After you pay, you fill in a short brief, and we make your ads from it. | not recorded yet |
| chat-welcome | Private project page, when it opens | This is your project page. Ask me about progress or timing, and I will pass anything else to our team. | not recorded yet |
| chat-reply | Private project page, when a new reply arrives | You have a new reply on your project page. | not recorded yet |

## How the timing works

- A page or product change waits 0.7 s before speaking, so the visitor sees the page first.
- Switching again before that restarts the wait, so a line for a page already left never plays.
- Only one line plays at a time; leaving a page cuts its line off within 0.18 s.
- A line plays once per visit, and the Replay button repeats it.
- A line that has not loaded in time is dropped rather than played late.
- A new chat reply speaks at once if the guide is quiet, or right after the current line ends.

## To record or re-record lines

1. Record the words above in the voice, one file per line, named `voice-src/<line>.wav`.
2. Run `npx tsx scripts/voice/build-clips.ts`.
3. Run the tests. They check every recording matches its words, every file's measured length matches the manifest, and every product and page has a line.
