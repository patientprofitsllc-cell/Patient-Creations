// Compares every product and tier price in the database to lib/pricing/catalog.ts.
//   npx tsx --env-file=.env scripts/pricing/verify-db.ts
// Exits with an error if anything disagrees. Run it after a seed, or on a schedule.

import { PrismaClient } from "@prisma/client";
import { PRICE_CENTS, tierPriceCents, usd } from "../../lib/pricing/catalog";

const db = new PrismaClient();

async function main() {
  const rows = await db.product.findMany({ where: { active: true }, include: { variants: true } });
  const problems: string[] = [];
  let checked = 0;
  for (const p of rows) {
    const want = (PRICE_CENTS as Record<string, number>)[p.slug];
    if (want === undefined) {
      problems.push(`${p.slug}: on sale but has no price in the catalog`);
      continue;
    }
    checked++;
    if (p.priceCents !== want) problems.push(`${p.slug}: database ${usd(p.priceCents)}, catalog ${usd(want)}`);
    for (const v of p.variants) {
      if (v.name !== "Signature" && v.name !== "Flagship") continue;
      const wantTier = tierPriceCents(p.slug, v.name, want);
      if (v.priceCents !== wantTier) problems.push(`${p.slug} ${v.name}: database ${usd(v.priceCents)}, catalog ${usd(wantTier)}`);
    }
  }
  const missing = Object.keys(PRICE_CENTS).filter((s) => !rows.some((r) => r.slug === s));
  for (const s of missing) problems.push(`${s}: in the catalog but not on sale in the database`);

  console.log(`checked ${checked} products against the catalog`);
  for (const p of rows.filter((r) => r.variants.length > 0).sort((a, b) => a.priceCents - b.priceCents)) {
    const tiers = [p.priceCents, ...p.variants.sort((a, b) => a.priceCents - b.priceCents).map((v) => v.priceCents)].map(usd).join(" / ");
    console.log(`  ${p.slug.padEnd(22)} ${tiers}`);
  }
  if (problems.length) {
    console.error("\nPRICE MISMATCHES:\n" + problems.map((x) => "  - " + x).join("\n"));
    process.exit(1);
  }
  console.log("\nevery price in the database matches the catalog");
  await db.$disconnect();
}
main();
