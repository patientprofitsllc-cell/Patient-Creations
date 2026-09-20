import { describe, expect, it } from "vitest";
import { CueScheduler, FADE_MS, OVERRUN_GUARD_MS, READY_GRACE_MS, SETTLE_MS, type Clip, type Clock, type Speaker } from "@/lib/voice/cueScheduler";

// A clock the test moves by hand, so time is exact and nothing is flaky.
class FakeClock implements Clock {
  t = 0;
  private next = 1;
  private timers = new Map<number, { at: number; fn: () => void }>();
  setTimeout(fn: () => void, ms: number) {
    const id = this.next++;
    this.timers.set(id, { at: this.t + ms, fn });
    return id;
  }
  clearTimeout(h: unknown) {
    this.timers.delete(h as number);
  }
  now() {
    return this.t;
  }
  get pending() {
    return this.timers.size;
  }
  async advance(ms: number) {
    await flush(); // let "the clip is ready" answers from just before this call arrive, as they do in a browser
    const end = this.t + ms;
    for (;;) {
      const due = [...this.timers.entries()].filter(([, v]) => v.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!due) break;
      this.t = due[1].at;
      this.timers.delete(due[0]);
      due[1].fn();
      await flush();
    }
    this.t = end;
    await flush();
  }
}
const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

interface Event {
  at: number;
  what: "prepare" | "play" | "stop";
  id: string;
  fade?: number;
}

class FakeSpeaker implements Speaker {
  events: Event[] = [];
  playing: string | null = null;
  overlap = 0;
  neverEnds = false; // a speaker that fails to report the end of a line
  onEnded: (id: string) => void = () => {};
  private token = 0;
  private endTimer: unknown = null;
  loadMs = 0; // how long a clip takes to become ready
  failLoad = new Set<string>();
  constructor(private clock: FakeClock) {}
  prepare(clip: Clip) {
    this.events.push({ at: this.clock.t, what: "prepare", id: clip.id });
    if (this.failLoad.has(clip.id)) return Promise.reject(new Error("load failed"));
    if (this.loadMs === 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      this.clock.setTimeout(resolve, this.loadMs);
    });
  }
  play(clip: Clip) {
    if (this.playing) this.overlap++;
    this.playing = clip.id;
    this.events.push({ at: this.clock.t, what: "play", id: clip.id });
    const token = ++this.token;
    if (!this.neverEnds) {
      this.endTimer = this.clock.setTimeout(() => {
        if (this.token === token && this.playing === clip.id) {
          this.playing = null;
          this.onEnded(clip.id);
        }
      }, clip.durationMs);
    }
  }
  stop(fade: number) {
    this.events.push({ at: this.clock.t, what: "stop", id: this.playing ?? "", fade });
    this.playing = null;
    this.token++;
    if (this.endTimer !== null) this.clock.clearTimeout(this.endTimer);
    this.endTimer = null;
  }
  plays() {
    return this.events.filter((e) => e.what === "play");
  }
}

const clip = (id: string, durationMs: number): Clip => ({ id, src: `/${id}.mp3`, durationMs, text: id });
const CLIPS: Record<string, Clip> = Object.fromEntries(
  [clip("home", 7000), clip("services", 6000), clip("site", 5000), clip("saas", 5500), clip("checkout", 4000), clip("chat-reply", 2000), clip("chat-welcome", 4000)].map((c) => [c.id, c]),
);

function setup(loadMs = 0) {
  const clock = new FakeClock();
  const speaker = new FakeSpeaker(clock);
  speaker.loadMs = loadMs;
  const changes: string[] = [];
  const s = new CueScheduler(CLIPS, speaker, clock, { onChange: (st, c) => changes.push(`${st}:${c?.id ?? "-"}`) });
  speaker.onEnded = (id) => s.ended(id); // the page wires the speaker's "ended" to the scheduler
  const endWhenDone = () => {}; // kept so the tests read the same; the fake speaker now ends its own lines
  return { clock, speaker, s, changes, endWhenDone };
}

