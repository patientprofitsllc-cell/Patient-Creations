// The homepage's design sections, in the look of the interactive concept site: olive-charcoal, sand, cream, a light
// sans headline with an italic serif accent. Every price is passed in from the live product rows, every link goes to a
// real page, and nothing claims a result.
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { ConceptSlides } from "./ConceptSlides";

/** "01 / The bigger picture": a small numbered label over a two-tone headline. */
export function SectionHead({ label, line1, line2, children, id }: { label: string; line1: ReactNode; line2: ReactNode; children?: ReactNode; id?: string }) {
  return (
    <Reveal>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">{label}</p>
      <h2 id={id} className="mt-5 text-[2.6rem] font-light leading-[1.02] tracking-[-0.035em] text-pc-cream sm:text-6xl">
        {line1}
        <br />
        <span className="text-pc-mute">{line2}</span>
      </h2>
      {children && <div className="mt-5 max-w-xl text-base leading-relaxed text-pc-mute">{children}</div>}
    </Reveal>
  );
}

/** One creative partner: the concept slides, then build / get seen / work smarter. */
export function BiggerPicture({ websiteFrom, adFrom }: { websiteFrom: string; adFrom: string }) {
  const pillars = [
    {
      n: "01 — Build",
      title: ["Give your business", "a presence."],
      body: "From a focused one-page website to a cinematic experience, make it easy for customers to understand what you do and take the next step.",
      points: ["Custom design & business-specific copy", "Mobile optimization & basic SEO", "Live deployment & ongoing care options"],
      link: { href: "/pricing#websites", label: "Explore websites", note: `From ${websiteFrom}` },
    },
    {
      n: "02 — Get seen",
      title: ["Stop the scroll.", "Start a conversation."],
      body: "Cinematic films, creator-style AI ads, and fresh monthly content. Give your business more ways to show up, without another shoot on your calendar.",
      points: ["UGC ads with opening hooks to test", "Cinematic ads in wide & vertical formats", "Rental listing films from your photos"],
      link: { href: "/pricing#ads", label: "Explore ads & video", note: `From ${adFrom} / ad` },
    },
    {
      n: "03 — Work smarter",
      title: ["Make the work", "work for you."],
      body: "Connect the pieces behind your business. Capture leads, follow up automatically, accept payments, or build software around the way you work.",
      points: ["Lead capture & automatic follow-up emails", "Stripe payment setup", "Custom apps & multi-agent AI systems"],
      link: { href: "/pricing#automation", label: "Explore automation", note: "Scoped to your business" },
    },
  ];
  return (
    <section aria-labelledby="bigger-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionHead id="bigger-title" label="01 / The bigger picture" line1="One creative partner." line2="Every next step.">
          A first impression, a new audience, a smarter workflow. Start where you are. Build what comes next.
        </SectionHead>
        <Reveal effect="scale">
          <ConceptSlides />
          <p className="mt-3 text-center text-xs text-pc-mute">Interactive service concepts. Built around your brand.</p>
        </Reveal>
      </div>

      <Stagger className="mt-24 grid gap-16 md:grid-cols-3 md:gap-10" step={140}>
        {pillars.map((p) => (
          <article key={p.n} className="flex h-full flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pc-sand">{p.n}</p>
            <h3 className="mt-4 text-[2rem] font-light leading-[1.05] tracking-[-0.03em] text-pc-cream">
              {p.title[0]}
              <br />
              {p.title[1]}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-pc-mute">{p.body}</p>
            <ul className="mt-5 space-y-2 text-sm text-pc-cream/85">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <span aria-hidden className="text-pc-sand">+</span>
                  {pt}
                </li>
              ))}
            </ul>
            <Link href={p.link.href} className="group mt-auto flex items-center gap-4 border-b border-white/10 pb-3 pt-8 text-sm text-pc-cream">
              <span className="underline-offset-4 group-hover:underline">{p.link.label}</span>
              <span className="text-xs text-pc-mute">{p.link.note}</span>
              <span aria-hidden className="ml-auto text-pc-sand transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </article>
        ))}
      </Stagger>
    </section>
  );
}

