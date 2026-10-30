// Runs only when scripts/sync-catalog.ts itself could not run or reported a failure (see "build" in package.json).
// Default: say so and let the build continue with the prices already in the database (the long-standing behavior).
// With CATALOG_SYNC_STRICT=1 set in Netlify's production environment, the build stops instead, so a price change can
// never go live in the code while checkout keeps charging the old database price.
const strict = process.env.CATALOG_SYNC_STRICT === "1";
console.log(`sync-catalog: could not run${strict ? " (CATALOG_SYNC_STRICT=1: failing the build)" : ""}`);
process.exit(strict ? 1 : 0);
