"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";
import type { FunnelEvent } from "@/lib/analytics/funnel";
import { gaEvent, gaFunnel, gaPurchase } from "@/lib/analytics/ga";

/** Counts one event from a click or other action. Never affects the page. */
export function sendFunnelEvent(event: FunnelEvent, data?: Record<string, string>) {
  send(event, data);
}

function send(event: FunnelEvent, data?: Record<string, string>) {
  gaFunnel(event, data);
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

/** Sends a "cta_click" to Google Analytics, naming which button was pressed. */
export function trackCta(cta: string, data: Record<string, string> = {}) {
  gaEvent("cta_click", { cta, ...data });
}

/** Records how far down the page people scroll (25, 50, 75 and 100%), once each per page view. */
export function ScrollDepth() {
  useEffect(() => {
    const sent = new Set<number>();
    let ticking = false;
    const check = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 100;
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark - 1 && !sent.has(mark)) {
          sent.add(mark);
          gaEvent("scroll_depth", { percent: mark, page: window.location.pathname });
        }
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

/** Sends one GA4 purchase for a paid order, once per order in this browser (a refresh doesn't count it twice). */
export function GaPurchase({ order }: { order: Parameters<typeof gaPurchase>[0] }) {
  useEffect(() => {
    const key = `ga-purchase-${order.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still send once for this page view */
    }
    gaPurchase(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
