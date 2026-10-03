"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { trackCta } from "@/components/analytics/Track";
import { useReducedMotion } from "./hooks";

/**
 * The main call-to-action button. On a computer it leans a few pixels toward the cursor; everywhere it presses in when
 * tapped, glows gently a few times when it first appears, and nudges its arrow on hover. Each click is reported to
 * Google Analytics as a cta_click with the button's name.
 */
export function MagneticButton({
  href,
  children,
  cta,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  /** The name GA reports this button under, for example "hero-website-special". */
  cta: string;
  variant?: "primary" | "ghost" | "sand" | "outline";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  const move = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const look = {
    primary: "cta-primary rounded-full bg-gradient-to-b from-gold to-gold-deep text-obsidian shadow-gold-glow",
    ghost: "rounded-full champagne-border text-champagne hover:bg-champagne/10",
    // The homepage design: flat sand, and a thin outline, both with softly squared corners.
    sand: "cta-primary rounded-xl bg-pc-sand text-pc-ink",
    outline: "rounded-xl border border-white/20 text-pc-cream hover:border-pc-sand/70",
  }[variant];

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={() => trackCta(cta)}
      className={`group relative inline-flex min-h-[56px] items-center justify-center gap-2 px-6 py-4 text-base font-semibold tracking-wide transition-[transform,filter] duration-200 ease-out hover:brightness-110 active:scale-[0.97] ${look} ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
