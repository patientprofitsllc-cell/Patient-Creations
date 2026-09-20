import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AD_PLANS, planDescription } from "../lib/ads/plans";
import { BUNDLE_DESCRIPTION, CINEMATIC_SPECIAL_DESCRIPTION, UGC_SPECIAL_DESCRIPTION } from "../lib/site/adSpecials";
import { PRODUCT_SCOPES } from "../lib/site/productScopes";

const db = new PrismaClient();

// Mirrors the real pricing model from "Patient Creations" (The Digital Master): a base (Core)
// price per service, with Signature (1.6x) and Flagship (2.5x) tiers for
// anything tierable, rounded to the nearest $50 — same formula as the
// original static page's `priceOf`/`round50`.
const round50 = (cents: number) => Math.round(cents / 5000) * 5000;
const tierPrice = (baseCents: number, mult: number) => round50(baseCents * mult);

interface ServiceDef {
  slug: string;
  name: string;
  category: string;
  description: string;
  baseCents: number;
  type?: "PRIMARY" | "SPECIAL"; // defaults to PRIMARY; SPECIAL stays off the regular /services grid
  setupFeeCents?: number; // per-unit setup fee folded into baseCents, waived in bulk (see BULK_SETUP_WAIVER_MIN_QTY)
  tierable: boolean;
  revisionLimit: number;
  turnaround: string;
  sortOrder: number;
}

const SERVICES: ServiceDef[] = [
  {
    slug: "site",
    name: "Cinematic AI Website",
    category: "Websites",
    description: PRODUCT_SCOPES.site.summary,
    baseCents: 200000,
    tierable: true,
    revisionLimit: 2,
    turnaround: "2-3 weeks",
    sortOrder: 1,
  },
  {
    slug: "saas",
    name: "AI Software / App",
    category: "Software",
    description: PRODUCT_SCOPES.saas.summary,
    baseCents: 1000000,
    tierable: true,
    revisionLimit: 3,
    turnaround: "4-8 weeks",
    sortOrder: 2,
  },
  {
    slug: "agents",
    name: "Multi-Agent System",
    category: "Automation",
    description: PRODUCT_SCOPES.agents.summary,
    baseCents: 600000,
    tierable: true,
    revisionLimit: 3,
    turnaround: "5-10 weeks",
    sortOrder: 3,
  },
  {
    slug: "rental-listing-film",
    name: "Rental Listing Film",
    category: "Video",
    description: PRODUCT_SCOPES["rental-listing-film"].summary,
    baseCents: 50000,
    tierable: true,
    revisionLimit: 1,
    turnaround: "5-7 days",
    sortOrder: 5,
  },
  {
    slug: "payments-setup",
    name: "Payments Setup",
    category: "Commerce",
    description: PRODUCT_SCOPES["payments-setup"].summary,
    baseCents: 90000,
    tierable: true,
    revisionLimit: 1,
    turnaround: "3-6 days",
    sortOrder: 6,
  },
  {
    slug: "lead-engine",
    name: "Lead Engine",
    category: "Growth",
    description: PRODUCT_SCOPES["lead-engine"].summary,
    baseCents: 170000,
    tierable: true,
    revisionLimit: 2,
    turnaround: "2-3 weeks",
    sortOrder: 7,
  },
  {
    slug: "strategy-session",
    name: "Strategy Session",
    category: "Advisory",
    description: "A one-hour working session. You leave with a written plan, and the fee is credited toward any build you book.",
    baseCents: 15000,
    tierable: false,
    revisionLimit: 0,
    turnaround: "60 minutes",
    sortOrder: 8,
  },
  {
    slug: "starter-website",
    name: "Quick Business Website",
    category: "Websites",
    description: "A custom one-page website built around your business: your services, contact details, call and text button, map, and basic SEO, deployed live with one revision. Our target is 72 hours once we have your info.",
    baseCents: 30000,
    tierable: false,
    revisionLimit: 1,
    turnaround: "3 days",
    sortOrder: 11,
  },
  {
    slug: "nfc-cards",
    name: "NFC Cards — Mix & Match",
    category: "Merch",
    description: "Tap-to-share smart cards. A phone tap opens your contact info, socials, or booking link. Choose how many of each design you want. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 12,
  },
  {
    slug: "nfc-wifi",
    name: "NFC WIFI Growth System",
    category: "Merch",
    description: "Save the confusion of the password and simply scan and go. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 13,
  },
  {
    slug: "nfc-custom-menu",
    name: "NFC Custom Menu Business Growth System",
    category: "Merch",
    description: "Save paper, copies, and time with your new scan and go menu. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 14,
  },
  {
    slug: "nfc-youtube",
    name: "NFC Youtube Growth System",
    category: "Merch",
    description: "Turn every happy customer into a subscriber with one tap. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 15,
  },
  {
    slug: "nfc-whatsapp",
    name: "NFC WhatsApp Growth System",
    category: "Merch",
    description: "Turn small talk into a conversation. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 16,
  },
  {
    slug: "nfc-instagram",
    name: "NFC Instagram Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential follower with one tap. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 17,
  },
  {
    slug: "nfc-tiktok",
    name: "NFC Tik Tok Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential follower with one tap. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 18,
  },
  {
    slug: "nfc-google-review",
    name: "NFC Google Review Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential Google review with one tap. Setup is included.",
    baseCents: 3000,
    setupFeeCents: 0,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 19,
  },
  // Homepage specials. type "SPECIAL" keeps them out of the regular /services
  // grid; they're bought through the special cards on the homepage.
  {
    slug: "cinematic-ad-special",
    name: "Cinematic Ad Special",
    category: "Ad Special",
    type: "SPECIAL",
    description: CINEMATIC_SPECIAL_DESCRIPTION,
    baseCents: 24900,
    tierable: false,
    revisionLimit: 1,
    turnaround: "5-7 days",
    sortOrder: 20,
  },
  {
    slug: "ugc-ad-special",
    name: "UGC Ad Special",
    category: "Ad Special",
    type: "SPECIAL",
    description: UGC_SPECIAL_DESCRIPTION,
    baseCents: 9900,
    tierable: false,
    revisionLimit: 1,
    turnaround: "5-7 days",
    sortOrder: 21,
  },
  {
    slug: "all-in-one-bundle",
    name: "All-in-One Launch Bundle",
    category: "Bundle",
    type: "SPECIAL",
    description: BUNDLE_DESCRIPTION,
    baseCents: 89900,
    tierable: false,
    revisionLimit: 2,
    turnaround: "2-3 weeks",
    sortOrder: 22,
  },
];

