"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const EVERY_MS = 30_000;
const MAX_REFRESHES = 40; // about 20 minutes, so a forgotten tab doesn't keep calling the site

/**
 * Keeps the tracking screen current while the customer has it open and the
 * order isn't finished. It refreshes only while the tab is visible, and stops
 * on its own, so it adds almost no load.
 */
export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    let count = 0;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      count++;
      router.refresh();
      if (count >= MAX_REFRESHES) window.clearInterval(id);
    }, EVERY_MS);
    return () => window.clearInterval(id);
  }, [active, router]);

  return null;
}
