import Link from "next/link";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { COMPANY, LEGAL_EFFECTIVE_DATE, LEGAL_PAGES, LEGAL_VERSION, type LegalDoc } from "@/lib/legal/config";

// Renders any legal document the same way: a plain summary, a table of
// contents, highlighted notices for the clauses that matter most, and links to
// the other legal pages. The wording lives in lib/legal/*.ts.

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">{COMPANY.legalName}</p>
        <h1 className="mt-2 font-display text-3xl text-ice sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-ice/40">
          Effective {LEGAL_EFFECTIVE_DATE} · Version {LEGAL_VERSION}
        </p>

        {doc.summary && (
          <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/80">In short</p>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-ice/80">
              {doc.summary.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-3 text-xs text-ice/40">This summary is for convenience. The full text below is what applies.</p>
          </div>
        )}

        <nav aria-label="Contents" className="mt-8 rounded-2xl border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-ice/50">Contents</p>
          <ol className="mt-3 columns-1 gap-8 text-sm sm:columns-2">
            {doc.sections.map((s) => (
              <li key={s.id} className="break-inside-avoid">
                <a href={`#${s.id}`} className="inline-block py-1 text-ice/70 hover:text-gold">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-display text-xl text-ice sm:text-2xl">{s.title}</h2>
              {s.callout && <p className="mt-3 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm font-semibold leading-relaxed text-ice">{s.callout}</p>}
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ice/70">
                {s.body.map((block, i) =>
                  typeof block === "string" ? (
                    <p key={i}>{block}</p>
                  ) : (
                    <ul key={i} className="list-disc space-y-2 pl-6">
                      {block.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <nav aria-label="Other legal pages" className="mt-14 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-ice/40">Legal</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 text-sm">
            {LEGAL_PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="inline-block py-2 text-gold hover:brightness-110">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
