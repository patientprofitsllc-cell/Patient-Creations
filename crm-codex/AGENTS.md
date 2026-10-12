# Patient Creations CRM — Codex Instructions

Build a secure, production-quality multi-device CRM as an independent application. DO NOT modify or deploy the existing Patient Creations public website from this branch.

## Existing assets
An existing standalone CRM and 134-lead dataset are available in the ChatGPT handoff archive `patient-creations-codex-handoff.zip`. The archive includes `legacy/index.html`, `data/leads-134.json`, `data/leads-original-34.csv`, `data/leads-next-100.csv`, and detailed instructions. Obtain/extract that archive into this directory before migrating the UI; do not falsely claim it is already committed.

Two more lead batches are available: 2026-10-11 (50 prospects) and 2026-10-12 (50 prospects). Import only after checking deduplication and data provenance. Treat leads as prospects, never as verified Google rank failures or current customers.

## Product scope
- Responsive high-quality dark-mode dashboard for mobile, tablet, desktop
- Lead pipeline: new, needs verification, qualified, contacted, demo booked, proposal, won, lost
- Lead profiles: contacts, business category, city, source URL, observed issue, evidence/verification status, assigned offer, notes, call history, next follow-up
- Click-to-call on mobile, clickable email/website, call activity recording manually (not covert audio recording)
- Live cold-call script cockpit: clearly highlighted spoken lines, separate coaching notes, business-specific openers, objection selector, and copy buttons
- Search, filters, qualification scores, deduplication by source identifiers/normalized name + phone, bulk CSV/JSON import, preview before commit, export
- Database-backed storage; authenticated user access with secure permissions and full audit-friendly data model
- Lead collection integration placeholder for daily 50 geographically relevant Columbus GA-area prospects, with manual review gates and evidence of website issues. Never claim Google rankings without keyword/location/date measurements.
- Reliable deployment and tests, documentation of needed services and costs

## Rules
Preserve sources, never invent business contact details, avoid storing arbitrary scraped personal data, protect CRM access, document third-party API authorization and rate limits, and keep the marketing site untouched. Never push leads or user records into public branch `master`. Use environment variables for secrets, and verify import counts.
