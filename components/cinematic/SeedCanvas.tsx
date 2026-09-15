"use client";

import { useEffect, useRef } from "react";

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
export function SeedCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: Particle[] = [];
    let raf = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 9000);
      particles = Array.from({ length: Math.min(count, 140) }, () => spawnParticle());
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

    function draw() {
      raf = requestAnimationFrame(draw);
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
            p.x += p.vx;
            p.y += p.vy;
            const dx = p.x - width / 2;
            const dy = p.y - height / 2;
            const dist = Math.hypot(dx, dy);
            const maxDist = Math.min(width, height) * 0.38;
            if (dist > maxDist) {
              p.vx -= (dx / dist) * 0.01;
              p.vy -= (dy / dist) * 0.01;
            }
          }

          ctx!.save();
          ctx!.beginPath();
          ctx!.fillStyle = p.hue === "gold" ? "rgba(224,196,138,0.85)" : "rgba(242,230,201,0.85)";
          ctx!.shadowColor = p.hue === "gold" ? "rgba(224,196,138,0.9)" : "rgba(242,230,201,0.9)";
          ctx!.shadowBlur = 6;
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }

        // connecting lines between nearby particles
        ctx!.save();
        ctx!.strokeStyle = "rgba(224,196,138,0.1)";
        ctx!.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 60) {
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

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
