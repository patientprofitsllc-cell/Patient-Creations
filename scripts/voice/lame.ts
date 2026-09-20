import { readFileSync } from "fs";
import { join } from "path";

export interface Mp3Encoder {
  encodeBuffer(left: Int16Array): Int8Array;
  flush(): Int8Array;
}
export interface Lame {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => Mp3Encoder;
}

/**
 * The MP3 encoder package (a dev tool, never shipped to visitors). Its normal entry point is broken under Node
 * (it relies on globals), so the single bundled file is loaded on its own instead.
 */
export function loadLame(): Lame {
  const code = readFileSync(join(process.cwd(), "node_modules/lamejs/lame.all.js"), "utf8");
  const m: { exports: unknown } = { exports: {} };
  new Function("module", "exports", `${code}\n;if (typeof lamejs !== "undefined") { module.exports = lamejs; }`)(m, m.exports);
  return m.exports as Lame;
}
