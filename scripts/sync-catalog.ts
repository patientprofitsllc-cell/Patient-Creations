// Runs before every build (see "build" in package.json): makes the live product and add-on rows match the price list in
// lib/pricing/catalog.ts, so a price change goes live with the deploy and nobody has to run SQL by hand. It only touches
// products and add-ons (never users, orders, or inventory). If there is no database to reach, it says so and the build
// carries on with the prices already in the database.
import { PrismaClient } from "@prisma/client";
import { syncCatalog } from "../prisma/seed";

async function run() {
  // Netlify sets CONTEXT on every build. Deploy previews and branch deploys share the live database, so only the
  // production deploy (a merge to master) may change prices; a preview of an unmerged change must never reach customers.
  const context = process.env.CONTEXT;
  if (context && context !== "production") {
    console.log(`sync-catalog: ${context} build, skipped (only the production deploy updates prices)`);
    return;
  }
  const url = process.env.DATABASE_URL ?? "";
  if (!/^postgres(ql)?:\/\//.test(url)) {
    console.log("sync-catalog: no Postgres DATABASE_URL at build time, skipped");
    return;
  }
  const db = new PrismaClient();
  try {
    await syncCatalog(db);
    console.log("sync-catalog: product and add-on prices are up to date");
  } catch (e) {
    console.warn("sync-catalog: skipped, could not update the database:", e instanceof Error ? e.message : e);
  } finally {
    await db.$disconnect();
  }
}

void run();
