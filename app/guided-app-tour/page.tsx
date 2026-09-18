import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { ChapterArt, ChapterArtType } from "@/components/cinematic/ChapterArt";

const STEPS: { art: ChapterArtType; title: string; body: string; href: string; linkLabel: string }[] = [
  {
    art: "rings",
    title: "1. Pick a build.",
    body: "Choose what you need — a website, an app, a video ad, whatever it is. Every option shows you a clear price and exactly how much cheaper it is than hiring an agency.",
    href: "/services",
    linkLabel: "Browse services & pricing",
  },
  {
    art: "lattice",
    title: "2. Set it up and pay.",
    body: "Pick your price level, add anything extra you want, and choose how fast you need it done. Then pay with a card for instant checkout, or choose Zelle/Apple Pay and we'll reach out to finish up.",
    href: "/services#pricing",
    linkLabel: "See delivery speed & pricing",
  },
  {
    art: "network",
    title: "3. The AI team gets to work.",
    body: "The second you pay, a team of AI specialists starts on your project right away — not one person slowly working through a to-do list.",
    href: "/agents",
    linkLabel: "Meet the agent network",
  },
  {
    art: "burst",
    title: "4. Everything gets checked before you see it.",
    body: "Before anything is handed to you, it's checked twice: once to make sure it works, and once to make sure it looks and feels premium. If something's off, it's fixed automatically first.",
    href: "/agents",
    linkLabel: "How the review loop works",
  },
  {
    art: "wave",
    title: "5. Watch it happen, anytime.",
    body: "You get a private link, just for you, to check on your project whenever you want. No login needed. It shows real progress, not a guess, updates from your AI team as they work, and a message box to ask them anything.",
    href: "/portal/dashboard",
    linkLabel: "Open your portal",
  },
  {
    art: "ascend",
    title: "6. Get it, review it, earn from it.",
    body: "When it's done, you check it over and ask for changes if you need any. You'll also get your own referral link — earn 10% every time someone you send our way buys something.",
    href: "/portal/referrals",
    linkLabel: "See the referral program",
  },
];

export default function GuidedAppTourPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Guided Tour</p>
        <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
          Exactly what happens, start to finish.
        </h1>
        <p className="mt-4 max-w-2xl text-ice/50">
          Here's exactly what happens, in plain terms — from the moment you decide you need something built to the
          day it lands in your hands, ready to use.
        </p>

        <div className="relative mt-16 space-y-14">
          <div className="absolute bottom-0 left-8 top-2 hidden w-px bg-white/10 sm:block" aria-hidden />
          {STEPS.map((step) => (
            <div key={step.title} className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative z-10 flex w-16 flex-none items-center justify-center rounded-full border border-gold/30 bg-white/5 p-3 shadow-gold-glow sm:w-16">
                <ChapterArt type={step.art} className="w-full" />
              </div>
              <div className="glass-panel flex-1 rounded-2xl p-6">
                <h2 className="font-display text-2xl text-ice">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ice/50">{step.body}</p>
                <Link href={step.href} className="mt-4 inline-block text-sm text-gold hover:brightness-110">
                  {step.linkLabel} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl border border-gold/20 bg-gold/5 p-8 text-center">
          <h2 className="font-display text-2xl text-ice">Ready to start?</h2>
          <p className="mt-2 text-ice/50">Pick a build and the agents take it from there.</p>
          <Link
            href="/services#book"
            className="mt-6 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
          >
            Choose a build
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