describe("cue timing", () => {
  it("rule 1: speaks a line exactly SETTLE_MS after the page appears, and not a moment before", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    await clock.advance(SETTLE_MS - 1);
    expect(speaker.plays()).toHaveLength(0);
    await clock.advance(1);
    expect(speaker.plays()).toEqual([{ at: SETTLE_MS, what: "play", id: "home" }]);
  });

  it("rule 2: switching again before the wait is over restarts the wait, and the old page's line never plays", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    await clock.advance(500);
    s.navigate("services");
    await clock.advance(SETTLE_MS - 1);
    expect(speaker.plays()).toHaveLength(0);
    await clock.advance(1);
    expect(speaker.plays().map((e) => [e.id, e.at])).toEqual([["services", 500 + SETTLE_MS]]);
  });

  it("rule 2: a rapid run of switches speaks only for where the visitor finally stopped", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    for (const id of ["services", "site", "saas", "checkout", "site"]) {
      await clock.advance(120);
      s.navigate(id);
    }
    await clock.advance(SETTLE_MS);
    expect(speaker.plays().map((e) => e.id)).toEqual(["site"]);
  });

  it("rules 3 and 4: leaving a page cuts its line off right away, then the new line waits its own turn", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    await clock.advance(SETTLE_MS + 1000); // home is mid-line
    s.navigate("services");
    expect(speaker.events.find((e) => e.what === "stop")).toEqual({ at: SETTLE_MS + 1000, what: "stop", id: "home", fade: FADE_MS });
    expect(s.playing).toBeNull();
    await clock.advance(SETTLE_MS);
    expect(speaker.plays().map((e) => e.id)).toEqual(["home", "services"]);
    expect(speaker.overlap).toBe(0);
  });

  it("rule 5: coming back to the same page while its line plays leaves it alone", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    await clock.advance(SETTLE_MS + 500);
    s.navigate("home");
    await clock.advance(300);
    expect(speaker.events.filter((e) => e.what === "stop")).toHaveLength(0);
    expect(speaker.plays()).toHaveLength(1);
  });

  it("rule 6: a line is spoken once per visit, and Replay speaks it again on request", async () => {
    const { clock, speaker, s, endWhenDone } = setup();
    s.enable("home");
    await clock.advance(SETTLE_MS);
    endWhenDone();
    await clock.advance(CLIPS.home.durationMs);
    s.navigate("services");
    await clock.advance(SETTLE_MS);
    s.navigate("home"); // back to a page already heard
    await clock.advance(SETTLE_MS + 100);
    expect(speaker.plays().filter((e) => e.id === "home")).toHaveLength(1);
    s.replay();
    await clock.advance(1);
    expect(speaker.plays().filter((e) => e.id === "home")).toHaveLength(2);
  });

  it("rule 7: a line that is not loaded in time is dropped, and one that loads just in time still plays", async () => {
    const slow = setup(SETTLE_MS + READY_GRACE_MS + 500);
    slow.s.enable("home");
    await slow.clock.advance(SETTLE_MS + READY_GRACE_MS + 1000);
    expect(slow.speaker.plays()).toHaveLength(0);
    expect(slow.s.state).toBe("idle");

    const late = setup(SETTLE_MS + 300);
    late.s.enable("home");
    await late.clock.advance(SETTLE_MS + 300);
    await late.clock.advance(60);
    expect(late.speaker.plays().map((e) => e.id)).toEqual(["home"]);
    expect(late.speaker.plays()[0].at).toBeLessThanOrEqual(SETTLE_MS + READY_GRACE_MS);

    const broken = setup();
    broken.speaker.failLoad.add("home");
    broken.s.enable("home");
    await broken.clock.advance(SETTLE_MS + 100);
    expect(broken.speaker.plays()).toHaveLength(0);
  });

  it("rule 8: a chat reply speaks at once when quiet, waits for a playing line to end, and dies with a page change", async () => {
    const quiet = setup();
    quiet.s.enable(null);
    quiet.s.notify("chat-reply");
    await quiet.clock.advance(1);
    expect(quiet.speaker.plays().map((e) => [e.id, e.at])).toEqual([["chat-reply", 0]]);

    const busy = setup();
    busy.s.enable("home");
    await busy.clock.advance(SETTLE_MS + 100);
    busy.endWhenDone();
    busy.s.notify("chat-welcome");
    busy.s.notify("chat-reply"); // only the newest waits
    expect(busy.speaker.plays().map((e) => e.id)).toEqual(["home"]);
    await busy.clock.advance(CLIPS.home.durationMs);
    await busy.clock.advance(10);
    expect(busy.speaker.plays().map((e) => e.id)).toEqual(["home", "chat-reply"]);

    const gone = setup();
    gone.s.enable("home");
    await gone.clock.advance(SETTLE_MS + 100);
    gone.s.notify("chat-reply");
    gone.s.navigate("services");
    await gone.clock.advance(20000);
    expect(gone.speaker.plays().map((e) => e.id)).toEqual(["home", "services"]);
  });

  it("rule 9: turning the guide off stops the line, clears every timer, and stays silent", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    await clock.advance(SETTLE_MS + 500);
    s.disable();
    expect(speaker.events.at(-1)).toMatchObject({ what: "stop", id: "home" });
    expect(clock.pending).toBe(0);
    s.navigate("services");
    s.notify("chat-reply");
    await clock.advance(30000);
    expect(speaker.plays()).toHaveLength(1);
    expect(s.state).toBe("off");
  });

  it("a page with no line stays silent, and a line the speaker never reports as finished is stopped on time", async () => {
    const { clock, speaker, s } = setup();
    speaker.neverEnds = true;
    s.enable(null);
    await clock.advance(5000);
    expect(speaker.plays()).toHaveLength(0);
    s.navigate("home");
    await clock.advance(SETTLE_MS);
    expect(s.state).toBe("playing");
    await clock.advance(CLIPS.home.durationMs + OVERRUN_GUARD_MS);
    expect(s.state).toBe("idle");
    expect(speaker.playing).toBeNull(); // it was stopped, not just forgotten
  });

  it("a page whose cue has no recording is skipped without a sound", async () => {
    const { clock, speaker, s } = setup();
    s.enable("no-such-cue");
    await clock.advance(3000);
    expect(speaker.plays()).toHaveLength(0);
  });
});

