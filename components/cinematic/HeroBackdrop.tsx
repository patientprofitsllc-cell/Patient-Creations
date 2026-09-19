"use client";

import { useEffect, useRef } from "react";
import { createIntelligenceScene, SCENE_PERIOD } from "@/lib/motion/intelligenceScene";
import { frameStep, motionProfile } from "@/lib/motion/timing";

/**
 * The animated "Intelligence Layer" backdrop behind a hero, drawn live on a canvas.
 * Because it is drawn (not played from a video) it has no loop point: it flows
 * round and round with no stop, restart, or hitch, and there is no video to download.
 *
 * A still poster of the same scene is in the page from the first paint, so nothing
 * pops in. Phones and weak devices get a lighter version (one pixel per pixel, 30
 * frames a second); reduced-motion visitors get the still scene; everything pauses
 * off screen and in background tabs.
 */
export function HeroBackdrop({ poster, posterMobile }: { poster: string; posterMobile?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const profile = motionProfile({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      saveData: nav.connection?.saveData,
    });
    const minFrameMs = 1000 / profile.fps - 2;

    let w = 0;
    let h = 0;
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * profile.dpr));
      canvas.height = Math.max(1, Math.round(h * profile.dpr));
      ctx.setTransform(profile.dpr, 0, 0, profile.dpr, 0, 0);
    };
    measure();
    const scene = createIntelligenceScene(ctx, w, h);

    // The scene's own clock. It only moves while we draw, so pausing never makes it jump.
    let t = 0;
    let last = 0;
    let raf = 0;
    let onScreen = true;
    const paint = () => scene.draw(t);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (last && now - last < minFrameMs) return;
      t = (t + (last ? frameStep(now - last, 6) / 60 : 0)) % SCENE_PERIOD;
      last = now;
      paint();
    };
    const start = () => {
      if (raf || profile.reduced) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => (onScreen && document.visibilityState === "visible" ? start() : stop());

    paint();
    canvas.dataset.ready = "true"; // reveals the canvas over the poster
    if (!profile.reduced) start();

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    // Phone address bars resize the page while scrolling; wait for it to settle, then keep going.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        scene.resize(w, h);
        paint();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden bg-obsidian">
      <picture>
        {posterMobile && <source media="(max-width: 767px)" srcSet={posterMobile} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      </picture>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100" />
    </div>
  );
}
