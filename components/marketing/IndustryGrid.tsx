import Link from "next/link";
import { INDUSTRIES, type IndustryConfig } from "@/lib/site/industries";

// A miniature of the sample design, drawn from its own tokens, so each card
// previews the real palette without loading twelve full pages.
function Thumb({ industry }: { industry: IndustryConfig }) {
  const t = industry.sample.tokens;
  return (
    <div aria-hidden style={{ background: t.bg, border: `1px solid ${t.muted}44`, borderRadius: 10 }} className="overflow-hidden">
      <div style={{ borderBottom: `1px solid ${t.muted}33` }} className="flex items-center justify-between px-3 py-2">
        <span style={{ background: t.text, opacity: 0.8 }} className="block h-1.5 w-12 rounded-full" />
        <span style={{ background: t.accent, borderRadius: 4 }} className="block h-2 w-8" />
      </div>
      <div className="space-y-1.5 px-3 py-4 text-center">
        <span style={{ background: t.text, opacity: 0.85 }} className="mx-auto block h-2 w-3/4 rounded-full" />
        <span style={{ background: t.muted, opacity: 0.5 }} className="mx-auto block h-1.5 w-1/2 rounded-full" />
        <span style={{ background: t.accent, borderRadius: 4 }} className="mx-auto mt-3 block h-3 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
        <span style={{ background: t.surface, border: `1px solid ${t.muted}33`, borderRadius: 4 }} className="block h-5" />
        <span style={{ background: t.surface, border: `1px solid ${t.muted}33`, borderRadius: 4 }} className="block h-5" />
      </div>
    </div>
  );
}

export function IndustryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {INDUSTRIES.map((industry) => (
        <Link
          key={industry.slug}
          href={`/examples/${industry.slug}`}
          className="glass-panel group rounded-2xl p-3 transition hover:border-gold/40 hover:shadow-gold-glow"
        >
          <Thumb industry={industry} />
          <p className="mt-3 px-1 text-sm font-semibold text-ice">{industry.name}</p>
          <p className="px-1 pb-1 text-xs text-gold/80 transition group-hover:text-gold">See the sample →</p>
        </Link>
      ))}
    </div>
  );
}
