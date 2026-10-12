# Patient Creations CRM — Codex Development Branch

This directory is the dedicated Codex handoff location for the Patient Creations sales CRM. The original public website remains on the `master` branch.

## Required source archive
Download `patient-creations-codex-handoff.zip` from the ChatGPT project conversation and extract its seven files here. Do not discard `legacy/index.html` or `data/leads-134.json`.

## Daily lead data
Additional CSV/JSON imports for 2026-10-11 and 2026-10-12 are provided separately in the ChatGPT conversation, 50 leads each. Intended historical aggregate is up to 234 records before cross-batch deduplication. Do not silently replace contacts or mark prospects as verified.

## Codex command
"Read crm-codex/AGENTS.md and the extracted legacy CRM and import datasets. Build the full application, automated test suite, migrations, and deployment instructions. Keep the public Patient Creations marketing site unchanged. Report all external credentials or approvals required to activate ingestion and cloud sync."

## Status
Planning and GitHub branch scaffolding committed; original CRM source and lead data still need to be added from the handoff archive. Not deployed.
