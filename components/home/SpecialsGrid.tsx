import { AGENT_BUNDLE_SLUGS, PRICE_CENTS, SPECIAL_CARE_MONTHS, agentBundleSeparatelyCents, bundleSeparatelyCents, usd } from "@/lib/pricing/catalog";
import { PRODUCT_SCOPES } from "@/lib/site/productScopes";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { deliveryLine } from "@/lib/payments/deliveryWindow";
import { AdSpecial } from "./AdSpecial";
import { SpecialPriceCard } from "./SpecialPriceCard";
import { money } from "./specialFrame";
import { BUNDLE_ITEMS } from "@/lib/site/adSpecials";

const SLUGS = [
  "site",
  "ad",
  "website-special",
  "cinematic-ad-special",
  "ugc-ad-special",
  "all-in-one-bundle",
  "strategy-session",
  "nfc-cards",
  ...AGENT_BUNDLE_SLUGS,
  // The other parts of the AI Agent bundles, so their "bought separately" price comes from the live rows too.
  "agents",
  "lead-engine",
  "payments-setup",
  "care-plan",
];

/**
 * The current specials, lowest price first. Used on the homepage and /services
 * so both pages always show the same offers, prices, and wording, all read from
 * the same product rows as every other listing.
 */
export async function SpecialsGrid({
  className = "",
  exclude = [],
  heading = "Current",
}: {
  className?: string;
  /** Specials to leave out ("starter" on the homepage, where the main offer card already covers it). */
  exclude?: ("ads" | "starter" | "bundle" | "site" | "agent-bundles")[];
  heading?: string;
}) {
  const rows = await db.product.findMany({ where: { slug: { in: SLUGS }, active: true } });
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  const starter = bySlug.get("website-special");
  const siteProduct = bySlug.get("site");
  const cinAd = bySlug.get("cinematic-ad-special");
  const ugcAd = bySlug.get("ugc-ad-special");
  const consult = bySlug.get("strategy-session");
  const bundle = bySlug.get("all-in-one-bundle");
  const nfc = bySlug.get("nfc-cards");

  // Each special carries the price it's sorted by, so the grid always reads
  // lowest price to highest no matter which specials are active.
  const specials: { key: string; sortCents: number; node: ReactNode }[] = [];

  if (!exclude.includes("ads") && cinAd && ugcAd && consult) {
    specials.push({
      key: "ads",
      sortCents: Math.min(cinAd.priceCents, ugcAd.priceCents),
      node: (
        <AdSpecial
          cinematic={{ slug: cinAd.slug, priceCents: cinAd.priceCents }}
          ugc={{ slug: ugcAd.slug, priceCents: ugcAd.priceCents }}
          consultation={{ slug: consult.slug, priceCents: consult.priceCents }}
          delivery={deliveryLine(cinAd.turnaround)}
        />
      ),
    });
  }

  if (!exclude.includes("starter") && starter) {
    specials.push({
      key: "starter",
      sortCents: starter.priceCents,
      node: (
        <SpecialPriceCard
          lead={starter.name}
          accent={money(starter.priceCents)}
          description={starter.description}
          delivery={deliveryLine(starter.turnaround)}
          nowCents={starter.priceCents}
          href={`/checkout?product=${starter.slug}`}
          cta="Get the Website Special"
          footnote={`Includes ${SPECIAL_CARE_MONTHS} months of monthly maintenance. Add Business Cards for ${nfc ? money(nfc.priceCents) : usd(PRICE_CENTS["nfc-card-addon"])} each at checkout.`}
        />
      ),
    });
  }

  if (!exclude.includes("bundle") && bundle) {
    const separately =
      starter && cinAd && ugcAd && nfc
        ? bundleSeparatelyCents({ website: starter.priceCents, cinematicAd: cinAd.priceCents, ugcAd: ugcAd.priceCents, card: nfc.priceCents })
        : undefined;
    const [first, ...rest] = bundle.name.split(" ");
    specials.push({
      key: "bundle",
      sortCents: bundle.priceCents,
      node: (
        <SpecialPriceCard
          lead={first}
          accent={rest.join(" ")}
          description={bundle.description}
          delivery={deliveryLine(bundle.turnaround)}
          items={BUNDLE_ITEMS}
          wasCents={separately && separately > bundle.priceCents ? separately : undefined}
          nowCents={bundle.priceCents}
          href={`/checkout?product=${bundle.slug}`}
          cta="Get the bundle"
          footnote="You pick your Business Card designs right after checkout."
        />
      ),
    });
  }

  if (!exclude.includes("site") && siteProduct) {
    specials.push({
      key: "site",
      sortCents: siteProduct.priceCents,
      node: (
        <SpecialPriceCard
          lead={siteProduct.name}
          accent={money(siteProduct.priceCents)}
          description={siteProduct.description}
          delivery={deliveryLine(siteProduct.turnaround)}
          nowCents={siteProduct.priceCents}
          href={`/checkout?product=${siteProduct.slug}`}
          cta="Reserve this build"
          footnote={`Includes ${siteProduct.revisionLimit} rounds of revisions.`}
        />
      ),
    });
  }

  if (!exclude.includes("agent-bundles")) {
    const live = (slug: keyof typeof PRICE_CENTS) => bySlug.get(slug)?.priceCents ?? PRICE_CENTS[slug];
    for (const slug of AGENT_BUNDLE_SLUGS) {
      const row = bySlug.get(slug);
      if (!row) continue;
      const separately = agentBundleSeparatelyCents(slug, live);
      const [lead, accent] = row.name.includes(" + ") ? [`${row.name.split(" + ")[0]} +`, row.name.split(" + ")[1]] : [row.name.split(" ")[0], row.name.split(" ").slice(1).join(" ")];
      specials.push({
        key: slug,
        sortCents: row.priceCents,
        node: (
          <SpecialPriceCard
            lead={lead}
            accent={accent}
            description={row.description}
            delivery={deliveryLine(row.turnaround)}
            items={PRODUCT_SCOPES[slug]?.includes.filter((i) => !/revision round/.test(i))}
            wasCents={separately > row.priceCents ? separately : undefined}
            nowCents={row.priceCents}
            href={`/checkout?product=${slug}`}
            cta="Get this bundle"
            footnote="Starts with one intake and one kickoff call."
          />
        ),
      });
    }
  }

  if (specials.length === 0) return null;
  specials.sort((a, b) => a.sortCents - b.sortCents);

  return (
    <section id="specials" className={`mx-auto max-w-5xl scroll-mt-24 px-6 pt-16 ${className}`}>
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Specials</p>
        <h2 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
          {heading} <span className="text-gradient-champagne italic">specials</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ice/50">Every special below, lowest price first.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {specials.map((s) => (
          <div key={s.key} className="flex flex-col [&>*]:flex-1">
            {s.node}
          </div>
        ))}
      </div>
    </section>
  );
}
