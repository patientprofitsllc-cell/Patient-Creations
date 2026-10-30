import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hostedSitesEnabled, hostedSlug, idTailFromSlug } from "@/lib/site/build/hosting";

// A customer's live website, hosted by us (see lib/site/build/hosting.ts). Only a version that is LIVE is ever served;
// a preview, an approved-but-not-launched version, or a wrong slug is a plain 404. The page has no scripts, and the
// policy below forbids any, so customer text can never run code on our domain.
export const dynamic = "force-dynamic";

const NOT_FOUND = () => new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!hostedSitesEnabled()) return NOT_FOUND();
  const tail = idTailFromSlug(params.slug);
  if (!tail) return NOT_FOUND();
  const project = await db.project.findFirst({ where: { id: { endsWith: tail } }, select: { id: true, name: true } });
  if (!project || hostedSlug(project) !== params.slug) return NOT_FOUND();
  const build = await db.websiteBuild.findFirst({ where: { projectId: project.id, status: "LIVE" }, orderBy: { version: "desc" }, select: { html: true } });
  if (!build) return NOT_FOUND();
  return new NextResponse(build.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https: data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
