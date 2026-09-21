import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { CUE_IDS, VOICE_SCRIPT, cueById } from "@/lib/voice/script";
import { cueForRoute, thanksCueFor } from "@/lib/voice/cues";
import { mp3DurationMs } from "@/lib/voice/mp3";
import { buildClips, manifest, voiceIsComplete, type VoiceManifest } from "@/lib/voice/manifest";
import { textSha } from "@/lib/voice/textSha";
import { loadLame } from "../../scripts/voice/lame";

const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), "utf8");
const words = (t: string) => t.trim().split(/\s+/).length;

describe("voice script (the prompt list)", () => {
  it("has a unique id per line, and every line is a page, a product, or a chat line", () => {
    expect(new Set(CUE_IDS).size).toBe(CUE_IDS.length);
    for (const c of VOICE_SCRIPT) {
      expect(["page", "product", "thanks", "chat"]).toContain(c.kind);
      expect(c.when.length, c.id).toBeGreaterThan(3);
    }
    expect(cueById("home")?.kind).toBe("page");
    expect(cueById("chat-reply")?.kind).toBe("chat");
  });

  it("says nothing a recording could get wrong later: no digits, prices, or percentages, and no dashes", () => {
    for (const c of VOICE_SCRIPT) {
      expect(c.text, c.id).not.toMatch(/[0-9$%]/);
      expect(c.text, c.id).not.toMatch(/[—–]/);
    }
  });

  it("promises no results, names no tool vendors, and stays short enough to finish before a visitor moves on", () => {
    for (const c of VOICE_SCRIPT) {
      expect(c.text, c.id).not.toMatch(/guarantee|proven|results|roi\b|double your|triple your|more sales|more customers/i);
      expect(c.text, c.id).not.toMatch(/runway|zeely|draftly|ulio|grok|zapier|viktor|daugh|avatarhype|gohighlevel|lovable|emergent|motionsites|sitedrop|freebeats|replysmart|higgsfield|elevenlabs/i);
      expect(words(c.text), c.id).toBeLessThanOrEqual(30);
      expect(c.text.trim().endsWith("."), c.id).toBe(true);
    }
  });

  it("has a line for every product that can be sold, so a new product cannot be added without one", () => {
    const seed = read("prisma/seed.ts");
    const services = /const SERVICES: ServiceDef\[\] = \[([\s\S]*?)\n\];/.exec(seed)?.[1] ?? "";
    const slugs = [...services.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(15);
    for (const slug of slugs) {
      const cue = cueForRoute("/checkout", slug);
      expect(cue, `${slug} needs its own voice line`).not.toBe("checkout");
      expect(cue, slug).not.toBeNull();
    }
    for (const plan of ["ads-monthly-300", "ads-monthly-500", "ads-monthly-1000"]) expect(cueForRoute("/monthly-ads/start"), plan).toBe("ads-plan");
  });
});

describe("thank you for purchasing", () => {
  const seedSlugs = () => {
    const seed = read("prisma/seed.ts");
    const services = /const SERVICES: ServiceDef\[\] = \[([\s\S]*?)\n\];/.exec(seed)?.[1] ?? "";
    return [...services.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
  };

  it("has its own spoken thank you for every product that can be bought, so none falls back to the general one", () => {
    const slugs = seedSlugs();
    expect(slugs.length).toBeGreaterThan(15);
    for (const slug of slugs) {
      const cue = thanksCueFor(slug);
      expect(cue, `${slug} needs its own thank you`).not.toBe("success");
      expect(cue).toMatch(/^thanks-/);
      expect(cueById(cue), cue).toBeTruthy();
    }
    for (const slug of ["nfc-cards", "nfc-wifi", "nfc-google-review", "nfc-tiktok"]) expect(thanksCueFor(slug)).toBe("thanks-nfc-cards");
    expect(thanksCueFor("something-new")).toBe("success");
    expect(thanksCueFor(undefined)).toBe("success");
  });

  it("covers the two subscriptions: a paid Monthly Ads plan and a paid Website Care Plan", () => {
    expect(cueForRoute("/monthly-ads/manage/abc", null, { adsStarted: true })).toBe("thanks-ads-plan");
    expect(cueForRoute("/monthly-ads/manage/abc")).toBeNull();
    expect(cueForRoute("/status/abc", null, { careStarted: true })).toBe("thanks-care-plan");
    expect(cueForRoute("/status/abc")).toBe("chat-welcome");
  });

  it("says thank you, and then names the customer's real next step on that page", () => {
    const thanks = VOICE_SCRIPT.filter((c) => c.kind === "thanks");
    expect(thanks.length).toBeGreaterThanOrEqual(17);
    for (const c of thanks) {
      expect(c.text, c.id).toMatch(/^Thank you/);
      expect(c.text, c.id).toMatch(/kickoff call|intake|card details|Pick a time|brief|update requests/);
      expect(c.text, c.id).not.toMatch(/within|hours|days|weeks|refund|free|discount/i);
    }
  });

  it("is read out by the confirmation page for the product that was bought, and by no other page", () => {
    const page = read("app/checkout/success/page.tsx");
    expect(page).toMatch(/<VoiceCue id=\{thanksCueFor\(order\.items\[0\]\?\.product\.slug\)\} \/>/);
    expect(read("components/voice/VoiceGuide.tsx")).toContain("override ??");
  });
});

describe("which line plays where", () => {
  it("maps each public page to its line, and a product switch to that product's line", () => {
    expect(cueForRoute("/")).toBe("home");
    expect(cueForRoute("/services")).toBe("services");
    expect(cueForRoute("/pricing")).toBe("pricing");
    expect(cueForRoute("/audit")).toBe("audit");
    expect(cueForRoute("/monthly-ads")).toBe("monthly-ads");
    expect(cueForRoute("/monthly-ads/start")).toBe("ads-plan");
    expect(cueForRoute("/gallery")).toBe("showcase");
    expect(cueForRoute("/examples/barbers")).toBe("showcase");
    expect(cueForRoute("/agents")).toBe("agents");
    expect(cueForRoute("/checkout", "site")).toBe("site");
    expect(cueForRoute("/checkout", "saas")).toBe("saas");
    expect(cueForRoute("/checkout", "starter-website")).toBe("starter-website");
    expect(cueForRoute("/checkout", "nfc-google-review")).toBe("nfc-cards");
    expect(cueForRoute("/checkout", "nfc-wifi")).toBe("nfc-cards");
    expect(cueForRoute("/checkout")).toBe("checkout");
    expect(cueForRoute("/checkout", "something-new")).toBe("checkout");
    expect(cueForRoute("/checkout/success")).toBe("success");
    expect(cueForRoute("/checkout/upsell")).toBe("upsell");
    expect(cueForRoute("/guided-app-tour")).toBe("guided-tour");
    expect(cueForRoute("/status/abc123")).toBe("chat-welcome");
    expect(cueForRoute("/services/")).toBe("services");
  });

  it("stays silent on staff pages, private work pages, sign in, and legal text", () => {
    for (const p of ["/admin/dashboard", "/portal/dashboard", "/auth/login", "/preview/abc", "/intake/abc", "/terms", "/privacy", "/refunds", "/acceptable-use", "/copyright", "/monthly-ads/manage/abc", "/api/track"]) {
      expect(cueForRoute(p), p).toBeNull();
    }
  });

  it("forces a decision for any new page: it gets a line, or it is on the short list of pages that stay quiet on purpose", () => {
    const quiet = new Set<string>();
    const routes: string[] = [];
    const walk = (dir: string, prefix: string) => {
      for (const name of readdirSync(join(root, dir))) {
        const p = join(root, dir, name);
        if (statSync(p).isDirectory()) {
          if (name.startsWith("[") || name.startsWith("(") || name === "api") continue;
          walk(join(dir, name), `${prefix}/${name}`);
        } else if (name === "page.tsx") routes.push(prefix || "/");
      }
    };
    walk("app", "");
    for (const r of routes) {
      if (quiet.has(r)) continue;
      const silent = cueForRoute(r) === null;
      const known = ["/admin", "/portal", "/auth", "/preview", "/intake", "/terms", "/privacy", "/refunds", "/acceptable-use", "/copyright", "/monthly-ads/manage"].some((p) => r === p || r.startsWith(p + "/"));
      expect(!silent || known, `${r} has no voice line and is not marked quiet`).toBe(true);
    }
  });
});

describe("recordings", () => {
  it("only appear on the site once every line is recorded", () => {
    expect(voiceIsComplete({ voice: null, clips: {} })).toBe(false);
    const all: VoiceManifest = { voice: { name: "X", id: "y" }, clips: Object.fromEntries(CUE_IDS.map((id) => [id, { src: `/a/${id}.mp3`, durationMs: 3000, textSha: "x" }])) };
    expect(voiceIsComplete(all)).toBe(true);
    delete all.clips["home"];
    expect(voiceIsComplete(all)).toBe(false);
  });

  it("match their words and their length: every file exists, was made from the words now in the script, and is exactly as long as the manifest says", () => {
    for (const [id, clip] of Object.entries(manifest.clips)) {
      const cue = cueById(id);
      expect(cue, `manifest has a clip for unknown line ${id}`).toBeTruthy();
      expect(clip.textSha, `${id}: the words changed after it was recorded; record it again`).toBe(textSha(cue!.text));
      const file = join(root, "public", clip.src);
      expect(existsSync(file), `${id} file`).toBe(true);
      const measured = mp3DurationMs(new Uint8Array(readFileSync(file)));
      expect(measured, id).toBe(clip.durationMs);
      expect(clip.durationMs, id).toBeGreaterThan(1200);
      expect(clip.durationMs, id).toBeLessThan(15000);
      expect(statSync(file).size, id).toBeLessThan(200_000);
    }
    const clips = buildClips();
    for (const id of Object.keys(manifest.clips)) expect(clips[id].text).toBe(cueById(id)!.text);
  });
});

describe("MP3 length reader", () => {
  it("reads the real length of an encoded file to within one frame", () => {
    const { Mp3Encoder } = loadLame();
    for (const [rate, seconds] of [[24000, 1], [24000, 3.5], [22050, 2]] as const) {
      const enc = new Mp3Encoder(1, rate, 64);
      const samples = new Int16Array(Math.round(rate * seconds));
      for (let i = 0; i < samples.length; i++) samples[i] = Math.round(8000 * Math.sin((2 * Math.PI * 220 * i) / rate));
      const parts: number[] = [];
      for (let i = 0; i < samples.length; i += 1152) parts.push(...enc.encodeBuffer(samples.subarray(i, i + 1152)));
      parts.push(...enc.flush());
      const ms = mp3DurationMs(new Uint8Array(parts.map((b) => b & 0xff)));
      expect(ms).not.toBeNull();
      expect(Math.abs(ms! - seconds * 1000)).toBeLessThan(80);
    }
  });

  it("returns null for something that is not an MP3", () => {
    expect(mp3DurationMs(new Uint8Array([1, 2, 3, 4, 5]))).toBeNull();
    expect(mp3DurationMs(new Uint8Array([]))).toBeNull();
  });
});

describe("chat hook", () => {
  it("the project chat and the guide use the same event name, and the guide is in the layout", () => {
    expect(read("components/status/ProjectMessages.tsx")).toContain(`"pc-voice-notify"`);
    expect(read("components/voice/VoiceGuide.tsx")).toContain(`"pc-voice-notify"`);
    expect(read("app/layout.tsx")).toContain("<VoiceGuide />");
    expect(read("components/status/ProjectMessages.tsx")).toMatch(/sender !== "CUSTOMER"/);
  });
});