describe("cue timing under stress", () => {
  // A seeded random walk of page switches, product switches, replays, chat replies, and gaps. Every single start
  // the scheduler makes is checked against the exact moment and page it belongs to, whatever the visitor did.
  function rng(seed: number) {
    let x = seed;
    return () => {
      x = (x * 1664525 + 1013904223) % 4294967296;
      return x / 4294967296;
    };
  }
  const PAGES = ["home", "services", "site", "saas", "checkout", null];

  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    it(`every start is on time, for the right page, and never overlaps (seed ${seed})`, async () => {
      const loadMs = seed % 3 === 0 ? 200 : 0;
      const { clock, speaker, s } = setup(loadMs);
      const rand = rng(seed);
      const navs: { t: number; cue: string | null }[] = []; // the page the visitor was on, over time
      const replays: number[] = [];
      const notifies: number[] = [];
      const offs: number[] = [];
      const ons: number[] = [];
      let on = false;

      for (let step = 0; step < 500; step++) {
        const r = rand();
        if (!on && r < 0.35) {
          const cue = navs.length ? navs[navs.length - 1].cue : null;
          s.enable(cue);
          on = true;
          ons.push(clock.t);
          navs.push({ t: clock.t, cue });
        } else if (r < 0.65) {
          const cue = PAGES[Math.floor(rand() * PAGES.length)];
          s.navigate(cue);
          navs.push({ t: clock.t, cue });
        } else if (r < 0.73) {
          s.replay();
          replays.push(clock.t);
        } else if (r < 0.83) {
          s.notify("chat-reply");
          notifies.push(clock.t);
        } else if (r < 0.86 && on) {
          s.disable();
          on = false;
          offs.push(clock.t);
        }
        await clock.advance(Math.floor(rand() * 1600));
      }
      await clock.advance(60000);

      const lastBefore = (times: number[], t: number) => times.filter((x) => x <= t).pop() ?? -Infinity;
      const pageAt = (t: number) => navs.filter((n) => n.t <= t).pop()?.cue ?? null;
      for (const p of speaker.plays()) {
        if (p.id === "chat-reply") continue;
        // 1. It is the page the visitor is on at that instant, never one they already left.
        expect(p.id, `play at ${p.at}`).toBe(pageAt(p.at));
        // 2. It waited the full settle time after the last page change, unless they pressed Replay.
        const lastNav = lastBefore(navs.map((n) => n.t), p.at);
        const lastReplay = lastBefore(replays, p.at);
        const viaReplay = lastReplay >= lastNav && p.at - lastReplay <= READY_GRACE_MS + 50;
        if (!viaReplay) expect(p.at - lastNav, `play at ${p.at}`).toBeGreaterThanOrEqual(SETTLE_MS);
        // 3. The guide was on.
        const lastOn = lastBefore(ons, p.at);
        const lastOff = lastBefore(offs, p.at);
        expect(lastOn, `play at ${p.at} while off`).toBeGreaterThan(lastOff);
      }
      // A chat line only ever speaks while the guide is on.
      for (const p of speaker.plays().filter((e) => e.id === "chat-reply")) {
        expect(lastBefore(ons, p.at)).toBeGreaterThan(lastBefore(offs, p.at));
      }
      expect(speaker.overlap).toBe(0);
      if (!on) expect(speaker.playing).toBeNull();
      expect(clock.pending).toBe(0);
      void notifies;
    });
  }

  it("a page change followed by a settle always speaks that page (the first time), whatever came before", async () => {
    const { clock, speaker, s } = setup();
    s.enable("home");
    const heard = new Set<string>();
    for (const id of ["home", "services", "site", "home", "saas", "services", "checkout", "site"]) {
      s.navigate(id);
      await clock.advance(SETTLE_MS + 50);
      if (!heard.has(id)) expect(speaker.playing, id).toBe(id);
      else expect(speaker.playing, id + " already heard").toBeNull();
      heard.add(id);
    }
    expect(speaker.overlap).toBe(0);
  });
});
