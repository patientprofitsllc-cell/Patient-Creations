// The timing brain of the voice guide. It decides, to the millisecond, when a line starts, when it is cut off, and
// when it is skipped. It has no browser code in it: the clock and the speaker are handed in, so the exact same
// logic runs in the page and in the tests, on a fake clock, where every rule below is proven.
//
// The rules (each one is a test in tests/unit/cueScheduler.test.ts):
//   1. A page or product change waits SETTLE_MS before speaking, so the visitor sees the page first.
//   2. If they switch again before that, the wait restarts. A line for a page they already left never plays.
//   3. Only one line is ever active. A new line is never started until the old one has been stopped.
//   4. Leaving a page cuts its line off within FADE_MS, so the guide never talks about a page that is gone.
//   5. Coming back to the same page or product while its line plays leaves it alone (no restart, no stutter).
//   6. A line is spoken once per visit. Replay is always available.
//   7. A line that is not loaded by the time it should start, plus READY_GRACE_MS, is dropped: silence is
//      better than a late line about the wrong page.
//   8. A chat notification speaks at once if the guide is quiet. If a page line is playing it waits for the
//      end of it (and only the newest waits). Any page change discards it.
//   9. Turning the guide off stops everything and clears every timer.

export const SETTLE_MS = 700;
export const FADE_MS = 180;
export const READY_GRACE_MS = 1200;
/** A line that has not reported "ended" this long after its known length is forced to stop. */
export const OVERRUN_GUARD_MS = 400;

export interface Clip {
  id: string;
  src: string;
  /** Measured length of the shipped file. */
  durationMs: number;
  text: string;
}

export interface Speaker {
  /** Start loading. Resolves when the clip can play right away, rejects if it cannot be loaded. */
  prepare(clip: Clip): Promise<void>;
  play(clip: Clip): void;
  /** Stop the current line, fading out over fadeMs. */
  stop(fadeMs: number): void;
}

export interface Clock {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  now(): number;
}

export type SchedulerState = "off" | "idle" | "waiting" | "playing";

export interface SchedulerHooks {
  /** Called whenever a line starts or ends, so the caption can follow. */
  onChange?: (state: SchedulerState, clip: Clip | null) => void;
}

export class CueScheduler {
  private enabledFlag = false;
  private target: string | null = null; // the cue for the page the visitor is on
  private waiting: { id: string; startTimer: unknown; readyBy: number } | null = null;
  private active: { clip: Clip; guard: unknown } | null = null;
  private heard = new Set<string>();
  private queuedChat: string | null = null;
  private generation = 0; // bumps on every change, so a late "ready" answer from an old page is ignored

  constructor(
    private readonly clips: Record<string, Clip>,
    private readonly speaker: Speaker,
    private readonly clock: Clock,
    private readonly hooks: SchedulerHooks = {},
  ) {}

  get state(): SchedulerState {
    if (!this.enabledFlag) return "off";
    if (this.active) return "playing";
    if (this.waiting) return "waiting";
    return "idle";
  }

  get playing(): Clip | null {
    return this.active?.clip ?? null;
  }

  /** The visitor turned the guide on (a tap, which is also what lets the browser play sound). */
  enable(currentCue: string | null): void {
    this.enabledFlag = true;
    this.navigate(currentCue);
  }

  /** Turns everything off: stops the line, clears every timer, forgets what was heard. */
  disable(): void {
    this.generation++;
    this.enabledFlag = false;
    this.cancelWaiting();
    this.stopActive(FADE_MS);
    this.queuedChat = null;
    this.heard.clear();
    this.target = null;
    this.emit();
  }

