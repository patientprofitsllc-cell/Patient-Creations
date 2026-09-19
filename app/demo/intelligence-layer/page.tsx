import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "fs";
import { join } from "path";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroBackdrop } from "@/components/cinematic/HeroBackdrop";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { ADD_ON_PITCH, addOnAvailable } from "@/lib/site/addOnPitch";
import { CARE_PLAN_INCLUDES, FALLBACK_CARE_PRICE_CENTS, getCarePlanProduct } from "@/lib/site/carePlan";
import { OFFER_CHECKOUT_HREF, OFFER_INCLUDES, OFFER_NAME, OFFER_SLUG, TRUST_ITEMS } from "@/lib/site/offer";
import { FALLBACK_OFFER_PRICE_CENTS, getOfferProduct } from "@/lib/site/offerData";

// A private design demo, not part of the live site: hidden from search engines,
// left out of the sitemap and every menu. Prices are read from the product rows.
export const revalidate = 60;
export const metadata: Metadata = {
  title: "Intelligence Layer",
  description: "Intelligence Layer, a community landing page direction. Demo preview.",
  robots: { index: false, follow: false },
};

// The seamless loop behind the headline: a wide version for desktop and a tall one for phones,
// each with a still poster (also shown to visitors who asked for reduced motion or data saving).
// If a file is missing, the looping animated glow fills the slot instead.
const HERO = {
  desktop: { video: "/assets/hero/intelligence-layer-loop.mp4", poster: "/assets/hero/intelligence-layer-loop.jpg" },
  mobile: { video: "/assets/hero/intelligence-layer-loop-mobile.mp4", poster: "/assets/hero/intelligence-layer-loop-mobile.jpg" },
};
const present = (m: { video: string; poster: string }) =>
  existsSync(join(process.cwd(), "public", m.video)) && existsSync(join(process.cwd(), "public", m.poster));
const heroDesktop = present(HERO.desktop) ? HERO.desktop : undefined;
const heroMobile = present(HERO.mobile) ? HERO.mobile : undefined;
const hasLoopVideo = Boolean(heroDesktop || heroMobile);

const BTN =
  "inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
const BTN_PRIMARY = `${BTN} bg-gradient-to-b from-gold to-gold-deep text-obsidian shadow-gold-glow hover:brightness-110`;
const BTN_GHOST = `${BTN} champagne-border text-champagne hover:bg-champagne/10`;

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Built from your own facts",
    body: "Your services, prices, hours, and location go on the page exactly as you give them to us. Nothing invented, nothing generic.",
    icon: (
      <Icon>
        <path d="M4 5h16M4 12h10M4 19h16" />
        <circle cx="18" cy="12" r="2" />
      </Icon>
    ),
  },
  {
    title: "Made for phones first",
    body: "Most people find a local business on their phone. Your page is laid out for a small screen, with a tap to call and text button.",
    icon: (
      <Icon>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M11 18h2" />
      </Icon>
    ),
  },
  {
    title: "See it before it goes live",
    body: "You get a private preview link. Approve it, or use your included revision. Nothing goes live without your yes.",
    icon: (
      <Icon>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
  },
  {
    title: "A clear next step",
    body: "Every visitor can see what to do next: call, text, book, or ask for a quote. One obvious action, not five.",
    icon: (
      <Icon>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </Icon>
    ),
  },
  {
    title: "One clear price",
    body: "A flat price with the work listed. No quote calls and no surprise fees. Extras are optional and priced up front.",
    icon: (
      <Icon>
        <path d="M12 3v18M16 7.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5S10 10 12 10.5s4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5" />
      </Icon>
    ),
  },
  {
    title: "Stays current",
    body: "After launch, the optional care plan keeps your details up to date: hours, prices, a new phone number. Cancel any time.",
    icon: (
      <Icon>
        <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />
      </Icon>
    ),
  },
];

