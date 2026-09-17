import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SeedCanvas } from "@/components/cinematic/SeedCanvas";
import { HowItWorks } from "@/components/cinematic/HowItWorks";
import { NfcOrderPicker } from "@/components/cinematic/NfcOrderPicker";
import { db } from "@/lib/db";

// Same catalog/pricing data, cached and refreshed every 60s — a price or
// catalog change shows up within a minute with no redeploy, matching the
// revalidate strategy already used on /services.
export const revalidate = 60;

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// The six flagship builds — the same lineup /services compares against the
// market. Kept in this fixed order regardless of DB sortOrder.
const FEATURED_SLUGS = ["site", "saas", "agents", "ad", "rental-listing-film", "lead-engine"];

const NFC_SHOWCASE = [
  { name: "Google Review", slug: "nfc-google-review", src: "/assets/nfc-cards/google-review.jpeg", rotate: "-rotate-6", translate: "sm:translate-x-6", z: "z-0" },
  { name: "YouTube", slug: "nfc-youtube", src: "/assets/nfc-cards/youtube.jpeg", rotate: "rotate-3", translate: "sm:translate-x-3", z: "z-10" },
  { name: "Custom Menu", slug: "nfc-custom-menu", src: "/assets/nfc-cards/menu.jpeg", rotate: "rotate-0", translate: "", z: "z-20" },
  { name: "WhatsApp", slug: "nfc-whatsapp", src: "/assets/nfc-cards/whatsapp.jpeg", rotate: "-rotate-3", translate: "sm:-translate-x-3", z: "z-10" },
  { name: "Instagram", slug: "nfc-instagram", src: "/assets/nfc-cards/instagram.jpeg", rotate: "rotate-6", translate: "sm:-translate-x-6", z: "z-0" },
  { name: "TikTok", slug: "nfc-tiktok", src: "/assets/nfc-cards/tiktok.jpeg", rotate: "-rotate-6", translate: "sm:translate-x-9", z: "z-0" },
  { name: "WiFi", slug: "nfc-wifi", src: "/assets/nfc-cards/wifi.jpeg", rotate: "rotate-6", translate: "sm:-translate-x-9", z: "z-0" },
];

export default async function HomePage() {
  const rawFeatured = await db.product.findMany({
    where: { slug: { in: FEATURED_SLUGS }, active: true },
  });
  const featured = FEATURED_SLUGS.map((slug) => rawFeatured.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden bg-studio-radial pt-24">
          <SeedCanvas className="pointer-events-none absolute inset-0 h-full w-full" />
          <div className="relative mx-auto max-w-3xl px-6">
            <Link
              href="/services#pricing"
              className="champagne-border mb-6 inline-block rounded-full px-5 py-2 text-xs tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              Compare the pricing
            </Link>
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

        <section className="mx-auto max-w-5xl px-6 pb-8 pt-16">
          <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-gold/70">Real cards, real designs</p>
          <p className="mx-auto mb-8 max-w-md text-center text-sm text-ice/40">
            Tap a design to order that exact card, or pick one below.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {NFC_SHOWCASE.map((card) => (
              <Link
                key={card.slug}
                href={`/checkout?product=${card.slug}`}
                className={`group relative mx-auto w-32 shrink-0 transition-transform duration-300 hover:z-20 hover:-translate-y-2 hover:rotate-0 sm:w-36 ${card.rotate}`}
              >
                <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white p-2 shadow-xl shadow-black/40">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <Image src={card.src} alt={`${card.name} NFC card`} fill sizes="144px" className="object-cover" />
                  </div>
                </div>
                <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-ice/50 transition group-hover:text-gold">
                  {card.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-4">
          <div className="glass-panel flex flex-col items-center justify-between gap-6 rounded-2xl p-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Merch</p>
              <h3 className="mt-2 font-display text-2xl text-ice">NFC Cards, $75 each — setup included</h3>
              <p className="mt-2 max-w-sm text-sm text-ice/50">
                Tap-to-share smart cards. A phone tap opens your contact info, socials, or booking link. The $25
                setup fee is already folded into the price.
              </p>
            </div>
            <NfcOrderPicker />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-8 pt-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">What We Build</p>
            <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">Six builds. One production system.</h2>
            <p className="mx-auto mt-4 max-w-xl text-ice/50">
              Every service enters the same automated pipeline: research, strategy, build, QA, and perception review
              before delivery.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.slug}
                href={`/checkout?product=${product.slug}`}
                className="glass-panel group flex flex-col rounded-2xl p-6 transition hover:border-gold/40"
              >
                <p className="text-xs uppercase tracking-widest text-gold/60">{product.category}</p>
                <h3 className="mt-2 font-display text-xl text-ice">{product.name}</h3>
                <p className="mt-2 flex-1 text-sm text-ice/50">{product.description}</p>
                <p className="mt-4 font-display text-2xl text-champagne">
                  {money(product.priceCents)}
                  <span className="ml-1 text-sm text-ice/40">from</span>
                </p>
                <span className="mt-4 text-sm text-gold transition group-hover:brightness-125">Reserve this build →</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="text-sm text-gold hover:brightness-110">
              See every service &amp; compare pricing →
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
              Pick a service for building
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

        <section className="mx-auto max-w-4xl px-6 pb-28 pt-4 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#tour"
              className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              See how it works
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
      <Link
        href="/services"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-gold px-4 py-2 text-xs font-semibold tracking-wide text-obsidian shadow-lg shadow-black/40 transition hover:brightness-110"
      >
        Products &amp; Services
      </Link>
      <SiteFooter />
    </>
  );
}
