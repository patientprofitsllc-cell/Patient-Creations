// Turns the recorded lines into the files the site ships, and writes down exactly how long each one is.
//
//   voice-src/<id>.wav   the recordings, one per line in lib/voice/script.ts (kept out of git)
//   -> public/assets/voice/<id>.mp3          small mono files trimmed to the speech
//   -> public/assets/voice/manifest.json     measured length and a fingerprint of the words, per line
//   -> docs/VOICE_SCRIPT.md                  the printed script, with what is recorded and what is not
//
// Run:  npx tsx scripts/voice/build-clips.ts
//
// A line with no recording is simply skipped, and the guide stays hidden on the site until every line has one.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { VOICE_SCRIPT } from "../../lib/voice/script";
import { mp3DurationMs } from "../../lib/voice/mp3";
import { textSha } from "../../lib/voice/textSha";
import { loadLame } from "./lame";

const lamejs = loadLame();

const ROOT = process.cwd();
const SRC = join(ROOT, "voice-src");
const OUT = join(ROOT, "public/assets/voice");
const VOICE = { name: "Xavier", id: "43173c95-3ec8-446a-a162-6504332c578b", type: "preset", model: "seed_audio" };

// Speech edges: keep this much quiet before and after, so a line starts right on cue and ends cleanly.
const HEAD_PAD_MS = 30;
const TAIL_PAD_MS = 70;
const SILENCE = 350; // out of 32768

function readWav(buf: Buffer): { rate: number; mono: Int16Array } {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("not a WAV file");
  const channels = buf.readUInt16LE(22);
  const rate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);
  if (bits !== 16) throw new Error(`expected 16-bit audio, got ${bits}`);
  let p = 12;
  let start = -1;
  let len = 0;
  while (p < buf.length - 8) {
    const id = buf.toString("ascii", p, p + 4);
    const size = buf.readUInt32LE(p + 4);
    if (id === "data") {
      start = p + 8;
      len = Math.min(size, buf.length - start);
      break;
    }
    p += 8 + size + (size % 2);
  }
  if (start < 0) throw new Error("no audio data in WAV");
  const frames = Math.floor(len / (2 * channels));
  const mono = new Int16Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) sum += buf.readInt16LE(start + (i * channels + c) * 2);
    mono[i] = Math.round(sum / channels);
  }
  return { rate, mono };
}

function trim(samples: Int16Array, rate: number): Int16Array {
  let first = 0;
  let last = samples.length - 1;
  while (first < samples.length && Math.abs(samples[first]) < SILENCE) first++;
  while (last > first && Math.abs(samples[last]) < SILENCE) last--;
  const from = Math.max(0, first - Math.round((HEAD_PAD_MS / 1000) * rate));
  const to = Math.min(samples.length, last + 1 + Math.round((TAIL_PAD_MS / 1000) * rate));
  return samples.slice(from, to);
}

function encode(samples: Int16Array, rate: number): Buffer {
  const enc = new lamejs.Mp3Encoder(1, rate, 64);
  const parts: Buffer[] = [];
  const block = 1152;
  for (let i = 0; i < samples.length; i += block) {
    const out = enc.encodeBuffer(samples.subarray(i, i + block));
    if (out.length) parts.push(Buffer.from(out));
  }
  const tail = enc.flush();
  if (tail.length) parts.push(Buffer.from(tail));
  return Buffer.concat(parts);
}

mkdirSync(OUT, { recursive: true });
const clips: Record<string, { src: string; durationMs: number; textSha: string }> = {};
const rows: string[] = [];
let recorded = 0;

for (const cue of VOICE_SCRIPT) {
  const wav = join(SRC, `${cue.id}.wav`);
  let status = "not recorded yet";
  if (existsSync(wav)) {
    const { rate, mono } = readWav(readFileSync(wav));
    const mp3 = encode(trim(mono, rate), rate);
    const durationMs = mp3DurationMs(new Uint8Array(mp3));
    if (durationMs === null) throw new Error(`could not measure ${cue.id}`);
    writeFileSync(join(OUT, `${cue.id}.mp3`), mp3);
    clips[cue.id] = { src: `/assets/voice/${cue.id}.mp3`, durationMs, textSha: textSha(cue.text) };
    status = `${(durationMs / 1000).toFixed(1)} s`;
    recorded++;
  }
  rows.push(`| ${cue.id} | ${cue.when} | ${cue.text} | ${status} |`);
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ voice: VOICE, clips }, null, 2) + "\n");

const total = VOICE_SCRIPT.length;
const doc = `# Voice guide script

Every line the voice guide can speak, one per page or product, plus two chat lines. The words below are what is recorded. Lines are recorded once (never generated live), so the timing of each one is known before a visitor arrives.

Voice: **${VOICE.name}** (preset voice \`${VOICE.id}\`). Recorded: **${recorded} of ${total}** lines. The guide button stays hidden on the site until every line is recorded.

Rules for the words: no digits, dollar signs, or percent signs (prices, counts, and times change and a recording cannot; the screen always shows the real numbers), no promised results, no tool names, no dashes used as punctuation. Editing a line here without recording it again is caught by the tests.

| Line | Plays on | Words | Length |
|---|---|---|---|
${rows.join("\n")}

## How the timing works

- A page or product change waits 0.7 s before speaking, so the visitor sees the page first.
- Switching again before that restarts the wait, so a line for a page already left never plays.
- Only one line plays at a time; leaving a page cuts its line off within 0.18 s.
- A line plays once per visit, and the Replay button repeats it.
- A line that has not loaded in time is dropped rather than played late.
- A new chat reply speaks at once if the guide is quiet, or right after the current line ends.

## To record or re-record lines

1. Record the words above in the voice, one file per line, named \`voice-src/<line>.wav\`.
2. Run \`npx tsx scripts/voice/build-clips.ts\`.
3. Run the tests. They check every recording matches its words, every file's measured length matches the manifest, and every product and page has a line.
`;
writeFileSync(join(ROOT, "docs/VOICE_SCRIPT.md"), doc);
console.log(`recorded ${recorded} of ${total}`);
for (const c of VOICE_SCRIPT) if (!clips[c.id]) console.log("  missing:", c.id);
