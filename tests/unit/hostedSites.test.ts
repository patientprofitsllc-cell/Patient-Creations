import { describe, expect, it, vi, beforeEach } from "vitest";

type Row = Record<string, any>;
const S = vi.hoisted(() => ({ projects: [] as Row[], builds: [] as Row[] }));
vi.mock("@/lib/db", () => ({
  db: {
    project: { findFirst: async ({ where }: Row) => S.projects.find((p) => p.id.endsWith(where.id.endsWith)) ?? null },
    websiteBuild: {
      findFirst: async ({ where }: Row) => S.builds.filter((b) => b.projectId === where.projectId && b.status === where.status).sort((a, b) => b.version - a.version)[0] ?? null,
    },
  },
}));

import { hostedSlug, hostedUrlFor, idTailFromSlug, phoneLinkMatches } from "@/lib/site/build/hosting";
import { GET } from "@/app/sites/[slug]/route";

const P = { id: "clx9q2w8e0000abcdefghij", name: "Joe's Pizza & Subs" };
const get = (slug: string) => GET(new Request(`https://patientcreations.com/sites/${slug}`) as never, { params: { slug } });

beforeEach(() => {
  vi.unstubAllEnvs();
  S.projects = [P];
  S.builds = [
    { projectId: P.id, version: 1, status: "SUPERSEDED", html: "<p>old</p>" },
    { projectId: P.id, version: 2, status: "LIVE", html: "<p>live v2</p>" },
    { projectId: P.id, version: 3, status: "PREVIEW", html: "<p>draft</p>" },
  ];
});

describe("hosted site addresses", () => {
  it("are readable, stable and carry the project id tail", () => {
    expect(hostedSlug(P)).toBe("joes-pizza-subs-abcdefghij");
    expect(hostedUrlFor(P)).toBe("https://patientcreations.com/sites/joes-pizza-subs-abcdefghij");
    expect(idTailFromSlug(hostedSlug(P))).toBe("abcdefghij");
    expect(hostedSlug({ id: P.id, name: "!!!" })).toBe("abcdefghij");
  });
  it("reject anything that is not one of ours", () => {
    for (const s of ["", "short", "../../etc/passwd", "UPPER-CASE-ABCDEFGHIJ", "x".repeat(200)]) expect(idTailFromSlug(s)).toBeNull();
  });
});

describe("the phone link check", () => {
  it("matches only the intake number, with or without country code", () => {
    expect(phoneLinkMatches('<a href="tel:7065550142">', "(706) 555-0142")).toBe(true);
    expect(phoneLinkMatches('<a href="tel:+17065550142">', "706-555-0142")).toBe(true);
    expect(phoneLinkMatches('<a href="tel:7065550143">', "(706) 555-0142")).toBe(false);
    expect(phoneLinkMatches('<a href="tel:7065550142"><a href="tel:7065550143">', "(706) 555-0142")).toBe(false);
    expect(phoneLinkMatches("<p>no link</p>", "(706) 555-0142")).toBe(false);
    expect(phoneLinkMatches('<a href="tel:">', "")).toBe(false);
  });
});

describe("serving a hosted site", () => {
  it("is off unless HOSTED_SITES_ENABLED=true", async () => {
    expect((await get(hostedSlug(P))).status).toBe(404);
  });
  it("serves only the LIVE version, with a no-scripts policy", async () => {
    vi.stubEnv("HOSTED_SITES_ENABLED", "true");
    const res = await get(hostedSlug(P));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<p>live v2</p>");
    expect(res.headers.get("content-security-policy")).toMatch(/default-src 'none'/);
    expect(res.headers.get("content-security-policy")).not.toMatch(/script-src/);
  });
  it("404s a wrong name with a real id tail, an unknown slug, and a site that is not live", async () => {
    vi.stubEnv("HOSTED_SITES_ENABLED", "true");
    expect((await get("someone-else-abcdefghij")).status).toBe(404);
    expect((await get("nope-zzzzzzzzzz")).status).toBe(404);
    S.builds = S.builds.filter((b) => b.status !== "LIVE");
    expect((await get(hostedSlug(P))).status).toBe(404);
  });
});
