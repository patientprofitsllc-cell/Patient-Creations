"use client";

import { useEffect, useRef } from "react";

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
 * following the same reliable render-loop pattern as SeedCanvas.
 */
export function AgentNetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    function draw() {
      raf = requestAnimationFrame(draw);
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
          pulse.progress += pulse.speed;
          if (pulse.progress > 1) pulse.progress = 0;
          const node = nodePositions[pulse.edgeIndex];
          const x = cx + (node.x - cx) * pulse.progress;
          const y = cy + (node.y - cy) * pulse.progress;

          ctx!.save();
          ctx!.beginPath();
          ctx!.fillStyle = "rgba(224,196,138,0.9)";
          ctx!.shadowColor = "rgba(224,196,138,0.9)";
          ctx!.shadowBlur = 8;
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
          ctx!.shadowColor = "rgba(224,196,138,0.6)";
          ctx!.shadowBlur = 6;
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

    layout();
    window.addEventListener("resize", layout);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
