import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { readFileSync } from "fs";
import { createIntelligenceScene, SCENE_PERIOD } from "@/lib/motion/intelligenceScene";

// A drawing surface that writes down every call and number, so scenes can be compared exactly.
function recorder() {
  const log: (string | number)[] = [];
  const target: Record<string, unknown> = {};
  const ctx = new Proxy(target, {
    get(_t, prop: string) {
      if (prop === "createLinearGradient" || prop === "createRadialGradient") {
        return (...args: number[]) => {
          log.push(prop, ...args);
          return { addColorStop: (o: number, c: string) => log.push("stop", o, c) };
        };
      }
      return (...args: unknown[]) => {
        log.push(prop, ...args.map((a) => (typeof a === "number" ? a : typeof a === "string" ? a : "obj")));
      };
    },
    set(_t, prop: string, value) {
      log.push(`set:${prop}`, typeof value === "number" ? value : String(value));
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, log };
}
const sprite = () => ({}) as CanvasImageSource;

function frameAt(t: number, w = 1280, h = 720) {
  const { ctx, log } = recorder();
  createIntelligenceScene(ctx, w, h, sprite).draw(t);
  return log;
}

function sameWithin(a: (string | number)[], b: (string | number)[], eps = 1e-6) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => (typeof v === "number" && typeof b[i] === "number" ? Math.abs(v - (b[i] as number)) < eps : v === b[i]));
}

describe("Intelligence Layer scene", () => {
  it("is exactly the same at the end of a period as at the start, so it has no loop point", () => {
    for (const [w, h] of [[1280, 720], [390, 844]] as const) {
      expect(sameWithin(frameAt(0, w, h), frameAt(SCENE_PERIOD, w, h)), `${w}x${h}`).toBe(true);
      expect(sameWithin(frameAt(3.7, w, h), frameAt(3.7 + SCENE_PERIOD, w, h)), `${w}x${h} mid`).toBe(true);
    }
  });

  it("actually moves between frames", () => {
    expect(sameWithin(frameAt(0), frameAt(0.5))).toBe(false);
    expect(sameWithin(frameAt(2), frameAt(2.5))).toBe(false);
  });

  it("changes only a little from one frame to the next (no jumps)", () => {
    const a = frameAt(5);
    const b = frameAt(5 + 1 / 60);
    let biggest = 0;
    a.forEach((v, i) => {
      if (typeof v === "number" && typeof b[i] === "number") biggest = Math.max(biggest, Math.abs(v - (b[i] as number)));
    });
    // A pulse re-emerging at the start of its link is the one large move; it happens at a node, not mid-screen.
    expect(biggest).toBeLessThan(1400);
  });

  it("draws the same community every time (fixed layout)", () => {
    expect(sameWithin(frameAt(1.25), frameAt(1.25))).toBe(true);
  });

  it("re-frames itself for a tall phone screen", () => {
    const { ctx, log } = recorder();
    const scene = createIntelligenceScene(ctx, 1280, 720, sprite);
    scene.draw(1);
    const wide = log.length;
    log.length = 0;
    scene.resize(390, 844);
    scene.draw(1);
    expect(log.length).toBe(wide); // same scene, new framing
    expect(sameWithin(frameAt(1, 390, 844), log)).toBe(true);
  });
});

describe("hero assets", () => {
  it("the demo page points only at poster stills that exist, and no longer ships a video", () => {
    const page = readFileSync(join(process.cwd(), "app/demo/intelligence-layer/page.tsx"), "utf8");
    const refs = [...page.matchAll(/"(\/assets\/hero\/[^"]+)"/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const r of refs) expect(existsSync(join(process.cwd(), "public", r)), r).toBe(true);
    expect(refs.some((r) => r.endsWith(".mp4"))).toBe(false);
  });
});
