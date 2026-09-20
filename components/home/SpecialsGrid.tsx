import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { deliveryLine } from "@/lib/payments/deliveryWindow";
import { AdSpecial } from "./AdSpecial";
import { SpecialPriceCard } from "./SpecialPriceCard";
import { money } from "./specialFrame";
import { BUNDLE_ITEMS } from "@/lib/site/adSpecials";

// Display-only "was" prices for the two website specials. What checkout
// actually charges is always the live database price, shown as the "now" price.
const STARTER_WAS_CENTS = 50000;
const SITE_WAS_CENTS = 500000;

const SLUGS = [
  "site",
  "ad",
  "starter-website",
  "cinematic-ad-special",
  "ugc-ad-special",
  "all-in-one-bundle",
  "strategy-session",
  "nfc-cards",
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
  exclude?: ("ads" | "starter" | "bundle" | "site")[];
  heading?: string;
}) {
  const rows = await db.product.findMany({ where: { slug: { in: SLUGS }, active: true } });
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  const starter = bySlug.get("starter-website");
  const siteProduct = bySlug.get("site");
  const regularAd = bySlug.get("ad");
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
          cinematic={{
            slug: cinAd.slug,
            priceCents: cinAd.priceCents,
            wasCents: regularAd && regularAd.priceCents > cinAd.priceCents ? regularAd.priceCents : undefined,
          }}
          ugc={{ slug: ugcAd.slug, priceCents: ugcAd.priceCents }}
          consultation={{ slug: consult.slug, priceCents: consult.priceCents }}
          delivery={deliveryLine(cinAd.turnaround)}
        />
      ),
    });
  }

  if (!exclude.includes("starter") && starter && starter.priceCents < STARTER_WAS_CENTS) {
    specials.push({
      key: "starter",
      sortCents: starter.priceCents,
      node: (
        <SpecialPriceCard
          lead={`${starter.name},`}
          accent={`now ${money(starter.priceCents)}`}
          description={starter.description}
          delivery={deliveryLine(starter.turnaround)}
          wasCents={STARTER_WAS_CENTS}
          nowCents={starter.priceCents}
          href={`/checkout?product=${starter.slug}`}
          cta="Claim this special"
          footnote="Add a matching NFC card for just $45 at checkout."
        />
      ),
    });
  }

  if (!exclude.includes("bundle") && bundle) {
    const separately =
      starter && cinAd && ugcAd && nfc
        ? starter.priceCents + 2 * cinAd.priceCents + 2 * ugcAd.priceCents + 3 * nfc.priceCents
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
          footnote="You pick your NFC card designs right after checkout."
        />
      ),
    });
  }

  if (!exclude.includes("site") && siteProduct && siteProduct.priceCents < SITE_WAS_CENTS) {
    specials.push({
      key: "site",
      sortCents: siteProduct.priceCents,
      node: (
        <SpecialPriceCard
          lead={`${siteProduct.name},`}
          accent={`now ${money(siteProduct.priceCents)}`}
          description={siteProduct.description}
          delivery={deliveryLine(siteProduct.turnaround)}
          wasCents={SITE_WAS_CENTS}
          nowCents={siteProduct.priceCents}
          href={`/checkout?product=${siteProduct.slug}`}
          cta="Claim this special"
          footnote={`Includes ${siteProduct.revisionLimit} rounds of revisions.`}
        />
      ),
    });
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
