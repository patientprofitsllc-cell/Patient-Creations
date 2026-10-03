"use client";

import { useEffect } from "react";

/**
 * Marks the page as able to animate. Scroll-reveal hides content only under this class, so if JavaScript is off or
 * slow, everything simply shows.
 */
export function MotionReady() {
  useEffect(() => {
    document.documentElement.classList.add("js-motion");
  }, []);
  return null;
}
