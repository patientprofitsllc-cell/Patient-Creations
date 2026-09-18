import Link from "next/link";

// After the website: what we can add next, in the order most businesses need it.
// Deliberately smaller than the $300 offer so the website stays the front door.
const LADDER = [
  {
    title: "Website growth",
    body: "After launch we can help with search visibility and keeping your site current. Ask us in your project thread.",
    href: null as string | null,
    cta: "",
  },
  {
    title: "Ads, UGC, and cinematic content",
    body: "Short video ads for social media, from creator-style to cinematic. Priced per ad.",
    href: "/services#specials",
    cta: "See the ad special",
  },
  {
    title: "Lead generation",
    body: "A system that finds new customers and sends them straight to you.",
    href: "/checkout?product=lead-engine",
    cta: "See Lead Engine",
  },
  {
    title: "Automation and custom software",
    body: "Automations and custom apps for the work that's eating your week.",
    href: "/services",
    cta: "See everything we build",
  },
];

export function GrowthLadder() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">After you&apos;re live</p>
        <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
          Grow when you&apos;re <span className="text-gradient-champagne italic">ready</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ice/50">
          Your website is the front door. Everything below is optional and priced separately.
        </p>
      </div>
      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LADDER.map((step, i) => (
          <li key={step.title} className="glass-panel rounded-2xl p-6">
            <span className="text-xs uppercase tracking-widest text-gold/60">Step {i + 2}</span>
            <p className="mt-1 font-display text-xl text-ice">{step.title}</p>
            <p className="mt-2 text-sm text-ice/60">{step.body}</p>
            {step.href && (
              <Link href={step.href} className="mt-3 inline-block text-sm text-gold hover:brightness-110">
                {step.cta} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
