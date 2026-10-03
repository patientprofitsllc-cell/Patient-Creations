"use client";

import { useEffect, useRef, useState } from "react";

/** True when the visitor's device asks for less motion. Every animation here checks it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** Becomes true the first time the element scrolls into view, then stays true. */
export function useInViewOnce<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
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
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

/**
 * True while the visitor has pressed "Pause motion" (or their device asks for less motion). Auto-advancing tabs and
 * slides check this, and CSS pauses every running animation under html[data-motion="paused"].
 */
export function useMotionPaused(): boolean {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const read = () => setPaused(document.documentElement.dataset.motion === "paused");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    return () => mo.disconnect();
  }, []);
  return reduced || paused;
}
