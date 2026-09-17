// Client-safe (no @/lib/db import) — shared between the server-side pricing
// engine and the checkout UI's live preview, so they can never disagree.
export const BULK_SETUP_WAIVER_MIN_QTY = 10;
