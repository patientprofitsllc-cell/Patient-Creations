import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { db } from "@/lib/db";
import { getActiveProjectCount } from "@/lib/payments/productionLoad";
import { ScopePanel } from "@/components/catalog/ScopePanel";
import { scopeFor } from "@/lib/site/productScopes";

export default async function CheckoutPage({ searchParams }: { searchParams: { product?: string } }) {
  if (!searchParams.product) redirect("/services");

  const primaryProduct = await db.product.findUnique({
    where: { slug: searchParams.product },
    include: { variants: { where: { active: true } } },
  });
  // A product taken off the shelf must not open a checkout from an old link.
  if (!primaryProduct || !primaryProduct.active || primaryProduct.type === "SUBSCRIPTION") redirect("/services");

  const [orderBumps, activeProjectCount] = await Promise.all([
    db.product.findMany({ where: { type: "ORDER_BUMP", active: true }, orderBy: { sortOrder: "asc" } }),
    getActiveProjectCount(),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Reserve This Build</p>
        <h1 className="mt-4 font-display text-4xl text-ice">{primaryProduct.name}</h1>
        <p className="mt-2 max-w-xl text-ice/50">{primaryProduct.description}</p>
        {scopeFor(primaryProduct.slug) && (
          <div className="glass-panel mt-6 max-w-2xl rounded-2xl p-5">
            <ScopePanel slug={primaryProduct.slug} open />
          </div>
        )}
        <div className="mt-10">
          <CheckoutForm
            primaryProduct={{
              id: primaryProduct.id,
              slug: primaryProduct.slug,
              name: primaryProduct.name,
              description: primaryProduct.description,
              priceCents: primaryProduct.priceCents,
              setupFeeCents: primaryProduct.setupFeeCents,
              type: primaryProduct.type,
              category: primaryProduct.category,
              turnaround: primaryProduct.turnaround,
              revisionLimit: primaryProduct.revisionLimit,
            }}
            variants={primaryProduct.variants.map((v) => ({ id: v.id, name: v.name, priceCents: v.priceCents }))}
            orderBumps={orderBumps.map((b) => ({
              id: b.id,
              slug: b.slug,
              name: b.name,
              description: b.description,
              priceCents: b.priceCents,
              type: b.type,
            }))}
            activeProjectCount={activeProjectCount}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