/** Three sample designs, clearly labeled as concepts, each linking to its real sample page. */
export function Reimagined({ showConcepts }: { showConcepts: boolean }) {
  const concepts = [
    { n: "01", kind: "Barbershop", kicker: "The cut.", title: <>Sharp style.<br />Lasting<br /><i className="font-accent text-[1.15em]">impressions.</i></>, chip: "Appointments & services", foot: "Barbers & grooming", href: "/examples/barbers", c: "bg-pc-forest text-pc-cream", line: "border-white/10" },
    { n: "02", kind: "Restaurant", kicker: "At the table", title: <>Good food.<br /><i className="font-accent text-[1.15em]">Great</i><br />company.</>, chip: "Menus & location", foot: "Restaurants & cafés", href: "/examples/restaurants", c: "bg-pc-tan text-[#3b2a1c]", line: "border-black/10" },
    { n: "03", kind: "Local retail", kicker: "Local / original", title: <>Something<br /><i className="font-accent text-[1.15em]">worth</i><br />discovering.</>, chip: "Products & your story", foot: "Shops & local brands", href: "/examples/local-retail", c: "bg-pc-sage text-[#24301f]", line: "border-black/10" },
  ];
  return (
    <section aria-labelledby="reimagined-title" className="bg-[#10110f] py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead id="reimagined-title" label="02 / Your business, reimagined" line1="A different business." line2="A different expression.">
          Explore the sample designs on our website. Design concepts, not customer results.
        </SectionHead>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3" step={130} effect="up">
          {concepts.map((c) => (
            <Link key={c.n} href={showConcepts ? c.href : c.href.replace("/examples/", "/websites/")} className={`group flex h-full min-h-[420px] flex-col rounded-2xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50 ${c.c}`}>
              <p className={`flex justify-between border-b px-6 py-4 text-[0.65rem] uppercase tracking-[0.2em] opacity-75 ${c.line}`}>
                <span>Design concept / {c.n}</span>
                <span>{c.kind}</span>
              </p>
              <div className="flex-1 px-6 pt-8">
                <p className="text-xs uppercase tracking-[0.25em] opacity-70">{c.kicker}</p>
                <p className="mt-6 text-[2.6rem] leading-[1] tracking-[-0.03em]">{c.title}</p>
                <span className="mt-6 inline-block rounded-full border border-current px-3 py-1 text-xs opacity-80">{c.chip}</span>
              </div>
              <p className={`flex justify-between border-t px-6 py-4 text-sm ${c.line}`}>
                <span>{c.foot}</span>
                <span className="opacity-70 transition group-hover:opacity-100">View sample →</span>
              </p>
            </Link>
          ))}
        </Stagger>
        <Reveal className="mt-8 text-sm text-pc-mute">
          <p>Also for salons, contractors, realtors, trainers, and more.</p>
          {showConcepts && (
            <Link href="/examples" className="mt-3 inline-block border-b border-white/20 pb-1 text-pc-cream hover:border-pc-sand">
              See the full website concepts →
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** "Not sure where to start?": the Growth Audit, in two short points. */
export function AuditNudge({ fee, creditDays }: { fee: string; creditDays: number }) {
  return (
    <Reveal className="mt-14 border-t border-white/10 pt-10">
      <div className="flex gap-4">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-2xl font-bold text-white">✱</span>
        <div>
          <p className="text-xl text-pc-cream">Not sure where to start?</p>
          <ul className="mt-2 space-y-1.5 text-sm text-pc-mute">
            <li className="flex gap-2">
              <span aria-hidden className="text-pc-sand">•</span>The Growth Audit helps you choose what to do first.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-pc-sand">•</span>
              {fee}, credited toward your first order within {creditDays} days.
            </li>
          </ul>
        </div>
      </div>
      <Link href="/audit" className="mt-6 flex min-h-[56px] w-full items-center justify-center rounded-xl border border-white/15 text-base font-semibold text-pc-cream transition hover:border-pc-sand hover:text-pc-sand sm:max-w-md">
        Get my growth audit
      </Link>
    </Reveal>
  );
}

/** "04 / From idea to online": the four steps. */
export function IdeaToOnline({ careMonths }: { careMonths: number }) {
  const steps = [
    { t: "Choose your move.", b: "Pick your service and order online. Need a plan first? Start with a Growth Audit or Strategy Session." },
    { t: "Make it yours.", b: "Complete a short intake with your business information, brand, and goals. Your project takes shape around you." },
    { t: "Preview and refine.", b: "See it on a private preview before anything goes live, and use your included revisions to get it right." },
    { t: "Launch and keep going.", b: `We put it live. Website Special orders include ${careMonths} months of care for small updates, and you can add more when you're ready.` },
  ];
  return (
    <section aria-labelledby="steps-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <SectionHead id="steps-title" label="04 / From idea to online" line1="Less back and forth." line2="More forward." />
      <Stagger className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2" step={120}>
        {steps.map((s, i) => (
          <div key={s.t}>
            <p className="font-accent text-6xl text-pc-mute/70">0{i + 1}</p>
            <div className="mt-4 border-t border-white/10 pt-6">
              <h3 className="text-2xl font-light tracking-tight text-pc-cream">{s.t}</h3>
              <p className="mt-3 text-base leading-relaxed text-pc-mute">{s.b}</p>
            </div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}
