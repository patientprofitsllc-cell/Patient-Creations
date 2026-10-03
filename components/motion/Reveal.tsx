"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInViewOnce } from "./hooks";

type Effect = "up" | "fade" | "scale" | "left" | "right";

/**
 * Fades and slides its content in the first time it scrolls into view. The content is in the page (and visible to
 * search engines and screen readers) from the start; only opacity and transform change, so nothing shifts the layout.
 * Turned off entirely when the device asks for less motion (see .reveal in globals.css).
 */
export function Reveal({
  children,
  effect = "up",
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  effect?: Effect;
  /** Milliseconds, for staggering items. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  return (
    <Tag ref={ref} data-effect={effect} data-seen={seen ? "" : undefined} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

/** Reveals each child in turn, `step` milliseconds apart. */
export function Stagger({ children, step = 90, effect = "up", className = "", itemClassName = "" }: { children: ReactNode[]; step?: number; effect?: Effect; className?: string; itemClassName?: string }) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step} effect={effect} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
