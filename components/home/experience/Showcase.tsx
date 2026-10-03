"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackCta } from "@/components/analytics/Track";
import { useMotionPaused } from "@/components/motion/hooks";

export interface ShowcasePrices {
  websiteSpecial: string;
  ugcAd: string;
  cinematicAd: string;
  monthlyAds: string;
  careMonths: number;
}

const TABS = ["Websites", "Content", "Automation"] as const;
type Tab = (typeof TABS)[number];
const TAB_MS = 5200;

/**
 * "Take a look inside": a browser window and a phone, showing what we make. The three tabs turn on their own until the
 * visitor picks one or pauses motion. Every price is passed in from the live product rows.
 */
export function Showcase({ prices }: { prices: ShowcasePrices }) {
  const [tab, setTab] = useState<Tab>("Websites");
  const [chosen, setChosen] = useState(false);
  const paused = useMotionPaused();

  useEffect(() => {
    if (paused || chosen) return;
    const t = window.setTimeout(() => setTab((cur) => TABS[(TABS.indexOf(cur) + 1) % TABS.length]), TAB_MS);
    return () => window.clearTimeout(t);
  }, [tab, paused, chosen]);

  return (
    <div id="experience" className="relative mx-auto mt-12 w-full max-w-3xl scroll-mt-28">
      {/* The browser window */}
      <div className={`relative ml-0 min-h-[300px] ${tab === "Websites" ? "mr-12" : "mr-0"} rounded-2xl border border-white/10 bg-pc-panel/90 p-4 shadow-2xl shadow-black/50 sm:ml-10 sm:mr-24 sm:min-h-[360px] sm:p-6`}>
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <span className="truncate rounded-md bg-white/[0.04] px-3 py-1 text-[0.65rem] text-pc-mute sm:text-xs">patientcreations.com / your-next-chapter</span>
          <span aria-hidden className="ml-auto text-pc-mute">⊞</span>
        </div>
        <p aria-hidden className="mt-3 text-right text-[0.6rem] uppercase tracking-[0.2em] text-pc-mute sm:text-[0.65rem]">
          Design · Content · Automation
        </p>

        <div key={tab} className="pc-swap mt-3 text-left" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "Websites" && (
            <>
              <p className="text-2xl leading-tight tracking-tight text-pc-cream sm:text-4xl">
                Your business.
                <br />
                An unforgettable
                <br />
                <span className="font-accent italic text-pc-sand">first impression.</span>
              </p>
              <p className="mt-3 max-w-[15rem] text-xs text-pc-mute">Distinctive design. A clear message. A website that feels like you.</p>
              <Link href="/examples" onClick={() => trackCta("showcase-examples")} className="mt-4 inline-flex min-h-[40px] items-center rounded-md bg-pc-sand px-4 text-xs font-semibold text-pc-ink">
                Explore website concepts
              </Link>
            </>
          )}
          {tab === "Content" && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:pr-20">
              {[
                { k: "01 / Creator style", t: <>Meet your next <i className="font-accent">customer.</i></>, p: `UGC Ad Special · ${prices.ugcAd}`, c: "bg-pc-cream text-pc-ink" },
                { k: "02 / Cinematic", t: <>Your story. A little <i className="font-accent">bigger.</i></>, p: `Cinematic Special · ${prices.cinematicAd}`, c: "bg-pc-sage text-pc-ink" },
                { k: "03 / Every month", t: <>Keep showing <i className="font-accent">up.</i></>, p: `Monthly Ads · from ${prices.monthlyAds}`, c: "bg-pc-tan text-pc-ink" },
              ].map((card) => (
                <div key={card.k} className={`flex min-h-[170px] flex-col rounded-lg p-2.5 sm:min-h-[210px] sm:p-3 ${card.c}`}>
                  <p className="text-[0.5rem] uppercase tracking-[0.15em] opacity-60 sm:text-[0.6rem]">{card.k}</p>
                  <p className="mt-2 text-sm leading-tight sm:text-lg">{card.t}</p>
                  <p className="mt-auto text-[0.5rem] uppercase tracking-wider opacity-70 sm:text-[0.6rem]">{card.p}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "Automation" && (
            <>
              <p className="text-xl tracking-tight text-pc-cream sm:text-3xl">Less busywork. More business.</p>
              <ol className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 sm:pr-20">
                {[
                  { i: "✱", t: "Capture interest", s: "Website + lead form" },
                  { i: "≋", t: "Follow up", s: "Automatic email sequence" },
                  { i: "✓", t: "Get paid", s: "Stripe checkout" },
                ].map((s) => (
                  <li key={s.t} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 sm:p-3">
                    <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-pc-sand">{s.i}</span>
                    <p className="mt-2 text-xs text-pc-cream sm:text-sm">{s.t}</p>
                    <p className="mt-1 text-[0.6rem] text-pc-mute sm:text-xs">{s.s}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[0.55rem] uppercase tracking-[0.15em] text-pc-mute sm:text-[0.65rem]">Illustrative workflow / your system is scoped to you</p>
            </>
          )}
        </div>
      </div>

      {/* Floating price tag */}
      <div
        className="pc-float absolute -left-1 -top-8 w-[12.5rem] rounded-xl border border-white/10 bg-pc-raised/95 p-3 text-left shadow-xl shadow-black/40 sm:-left-4 sm:w-56"
        style={{ ["--tilt" as string]: "-4deg" }}
      >
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-pc-mute">The Website Special</p>
        <p className="mt-1 text-xl text-pc-cream">
          {prices.websiteSpecial} <span className="text-xs text-pc-mute">/ one time</span>
        </p>
        <p className="text-[0.65rem] text-pc-mute">One page. A whole new presence.</p>
        <p className="mt-2 flex gap-1.5 text-[0.55rem] text-pc-cream/80">
          <span className="rounded border border-white/10 px-1.5 py-0.5">Mobile ready</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5">{prices.careMonths} months of care</span>
        </p>
      </div>

      {/* The phone */}
      <div
        aria-hidden
        className={`pc-float absolute -right-1 top-14 w-[8.5rem] ${tab === "Websites" ? "" : "hidden sm:block"} rounded-[1.6rem] border-[3px] border-pc-line bg-pc-ink p-2 shadow-2xl shadow-black/60 sm:right-2 sm:w-44`}
        style={{ ["--tilt" as string]: "6deg", ["--float-delay" as string]: "-2.5s" }}
      >
        <div className="rounded-[1.2rem] bg-gradient-to-b from-pc-raised to-pc-ink px-3 pb-3 pt-2">
          <p className="text-[0.5rem] text-pc-mute">9:41</p>
          <p className="mt-2 text-[0.55rem] font-semibold uppercase leading-tight tracking-wider text-pc-cream">
            Patient
            <br />
            Creations
          </p>
          <Image src="/assets/brand/logo-mono-96.webp" alt="" width={102} height={96} unoptimized className="mx-auto my-3 h-14 w-auto sm:h-16" />
          <p className="text-sm leading-tight text-pc-cream">
            Small screen.
            <br />
            Big impression.
          </p>
          <p className="mt-2 rounded bg-pc-sand py-1 text-center text-[0.5rem] text-pc-ink">Built for mobile</p>
        </div>
      </div>

      {/* Badge */}
      <div className="pc-float relative z-10 -mt-6 ml-4 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-pc-raised/95 px-3 py-2.5 text-left shadow-xl shadow-black/40" style={{ ["--float-delay" as string]: "-4s" }}>
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-xl font-bold text-white">✱</span>
        <span>
          <span className="block text-[0.55rem] uppercase tracking-[0.2em] text-pc-mute">Less busywork. More business.</span>
          <span className="block text-sm text-pc-cream">Make your next move.</span>
        </span>
      </div>

      <p className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-pc-mute">Take a look inside</p>
      <div role="tablist" aria-label="What we make" className="mx-auto mt-3 flex w-fit gap-1 rounded-xl border border-white/10 bg-pc-panel p-1">
        {TABS.map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => {
              setTab(t);
              setChosen(true);
              trackCta(`showcase-tab-${t.toLowerCase()}`);
            }}
            className={`min-h-[44px] rounded-lg px-4 text-sm transition sm:px-6 ${tab === t ? "bg-pc-raised text-pc-cream shadow" : "text-pc-mute hover:text-pc-cream"}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
