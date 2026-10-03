"use client";

import type { ReactNode } from "react";

/**
 * A slow, endless strip of items. It pauses on hover and when the device asks for less motion (then it simply wraps).
 * The items are listed once for screen readers; the repeat that makes the loop seamless is hidden from them.
 */
export function Marquee({ items, className = "", seconds = 38 }: { items: ReactNode[]; className?: string; seconds?: number }) {
  return (
    <div className={`marquee group relative overflow-hidden ${className}`} style={{ ["--marquee-duration" as string]: `${seconds}s` }}>
      <div className="marquee-track flex w-max gap-10 group-hover:[animation-play-state:paused]">
        <ul className="flex shrink-0 gap-10">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
        <ul aria-hidden className="marquee-copy flex shrink-0 gap-10">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      </div>
    </div>
  );
}