  /** The page or product changed. Pass null on a page with no line. */
  navigate(cueId: string | null): void {
    this.generation++;
    this.queuedChat = null; // a chat line is about the page they just left
    const same = cueId !== null && this.active?.clip.id === cueId;
    this.target = cueId;
    if (!this.enabledFlag) return;
    if (same) {
      // Rule 5: already speaking this exact line, so leave it and drop any stray timer.
      this.cancelWaiting();
      return;
    }
    this.cancelWaiting();
    if (this.active) this.stopActive(FADE_MS); // rule 4
    if (cueId === null || !this.clips[cueId] || this.heard.has(cueId)) {
      this.emit();
      return;
    }
    this.scheduleStart(cueId, SETTLE_MS);
  }

  /** Speak this line again for the current page, even if it was heard already. */
  replay(): void {
    if (!this.enabledFlag || !this.target || !this.clips[this.target]) return;
    this.generation++;
    this.cancelWaiting();
    if (this.active) this.stopActive(FADE_MS);
    this.heard.delete(this.target);
    this.scheduleStart(this.target, 0);
  }

  /** Something happened on the page that has its own short line, such as a new chat reply. */
  notify(cueId: string): void {
    if (!this.enabledFlag || !this.clips[cueId]) return;
    if (this.active || this.waiting) {
      this.queuedChat = cueId; // rule 8: only the newest waits
      return;
    }
    this.scheduleStart(cueId, 0);
  }

  /** The speaker reports that the line finished on its own. */
  ended(cueId: string): void {
    if (this.active?.clip.id !== cueId) return;
    this.finishActive();
  }

  // ---- internals ----

  private scheduleStart(cueId: string, settleMs: number): void {
    const clip = this.clips[cueId];
    const generation = this.generation;
    const readyBy = this.clock.now() + settleMs + READY_GRACE_MS;
    let ready = false;
    let failed = false;
    this.speaker.prepare(clip).then(
      () => {
        ready = true;
      },
      () => {
        failed = true;
      },
    );
    const startTimer = this.clock.setTimeout(() => this.tryStart(cueId, generation, () => ready, () => failed, readyBy), settleMs);
    this.waiting = { id: cueId, startTimer, readyBy };
    this.emit();
  }

  private tryStart(cueId: string, generation: number, isReady: () => boolean, hasFailed: () => boolean, readyBy: number): void {
    if (generation !== this.generation || !this.enabledFlag) return; // rule 2
    if (hasFailed()) {
      this.waiting = null;
      this.emit();
      return;
    }
    if (!isReady()) {
      const left = readyBy - this.clock.now();
      if (left <= 0) {
        this.waiting = null; // rule 7
        this.emit();
        return;
      }
      const startTimer = this.clock.setTimeout(() => this.tryStart(cueId, generation, isReady, hasFailed, readyBy), Math.min(50, left));
      this.waiting = { id: cueId, startTimer, readyBy };
      return;
    }
    this.waiting = null;
    if (this.active) this.stopActive(FADE_MS); // rule 3: never two at once
    const clip = this.clips[cueId];
    this.heard.add(cueId); // rule 6
    this.speaker.play(clip);
    // If the speaker never says the line ended, stop it ourselves at its known length plus a small guard.
    const guard = this.clock.setTimeout(() => {
      this.speaker.stop(FADE_MS);
      this.finishActive();
    }, clip.durationMs + OVERRUN_GUARD_MS);
    this.active = { clip, guard };
    this.emit();
  }

  private finishActive(): void {
    if (!this.active) return;
    this.clock.clearTimeout(this.active.guard);
    this.active = null;
    const next = this.queuedChat;
    this.queuedChat = null;
    this.emit();
    if (next && this.enabledFlag) this.scheduleStart(next, 0);
  }

  private stopActive(fadeMs: number): void {
    if (!this.active) return;
    this.clock.clearTimeout(this.active.guard);
    this.active = null;
    this.speaker.stop(fadeMs);
    this.emit();
  }

  private cancelWaiting(): void {
    if (!this.waiting) return;
    this.clock.clearTimeout(this.waiting.startTimer);
    this.waiting = null;
  }

  private emit(): void {
    this.hooks.onChange?.(this.state, this.active?.clip ?? null);
  }
}
