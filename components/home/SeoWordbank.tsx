import Link from "next/link";

const WORDBANK: { label: string; href: string }[] = [
  { label: "Patient Creations", href: "/" },
  { label: "Patient Profits", href: "/" },
  { label: "The Digital Master", href: "/" },
  { label: "AI website design", href: "/services#book" },
  { label: "Cinematic AI website", href: "/services#book" },
  { label: "Quick business website", href: "/#offer" },
  { label: "Cheap website for small business", href: "/pricing" },
  { label: "One-page website for small business", href: "/websites" },
  { label: "Affordable website design", href: "/pricing" },
  { label: "Website for barbers", href: "/websites/barbers" },
  { label: "Website for contractors", href: "/websites/contractors" },
  { label: "Website for restaurants", href: "/websites/restaurants" },
  { label: "Website for pressure washing", href: "/websites/pressure-washing" },
  { label: "Website for salons", href: "/websites/salons" },
  { label: "Website design concepts", href: "/examples" },
  { label: "UGC ads", href: "/#specials" },
  { label: "Cinematic video ads", href: "/#specials" },
  { label: "AI video ads for small business", href: "/#specials" },
  { label: "Rental listing video", href: "/services#book" },
  { label: "Business cards (NFC tap-to-share)", href: "/#business-cards" },
  { label: "Google review Business Card", href: "/#business-cards" },
  { label: "Tap to review card", href: "/#business-cards" },
  { label: "Business Card menu", href: "/#business-cards" },
  { label: "WiFi Business Card", href: "/#business-cards" },
  { label: "Instagram Business Card", href: "/#business-cards" },
  { label: "TikTok Business Card", href: "/#business-cards" },
  { label: "YouTube subscribe Business Card", href: "/#business-cards" },
  { label: "WhatsApp Business Card", href: "/#business-cards" },
  { label: "Custom Business Cards", href: "/#business-cards" },
  { label: "AI software development", href: "/services#book" },
  { label: "Multi-agent AI systems", href: "/agents" },
  { label: "AI automation for small business", href: "/services#book" },
  { label: "Lead generation system", href: "/services#book" },
];

export function SeoWordbank() {
  return (
    <section aria-labelledby="popular-searches" className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      {/* Folded by default so it doesn't crowd the page; the links are still in the page for search engines. */}
      <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <summary className="flex cursor-pointer list-none items-center justify-between marker:hidden">
          <h2 id="popular-searches" className="text-xs uppercase tracking-[0.3em] text-gold/70">
            Popular searches
          </h2>
          <span aria-hidden className="text-gold transition group-open:rotate-45">
            +
          </span>
        </summary>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ice/50">
          Patient Creations builds cinematic AI websites, cinematic and UGC ads, Business Cards, software, and multi-agent
          systems for small businesses, creators, and hosts, at freelancer-floor pricing with agency-level quality.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {WORDBANK.map((w) => (
            <li key={w.label}>
              <Link
                href={w.href}
                className="inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-ice/60 transition hover:border-gold/40 hover:text-gold"
              >
                {w.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
