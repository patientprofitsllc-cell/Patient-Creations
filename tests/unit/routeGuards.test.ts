import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

// Every route that can touch a customer's data must say WHO may call it, and the code must really check. This test walks the
// app, forces a decision for every new route and every private page (like the voice guide forces one for every new page),
// and confirms the file contains the check its decision promises. A route with no decision fails the build.
//
//   admin   only the owner (requireAdmin), and it answers 401 or 403, never a server error
//   session a signed-in customer, scoped to their own records by the session, never by anything the browser sends
//   token   the private, unguessable link is the credential, and an unknown or malformed one is a plain 404
//   secret  a webhook signature or a server secret (CRON_SECRET), and it looks like nothing exists without it
//   public  open to anyone on purpose, and it exposes no one's data (the reason is written down)

type Kind = "admin" | "session" | "token" | "secret" | "public";

const ROUTES: Record<string, { kind: Kind; why?: string }> = {
  "admin/ads/[id]/deliveries": { kind: "admin" },
  "admin/audits/[id]/contacted": { kind: "admin" },
  "admin/customers/[id]/notes": { kind: "admin" },
  "admin/email-test": { kind: "admin" },
  "admin/followups": { kind: "admin" },
  "admin/founder-settings": { kind: "admin" },
  "admin/ideas": { kind: "admin" },
  "admin/ideas/[id]": { kind: "admin" },
  "admin/inventory/[id]/adjust": { kind: "admin" },
  "admin/invoices": { kind: "admin" },
  "admin/invoices/[id]/paid": { kind: "admin" },
  "admin/invoices/[id]/void": { kind: "admin" },
  "admin/orders/[id]/mark-paid": { kind: "admin" },
  "admin/partners/[id]": { kind: "admin" },
  "admin/partners/[id]/pay": { kind: "admin" },
  "admin/product-costs": { kind: "admin" },
  "admin/projects/[id]/messages": { kind: "admin" },
  "admin/projects/[id]/updates": { kind: "admin" },
  "admin/projects/[id]/website": { kind: "admin" },
  "admin/projects/[id]/website/download": { kind: "admin" },
  "admin/prospects": { kind: "admin" },
  "admin/prospects/[id]": { kind: "admin" },
  "admin/prospects/[id]/audit": { kind: "admin" },
  "admin/reminders": { kind: "admin" },
  "admin/spend": { kind: "admin" },
  "admin/spend/[id]": { kind: "admin" },

  "portal/assistant": { kind: "session" },
  "portal/reviews": { kind: "session" },
  "portal/revisions": { kind: "session" },

  "ads/[token]/brief": { kind: "token" },
  "ads/[token]/portal": { kind: "token" },
  "care/checkout": { kind: "token", why: "the project's status token arrives in the body, and guardCare looks the project up by it" },
  "care/portal": { kind: "token", why: "the project's status token arrives in the body, and guardCare looks the project up by it" },
  "intake/[token]": { kind: "token" },
  "intake/[token]/complete": { kind: "token" },
  "intake/[token]/start": { kind: "token" },
  "preview/[token]/approve": { kind: "token" },
  "preview/[token]/revise": { kind: "token" },
  "status/[token]/messages": { kind: "token" },
  "invoice/pay": { kind: "token", why: "the invoice's private token arrives in the body, and the amount comes from the saved invoice" },
  "audit/pay": { kind: "token", why: "the audit's private token arrives in the body, and the price comes from the saved audit" },
  "partners/lead": { kind: "token", why: "the partner's private dashboard token arrives in the body" },

  "cron/followups": { kind: "secret" },
  "cron/founder-brief": { kind: "secret" },
  "webhooks/stripe": { kind: "secret" },

  "auth/[...nextauth]": { kind: "public", why: "the sign-in handler itself" },
  "cart-offer": { kind: "public", why: "issues the same signed offer to any visitor and returns nothing about anyone" },
  "checkout": { kind: "public", why: "a purchase: it creates or uses the buyer's own account and prices everything on the server" },
  "checkout/nfc-intake": { kind: "public", why: "saves card details against an order the buyer just placed; it needs the order's own id" },
  "ads/checkout": { kind: "public", why: "a purchase: it prices on the server and starts a plan for the buyer's own account" },
  "audit": { kind: "public", why: "the public growth audit request: rate limited, honeypot, consent; returns a teaser and a private link, never a report" },
  "audit/agent": { kind: "public", why: "answers questions about the audit from fixed facts and knows nothing about any customer" },
  "partners/apply": { kind: "public", why: "a public application that answers the same whether or not the email is known" },
  "referrals/click": { kind: "public", why: "counts a visit and redirects; reads no private data" },
  "track": { kind: "public", why: "accepts only a fixed list of event names and stores no personal data" },
  "unsubscribe": { kind: "public", why: "signed link: it only acts for the address inside a valid signature" },
};

