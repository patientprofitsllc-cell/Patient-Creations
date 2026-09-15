import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";

// Reads the signed-in user's own purchase history — never eligible for
// build-time static generation.
export const dynamic = "force-dynamic";

export default async function UpsellPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 pb-28 pt-40 text-center text-ice/60">
          Sign in to see personalized next steps.
        </main>
        <SiteFooter />
      </>
    );
  }

  const customer = await db.customer.findUnique({ where: { userId: session.user.id }, include: { orders: { include: { items: true } } } });
  const ownedProductIds = new Set(customer?.orders.flatMap((o) => o.items.map((i) => i.productId)) ?? []);

  const upsells = await db.product.findMany({ where: { type: "UPSELL", active: true }, orderBy: { sortOrder: "asc" } });
  const relevant = upsells.filter((u) => !ownedProductIds.has(u.id));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-28 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne/70">Recommended Next</p>
        <h1 className="mt-4 font-display text-3xl text-ice">One relevant next step.</h1>
        <div className="mt-10 space-y-4 text-left">
          {relevant.length === 0 && <p className="text-center text-ice/40">You already own everything we'd recommend right now.</p>}
          {relevant.map((u) => (
            <div key={u.id} className="glass-panel flex items-center justify-between rounded-2xl p-6">
              <div>
                <p className="text-ice">{u.name}</p>
                <p className="text-sm text-ice/50">{u.description}</p>
              </div>
              <Link
                href={`/checkout?product=${u.slug}`}
                className="rounded-full bg-gold px-5 py-2 text-sm text-obsidian transition hover:brightness-110"
              >
                Add — {(u.priceCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </Link>
            </div>
          ))}
        </div>
        <Link href="/portal/dashboard" className="mt-10 inline-block text-sm text-ice/50 hover:text-gold">
          Skip for now →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
