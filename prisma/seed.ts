import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
    description: "A bespoke, motion-forward site built as a single fast build: cinematic, responsive, and accessible.",
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
    description: "A full product with accounts, a database, live billing, and an AI feature at its core.",
    baseCents: 400000,
    tierable: true,
    revisionLimit: 3,
    turnaround: "4-8 weeks",
    sortOrder: 2,
  },
  {
    slug: "agents",
    name: "Multi-Agent System",
    category: "Automation",
    description: "A community of agents that plan, act, review, and improve, shipped with a dashboard and a tested API.",
    baseCents: 600000,
    tierable: true,
    revisionLimit: 3,
    turnaround: "5-10 weeks",
    sortOrder: 3,
  },
  {
    slug: "ad",
    name: "Cinematic Ad",
    category: "Video",
    description: "A scroll-stopping AI-made spot, graded and cut for every platform, delivered as a master plus variations.",
    baseCents: 50000,
    tierable: true,
    revisionLimit: 2,
    turnaround: "1-2 weeks",
    sortOrder: 4,
  },
  {
    slug: "rental-listing-film",
    name: "Rental Listing Film",
    category: "Video",
    description: "A cinematic walkthrough and conversion-tuned copy that books out a short-term rental calendar.",
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
    description: "Real Stripe payments in any site or app, one-off or subscription, on a production-grade stack.",
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
    description: "A system that finds, scores, and routes prospects to you on its own.",
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
    description: "A focused working hour. You leave with a written build plan, and the fee is credited toward a booked build.",
    baseCents: 15000,
    tierable: false,
    revisionLimit: 0,
    turnaround: "60 minutes",
    sortOrder: 8,
  },
  {
    slug: "custom-build",
    name: "Custom Build Consultation",
    category: "Bespoke",
    description: "This is a CONSULTATION only, not a build. A focused call to talk through your wants, needs, and expectations for anything outside the menu. The fee is fully credited toward the build once we scope it.",
    baseCents: 10000,
    tierable: false,
    revisionLimit: 0,
    turnaround: "scoped on the call",
    sortOrder: 9,
  },
  {
    slug: "basic-package",
    name: "Basic Package",
    category: "Local Business",
    description: "A drone-style walkthrough of your building and storefront, built to run as your homepage hero, so customers know exactly where to go before they show up.",
    baseCents: 100000,
    tierable: false,
    revisionLimit: 1,
    turnaround: "3-5 days",
    sortOrder: 10,
  },
  {
    slug: "starter-website",
    name: "Starter Website",
    category: "Websites",
    description: "A simple one-page site: a header, a product catalog, and an image and description for each item. The fast, affordable way to get a real page live.",
    baseCents: 30000,
    tierable: false,
    revisionLimit: 1,
    turnaround: "3-5 days",
    sortOrder: 11,
  },
  {
    slug: "nfc-cards",
    name: "NFC Cards",
    category: "Merch",
    description: "Tap-to-share smart cards. A phone tap opens your contact info, socials, or booking link. No app required. Choose how many you need. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 12,
  },
  {
    slug: "nfc-wifi",
    name: "NFC WIFI Growth System",
    category: "Merch",
    description: "Save the confusion of the password and simply scan and go. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 13,
  },
  {
    slug: "nfc-custom-menu",
    name: "NFC Custom Menu Business Growth System",
    category: "Merch",
    description: "Save paper, copies, and time with your new scan and go menu. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 14,
  },
  {
    slug: "nfc-youtube",
    name: "NFC Youtube Growth System",
    category: "Merch",
    description: "Turn every happy customer into a subscriber with one tap. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 15,
  },
  {
    slug: "nfc-whatsapp",
    name: "NFC WhatsApp Growth System",
    category: "Merch",
    description: "Turn small talk into a conversation. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 16,
  },
  {
    slug: "nfc-instagram",
    name: "NFC Instagram Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential follower with one tap. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 17,
  },
  {
    slug: "nfc-tiktok",
    name: "NFC Tik Tok Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential follower with one tap. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 18,
  },
  {
    slug: "nfc-google-review",
    name: "NFC Google Review Growth System",
    category: "Merch",
    description: "Turn every happy customer into a potential Google review with one tap. Includes a $25 setup fee.",
    baseCents: 12500,
    setupFeeCents: 2500,
    tierable: false,
    revisionLimit: 0,
    turnaround: "5-7 business days",
    sortOrder: 19,
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
    slug: "maintenance-3mo",
    name: "3-Month Maintenance",
    category: "Add-on",
    type: "ORDER_BUMP",
    description: "Three months of site maintenance covered up front: updates, monitoring, and small fixes.",
    priceCents: 25000,
    revisionLimit: 0,
    sortOrder: 4,
  },
  {
    slug: "automation-add-on",
    name: "Automation Add-On",
    category: "Automation",
    type: "UPSELL",
    description: "Connect your build to lead-routing and email automation.",
    priceCents: 60000,
    revisionLimit: 1,
    sortOrder: 1,
  },
  {
    slug: "monthly-optimization",
    name: "Monthly Optimization",
    category: "Retainer",
    type: "SUBSCRIPTION",
    description: "We keep watch on how the site's performing and ship small improvements every month.",
    priceCents: 40000,
    billingPeriod: "monthly",
    revisionLimit: 0,
    sortOrder: 2,
  },
];

// Slugs from the earlier generic "AI Creation Studio" catalog. Deactivated
// rather than deleted so historical orders/order items that reference them
// keep working; they're excluded from /services by the `active` filter.
const LEGACY_SLUGS = ["ai-website", "cinematic-ai-ad", "ai-character", "ai-agent-system"];

async function main() {
  await db.product.updateMany({ where: { slug: { in: LEGACY_SLUGS } }, data: { active: false } });

  for (const s of SERVICES) {
    const product = await db.product.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        type: "PRIMARY",
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
        type: "PRIMARY",
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

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "book@patientprofits.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "change-me-now";

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.user.create({
      data: { email: adminEmail, name: "Trenton", passwordHash, role: "ADMIN" },
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
