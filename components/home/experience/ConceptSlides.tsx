"use client";

import { useEffect, useState } from "react";
import { useMotionPaused } from "@/components/motion/hooks";

const SLIDE_MS = 5000;

const SLIDES = [
  {
    label: "The digital first impression",
    kicker: "Your business / your story",
    title: (
      <>
        Make a<br />
        <i className="font-accent text-[1.15em]">lasting</i>
        <br />
        impression.
      </>
    ),
    sub: "A clear introduction. A memorable presence.",
    foot: ["Designed for you", "Built for mobile"],
    chips: ["Custom design", "Clear next steps", "Mobile ready"],
    card: "bg-pc-cream text-pc-ink",
  },
  {
    label: "The scroll-stopper",
    kicker: "Your offer / their feed",
    title: (
      <>
        Show up
        <br />
        where they
        <br />
        <i className="font-accent text-[1.15em]">scroll.</i>
      </>
    ),
    sub: "Hooks that earn a second look.",
    foot: ["Creator style", "Cinematic"],
    chips: ["Opening hooks", "Wide and vertical", "Captions written"],
    card: "bg-pc-sage text-pc-ink",
  },
  {
    label: "The quiet engine",
    kicker: "Your leads / on autopilot",
    title: (
      <>
        Let the
        <br />
        follow-up
        <br />
        <i className="font-accent text-[1.15em]">run itself.</i>
      </>
    ),
    sub: "Capture, follow up, and get paid.",
    foot: ["Lead capture", "Stripe payments"],
    chips: ["Lead forms", "Auto emails", "Payments"],
    card: "bg-pc-tan text-pc-ink",
  },
];

/** Three service concepts that turn on their own (with a progress bar) until paused, or by tapping the dots. */
export function ConceptSlides() {
  const [i, setI] = useState(0);
  const paused = useMotionPaused();

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [i, paused]);

  const s = SLIDES[i];
  return (
    <div className="rounded-2xl border border-white/10 bg-pc-panel p-5 sm:p-7" aria-roledescription="carousel" aria-label="Service concepts">
      <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.2em] text-pc-mute">
        <span>{s.label}</span>
        <span>
          0{i + 1} / 0{SLIDES.length}
        </span>
      </div>
      <div key={i} className={`pc-swap mt-5 rounded-lg p-6 shadow-xl shadow-black/30 sm:p-8 ${s.card}`} style={{ transform: "rotate(-1.5deg)" }} aria-live="polite">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] opacity-70">{s.kicker}</p>
        <p className="mt-5 text-4xl leading-[1.02] tracking-tight sm:text-5xl">{s.title}</p>
        <p className="mt-4 text-sm opacity-70">{s.sub}</p>
        <p className="mt-6 flex justify-between border-t border-black/10 pt-3 text-[0.6rem] uppercase tracking-[0.15em] opacity-70">
          {s.foot.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </p>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2">
        {s.chips.map((c) => (
          <li key={c} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-pc-cream/80">
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2">
        {SLIDES.map((sl, n) => (
          <button key={sl.label} type="button" onClick={() => setI(n)} aria-label={`Show ${sl.label}`} aria-current={n === i} className="flex h-8 flex-1 items-center">
            <span className="relative block h-0.5 w-full overflow-hidden rounded bg-white/10">
              {n === i && <span key={`${i}-${paused}`} className={`absolute inset-0 bg-pc-sand ${paused ? "" : "pc-progress"}`} style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms` }} />}
              {n < i && <span className="absolute inset-0 bg-pc-sand/50" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
