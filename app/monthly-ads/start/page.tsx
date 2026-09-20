import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { StartForm } from "@/components/ads/StartForm";
import { money } from "@/components/home/specialFrame";
import { AD_PLANS, isAdPlanSlug, planIncludes } from "@/lib/ads/plans";
import { loadAdPlan } from "@/lib/ads/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Start your Monthly Ads plan", robots: { index: false, follow: false } };

export default async function StartAdPlanPage({ searchParams }: { searchParams: { plan?: string } }) {
  const slug = isAdPlanSlug(searchParams.plan) ? searchParams.plan : null;
  if (!slug) redirect("/monthly-ads#plans");
  const plan = await loadAdPlan(slug);
  if (!plan) redirect("/monthly-ads#plans");

  const session = await getServerSession(authOptions);
  const signedIn = Boolean(session?.user);
  const price = money(plan.priceCents);
  const others = AD_PLANS.filter((p) => p.slug !== slug);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Monthly Ads</p>
        <h1 className="mt-2 font-display text-3xl text-ice sm:text-4xl">Start {plan.name.replace("Monthly Ads ", "")} for {price} a month</h1>
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          <StartForm planSlug={slug} planName={plan.name} priceLabel={price} signedIn={signedIn} />
          <aside className="glass-panel h-fit rounded-2xl p-6">
            <h2 className="text-ice">{plan.name}</h2>
            <p className="mt-1 font-display text-3xl text-ice">
              {price}
              <span className="text-base text-ice/50"> / month</span>
            </p>
            <ul className="mt-4 space-y-2">
              {planIncludes(plan).map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                  <span aria-hidden className="mt-0.5 text-gold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ice/40">Ad spend is separate and paid to the ad platform. No sales or results are promised.</p>
            <p className="mt-4 text-xs text-ice/50">
              Want a different plan?{" "}
              {others.map((o, i) => (
                <span key={o.slug}>
                  {i > 0 && " · "}
                  <Link href={`/monthly-ads/start?plan=${o.slug}`} className="text-gold underline">
                    {o.name.replace("Monthly Ads ", "")}
                  </Link>
                </span>
              ))}
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
