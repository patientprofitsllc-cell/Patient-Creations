"use client";

import { useEffect, useState } from "react";
import { usd } from "@/lib/pricing/catalog";
import { useInViewOnce, useReducedMotion } from "./hooks";

/**
 * A dollar amount that counts up from zero when it scrolls into view. The real amount is what the server renders (so it
 * is right without JavaScript, for search engines, and with reduced motion); only real figures should be passed in.
 */
export function CountUp({ cents, durationMs = 1100, className = "" }: { cents: number; durationMs?: number; className?: string }) {
  const { ref, seen } = useInViewOnce<HTMLSpanElement>(0.6);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(cents);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!seen || started || reduced) return;
    setStarted(true);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round((cents * eased) / 100) * 100);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, started, reduced, cents, durationMs]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={usd(cents)}>
      <span aria-hidden>{usd(started ? shown : cents)}</span>
    </span>
  );
}
