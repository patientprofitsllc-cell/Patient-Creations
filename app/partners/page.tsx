import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { PartnerApplyForm } from "@/components/partners/PartnerApplyForm";
import { PARTNER, usd } from "@/lib/pricing/catalog";
import { PARTNER_TYPES } from "@/lib/partners/rules";

export const metadata: Metadata = {
  title: "Partner Program",
  description: "Agencies, designers, consultants, and local organizations: send Patient Creations customers and earn a commission on what they pay.",
  alternates: { canonical: "/partners" },
};

const STEPS = [
  { n: "1", title: "Apply", text: "Tell us who you are and how you would send customers our way. We read every application." },
  { n: "2", title: "Get your link", text: "Once approved, you get a personal link and a private dashboard. Attribution is automatic: a customer who signs up through your link is yours." },
  { n: "3", title: "Share it honestly", text: "Send it to people who would really benefit, and say you may earn a commission. We give you ready-made words." },
  { n: "4", title: "Get paid", text: `You earn ${PARTNER.defaultPercent}% of what they pay on one-time orders. We hold it ${PARTNER.pendingDays} days for refunds, approve it once the order is fully paid, and pay you by hand.` },
];

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl px-5 pb-28 pt-32 sm:px-6 sm:pt-40">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Partner program</p>
        <h1 className="mt-3 font-display text-4xl text-ice sm:text-5xl">Send us customers. Earn on what they pay.</h1>
        <p className="mt-4 max-w-2xl text-lg text-ice/60">
          If your clients need a website, review cards, ads, or a little automation, and you would rather not build it yourself, send them to Patient Creations. You earn {PARTNER.defaultPercent}% of what a customer you refer pays on one-time orders, for a year after their first order.
        </p>

        <section aria-labelledby="how" className="mt-14">
          <h2 id="how" className="font-display text-2xl text-ice">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="glass-panel rounded-2xl p-5">
                <span className="text-xs uppercase tracking-[0.3em] text-gold/70">Step {s.n}</span>
                <p className="mt-1 text-ice">{s.title}</p>
                <p className="mt-2 text-sm text-ice/60">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="who" className="mt-14">
          <h2 id="who" className="font-display text-2xl text-ice">Who it is for</h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {PARTNER_TYPES.filter((t) => t.key !== "other").map((t) => (
              <li key={t.key} className="rounded-full border border-white/10 px-4 py-2 text-ice/70">
                {t.label}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="fair" className="mt-14 rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 id="fair" className="font-display text-2xl text-ice">The fine print, in plain words</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ice/80">
            <li>The commission is {PARTNER.defaultPercent}% of the order total, not counting shipping or taxes, on one-time orders. Monthly plans and audit fees do not earn one.</li>
            <li>It applies to orders in the year after that customer&apos;s first paid order.</li>
            <li>Every commission is held for {PARTNER.pendingDays} days and approved only once the customer&apos;s whole order is paid. If the order is refunded first, the commission is cancelled.</li>
            <li>We pay by hand, and we may wait until you are owed {usd(PARTNER.minPayoutCents)}.</li>
            <li>We do not promise any earnings, and you may not promise any results to your clients. Always say you may earn a commission.</li>
          </ul>
          <p className="mt-4 text-sm text-ice/60">
            Read the full <Link href="/partner-terms" className="text-gold underline">Partner Program Terms</Link>.
          </p>
        </section>

        <section aria-labelledby="apply" className="mt-14">
          <h2 id="apply" className="font-display text-2xl text-ice">Apply</h2>
          <p className="mb-6 mt-2 text-sm text-ice/50">It takes about two minutes. Nothing is approved automatically.</p>
          <PartnerApplyForm types={PARTNER_TYPES.map((t) => ({ key: t.key, label: t.label }))} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
