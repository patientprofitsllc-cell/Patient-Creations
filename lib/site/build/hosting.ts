import { SITE_URL } from "@/lib/config/site";
import { phoneDigits } from "@/lib/site/build/config";

// Patient Creations can host a customer's approved one-page site itself, at patientcreations.com/sites/<name>-<id>.
// The site is one self-contained HTML file (no scripts, no outside requests: see renderHtml.ts), so serving it from
// our own address needs no per-customer hosting account. Off unless HOSTED_SITES_ENABLED=true. Pointing the
// customer's own domain at it later is a separate, human step.

export const hostedSitesEnabled = (env: Record<string, string | undefined> = process.env) => env.HOSTED_SITES_ENABLED === "true";

const ID_TAIL = 10;

/** "Joe's Pizza & Subs" + project id -> "joes-pizza-subs-<last 10 of id>". The id tail makes it unique and unguessable enough to be stable, not secret. */
export function hostedSlug(project: { id: string; name: string }): string {
  const words = project.name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const tail = project.id.slice(-ID_TAIL).toLowerCase();
  return words ? `${words}-${tail}` : tail;
}

/** The id tail at the end of a hosted slug, or null when the slug is not one of ours. */
export function idTailFromSlug(slug: string): string | null {
  const m = new RegExp(`(?:^|-)([a-z0-9]{${ID_TAIL}})$`).exec(slug);
  return m && /^[a-z0-9-]{1,80}$/.test(slug) ? m[1]! : null;
}

export const hostedUrlFor = (project: { id: string; name: string }) => `${SITE_URL}/sites/${hostedSlug(project)}`;

/** True when the page's call link dials exactly the number the customer gave in their intake. */
export function phoneLinkMatches(html: string, intakePhone: string | null | undefined): boolean {
  const want = intakePhone ? phoneDigits(intakePhone).replace(/^\+?1(?=\d{10}$)/, "") : "";
  if (want.replace(/\D/g, "").length < 7) return false;
  const links = [...html.matchAll(/href="tel:([^"]*)"/g)].map((m) => m[1]!.replace(/^\+?1(?=\d{10}$)/, ""));
  return links.length > 0 && links.every((l) => l === want);
}
