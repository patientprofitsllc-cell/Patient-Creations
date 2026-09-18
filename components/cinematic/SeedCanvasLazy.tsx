"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The particle animation is decoration, so it must never compete with the
// page becoming usable. It is its own chunk, started a moment after the page
// has loaded (once the browser is idle), and fades in over the CSS gradient
// that's already there.
const SeedCanvas = dynamic(() => import("./SeedCanvas").then((m) => m.SeedCanvas), { ssr: false });

const START_DELAY_MS = 1500;

export function SeedCanvasLazy({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let idleId: number | undefined;
    const timer = window.setTimeout(() => {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      else setReady(true);
    }, START_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    };
  }, []);

  return (
    <div aria-hidden className={`${className ?? ""} transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      {ready && <SeedCanvas className="h-full w-full" />}
    </div>
  );
}
