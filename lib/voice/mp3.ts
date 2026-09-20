// Measures the real length of an MP3 by walking its frames, so a clip's duration in the manifest is a fact about
// the file that ships, not an estimate. Pure (no Node or browser APIs): used by the build script and the tests.

const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_V2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const RATES_V1 = [44100, 48000, 32000];
const RATES_V2 = [22050, 24000, 16000];
const RATES_V25 = [11025, 12000, 8000];

/** Length in milliseconds of an MPEG audio layer 3 file, or null if it does not look like one. */
export function mp3DurationMs(bytes: Uint8Array): number | null {
  let pos = 0;
  // Skip an ID3v2 tag at the start.
  if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    pos = 10 + size;
  }
  let samples = 0;
  let sampleRate = 0;
  let frames = 0;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff || (bytes[pos + 1] & 0xe0) !== 0xe0) {
      pos++;
      continue;
    }
    const versionBits = (bytes[pos + 1] >> 3) & 0x3; // 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5
    const layerBits = (bytes[pos + 1] >> 1) & 0x3; // 1 = layer 3
    const bitrateIdx = (bytes[pos + 2] >> 4) & 0xf;
    const rateIdx = (bytes[pos + 2] >> 2) & 0x3;
    const padding = (bytes[pos + 2] >> 1) & 0x1;
    if (versionBits === 1 || layerBits !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || rateIdx === 3) {
      pos++;
      continue;
    }
    const v1 = versionBits === 3;
    const rate = (v1 ? RATES_V1 : versionBits === 2 ? RATES_V2 : RATES_V25)[rateIdx];
    const kbps = (v1 ? BITRATES_V1_L3 : BITRATES_V2_L3)[bitrateIdx];
    const frameLen = Math.floor(((v1 ? 144000 : 72000) * kbps) / rate) + padding;
    if (frameLen < 4) {
      pos++;
      continue;
    }
    samples += v1 ? 1152 : 576;
    sampleRate = rate;
    frames++;
    pos += frameLen;
  }
  if (frames === 0 || sampleRate === 0) return null;
  return Math.round((samples / sampleRate) * 1000);
}
