import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { syncCatalog } from "../../../../prisma/seed";

// Makes the live product rows match the price list (lib/pricing/catalog.ts) right now, and refreshes the pages that show
// prices. The same sync runs at every production build; this is the owner's way to run it by hand (open the address while
// signed in as admin) if a deploy's sync was skipped, and it says exactly what went wrong if it can't. It only touches
// products and their tiers, and it is safe to run again: the result is always the price list.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    try {
      await syncCatalog(db);
    } catch (e) {
      return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
    for (const path of ["/", "/pricing", "/services", "/checkout"]) revalidatePath(path);
    const rows = await db.product.findMany({
      where: { slug: { in: ["website-special", "site", "agents", "all-in-one-bundle", "agent-website-bundle", "agent-cinematic-bundle", "agent-lead-bundle", "everything-bundle"] } },
      select: { slug: true, priceCents: true, active: true },
      orderBy: { slug: "asc" },
    });
    return NextResponse.json({ ok: true, products: rows.map((r) => ({ slug: r.slug, dollars: r.priceCents / 100, active: r.active })) });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw err;
  }
}
