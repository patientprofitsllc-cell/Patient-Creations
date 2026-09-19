// Small pure helpers so animation behaves the same on a 60Hz laptop, a 120Hz
// phone, and a low-power device that draws every other frame.

const FRAME_MS = 1000 / 60;

/**
 * How many "60 frames" of movement have passed since the last drawn frame.
 * Motion is multiplied by this, so speed depends on the clock, not on how
 * often the screen refreshes. Capped so a tab that was in the background does
 * not make everything jump when it comes back.
 */
export function frameStep(deltaMs: number, maxSteps = 3): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 0;
  return Math.min(deltaMs / FRAME_MS, maxSteps);
}

export type Relayout = "none" | "resize" | "respawn";

/**
 * What a canvas should do when its box changes. Phone browsers fire resize
 * events when the address bar slides in and out while scrolling; that must not
 * re-randomize the scene. Resize the drawing surface, but only start over when
 * the shape really changed (a rotation, a new window size).
 */
export function relayoutAction(prev: { w: number; h: number }, next: { w: number; h: number }): Relayout {
  const dw = Math.abs(next.w - prev.w);
  const dh = Math.abs(next.h - prev.h);
  if (dw < 1 && dh < 1) return "none";
  const prevArea = Math.max(1, prev.w * prev.h);
  const areaChange = Math.abs(next.w * next.h - prev.w * prev.h) / prevArea;
  // A different width means a real change of shape (rotation, window resize). A height-only change
  // is usually the address bar, so the scene keeps going unless it changed a lot.
  if (dw >= 1 || areaChange > 0.35) return "respawn";
  return "resize";
}

export interface MotionProfile {
  reduced: boolean;
  /** Phones, small screens, and devices with few cores: lighter drawing. */
  lowPower: boolean;
  dpr: number;
  /** Draw at most this many frames a second. */
  fps: number;
}

export function motionProfile(env: {
  reducedMotion: boolean;
  width: number;
  cores?: number;
  devicePixelRatio?: number;
  saveData?: boolean;
}): MotionProfile {
  const lowPower = env.width < 768 || (env.cores ?? 8) <= 4 || Boolean(env.saveData);
  return {
    reduced: env.reducedMotion,
    lowPower,
    dpr: lowPower ? 1 : Math.min(env.devicePixelRatio || 1, 1.5),
    fps: lowPower ? 30 : 60,
  };
}
