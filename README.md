# AI Creation Studio

A cinematic AI creation studio platform: marketing site → checkout → AI orchestrator/worker
production pipeline → QA/perception audit loop → customer portal → referrals/commissions →
admin command center.

Built from the spec in `docs/` (copied verbatim from the original master package). See
`docs/IMPLEMENTATION_STATUS.md` for exactly what's real vs. mocked and how to go live.

## Quick start

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000. No external accounts are required — payments, email, and AI
model calls all run in mock mode until you add the relevant key to `.env`.

## Scripts

- `npm run dev` — start the dev server
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — end-to-end smoke tests (Playwright)
- `npm run db:migrate` / `npm run db:seed` — database