const MARKERS: Record<Kind, RegExp> = {
  admin: /requireAdmin\(/,
  session: /requireSession\(|getServerSession\(/,
  token: /params\.token|guard(Preview|Care|Ads|Intake)\(|\btoken\b/,
  secret: /CRON_SECRET|verifyWebhookSignature/,
  public: /[\s\S]*/,
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const root = process.cwd();
const routeFiles = walk(join(root, "app/api")).filter((f) => /route\.ts$/.test(f));
const rel = (f: string) => f.slice(join(root, "app/api").length + 1).replace(/\\/g, "/").replace(/\/route\.ts$/, "");
const onDisk = routeFiles.map(rel).sort();
const read = (f: string) => readFileSync(join(root, f), "utf8");

describe("every API route says who may call it", () => {
  it("has a decision for every route that exists, and no decision for one that does not", () => {
    const decided = Object.keys(ROUTES).sort();
    expect(onDisk.filter((r) => !decided.includes(r)), "routes with no decision: add them to ROUTES with a kind").toEqual([]);
    expect(decided.filter((r) => !onDisk.includes(r)), "decisions for routes that no longer exist").toEqual([]);
  });

  it("gives every public route a written reason", () => {
    for (const [route, p] of Object.entries(ROUTES)) if (p.kind === "public") expect(p.why?.length ?? 0, route).toBeGreaterThan(20);
  });

  it("really contains the check its decision promises", () => {
    for (const f of routeFiles) {
      const r = rel(f);
      const kind = ROUTES[r]?.kind;
      if (!kind) continue;
      const src = readFileSync(f, "utf8");
      expect(MARKERS[kind].test(src), `${r} is declared "${kind}" but does not contain its check`).toBe(true);
    }
  });

  it("answers a visitor with 401 or 403 on every owner route, not a server error", () => {
    for (const f of routeFiles) {
      const r = rel(f);
      if (ROUTES[r]?.kind !== "admin") continue;
      const src = readFileSync(f, "utf8");
      expect(/UnauthorizedError/.test(src) && /ForbiddenError/.test(src), `${r} calls requireAdmin but does not turn a failed check into a 401 or 403`).toBe(true);
    }
  });

  it("answers a signed-out visitor with 401 on every signed-in customer route, not a server error", () => {
    for (const f of routeFiles) {
      const r = rel(f);
      if (ROUTES[r]?.kind !== "session") continue;
      const src = readFileSync(f, "utf8");
      const handled = /status: 401/.test(src) || /catch/.test(src);
      expect(handled, `${r} needs to answer 401 when nobody is signed in`).toBe(true);
    }
  });

  it("never lets a signed-in route take the customer or account from the request", () => {
    for (const f of routeFiles) {
      const r = rel(f);
      if (ROUTES[r]?.kind !== "session") continue;
      const src = readFileSync(f, "utf8");
      expect(/customerId|userId/.test(src) ? /[sS]ession/.test(src) : true, `${r} mentions a customer or user id, so it must derive it from the session`).toBe(true);
    }
  });
});

describe("the pages that show one customer's data", () => {
  const TOKEN_PAGES = ["app/status/[token]/page.tsx", "app/preview/[token]/page.tsx", "app/intake/[token]/page.tsx", "app/invoice/[token]/page.tsx", "app/audit/report/[token]/page.tsx", "app/partners/dashboard/[token]/page.tsx", "app/monthly-ads/manage/[token]/page.tsx"];

  it("show a plain 404 for an unknown or malformed link, and stay out of search results", () => {
    for (const p of TOKEN_PAGES) {
      const src = read(p);
      expect(/notFound\(\)/.test(src), `${p} must call notFound() for a bad link`).toBe(true);
      expect(/robots:\s*\{\s*index:\s*false/.test(src), `${p} must be noindex`).toBe(true);
    }
  });

  it("send a visitor who is not signed in away from the portal, and from the admin, before anything renders", () => {
    expect(read("app/portal/layout.tsx")).toMatch(/if \(!session\?\.user\) redirect\("\/auth\/login"\)/);
    const admin = read("app/admin/layout.tsx");
    expect(admin).toMatch(/role\s*!==\s*"ADMIN"/);
    expect(admin).toMatch(/redirect\("\/auth\/login"\)/);
  });

  it("keep one customer's project, invoices, and referrals from another's", () => {
    expect(read("app/portal/projects/[id]/page.tsx")).toMatch(/userId !== session\?\.user\.id\) redirect/);
    const invoices = read("app/portal/invoices/page.tsx");
    expect(invoices).toMatch(/customerId: customer\.id/);
    expect(invoices).toMatch(/session\?\.user\?\.id/);
    expect(read("app/portal/referrals/page.tsx")).toMatch(/where: \{ userId: session!\.user\.id/);
    expect(read("app/portal/dashboard/page.tsx")).toMatch(/where: \{ userId: session!\.user\.id/);
  });

  it("show an order confirmation only to someone holding the order's private key", () => {
    expect(read("app/checkout/success/page.tsx")).toMatch(/orderAccessOk\(found\.accessToken, searchParams\.k\)/);
    expect(read("app/api/checkout/nfc-intake/route.ts")).toMatch(/orderAccessOk\(order\.accessToken, k\)/);
  });

  it("keep private pages out of the sitemap and robots allow-list", () => {
    const robots = read("app/robots.ts");
    for (const p of ["/admin", "/portal", "/api", "/status", "/intake", "/preview", "/monthly-ads/manage", "/audit/report", "/invoice", "/partners/dashboard"]) expect(robots, p).toContain(`"${p}"`);
    const sitemap = read("app/sitemap.ts");
    for (const p of ["/admin", "/portal", "/status/", "/preview/", "/intake/", "/invoice/", "/partners/dashboard", "/audit/report"]) expect(sitemap, p).not.toContain(p);
  });
});
