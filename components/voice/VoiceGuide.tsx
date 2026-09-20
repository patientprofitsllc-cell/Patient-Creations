"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrowserSpeaker, browserClock } from "@/lib/voice/browserSpeaker";
import { CueScheduler, type SchedulerState } from "@/lib/voice/cueScheduler";
import { cueForRoute } from "@/lib/voice/cues";
import { getCueOverride, subscribeCueOverride } from "@/lib/voice/cueOverride";
import { buildClips, voiceIsComplete, voiceName } from "@/lib/voice/manifest";

// A small opt-in voice guide. Nothing plays until the visitor taps it (browsers require a tap before any sound, and
// it is the polite thing to do). After that it speaks one recorded line per page or product, on the schedule in
// lib/voice/cueScheduler.ts. It only exists on the site once every line has a recording.

const PREF_KEY = "pc-voice-guide";
export const VOICE_NOTIFY_EVENT = "pc-voice-notify";

function readPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}
function writePref(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* storage can be blocked; the guide still works for this visit */
  }
}

function Guide() {
  const pathname = usePathname();
  const params = useSearchParams();
  const override = useSyncExternalStore(subscribeCueOverride, getCueOverride, () => null);
  const cueId =
    override ??
    cueForRoute(pathname, params.get("product"), { adsStarted: params.get("started") === "1", careStarted: params.get("care") === "started" });

  const [state, setState] = useState<SchedulerState>("off");
  const [caption, setCaption] = useState<string | null>(null);
  const scheduler = useRef<CueScheduler | null>(null);
  const speaker = useRef<BrowserSpeaker | null>(null);
  const cueRef = useRef<string | null>(cueId);
  cueRef.current = cueId;

  const clips = useRef(buildClips());

  // Start downloading this page's line as soon as the visitor shows interest in the button (hover, focus, or the
  // first touch), so the line is ready by the time they tap and starts exactly on cue.
  const warm = useCallback(() => {
    if (!speaker.current) speaker.current = new BrowserSpeaker((id) => scheduler.current?.ended(id));
    const clip = cueRef.current ? clips.current[cueRef.current] : undefined;
    if (clip) speaker.current.prepare(clip).catch(() => {});
  }, []);

  const start = useCallback(() => {
    if (scheduler.current) return;
    if (!speaker.current) speaker.current = new BrowserSpeaker((id) => scheduler.current?.ended(id));
    const s = speaker.current;
    scheduler.current = new CueScheduler(clips.current, s, browserClock, {
      onChange: (st, clip) => {
        setState(st);
        setCaption(clip ? clip.text : null);
      },
    });
    scheduler.current.enable(cueRef.current);
    writePref(true);
  }, []);

  const stop = useCallback(() => {
    scheduler.current?.disable();
    speaker.current?.dispose();
    scheduler.current = null;
    speaker.current = null;
    setState("off");
    setCaption(null);
    writePref(false);
  }, []);

  // Every page or product change goes to the scheduler, which decides what to say and when.
  useEffect(() => {
    scheduler.current?.navigate(cueId);
  }, [cueId]);

  // A visitor who turned it on before waits for their first tap on this visit (browsers block sound until then).
  useEffect(() => {
    if (!readPref()) return;
    const go = () => start();
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [start]);

  // Other parts of the page (the project chat) can ask for their own short line.
  useEffect(() => {
    const onNotify = (e: Event) => scheduler.current?.notify(String((e as CustomEvent).detail));
    window.addEventListener(VOICE_NOTIFY_EVENT, onNotify);
    return () => window.removeEventListener(VOICE_NOTIFY_EVENT, onNotify);
  }, []);

  useEffect(() => () => speaker.current?.dispose(), []);

  const on = state !== "off";
  const name = voiceName();

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2 sm:max-w-sm">
      {on && caption && (
        <p aria-hidden className="pointer-events-auto rounded-2xl border border-gold/30 bg-obsidian/90 px-4 py-3 text-sm leading-relaxed text-ice/90 shadow-lg backdrop-blur">
          {caption}
        </p>
      )}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-pressed={on}
          onClick={on ? stop : start}
          onPointerEnter={warm}
          onFocus={warm}
          onTouchStart={warm}
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-gold/40 bg-obsidian/90 px-4 text-sm font-semibold text-gold shadow-lg backdrop-blur transition hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <span aria-hidden>{on ? "🔊" : "🔈"}</span>
          {on ? `${name} is on` : "Voice guide"}
        </button>
        {on && cueId && (
          <button
            type="button"
            onClick={() => scheduler.current?.replay()}
            className="min-h-[44px] rounded-full border border-white/15 bg-obsidian/90 px-4 text-sm text-ice/80 shadow-lg backdrop-blur transition hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Replay
          </button>
        )}
      </div>
    </div>
  );
}

export function VoiceGuide() {
  if (!voiceIsComplete()) return null;
  return (
    <Suspense fallback={null}>
      <Guide />
    </Suspense>
  );
}
