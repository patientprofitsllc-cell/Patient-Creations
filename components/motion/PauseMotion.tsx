"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./hooks";

/**
 * A small "Pause motion" pill, always in reach, that stops every moving part of the page (WCAG 2.2.2). The choice is
 * remembered for the visit. Hidden when the device already asks for less motion, since nothing moves then.
 */
export function PauseMotion() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = sessionStorage.getItem("motion-paused") === "1";
    } catch {
      /* storage blocked */
    }
    setPaused(saved);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (paused) html.dataset.motion = "paused";
    else delete html.dataset.motion;
    try {
      sessionStorage.setItem("motion-paused", paused ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [paused]);

  if (reduced) return null;
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setPaused((p) => !p)}
      className="pause-motion fixed bottom-[5.25rem] right-3 z-40 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/10 bg-pc-panel/90 px-4 text-xs text-pc-cream/80 backdrop-blur transition hover:text-pc-cream sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <span aria-hidden>{paused ? "▶" : "❙❙"}</span>
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
