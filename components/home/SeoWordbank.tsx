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
  { label: "Website examples", href: "/examples" },
  { label: "UGC ads", href: "/#specials" },
  { label: "Cinematic video ads", href: "/#specials" },
  { label: "AI video ads for small business", href: "/#specials" },
  { label: "Rental listing video", href: "/services#book" },
  { label: "NFC business cards", href: "/#nfc" },
  { label: "Google review NFC card", href: "/#nfc" },
  { label: "Tap to review card", href: "/#nfc" },
  { label: "NFC menu card", href: "/#nfc" },
  { label: "WiFi NFC card", href: "/#nfc" },
  { label: "Instagram NFC card", href: "/#nfc" },
  { label: "TikTok NFC card", href: "/#nfc" },
  { label: "YouTube subscribe NFC card", href: "/#nfc" },
  { label: "WhatsApp NFC card", href: "/#nfc" },
  { label: "Custom NFC cards", href: "/#nfc" },
  { label: "AI software development", href: "/services#book" },
  { label: "Multi-agent AI systems", href: "/agents" },
  { label: "AI automation for small business", href: "/services#book" },
  { label: "Lead generation system", href: "/services#book" },
];

export function SeoWordbank() {
  return (
    <section aria-labelledby="popular-searches" className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <h2 id="popular-searches" className="text-xs uppercase tracking-[0.3em] text-gold/70">
          Popular searches
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ice/50">
          Patient Creations builds cinematic AI websites, cinematic and UGC ads, NFC cards, software, and multi-agent
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
      </div>
    </section>
  );
}
