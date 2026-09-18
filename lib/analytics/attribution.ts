// Client-side only. Remembers who a visitor is (a random id, no personal data)
// and where they first came from, so a purchase days later can still be
// credited to the ad, partner, or referral that brought them.
export interface Attribution {
  visitorId: string;
  ref?: string;
  source?: string;
  medium?: string;
  campaign?: string;
}

const KEY = "pc_attr";

function randomId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function readAttribution(): Attribution {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    /* storage unavailable: fall through to a fresh, unsaved id */
  }
  return { visitorId: randomId() };
}

/** Reads ?ref= and ?utm_* from the URL, keeping the first source seen. */
export function captureAttribution(): Attribution {
  const current = readAttribution();
  const params = new URLSearchParams(window.location.search);
  const next: Attribution = { ...current };

  const ref = params.get("ref");
  if (ref && /^[A-Za-z0-9_-]{3,40}$/.test(ref)) next.ref = ref;
  next.source ??= params.get("utm_source") ?? undefined;
  next.medium ??= params.get("utm_medium") ?? undefined;
  next.campaign ??= params.get("utm_campaign") ?? undefined;

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** "google", "google:spring-sale", or "referral" when there's only a ref code. */
export function sourceLabel(a: Attribution): string | undefined {
  if (a.source) return a.campaign ? `${a.source}:${a.campaign}` : a.source;
  return a.ref ? "referral" : undefined;
}
