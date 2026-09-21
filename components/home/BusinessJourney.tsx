"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { JOURNEY } from "@/lib/journey/discovery";

/**
 * Five steps from getting online to scaling: build, attract, capture, automate, scale. Each rises into place once as it
 * scrolls into view. Only opacity and position change, nothing runs off screen, and a visitor who asks their device
 * for less motion simply sees it all at once.
 */
export function BusinessJourney() {
  const ref = useRef<HTMLOListElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16" aria-labelledby="journey-heading">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">The path</p>
        <h2 id="journey-heading" className="mt-3 font-display text-3xl text-ice sm:text-4xl">
          From getting online to <span className="text-gradient-champagne italic">running on its own.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ice/50">Most businesses start at step one and add the next step when they are ready. You never have to buy more than you need.</p>
      </div>
      <ol ref={ref} className="relative mt-10 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-3">
        {JOURNEY.map((s, i) => (
          <li
            key={s.n}
            style={{ transitionDelay: seen ? `${i * 110}ms` : "0ms" }}
            className={`relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition duration-500 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
              seen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="font-display text-2xl text-gold">{s.n}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-ice">{s.stage}</p>
            <p className="mt-3 text-sm text-ice/80">{s.line}</p>
            <p className="mt-2 text-xs leading-relaxed text-ice/50">{s.detail}</p>
            <Link href={s.href} className="mt-3 inline-flex min-h-[44px] items-center text-sm text-gold hover:brightness-110">
              See how →
            </Link>
            {i < JOURNEY.length - 1 && (
              <span aria-hidden className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 text-gold/60 sm:-right-3 sm:bottom-auto sm:left-auto sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0">
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
