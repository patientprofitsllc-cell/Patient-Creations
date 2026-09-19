"use client";

import { useEffect, useRef, useState } from "react";

export interface HeroMedia {
  video: string;
  poster: string;
}

/**
 * The looping backdrop behind a hero. It always draws the animated glow (cheap:
 * only transforms move, no blur filter). If a loop video is provided it plays on
 * top, with a smaller portrait version on phones. Visitors who asked for reduced
 * motion or data saving, or who are on a very slow connection, get the still
 * poster image instead and download no video. Everything pauses when the hero
 * is off screen or the tab is in the background, so it never competes with
 * scrolling on a phone.
 */
export function HeroBackdrop({ desktop, mobile }: { desktop?: HeroMedia; mobile?: HeroMedia }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"glow" | "still" | "video">("glow");
  const [media, setMedia] = useState<HeroMedia | undefined>(undefined);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slow = Boolean(nav.connection?.saveData) || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const chosen = (isPhone ? mobile : desktop) ?? desktop ?? mobile;
    setMedia(chosen);
    setMode(!chosen ? "glow" : reduced || slow ? "still" : "video");

    let onScreen = true;
    const apply = () => {
      const paused = !onScreen || document.visibilityState !== "visible";
      root.dataset.paused = String(paused);
      const video = videoRef.current;
      if (video) {
        if (paused) video.pause();
        else void video.play().catch(() => undefined);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      },
      { threshold: 0 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, [desktop, mobile]);

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -left-1/4 top-[-10%] h-[70vmax] w-[70vmax] animate-orbitA rounded-full bg-[radial-gradient(circle,rgba(224,196,138,0.30),transparent_62%)] will-change-transform" />
      <div className="absolute -right-1/3 top-1/4 h-[60vmax] w-[60vmax] animate-orbitB rounded-full bg-[radial-gradient(circle,rgba(242,230,201,0.16),transparent_60%)] will-change-transform" />
      <div className="absolute bottom-[-25%] left-1/4 h-[55vmax] w-[55vmax] animate-orbitA rounded-full bg-[radial-gradient(circle,rgba(160,120,60,0.28),transparent_60%)] will-change-transform [animation-delay:-9s]" />
      {media && mode === "still" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {media && mode === "video" && (
        <video
          key={media.video}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={media.poster}
        >
          <source src={media.video} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