export default async function IntelligenceLayerDemo() {
  const [offer, care, addOns] = await Promise.all([
    getOfferProduct(),
    getCarePlanProduct(),
    db.product.findMany({ where: { type: "ORDER_BUMP", active: true }, orderBy: { priceCents: "asc" } }),
  ]);
  const price = money(offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS);
  const carePrice = money(care?.priceCents ?? FALLBACK_CARE_PRICE_CENTS);
  const extras = addOns.filter((a) => a.slug in ADD_ON_PITCH && addOnAvailable(a.slug, OFFER_SLUG));

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero: full-bleed, video-first. The loop stays behind the type. */}
        <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-obsidian" aria-labelledby="hero-title">
          <HeroBackdrop desktop={heroDesktop} mobile={heroMobile} />
          {/* Keeps the headline readable over any frame of the loop. */}
          <div aria-hidden className={`absolute inset-0 -z-10 bg-gradient-to-b ${hasLoopVideo ? "from-obsidian/80 via-obsidian/60 to-obsidian" : "from-obsidian/70 via-obsidian/55 to-obsidian"}`} />

          <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-32 text-center sm:pt-36">
            <p className="mx-auto inline-block rounded-full border border-gold/40 bg-black/40 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold">
              Demo preview, not live
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-champagne/80">Community · Patient Profits LLC</p>
            <h1 id="hero-title" className="mx-auto mt-4 max-w-4xl font-display text-4xl leading-[1.1] text-ice sm:text-6xl">
              Intelligence Layer keeps the first screen <span className="text-gradient-champagne italic">specific</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ice/80">Intelligence Layer belongs to this community offer</p>
            <p className="mx-auto mt-3 max-w-2xl text-base text-ice/80">
              {OFFER_NAME}: the first screen your business is judged on, built from your own facts and made for phones. From {price}, with a 72-hour target once we have your info.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={OFFER_CHECKOUT_HREF} className={BTN_PRIMARY}>
                Open Intelligence Layer
              </Link>
              <a href="#pricing" className={BTN_GHOST}>
                See what is included
              </a>
            </div>
            <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ice/60">
              {TRUST_ITEMS.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="features-title">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gold/70">Features</p>
          <h2 id="features-title" className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl text-ice sm:text-4xl">
            Everything a first screen has to do
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="glass-panel rounded-2xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/5">{f.icon}</div>
                <h3 className="mt-4 font-display text-xl text-ice">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ice/70">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Testimonials: intentionally empty until a real customer agrees to be quoted. */}
        <section id="testimonials" className="mx-auto max-w-4xl px-6 pb-20" aria-labelledby="testimonials-title">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gold/70">Testimonials</p>
          <h2 id="testimonials-title" className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl text-ice sm:text-4xl">
            In their words
          </h2>
          <div className="mt-10 rounded-2xl border border-dashed border-gold/40 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Demo placeholder</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ice/70">
              This slot is reserved for real customer words. It stays empty until a paying customer has approved being quoted. We do not write or invent testimonials.
            </p>
          </div>
        </section>

        {/* Pricing: numbers come from the product rows. */}
        <section id="pricing" className="mx-auto max-w-5xl px-6 pb-20" aria-labelledby="pricing-title">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gold/70">Pricing</p>
          <h2 id="pricing-title" className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl text-ice sm:text-4xl">
            One clear price to get online
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent p-7 shadow-gold-glow">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/80">{OFFER_NAME}</p>
              <p className="mt-3 font-display text-5xl text-ice">{price}</p>
              <p className="mt-1 text-xs text-ice/50">One time. 72-hour target once we have your info.</p>
              <ul className="mt-5 space-y-2">
                {OFFER_INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                    <span aria-hidden className="mt-0.5 text-gold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={OFFER_CHECKOUT_HREF} className={`${BTN_PRIMARY} mt-7 w-full`}>
                Open Intelligence Layer
              </Link>
            </div>

            <div className="glass-panel rounded-3xl p-7">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/80">Website Care Plan</p>
              <p className="mt-3 font-display text-5xl text-ice">
                {carePrice}
                <span className="text-lg text-ice/50"> / month</span>
              </p>
              <p className="mt-1 text-xs text-ice/50">Optional, offered once your site is live. Cancel any time.</p>
              <ul className="mt-5 space-y-2">
                {CARE_PLAN_INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                    <span aria-hidden className="mt-0.5 text-gold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              {extras.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ice/50">Optional extras at checkout</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ice/70">
                    {extras.map((a) => (
                      <li key={a.id} className="flex justify-between gap-4">
                        <span>{a.name}</span>
                        <span className="text-champagne">{a.priceCents === 0 ? "Free" : money(a.priceCents)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-ice/40">
            All sales are final. See the{" "}
            <Link href="/refunds" className="text-gold underline">Refund and Cancellation Policy</Link> and{" "}
            <Link href="/terms" className="text-gold underline">Terms of Service</Link>. We do not promise any search ranking or sales result.
          </p>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto max-w-3xl px-6 pb-24 text-center" aria-labelledby="cta-title">
          <h2 id="cta-title" className="font-display text-3xl text-ice sm:text-4xl">Ready for a first screen that says what you do?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ice/60">Tell us about your business in a few minutes and we start from there.</p>
          <Link href={OFFER_CHECKOUT_HREF} className={`${BTN_PRIMARY} mt-8`}>
            Open Intelligence Layer
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
