"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackCta } from "@/components/analytics/Track";

/**
 * The next step, always within reach. Appears once the hero has scrolled away (watching the element with id
 * `heroId`), hides again near the final call to action (`endId`) so the two never stack, and can be dismissed for the
 * visit. A bar across the bottom on phones, a pill in the corner on larger screens.
 */
export function StickyCta({ label, price, href, heroId = "hero", endId = "final-cta" }: { label: string; price: string; href: string; heroId?: string; endId?: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem("sticky-cta-closed") === "1");
    } catch {
      /* storage blocked: show it */
    }
    if (typeof IntersectionObserver === "undefined") return;
    const watch = (id: string, on: (visible: boolean) => void) => {
      const el = document.getElementById(id);
      if (!el) return () => {};
      const io = new IntersectionObserver((entries) => on(entries.some((e) => e.isIntersecting)), { threshold: 0 });
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(heroId, (v) => setPastHero(!v));
    const b = watch(endId, (v) => setAtEnd(v));
    return () => {
      a();
      b();
    };
  }, [heroId, endId]);

  const show = pastHero && !atEnd && !closed;
  const close = () => {
    setClosed(true);
    try {
      sessionStorage.setItem("sticky-cta-closed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-show={show ? "true" : "false"}
      aria-hidden={!show}
      className="sticky-cta fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-obsidian/95 px-4 py-3 backdrop-blur-lg sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-full sm:border sm:px-3 sm:py-2"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="flex-1 text-sm text-ice/80 sm:pl-3">
          {label} <span className="font-semibold text-champagne">{price}</span>
        </p>
        <Link
          href={href}
          tabIndex={show ? 0 : -1}
          onClick={() => trackCta("sticky")}
          className="inline-flex min-h-[44px] items-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-5 text-sm font-semibold text-obsidian transition hover:brightness-110 active:scale-[0.97]"
        >
          Start now →
        </Link>
        <button type="button" onClick={close} tabIndex={show ? 0 : -1} aria-label="Hide this bar" className="flex h-11 w-11 items-center justify-center rounded-full text-ice/50 hover:text-ice">
          ×
        </button>
      </div>
    </div>
  );
}
