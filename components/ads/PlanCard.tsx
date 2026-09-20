import Link from "next/link";
import { money } from "@/components/home/specialFrame";
import { perAdDollars, planDeliveryTarget, planIncludes, planNotIncluded, type AdPlan } from "@/lib/ads/plans";

/** One Monthly Ads plan: price, exactly what is included, and what is not. Everything comes from lib/ads/plans.ts. */
export function PlanCard({ plan, priceCents, featured = false, purchasable = true }: { plan: AdPlan; priceCents: number; featured?: boolean; purchasable?: boolean }) {
  const includes = planIncludes(plan);
  const not = planNotIncluded(plan);
  return (
    <article
      className={`flex flex-col rounded-3xl p-7 ${featured ? "border border-gold/40 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent shadow-gold-glow" : "glass-panel"}`}
      aria-labelledby={`plan-${plan.slug}`}
    >
      <p id={`plan-${plan.slug}`} className="text-xs uppercase tracking-[0.25em] text-gold/80">
        {plan.name.replace("Monthly Ads ", "")}
      </p>
      <p className="mt-3 font-display text-5xl text-ice">
        {money(priceCents)}
        <span className="text-lg text-ice/50"> / month</span>
      </p>
      <p className="mt-1 text-sm text-champagne">
        About ${perAdDollars(priceCents, plan)} per short ad
        {(plan.counts.cinematic > 0 || plan.counts.visual3d > 0 || plan.counts.landingPages > 0) && ", with the extras below on top"}
      </p>
      <p className="mt-2 text-sm text-ice/70">{plan.tagline}</p>
      <p className="mt-1 text-xs text-gold/80">{plan.bestFor}</p>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ice/50">Each month you get</p>
      <ul className="mt-3 space-y-2">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-ice/85">
            <span aria-hidden className="mt-0.5 text-gold">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ice/50">Each batch is our target for {planDeliveryTarget(plan)} after we have your monthly brief.</p>

      <details className="mt-5 text-sm text-ice/60">
        <summary className="flex min-h-[44px] cursor-pointer items-center text-ice/70 hover:text-gold">What is not included</summary>
        <ul className="mt-2 space-y-1.5">
          {not.map((item) => (
            <li key={item} className="flex items-start gap-3 text-xs text-ice/60">
              <span aria-hidden className="mt-0.5 text-ice/40">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-auto pt-7">
        {purchasable ? (
          <Link
            href={`/monthly-ads/start?plan=${plan.slug}`}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            START {plan.name.replace("Monthly Ads ", "").toUpperCase()} {money(priceCents)}/MONTH
          </Link>
        ) : (
          <p className="text-center text-xs text-ice/50">This plan isn&apos;t open for sign-ups right now.</p>
        )}
        <p className="mt-2 text-center text-xs text-ice/40">Renews monthly. Cancel any time.</p>
      </div>
    </article>
  );
}