const ADD_ONS: {
  slug: string;
  name: string;
  category: string;
  type: "ORDER_BUMP" | "UPSELL" | "SUBSCRIPTION";
  description: string;
  priceCents: number;
  billingPeriod?: string;
  revisionLimit: number;
  sortOrder: number;
}[] = [
  {
    slug: "brand-kit",
    name: "Brand Kit",
    category: "Add-on",
    type: "ORDER_BUMP",
    description: "A logo, color system, and typography guide built specifically for your project, not a template.",
    priceCents: 25000,
    revisionLimit: 1,
    sortOrder: 1,
  },
  {
    slug: "extra-revision-package",
    name: "Extra Revision Package",
    category: "Add-on",
    type: "ORDER_BUMP",
    description: "Two more rounds of revisions if you need extra polish.",
    priceCents: 15000,
    revisionLimit: 0,
    sortOrder: 2,
  },
  {
    slug: "social-asset-pack",
    name: "Social Asset Pack",
    category: "Add-on",
    type: "ORDER_BUMP",
    description: "9:16, 1:1, and 16:9 crops of your hero creative, ready for social.",
    priceCents: 12000,
    revisionLimit: 0,
    sortOrder: 3,
  },
  {
    // Price is the flat per-card price ($30). lib/payments/nfcAddon.ts makes the
    // first card free on a $1,000+ cinematic video tier.
    slug: "nfc-card-addon",
    name: "NFC Card — Your Choice",
    category: "Add-on",
    type: "ORDER_BUMP",
    description: "Add NFC growth cards in the designs of your choice (Google Review, YouTube, Menu, WiFi, and more), $30 each. Tell us which designs right after checkout.",
    priceCents: 3000,
    revisionLimit: 0,
    sortOrder: 5,
  },
  {
    slug: "automation-add-on",
    name: "Automation Add-On",
    category: "Automation",
    type: "UPSELL",
    description: PRODUCT_SCOPES["automation-add-on"].summary,
    priceCents: 60000,
    revisionLimit: 1,
    sortOrder: 1,
  },
  {
    // Started from the customer's project page once their website is live (see
    // app/api/care/checkout). Never sold through the ordinary one-time checkout.
    slug: "care-plan",
    name: "Website Care Plan",
    category: "Care Plan",
    type: "SUBSCRIPTION",
    description: "Monthly care for your live website: small updates, and we keep it online and your domain looked after. Cancel any time.",
    priceCents: 7900,
    billingPeriod: "monthly",
    revisionLimit: 0,
    sortOrder: 3,
  },
  // Monthly Ads plans. Started from /monthly-ads (see app/api/ads/checkout), never through
  // the one-time checkout. Wording and counts come from lib/ads/plans.ts so nothing can drift.
  ...AD_PLANS.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: "Monthly Ads",
    type: "SUBSCRIPTION" as const,
    description: planDescription(p),
    priceCents: p.fallbackPriceCents,
    billingPeriod: "monthly",
    revisionLimit: p.counts.revisionRounds,
    sortOrder: p.sortOrder,
  })),
];

