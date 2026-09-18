import { db } from "@/lib/db";

/**
 * Real customer results, and only real ones. It renders nothing until a
 * case study has been published in the database, so the site can never show an
 * invented before/after or testimonial. A testimonial appears only if one was
 * stored (with the customer's permission) on that case study.
 */
export async function CaseStudies() {
  const studies = await db.caseStudy.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 });
  if (studies.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Results</p>
        <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
          Before <span className="text-gradient-champagne italic">and after</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {studies.map((s) => (
          <article key={s.id} className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-gold/60">{s.industry}</p>
            <h3 className="mt-2 font-display text-xl text-ice">{s.businessName}</h3>
            <p className="mt-4 text-xs uppercase tracking-wide text-ice/40">Before</p>
            <p className="mt-1 text-sm text-ice/70">{s.problem}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-ice/40">After</p>
            <ul className="mt-1 space-y-1 text-sm text-ice/70">
              {s.improvements
                .split("\n")
                .filter(Boolean)
                .map((item) => (
                  <li key={item}>
                    <span className="mr-2 text-gold">✓</span>
                    {item}
                  </li>
                ))}
            </ul>
            {s.testimonial && (
              <blockquote className="mt-4 border-l-2 border-gold/40 pl-3 text-sm italic text-ice/70">
                &ldquo;{s.testimonial}&rdquo;
                {s.testimonialAuthor && <footer className="mt-1 text-xs not-italic text-ice/40">{s.testimonialAuthor}</footer>}
              </blockquote>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
