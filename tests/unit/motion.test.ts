import { describe, expect, it } from "vitest";
import { frameStep, motionProfile, relayoutAction } from "@/lib/motion/timing";

describe("frameStep", () => {
  it("is 1 for a 60Hz frame, so speeds tuned per frame stay the same", () => {
    expect(frameStep(1000 / 60)).toBeCloseTo(1, 5);
  });

  it("moves the same distance per second at any refresh rate", () => {
    const perSecond = (hz: number) => Array.from({ length: hz }, () => frameStep(1000 / hz)).reduce((a, b) => a + b, 0);
    expect(perSecond(30)).toBeCloseTo(60, 3);
    expect(perSecond(60)).toBeCloseTo(60, 3);
    expect(perSecond(120)).toBeCloseTo(60, 3);
  });

  it("does not let a returning background tab make things jump", () => {
    expect(frameStep(30_000)).toBe(3);
    expect(frameStep(30_000, 2)).toBe(2);
  });

  it("stands still for a zero, negative, or broken time step", () => {
    expect(frameStep(0)).toBe(0);
    expect(frameStep(-5)).toBe(0);
    expect(frameStep(Number.NaN)).toBe(0);
  });
});

describe("relayoutAction", () => {
  const phone = { w: 390, h: 700 };

  it("does nothing when the size did not change", () => {
    expect(relayoutAction(phone, { w: 390, h: 700 })).toBe("none");
    expect(relayoutAction(phone, { w: 390.4, h: 700.4 })).toBe("none");
  });

  it("keeps the scene going when only the address bar moved", () => {
    expect(relayoutAction(phone, { w: 390, h: 760 })).toBe("resize");
    expect(relayoutAction(phone, { w: 390, h: 640 })).toBe("resize");
  });

  it("starts over when the phone is rotated or the window is resized", () => {
    expect(relayoutAction(phone, { w: 700, h: 390 })).toBe("respawn");
    expect(relayoutAction(phone, { w: 430, h: 700 })).toBe("respawn");
  });

  it("starts over when the box changed a lot in height alone", () => {
    expect(relayoutAction(phone, { w: 390, h: 300 })).toBe("respawn");
  });
});

describe("motionProfile", () => {
  const base = { reducedMotion: false, width: 1440, cores: 8, devicePixelRatio: 2 };

  it("gives a desktop full drawing quality, capped density", () => {
    expect(motionProfile(base)).toEqual({ reduced: false, lowPower: false, dpr: 1.5, fps: 60 });
  });

  it("lightens up on phones, weak devices, and data saver", () => {
    for (const env of [{ ...base, width: 390 }, { ...base, cores: 4 }, { ...base, saveData: true }]) {
      expect(motionProfile(env)).toEqual({ reduced: false, lowPower: true, dpr: 1, fps: 30 });
    }
  });

  it("passes reduced motion through", () => {
    expect(motionProfile({ ...base, reducedMotion: true }).reduced).toBe(true);
  });
});
