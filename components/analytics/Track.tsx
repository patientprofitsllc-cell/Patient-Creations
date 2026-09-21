"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";
import type { FunnelEvent } from "@/lib/analytics/funnel";

/** Counts one event from a click or other action. Never affects the page. */
export function sendFunnelEvent(event: FunnelEvent, data?: Record<string, string>) {
  send(event, data);
}

function send(event: FunnelEvent, data?: Record<string, string>) {
  const a = captureAttribution();
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ event, path: window.location.pathname, ...a, data }),
  }).catch(() => {
    /* analytics must never affect the page */
  });
}

/** Fires one funnel event when the page (or component) first appears. */
export function TrackView({ event, data }: { event: FunnelEvent; data?: Record<string, string> }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    send(event, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Wraps a section and fires the event once when a good part of it is on screen. */
export function TrackOnScreen({ event, children }: { event: FunnelEvent; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !fired.current) {
          fired.current = true;
          send(event);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [event]);

  return <div ref={ref}>{children}</div>;
}