// Current physical stock on hand, as counted by Trenton. `update` never
// touches quantityOnHand on a reseed — only `create` sets a starting count —
// so re-running this script can't clobber stock changes made since launch.
const INVENTORY: { sku: string; label: string; productSlug: string | null; quantityOnHand: number }[] = [
  { sku: "nfc-tiktok", label: "TikTok", productSlug: "nfc-tiktok", quantityOnHand: 10 },
  { sku: "nfc-instagram", label: "Instagram", productSlug: "nfc-instagram", quantityOnHand: 20 },
  { sku: "nfc-google-review-black", label: "Google Review — Black", productSlug: null, quantityOnHand: 20 },
  { sku: "nfc-google-review-white", label: "Google Review — White", productSlug: null, quantityOnHand: 20 },
  { sku: "nfc-youtube", label: "YouTube", productSlug: "nfc-youtube", quantityOnHand: 0 },
  { sku: "nfc-custom-menu", label: "Custom Menu", productSlug: "nfc-custom-menu", quantityOnHand: 0 },
  { sku: "nfc-whatsapp", label: "WhatsApp", productSlug: "nfc-whatsapp", quantityOnHand: 0 },
  { sku: "nfc-wifi", label: "WiFi", productSlug: "nfc-wifi", quantityOnHand: 0 },
];

// Slugs from the earlier generic "AI Creation Studio" catalog. Deactivated
// rather than deleted so historical orders/order items that reference them
// keep working; they're excluded from /services by the `active` filter.
const LEGACY_SLUGS = [
  "ai-website",
  "cinematic-ai-ad",
  "ai-character",
  "ai-agent-system",
  "monthly-optimization", // promised monitoring that is not built
  "custom-build", // a second, overlapping consultation next to the Strategy Session
  "basic-package", // the same kind of AI video tour as the Rental Listing Film, at twice the price
  "ad", // the per-ad specials and the Monthly Ads plans cover ads; three ad products was one too many
  "maintenance-3mo", // overlaps the monthly Website Care Plan
];

async function main() {
  await db.product.updateMany({ where: { slug: { in: LEGACY_SLUGS } }, data: { active: false } });

  for (const s of SERVICES) {
    const product = await db.product.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        type: s.type ?? "PRIMARY",
        description: s.description,
        priceCents: s.baseCents,
        setupFeeCents: s.setupFeeCents ?? 0,
        revisionLimit: s.revisionLimit,
        turnaround: s.turnaround,
        sortOrder: s.sortOrder,
      },
      create: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        type: s.type ?? "PRIMARY",
        description: s.description,
        priceCents: s.baseCents,
        setupFeeCents: s.setupFeeCents ?? 0,
        revisionLimit: s.revisionLimit,
        turnaround: s.turnaround,
        sortOrder: s.sortOrder,
      },
    });

    if (s.tierable) {
      const tiers: { name: string; priceCents: number }[] = [
        { name: "Signature", priceCents: tierPrice(s.baseCents, 1.6) },
        { name: "Flagship", priceCents: tierPrice(s.baseCents, 2.5) },
      ];
      for (const t of tiers) {
        const existing = await db.productVariant.findFirst({ where: { productId: product.id, name: t.name } });
        if (existing) {
          await db.productVariant.update({ where: { id: existing.id }, data: { priceCents: t.priceCents } });
        } else {
          await db.productVariant.create({ data: { productId: product.id, name: t.name, priceCents: t.priceCents } });
        }
      }
    }
  }

  for (const a of ADD_ONS) {
    await db.product.upsert({ where: { slug: a.slug }, update: a, create: a });
  }

  for (const i of INVENTORY) {
    await db.inventoryItem.upsert({
      where: { sku: i.sku },
      update: { label: i.label, productSlug: i.productSlug },
      create: i,
    });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "book@patientprofits.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "change-me-now";

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.user.create({
      data: { email: adminEmail, name: "Patient Profits LLC", passwordHash, role: "ADMIN" },
    });
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
  }

  console.log(`Seeded ${SERVICES.length} services and ${ADD_ONS.length} add-ons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
