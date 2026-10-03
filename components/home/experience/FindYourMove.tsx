import { money } from "@/components/home/specialFrame";
import { Reveal } from "@/components/motion/Reveal";
import { db } from "@/lib/db";
import { AUDIT_CREDIT_DAYS, AUDIT_FEE_CENTS, PRICE_CENTS, SPECIAL_CARE_MONTHS, BUNDLE_PARTS, usd, type PricedSlug } from "@/lib/pricing/catalog";
import { PRICE_LIST, PRICE_LIST_SLUGS } from "@/lib/site/priceList";
import { AuditNudge, SectionHead } from "./Sections";
import { MoveTabs, type MoveGroup } from "./MoveTabs";

// The concept site's card details for the headline products. Everything else uses its price-list line.
const EXTRA: Partial<Record<PricedSlug, { eyebrow: string; points?: string[]; cta?: string }>> = {
  "website-special": {
    eyebrow: "Your first big move",
    points: ["Mobile optimized + basic SEO", "Business-specific copy + one revision", `${SPECIAL_CARE_MONTHS} months of maintenance included`],
  },
  site: { eyebrow: "Make an impression", points: ["Cinematic motion hero", "Up to 5 pages in the starting tier", "Target delivery: 2–3 weeks"] },
  "all-in-one-bundle": {
    eyebrow: "Your launch, fully loaded",
    points: [`Website Special + ${SPECIAL_CARE_MONTHS} months of care`, `${BUNDLE_PARTS.cinematicAds} Cinematic Ads + ${BUNDLE_PARTS.ugcAds} UGC Ads`, `${BUNDLE_PARTS.cards} Business Cards of your choice`],
  },
  "ugc-ad-special": { eyebrow: "Meet your next customer" },
  "cinematic-ad-special": { eyebrow: "Your story, a little bigger" },
  "nfc-cards": { eyebrow: "One tap, one connection" },
  "strategy-session": { eyebrow: "Not sure yet?" },
};

/** "03 / Find your next move": every product, a tab per group, at live prices. */
export async function FindYourMove() {
  let rows: { slug: string; name: string; priceCents: number; active: boolean; variants: { id: string }[] }[] = [];
  try {
    rows = await db.product.findMany({
      where: { slug: { in: PRICE_LIST_SLUGS } },
      select: { slug: true, name: true, priceCents: true, active: true, variants: { where: { active: true }, select: { id: true } } },
    });
  } catch {
    /* fall back to the price list */
  }
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  const groups: MoveGroup[] = PRICE_LIST.map((g) => ({
    id: g.id,
    title: g.id === "ads" ? "Ads & video" : g.title,
    blurb: g.blurb,
    cards: g.items
      .filter((i) => bySlug.get(i.slug)?.active ?? true)
      .map((i, n) => {
        const row = bySlug.get(i.slug);
        const extra = EXTRA[i.slug];
        return {
          slug: i.slug,
          eyebrow: extra?.eyebrow,
          name: i.name,
          price: money(row?.priceCents ?? PRICE_CENTS[i.slug]),
          from: Boolean(i.from || (row?.variants.length ?? 0) > 0),
          unit: i.unit,
          line: i.line,
          points: extra?.points,
          href: i.href ?? `/checkout?product=${i.slug}`,
          cta: i.href ? (i.cta ?? "Learn more") : `Choose ${i.name}`,
          featured: g.id === "websites" && n === 0,
        };
      }),
  })).filter((g) => g.cards.length > 0);

  return (
    <section id="products" aria-labelledby="products-title" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6">
      <SectionHead id="products-title" label="03 / Find your next move" line1="Big possibilities." line2="Clear prices.">
        Choose the piece you need today. Add the rest when you&apos;re ready.
      </SectionHead>
      <Reveal>
        <MoveTabs groups={groups} />
      </Reveal>
      <AuditNudge fee={usd(AUDIT_FEE_CENTS)} creditDays={AUDIT_CREDIT_DAYS} />
    </section>
  );
}
