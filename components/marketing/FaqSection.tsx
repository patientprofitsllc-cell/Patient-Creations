interface Faq {
  q: string;
  a: string;
}

export function FaqSection({ faqs, heading = "Questions, answered." }: { faqs: Faq[]; heading?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">FAQ</p>
        <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">{heading}</h2>
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
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
  );
}
