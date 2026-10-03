"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "./hooks";

/**
 * Moves its content a little slower (or faster) than the page as it scrolls, for depth. `speed` 0.15 means it drifts 15%
 * of the scroll distance. Only transform changes, only while on screen, and not at all with reduced motion.
 */
export function ParallaxLayer({ children, speed = 0.15, fade = false, className = "" }: { children: ReactNode; speed?: number; fade?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      if (fade) el.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, speed, fade]);
  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
