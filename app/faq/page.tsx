import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { TrackView } from "@/components/analytics/Track";
import { CONTACT_EMAIL, CONTACT_PHONE_DIGITS, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { bnplEnabled } from "@/lib/payments/bnpl";
import { faqGroups } from "@/lib/site/faq";
import { getLivePrices } from "@/lib/site/livePrices";

export const metadata: Metadata = {
  title: "Questions and answers",
  description: "Answers about our websites, ads, Business Cards, the All-in-One Bundle, timing, paying, and refunds.",
  alternates: { canonical: "/faq" },
};

// Same 60-second refresh as the price list, so the answers quote the prices shown next to them.
export const revalidate = 60;

export default async function FaqPage() {
  const groups = faqGroups({ bnpl: bnplEnabled(), prices: await getLivePrices() });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) => g.faqs).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <TrackView event="landing_page_view" />
      <main id="main" className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">FAQ</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">
            Questions, <span className="text-gradient-champagne italic">answered.</span>
          </h1>
          <nav aria-label="Topics" className="mt-6 flex flex-wrap justify-center gap-2">
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-ice/70 transition hover:border-gold/50 hover:text-gold">
                {g.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 space-y-12">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-24">
              <h2 id={`${g.id}-title`} className="font-display text-2xl text-ice">
                {g.title}
              </h2>
              <div className="mt-4 space-y-3">
                {g.faqs.map((f) => (
                  <details key={f.q} className="glass-panel group rounded-xl">
                    <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-ice marker:hidden">
                      <span>{f.q}</span>
                      <span aria-hidden className="text-gold transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-4 text-sm leading-relaxed text-ice/60">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="glass-panel mt-16 rounded-2xl p-8 text-center">
          <h2 className="font-display text-2xl text-ice">Still have a question?</h2>
          <p className="mt-2 text-sm text-ice/60">
            Call or text <a href={`tel:${CONTACT_PHONE_DIGITS}`} className="text-gold underline">{CONTACT_PHONE_DISPLAY}</a>, or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">{CONTACT_EMAIL}</a>.
          </p>
          <p className="mt-4 text-sm text-ice/50">
            <Link href="/pricing" className="text-gold underline">See every product and price</Link> ·{" "}
            <Link href="/refunds" className="text-gold underline">Refund Policy</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
