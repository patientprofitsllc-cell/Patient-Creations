# Production QA checklist

How a customer's website goes from "built" to "live", what the system checks for you, what only you can check, and how to
undo a mistake. The same rules are enforced in the product (Admin, Sessions and Logs, open a project, "Website"), so this
page and the screen cannot disagree: the checklist there is `lib/site/build/checklist.ts`.

## 1. What the system checks by itself (every version, before the customer sees it)

A version that fails any **error** is never shown to the customer. Warnings are passed to you.

| Check | Severity |
|---|---|
| Business name, headline, and intro text are present | error |
| The phone number looks valid, and the main button links somewhere real | error |
| No text from our sample designs leaked into the page | error |
| The page has a title and a description | error |
| Mobile viewport and page language are set | error |
| No scripts and no outside requests, and the page is a small download | error |
| Body text and links are readable (contrast) | error |
| Every link uses a safe address (web, phone, or text only) | error |
| Everything the customer typed reached the page (their name, phone, address, hours, services, prices) | warning, and shown as advisory on the launch checklist |
| Title and description are a sensible length; secondary text is readable | warning |
| Services, hours, and location are listed | warning |

## 2. The launch checklist (required before "Mark as live")

Lines the system fills in:

1. The customer approved **this** version.
2. No change request is still open.
3. The automated checks in section 1 passed.
4. The customer finished their intake.
5. The order is paid in full. A deposit order waits here until the final payment is in.

Lines only you can tick, for **this exact version**:

6. I opened the preview on a phone and it looks right.
7. I tapped the phone number and it dialed the right number.
8. The business name, hours, and address match what the customer told us.
9. I put the site file on the customer's hosting and the live address opens it.

Ticks belong to one version. If a new or restored version is made, you look at it again.

**Launch anyway** exists for the rare case where you must go live with something unfinished. It asks you to confirm, and it is
written to the log with the list of what was missing.

## 3. Going back to an earlier version

Before a site is launched, open the project, find "Version history", pick a version, and choose **Go back to this one**. You
give a reason (it is recorded). This:

- makes a **new** version that is a copy of the one you picked, waiting for the customer's approval again;
- keeps every version. Nothing is deleted, and the one you went back from is marked superseded;
- withdraws any approval the customer had given, so they approve the restored version afresh;
- re-runs today's automated checks first, and refuses if the old version would no longer pass;
- tells the customer to look at the new preview, unless you turn that off.

A site that is already live is not rolled back here, because what is live is the copy you put on the customer's hosting.
Replace that copy by hand, or start a new build.

## 4. Who can see what (the isolation guard)

`tests/unit/routeGuards.test.ts` makes every API route declare who may call it (owner only, a signed-in customer, a private
link, a server secret, or open to anyone with the reason written down) and checks the code really contains that check. A new
route with no decision fails the build. The behavior is tested in `isolationSession.test.ts` and `isolationTokens.test.ts`:

- a customer cannot read or change another customer's project, review, or messages, and a project that belongs to someone else
  answers exactly like one that does not exist;
- a private link opens one customer's record. A malformed link and an unknown link answer identically, so nothing reveals
  which exist;
- the order confirmation page and the card-details form need a private key that only the buyer's link carries. An order number
  alone shows nothing and changes nothing.

## 5. Every time you change the production pipeline

1. Run the tests (`npm test`) and the build (`npm run build`).
2. Build one test website end to end: intake, preview, a change request, approval, the checklist, launch.
3. Try to break the checklist: skip a tick, leave a balance owed, open a change request. Launch must refuse each time.
4. Go back to an earlier version on a test project and confirm the customer has to approve it again.
