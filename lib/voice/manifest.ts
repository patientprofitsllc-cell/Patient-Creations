import manifestJson from "@/public/assets/voice/manifest.json";
import { VOICE_SCRIPT } from "@/lib/voice/script";
import type { Clip } from "@/lib/voice/cueScheduler";

export interface ManifestClip {
  src: string;
  /** Measured from the shipped file by scripts/voice/build-clips.ts. */
  durationMs: number;
  /** Fingerprint of the exact words this recording was made from. */
  textSha: string;
}

export interface VoiceManifest {
  voice: { name: string; id: string } | null;
  clips: Record<string, ManifestClip>;
}

export const manifest = manifestJson as unknown as VoiceManifest;

/** The recordings joined to their words, ready for the scheduler. */
export function buildClips(m: VoiceManifest = manifest): Record<string, Clip> {
  const out: Record<string, Clip> = {};
  for (const cue of VOICE_SCRIPT) {
    const c = m.clips[cue.id];
    if (c) out[cue.id] = { id: cue.id, src: c.src, durationMs: c.durationMs, text: cue.text };
  }
  return out;
}

/** The guide only appears once every line is recorded, so it is never half-finished on the live site. */
export function voiceIsComplete(m: VoiceManifest = manifest): boolean {
  return VOICE_SCRIPT.every((c) => Boolean(m.clips[c.id]));
}

export const voiceName = (m: VoiceManifest = manifest): string => m.voice?.name ?? "Voice guide";
