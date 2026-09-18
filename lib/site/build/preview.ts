import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NFC_BUNDLE_SLUG } from "@/lib/payments/nfcAddon";
import { rateLimit } from "@/lib/security/rateLimit";
import { OFFER_SLUG } from "@/lib/site/offer";
import { latestBuild } from "@/lib/site/build/store";

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,40}$/;

/** Everything the preview page and its endpoints need, found by the private preview token alone. */
export async function loadPreview(token: string) {
  if (!TOKEN_SHAPE.test(token)) return null;
  const project = await db.project.findFirst({
    where: { previewToken: token },
    include: {
      customer: { include: { user: true } },
      order: { include: { websiteIntake: true, items: { include: { product: true } } } },
    },
  });
  if (!project) return null;
  const build = await latestBuild(project.id);
  if (!build) return null;

  const revisions = await db.revision.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } });
  const websiteProduct = project.order.items.find((i) => i.product.slug === OFFER_SLUG || i.product.slug === NFC_BUNDLE_SLUG)?.product;
  return {
    project,
    build,
    revisionsUsed: revisions.length,
    revisionLimit: websiteProduct?.revisionLimit ?? 1,
    openRevision: revisions.find((r) => r.status === "REQUESTED") ?? null,
  };
}

export type Preview = NonNullable<Awaited<ReturnType<typeof loadPreview>>>;

export const NO_STORE = { "Cache-Control": "no-store" };

/** Rate limit plus token lookup. An unknown or malformed token gets the same 404 as anything else. */
export async function guardPreview(req: NextRequest, token: string, perTokenPerMinute: number, scope: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`preview-ip:${ip}`, 60, 60_000).allowed || !rateLimit(`preview:${scope}:${token.slice(0, 40)}`, perTokenPerMinute, 60_000).allowed) {
    return { response: NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE }) };
  }
  const preview = await loadPreview(token);
  if (!preview) return { response: NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE }) };
  return { preview };
}
