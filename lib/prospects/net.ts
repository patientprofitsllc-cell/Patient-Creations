import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

// Fetching a stranger's website from our server is a classic way to be tricked
// into reaching internal addresses (the cloud metadata service, localhost, a
// private network). Every connection is therefore checked at connect time, after
// DNS resolves, and only public addresses are allowed.

/** True for any address that isn't a normal public internet address. */
export function isBlockedAddress(address: string): boolean {
  const v = net.isIP(address);
  if (v === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      (a === 169 && b === 254) || // link-local, including the cloud metadata address
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224 // multicast and reserved
    );
  }
  if (v === 6) {
    const lower = address.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("::ffff:")) return isBlockedAddress(lower.slice(7)); // IPv4 inside IPv6
    return lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb") || lower.startsWith("ff");
  }
  return true; // not an IP at all: refuse
}

/** A normalized http(s) URL, or null. Adds https:// when missing. Rejects credentials and odd ports. */
export function normalizeWebUrl(input: string | null | undefined): URL | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (url.port && url.port !== "80" && url.port !== "443") return null;
    if (!url.hostname.includes(".") && !net.isIP(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

// Checks the resolved address at the moment of connecting, so a name that
// resolves to a public address at check time can't swap to a private one later.
const safeLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    const list = Array.isArray(addresses) ? addresses : [];
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      return callback(new Error("Blocked: that address is not a public website"), "", 0);
    }
    if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: typeof list) => void)(null, list);
    callback(null, list[0].address, list[0].family);
  });
};

export interface FetchedPage {
  finalUrl: string;
  status: number;
  html: string;
  bytes: number;
  truncated: boolean;
}

const MAX_BYTES = 600_000;
const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;

function once(url: URL): Promise<{ status: number; location?: string; html: string; bytes: number; truncated: boolean }> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(
      url,
      { method: "GET", lookup: safeLookup, timeout: TIMEOUT_MS, headers: { "User-Agent": "PatientCreationsSiteCheck/1.0", Accept: "text/html,application/xhtml+xml" } },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = typeof res.headers.location === "string" ? res.headers.location : undefined;
        if (status >= 300 && status < 400) {
          res.resume();
          return resolve({ status, location, html: "", bytes: 0, truncated: false });
        }
        const type = String(res.headers["content-type"] ?? "");
        if (type && !/text\/html|application\/xhtml/i.test(type)) {
          res.resume();
          return resolve({ status, html: "", bytes: 0, truncated: false });
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        let truncated = false;
        res.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > MAX_BYTES) {
            truncated = true;
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });
        const finish = () => resolve({ status, html: Buffer.concat(chunks).toString("utf8"), bytes, truncated });
        res.on("end", finish);
        res.on("close", finish);
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("Timed out")));
    req.on("error", reject);
    req.end();
  });
}

/**
 * Fetches a page's HTML with hard limits: public addresses only, 8 seconds,
 * 600 KB, HTML only, and up to 3 redirects that are each re-checked.
 */
export async function safeFetchHtml(input: string): Promise<FetchedPage> {
  let url = normalizeWebUrl(input);
  if (!url) throw new Error("That doesn't look like a website address");
  if (net.isIP(url.hostname) && isBlockedAddress(url.hostname)) throw new Error("Blocked: that address is not a public website");

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const r = await once(url);
    if (r.status >= 300 && r.status < 400 && r.location) {
      const next = normalizeWebUrl(new URL(r.location, url).toString());
      if (!next) throw new Error("It redirected somewhere we won't follow");
      if (net.isIP(next.hostname) && isBlockedAddress(next.hostname)) throw new Error("Blocked: that address is not a public website");
      url = next;
      continue;
    }
    return { finalUrl: url.toString(), status: r.status, html: r.html, bytes: r.bytes, truncated: r.truncated };
  }
  throw new Error("Too many redirects");
}
