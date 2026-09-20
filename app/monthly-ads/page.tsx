import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { HeroBackdrop } from "@/components/cinematic/HeroBackdrop";
import { FaqSection } from "@/components/marketing/FaqSection";
import { PlanCard } from "@/components/ads/PlanCard";
import { money } from "@/components/home/specialFrame";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { AD_AI_NOTE, AD_PLANS, AD_TIMING_NOTE, QUOTED_SEPARATELY } from "@/lib/ads/plans";
import { loadAdPlans } from "@/lib/ads/data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const plans = await loadAdPlans();
  const lowest = Math.min(...plans.map((p) => p.priceCents));
  return {
    title: `Monthly Ads: fresh ads every month, from ${money(lowest)}`,
    description: `Short video ads, cinematic showcase videos, 3D visuals and landing pages, made for you every month. Three plans, cancel any time. Ad spend and results are not included or promised.`,
    alternates: { canonical: "/monthly-ads" },
  };
}

const STEPS = [
  { title: "Pick a plan", body: "Choose the number of ads that fits. You can start today and cancel any time." },
  { title: "Send your monthly brief", body: "A few minutes on your private plan page: what to promote, who it is for, and any style you like." },
  { title: "We make your ads", body: "Your ads are made from your brief. Our target is about 7 business days, and you can ask for revisions." },
  { title: "Download and post", body: "Finished ads appear on your plan page with a download link. You post them on your own ad accounts." },
];

const FAQS = [
  {
    q: "What exactly do I get each month?",
    a: "The list on your plan: a set number of short video ads (vertical and square), with written captions, headlines and calls to action. Higher plans add cinematic showcase videos, a 3D product visual, and a landing page. Nothing is hidden: the counts on this page are the counts you get.",
  },
  {
    q: "Do you run my ads and pay for them?",
    a: "No. We make the ads. You post them on your own ad accounts and pay the platforms directly. Ad spend is never included, and we do not manage your campaigns.",
  },
  {
    q: "Will these ads get me more customers?",
    a: "We can't promise that, and nobody honestly can. We make ads built around a specific offer and a clear next step. What they earn depends on your offer, your budget and your market.",
  },
  { q: "Are the people in the ads real?", a: AD_AI_NOTE },
  {
    q: "How long does each batch take?",
    a: AD_TIMING_NOTE,
  },
  {
    q: "What if I don't use everything in a month?",
    a: "Each month's ads and revisions are for that month. Unused ones do not carry over, so send your brief early so you get the full month's value.",
  },
  {
    q: "Can I cancel or change plans?",
    a: `Yes. Cancel any time from your plan page. It takes effect at the end of the month you have paid for, and we do not refund or prorate the current month. To move to a different plan, email ${CONTACT_EMAIL} and we'll switch it for you.`,
  },
  {
    q: "Can you also set up an AI receptionist, text follow-up, or automations?",
    a: "Those are not part of a Monthly Ads plan, but we can quote them separately after a short call. See the list below the plans.",
  },
];

export default async function MonthlyAdsPage() {
  const plans = await loadAdPlans();

  return (
    <>
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main">
        <section className="relative isolate flex min-h-[64vh] items-center overflow-hidden bg-obsidian pb-10 pt-24 sm:pb-0" aria-labelledby="ads-title">
          <HeroBackdrop poster="/assets/hero/hero-poster.jpg" posterMobile="/assets/hero/hero-poster-mobile.jpg" deferMs={600} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold/80">Monthly Ads</p>
            <h1 id="ads-title" className="font-display text-[2.1rem] leading-tight text-ice min-[400px]:text-5xl sm:text-6xl">
              Fresh ads for your business, <span className="text-gradient-champagne italic">every month.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ice/80 sm:mt-6 sm:text-lg">
              Short video ads, cinematic showcase videos, 3D visuals and landing pages, made for you on a simple monthly plan. You post them and pay the ad platforms directly. Cancel any time.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#plans"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
              >
                SEE THE PLANS
              </a>
              <a href="#how" className="champagne-border inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10">
                HOW IT WORKS
              </a>
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16" aria-labelledby="plans-title">
          <h2 id="plans-title" className="text-center font-display text-3xl text-ice sm:text-4xl">
            Three plans, one clear price each
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ice/60">
            Every plan renews monthly and can be canceled any time. The prices below are what you are charged. Ad spend is separate and paid to the ad platform.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <PlanCard key={p.slug} plan={p} priceCents={p.priceCents} purchasable={p.purchasable} featured={p.slug === AD_PLANS[1].slug} />
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-ice/40">
            All sales are final. See the{" "}
            <Link href="/refunds" className="text-gold underline">
              Refund and Cancellation Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-gold underline">
              Terms of Service
            </Link>
            . We do not promise any sales, leads or results.
          </p>
        </section>

        <section id="how" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16" aria-labelledby="how-title">
          <h2 id="how-title" className="text-center font-display text-3xl text-ice sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="glass-panel rounded-2xl p-6">
                <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 text-sm text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg text-ice">{s.title}</h3>
                <p className="mt-2 text-sm text-ice/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-16" aria-labelledby="more-title">
          <div className="glass-panel rounded-3xl p-7">
            <h2 id="more-title" className="font-display text-2xl text-ice">
              Need more than ads?
            </h2>
            <p className="mt-2 text-sm text-ice/60">These are not part of a Monthly Ads plan. We quote them separately after a short call, so you know the price before anything starts.</p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUOTED_SEPARATELY.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                  <span aria-hidden className="mt-0.5 text-gold">
                    ›
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-ice/60">
              Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
                {CONTACT_EMAIL}
              </a>{" "}
              or call {CONTACT_PHONE_DISPLAY}.
            </p>
          </div>
        </section>

        <FaqSection faqs={FAQS} />
      </main>
      <SiteFooter />
    </>
  );
}
