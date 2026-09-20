import type { Clip, Clock, Speaker } from "@/lib/voice/cueScheduler";

// The real speaker and clock for a browser. Kept apart from the scheduler so all the timing rules can be
// tested without a browser. A clip is loaded ahead of its start and cached, so a start is instant.

export const browserClock: Clock = {
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (h) => window.clearTimeout(h as number),
  now: () => performance.now(),
};

export class BrowserSpeaker implements Speaker {
  private cache = new Map<string, HTMLAudioElement>();
  private current: HTMLAudioElement | null = null;
  private fade: number | null = null;

  constructor(private readonly onEnded: (id: string) => void) {}

  prepare(clip: Clip): Promise<void> {
    const audio = this.get(clip);
    if (audio.readyState >= 3) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const ok = () => {
        cleanup();
        resolve();
      };
      const bad = () => {
        cleanup();
        reject(new Error(`could not load ${clip.id}`));
      };
      const cleanup = () => {
        audio.removeEventListener("canplay", ok);
        audio.removeEventListener("error", bad);
      };
      audio.addEventListener("canplay", ok);
      audio.addEventListener("error", bad);
      audio.load();
    });
  }

  play(clip: Clip): void {
    this.stopNow();
    const audio = this.get(clip);
    audio.currentTime = 0;
    audio.volume = 1;
    this.current = audio;
    void audio.play().catch(() => {
      // The browser refused to play (no tap yet, or sound blocked): stay silent rather than error.
      this.onEnded(clip.id);
    });
  }

  stop(fadeMs: number): void {
    const audio = this.current;
    if (!audio) return;
    this.current = null;
    if (this.fade !== null) window.clearInterval(this.fade);
    const steps = Math.max(1, Math.round(fadeMs / 20));
    const start = audio.volume;
    let i = 0;
    this.fade = window.setInterval(() => {
      i++;
      audio.volume = Math.max(0, start * (1 - i / steps));
      if (i >= steps) {
        if (this.fade !== null) window.clearInterval(this.fade);
        this.fade = null;
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      }
    }, 20);
  }

  /** Release everything, for when the guide is turned off or the page is left. */
  dispose(): void {
    this.stopNow();
    this.cache.forEach((a) => {
      a.removeAttribute("src");
      a.load();
    });
    this.cache.clear();
  }

  private stopNow(): void {
    if (this.fade !== null) {
      window.clearInterval(this.fade);
      this.fade = null;
    }
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current.volume = 1;
      this.current = null;
    }
  }

  private get(clip: Clip): HTMLAudioElement {
    let audio = this.cache.get(clip.id);
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audio.src = clip.src;
      audio.addEventListener("ended", () => this.onEnded(clip.id));
      this.cache.set(clip.id, audio);
    }
    return audio;
  }
}
