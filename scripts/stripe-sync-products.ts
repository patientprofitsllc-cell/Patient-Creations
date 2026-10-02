// Mirrors every active product (and each tier) into your Stripe account's Product catalog, so every sale shows up in
// Stripe under its real product name and every price is visible in the Stripe dashboard.
//
// Checkout does NOT depend on this: it charges the live database price for each item directly (price_data), and every
// payment lands in whichever Stripe account STRIPE_SECRET_KEY belongs to. This script is for reporting and for using
// the same products in Payment Links or invoices you create by hand in Stripe.
//
// Safe to run again: products are matched by id `pc_<slug>` and prices by lookup key, and a price that changed gets a
// new Stripe price (the old one is archived, since Stripe prices can't be edited).
//
//   npm run stripe:sync           shows what would change
//   npm run stripe:sync -- --apply makes the changes
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const apply = process.argv.includes("--apply");

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Use the key from your own Stripe account (Developers › API keys).");
  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  const db = new PrismaClient();
  const account = await stripe.accounts.retrieve();
  console.log(`Stripe account: ${account.settings?.dashboard?.display_name ?? account.id} (${key.startsWith("sk_live") ? "LIVE" : "TEST"} mode)`);
  console.log(apply ? "Applying changes.\n" : "Dry run. Add --apply to make these changes.\n");

  try {
    const products = await db.product.findMany({ where: { active: true }, include: { variants: { where: { active: true } } }, orderBy: { sortOrder: "asc" } });
    let changed = 0;
    for (const p of products) {
      const entries = [
        { id: `pc_${p.slug}`, name: p.name, cents: p.priceCents },
        ...p.variants.map((v) => ({ id: `pc_${p.slug}_${v.id}`.slice(0, 64), name: `${p.name} (${v.name})`, cents: v.priceCents })),
      ];
      for (const e of entries) {
        const recurring = p.billingPeriod === "monthly" ? { interval: "month" as const } : undefined;
        const lookupKey = e.id;
        const existing = await stripe.products.retrieve(e.id).catch(() => null);
        const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
        const current = prices.data[0];
        const priceOk = current && current.unit_amount === e.cents && Boolean(current.recurring) === Boolean(recurring);
        if (existing && existing.name === e.name && existing.active && priceOk) continue;
        changed++;
        console.log(`${existing ? "update" : "create"}  ${e.name}  $${(e.cents / 100).toFixed(2)}${recurring ? "/mo" : ""}`);
        if (!apply) continue;
        if (!existing) {
          await stripe.products.create({ id: e.id, name: e.name, description: p.description.slice(0, 500) || undefined, metadata: { slug: p.slug } });
        } else if (existing.name !== e.name || !existing.active) {
          await stripe.products.update(e.id, { name: e.name, active: true });
        }
        if (!priceOk) {
          await stripe.prices.create({ product: e.id, currency: "usd", unit_amount: e.cents, recurring, lookup_key: lookupKey, transfer_lookup_key: true, metadata: { slug: p.slug } });
          if (current) await stripe.prices.update(current.id, { active: false });
        }
      }
    }
    console.log(changed ? `\n${changed} item(s) ${apply ? "synced" : "to sync"}.` : "\nEvery product is already in Stripe at the right price.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
