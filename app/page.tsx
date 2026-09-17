import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SeedCanvas } from "@/components/cinematic/SeedCanvas";
import { HowItWorks } from "@/components/cinematic/HowItWorks";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden bg-studio-radial pt-24">
          <SeedCanvas className="pointer-events-none absolute inset-0 h-full w-full" />
          <div className="relative mx-auto max-w-3xl px-6">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold/80">Patient Profits · Global</p>
            <p className="mb-3 font-display text-lg italic text-champagne/80">The Digital Master.</p>
            <h1 className="font-display text-5xl leading-tight text-ice sm:text-6xl md:text-7xl">
              The machine that <span className="text-gradient-champagne italic">builds your wealth</span>, built to order.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ice/60">
              Cinematic websites, software, and multi-agent systems. Agency quality at freelancer-floor pricing. A
              community of AI agents handles your questions, your timeline, and your checkout, so the work moves
              while you do.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-16">
          <div className="glass-panel flex flex-col items-center justify-between gap-6 rounded-2xl p-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Merch</p>
              <h3 className="mt-2 font-display text-2xl text-ice">NFC Cards, $125 each</h3>
              <p className="mt-2 max-w-sm text-sm text-ice/50">
                Tap-to-share smart cards. A phone tap opens your contact info, socials, or booking link. Includes a
                $25 setup fee. Choose how many you need at checkout.
              </p>
            </div>
            <Link
              href="/checkout?product=nfc-cards"
              className="whitespace-nowrap rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
            >
              Order NFC Cards
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#tour"
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              See how it works
            </Link>
            <Link
              href="/services#pricing"
              className="champagne-border rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              Compare the pricing
            </Link>
            <Link
              href="/services"
              className="rounded-full bg-gold px-8 py-3 text-sm font-semibold tracking-wide text-obsidian transition hover:brightness-110"
            >
              Click here for Products &amp; Services
            </Link>
          </div>
        </section>

        <section id="tour" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">How It Works</p>
            <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
              An automated production system, not a freelancer.
            </h2>
          </div>
          <HowItWorks />
          <div className="mt-16">
            <Link href="/guided-app-tour" className="text-sm text-gold hover:brightness-110">
              Take the full guided tour →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-28 text-center">
          <h2 className="font-display text-3xl text-ice sm:text-4xl">
            Build once. <span className="text-gradient-champagne">Own the machine.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            Every enquiry is handled by the agent community. See what a build costs against the market, or meet the
            fleet this same system already runs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/services#book"
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              Choose a build
            </Link>
            <Link
              href="/gallery"
              className="champagne-border rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              See the fleet
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
