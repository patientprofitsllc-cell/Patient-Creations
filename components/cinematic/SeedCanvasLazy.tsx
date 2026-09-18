"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The particle animation is decoration, so it must never compete with the
// page becoming usable. It is its own chunk, loaded after the page is idle,
// and fades in over the CSS gradient that's already there.
const SeedCanvas = dynamic(() => import("./SeedCanvas").then((m) => m.SeedCanvas), { ssr: false });

export function SeedCanvasLazy({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback && w.cancelIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div aria-hidden className={`${className ?? ""} transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      {ready && <SeedCanvas className="h-full w-full" />}
    </div>
  );
}
