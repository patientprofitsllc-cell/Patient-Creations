"use client";

import { useEffect, useRef } from "react";
import { frameStep, motionProfile, relayoutAction } from "@/lib/motion/timing";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: "gold" | "champagne";
}

/**
 * Pure-code "Digital Seed" hero visual: a dense core of drifting particles
 * with connecting energy lines — obsidian core, gold internal energy,
 * restrained champagne highlights. No generated image required. Render
 * loop follows the reliability pattern from the studio's
 * canvas reference notes: schedule rAF first, wrap the frame body in
 * try/catch, and save/restore context state per draw pass so glow settings
 * never bleed across frames.
 */
// Pre-rendered glow sprites, drawn once and blitted per-particle instead of
// paying for ctx.shadowBlur (an expensive per-call blur convolution) on
// every particle, every frame — same visual result, far cheaper to render.
function makeGlowSprite(color: string, r: number): HTMLCanvasElement {
  const size = Math.ceil(r * 8);
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const sctx = sprite.getContext("2d")!;
  const grad = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, size, size);
  return sprite;
}

export function SeedCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const profile = motionProfile({
      reducedMotion: prefersReducedMotion,
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      saveData: nav.connection?.saveData,
    });
    const goldSprite = makeGlowSprite("rgba(224,196,138,0.85)", 6);
    const champagneSprite = makeGlowSprite("rgba(242,230,201,0.85)", 6);

    let width = 0;
    let height = 0;
    // Phones, low-core devices, and data-saver mode get a lighter version: fewer particles, no
    // retina-density canvas, and about 30 frames a second instead of 60.
    const lowPower = profile.lowPower;
    const dpr = profile.dpr;
    const minFrameMs = 1000 / profile.fps - 2;
    let lastDraw = 0;
    let particles: Particle[] = [];
    let raf = 0;
    // Only animate while the canvas is actually visible on screen and the
    // tab has focus — an off-screen or backgrounded hero shouldn't compete
    // for the main thread with scrolling, typing, or anything else.
    let isVisible = true;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const action = relayoutAction({ w: width, h: height }, { w: rect.width, h: rect.height });
      if (action === "none" && particles.length > 0) return;
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Phone address bars resize the page while scrolling; keep the scene going instead of re-randomizing it.
      if (action === "resize" && particles.length > 0) return;
      const count = Math.round((width * height) / 9000);
      particles = Array.from({ length: Math.min(count, lowPower ? 70 : 140) }, () => spawnParticle());
    }

    function spawnParticle(): Particle {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(width, height) * 0.32;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius;
      return {
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.4,
        hue: Math.random() > 0.85 ? "champagne" : "gold",
      };
    }

    function draw(now: number = performance.now()) {
      raf = requestAnimationFrame(draw);
      const elapsed = now - lastDraw;
      if (!prefersReducedMotion && lastDraw && elapsed < minFrameMs) return;
      // Movement is scaled by real elapsed time, so speed is the same at 30, 60, or 120 frames a second.
      const step = prefersReducedMotion || !lastDraw ? 0 : frameStep(elapsed);
      lastDraw = now;
      try {
        ctx!.clearRect(0, 0, width, height);

        // core glow
        ctx!.save();
        const grad = ctx!.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height) * 0.35);
        grad.addColorStop(0, "rgba(224,196,138,0.14)");
        grad.addColorStop(1, "rgba(16,13,11,0)");
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, width, height);
        ctx!.restore();

        for (const p of particles) {
          if (!prefersReducedMotion) {
            p.x += p.vx * step;
            p.y += p.vy * step;
            const dx = p.x - width / 2;
            const dy = p.y - height / 2;
            const dist = Math.hypot(dx, dy);
            const maxDist = Math.min(width, height) * 0.38;
            if (dist > maxDist) {
              p.vx -= (dx / dist) * 0.01 * step;
              p.vy -= (dy / dist) * 0.01 * step;
            }
          }

          // Blit a pre-rendered glow sprite instead of stroking a fresh
          // shadowBlur per particle per frame — visually identical, far
          // cheaper (shadowBlur forces a blur convolution on every call).
          const sprite = p.hue === "gold" ? goldSprite : champagneSprite;
          const scale = p.r / 1.6;
          const drawSize = sprite.width * scale;
          ctx!.drawImage(sprite, p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
        }

        // Connecting lines between nearby particles. Compare squared
        // distances (no sqrt) since we only need a threshold check — this
        // loop is O(n^2) over up to 140 particles, so avoiding sqrt on
        // ~9,700 pair checks per frame meaningfully cuts main-thread work.
        const maxLineDist = 60;
        const maxLineDistSq = maxLineDist * maxLineDist;
        ctx!.save();
        ctx!.strokeStyle = "rgba(224,196,138,0.1)";
        ctx!.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (dx * dx + dy * dy < maxLineDistSq) {
              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
              ctx!.stroke();
            }
          }
        }
        ctx!.restore();
      } catch {
        // never let a transient error kill the loop permanently
      }
    }

    function startLoop() {
      if (raf) return;
      lastDraw = 0; // do not count the time spent paused as movement
      raf = requestAnimationFrame(draw);
    }

    function stopLoop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    // Wait for resizing to settle (rotating a phone fires several events).
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    // Pause entirely when the hero scrolls off screen or the tab is
    // backgrounded — an invisible animation shouldn't spend main-thread
    // time competing with scrolling, typing, or anything else the visitor
    // is actually doing.
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && document.visibilityState === "visible") startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && isVisible) startLoop();
      else stopLoop();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (prefersReducedMotion) {
      // Draw a single static frame and never loop — nothing on screen is
      // moving, so there's nothing to animate.
      draw();
      stopLoop();
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
