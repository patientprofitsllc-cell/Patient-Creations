# Deployment, and what true 24/7 operation still needs

## What is deployed

Everything runs inside the existing Next.js app on the existing database. There is no separate service.

- The tables (`UniverseMission`, `UniverseTask`, `UniverseMemory`, `UniverseActivity`) were added to the shared database. Nothing was changed or removed.
- The dashboard is **Admin, then Agents**.
- The four API routes are listed in `security.md`.

## Turning on the daily run

The Agent Universe does **not** run by itself. An AI cannot be "running 24/7" unless something calls it. Three things must all be true
before a daily audit happens without you:

1. **A scheduler calls it.** Netlify does not schedule for you here. Point any scheduler (a cron service, a GitHub Action, Netlify scheduled functions) at

   ```
   GET https://<your site>/api/cron/universe
   Authorization: Bearer <CRON_SECRET>
   ```

   once a day. It runs the daily audit, and on Mondays the weekly review.
2. **`CRON_SECRET` is set** on the server, 24 or more characters. Without it the address answers 404. (The same secret already protects the morning brief and the follow-ups.)
3. **The level is AUTONOMOUS and autonomy is not paused.** Set it on the Agents page. At any lower level the run is refused and recorded as refused.

Even then the run is capped: each daily command runs at most once a day, and at most four autonomous runs happen in a day.
A run that starts on its own only records tasks and a decision, and notifies you if something is urgent. It cannot change
prices, send email, spend money, or delete anything.

## Function time limits

A whole-business run reads live data and opens four pages. Against the real records it took about four seconds. The routes ask
for up to 60 seconds (`maxDuration`), but the host decides: Netlify's default limit for a function is 10 seconds, and a slow
database or a slow page could pass it. If a run is cut off, raise the function timeout in the Netlify site settings, or run
the lighter commands (the daily audit, or a single question). The agents' own limits are 8 seconds per data source, 7 seconds for
the pages, and 15 seconds per agent, so a slow source becomes DATA NOT AVAILABLE rather than a hang.

## Environment

| Setting | Effect |
|---|---|
| `CRON_SECRET` | Lets the scheduler call `/api/cron/universe`. Off without it. |
| `UNIVERSE_SITE_URL` | The public address LOOK examines. Defaults to the site address in `lib/config/site.ts`. Set it if that address does not serve the site yet (at the time of the first real run, `patientcreations.com` did not answer from the build machine, and the Netlify address was used). |
| `AI_ENABLED=true` and `ANTHROPIC_API_KEY` | Optional. Lets SPEAKER write copy with a model. Whatever it writes is checked by LOGIC. Off by default. |
| `OWNER_ALERT_EMAIL` | Not used by the agents. Urgent items go to the admin notifications. |

The configuration checks (email, daily jobs, mailing address, card payments) read the environment of whatever is running the
code. Run on your own computer, they describe your computer. Run from the dashboard on the live site, they describe the live site.

## What still needs outside infrastructure for true 24/7

| Need | Why | Today |
|---|---|---|
| A scheduler | Nothing else wakes the system | Not set up. You choose one. |
| A longer function timeout, or a background worker | A full audit can approach a short function limit | Default limits apply |
| An email channel | Urgent items appear in the admin notifications; they are not emailed | Email domain is not verified, so no email sends from the app at all |
| Outside research | RUN_RESEARCH reports what is known and what is not; it does not search the web | No research tool is connected. Say what you want researched and add a probe. |
| Image review | LOOK reads markup; it cannot see a rendered page | A screenshot-capable model or a person |
| A writing model | SPEAKER cannot rewrite prose without one | Off; it cleans and checks the text you give it |
| Wiring to live events | New order, payment, and form events do not call the Agent Universe | Not wired, on purpose. Each is a single `handleEvent` call to add, and only three event types start a mission. |

## Rolling back

Nothing else in the app depends on the Agent Universe. To switch it off, set the level to READ, or remove the **Agents** tab. The
tables can stay; they are only read by these pages.
