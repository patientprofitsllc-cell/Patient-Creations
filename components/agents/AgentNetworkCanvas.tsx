"use client";

import { useEffect, useRef } from "react";
import { frameStep, motionProfile } from "@/lib/motion/timing";

const NODE_LABELS = [
  "Research",
  "Strategy",
  "Creative",
  "Visual",
  "UX/UI",
  "Copy",
  "Development",
  "Marketing",
  "QA",
];

interface Pulse {
  edgeIndex: number;
  progress: number;
  speed: number;
}

/**
 * Central Orchestrator connected to specialized nodes, represented as
 * energy/nodes/pathways per the Visual Asset Bible's AI Agent World spec
 * (explicitly: no robot faces, no generic humanoid AI). Pure canvas code,
 * following the same render-loop pattern as HeroBackdrop (time-based, pauses off screen).
 */
export function AgentNetworkCanvas({ className }: { className?: string }) {
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
    const { dpr, reduced } = profile;
    const minFrameMs = 1000 / profile.fps - 2;
    let lastDraw = 0;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let raf = 0;
    let nodePositions: { x: number; y: number }[] = [];
    let pulses: Pulse[] = [];

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      nodePositions = NODE_LABELS.map((_, i) => {
        const angle = (i / NODE_LABELS.length) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
      });

      pulses = NODE_LABELS.map((_, i) => ({ edgeIndex: i, progress: Math.random(), speed: 0.003 + Math.random() * 0.004 }));
    }

    function draw(now: number = performance.now()) {
      raf = requestAnimationFrame(draw);
      const elapsed = now - lastDraw;
      if (!reduced && lastDraw && elapsed < minFrameMs) return;
      // Pulses travel by real elapsed time, so they move at the same speed on any refresh rate.
      const step = reduced || !lastDraw ? 0 : frameStep(elapsed);
      lastDraw = now;
      try {
        ctx!.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;

        // edges
        ctx!.save();
        ctx!.strokeStyle = "rgba(224,196,138,0.18)";
        ctx!.lineWidth = 1;
        for (const node of nodePositions) {
          ctx!.beginPath();
          ctx!.moveTo(cx, cy);
          ctx!.lineTo(node.x, node.y);
          ctx!.stroke();
        }
        ctx!.restore();

        // pulses traveling along edges
        for (const pulse of pulses) {
          pulse.progress += pulse.speed * step;
          if (pulse.progress > 1) pulse.progress = 0;
          const node = nodePositions[pulse.edgeIndex];
          const x = cx + (node.x - cx) * pulse.progress;
          const y = cy + (node.y - cy) * pulse.progress;

          ctx!.save();
          ctx!.beginPath();
          if (profile.lowPower) {
            ctx!.fillStyle = "rgba(224,196,138,0.25)";
            ctx!.arc(x, y, 5, 0, Math.PI * 2);
            ctx!.fill();
            ctx!.beginPath();
          } else {
            ctx!.shadowColor = "rgba(224,196,138,0.9)";
            ctx!.shadowBlur = 8;
          }
          ctx!.fillStyle = "rgba(224,196,138,0.9)";
          ctx!.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }

        // orchestrator core
        ctx!.save();
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 34);
        grad.addColorStop(0, "rgba(242,230,201,0.9)");
        grad.addColorStop(1, "rgba(242,230,201,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        // nodes + labels
        ctx!.save();
        ctx!.font = "12px var(--font-body), sans-serif";
        ctx!.textAlign = "center";
        nodePositions.forEach((node, i) => {
          ctx!.beginPath();
          ctx!.fillStyle = "rgba(224,196,138,0.85)";
          if (!profile.lowPower) {
            ctx!.shadowColor = "rgba(224,196,138,0.6)";
            ctx!.shadowBlur = 6;
          }
          ctx!.arc(node.x, node.y, 5, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = "rgba(244,239,231,0.75)";
          ctx!.fillText(NODE_LABELS[i], node.x, node.y + (node.y > height / 2 ? 20 : -12));
        });
        ctx!.restore();
      } catch {
        // keep the loop alive across transient errors
      }
    }

    function startLoop() {
      if (raf) return;
      lastDraw = 0; // time spent paused is not movement
      raf = requestAnimationFrame(draw);
    }
    function stopLoop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    layout();
    // Phone address bars resize the page while scrolling: wait for it to settle instead of relaying out on every event.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    };
    window.addEventListener("resize", onResize);

    // Only animate while the canvas is on screen and the tab is in front.
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && document.visibilityState === "visible") startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVisibility = () => {
      if (document.visibilityState === "visible" && isVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // One still frame; nothing moves.
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
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
