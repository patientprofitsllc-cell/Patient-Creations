import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { NextStepCards } from "@/components/journey/NextStepCards";
import { db } from "@/lib/db";
import { firstOffers, nextOffers, type Offer } from "@/lib/journey/ladder";

// Reads the signed-in user's own purchase history, so it is never built ahead of time.
export const dynamic = "force-dynamic";

async function offersFor(userId: string | undefined): Promise<{ offers: Offer[]; signedIn: boolean }> {
  if (!userId) return { offers: firstOffers(), signedIn: false };
  const customer = await db.customer.findUnique({
    where: { userId },
    include: {
      orders: { where: { status: "PAID" }, orderBy: { createdAt: "desc" }, include: { items: { include: { product: { select: { slug: true } } } }, project: { select: { statusToken: true } } } },
    },
  });
  if (!customer || customer.orders.length === 0) return { offers: firstOffers(), signedIn: true };
  const [carePlans, adsPlans] = await Promise.all([
    db.careSubscription.count({ where: { customerId: customer.id, status: { not: "CANCELED" } } }),
    db.adSubscription.count({ where: { customerId: customer.id, status: { in: ["ACTIVE", "PAST_DUE"] } } }),
  ]);
  const latest = customer.orders[0];
  const offers = nextOffers({
    justBought: latest.items.map((i) => i.product.slug),
    owned: customer.orders.flatMap((o) => o.items.map((i) => i.product.slug)),
    hasCarePlan: carePlans > 0,
    hasAdsPlan: adsPlans > 0,
    statusPath: latest.project?.statusToken ? `/status/${latest.project.statusToken}` : null,
  });
  return { offers, signedIn: true };
}

export default async function UpsellPage() {
  const session = await getServerSession(authOptions);
  const { offers, signedIn } = await offersFor(session?.user?.id);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 pb-28 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne/70">Recommended Next</p>
        <h1 className="mt-4 font-display text-3xl text-ice">One relevant next step.</h1>
        {offers.length > 0 ? (
          <NextStepCards offers={offers} heading={signedIn ? "What fits your order" : "Where most people start"} source="upsell-page" />
        ) : (
          <p className="mt-10 text-ice/50">You already have everything we would recommend right now. If you want to talk about what is next, message us on your project page.</p>
        )}
        <Link href={signedIn ? "/portal/dashboard" : "/services"} className="mt-10 inline-block py-3 text-sm text-ice/50 hover:text-gold">
          {signedIn ? "Skip for now →" : "See everything we build →"}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
