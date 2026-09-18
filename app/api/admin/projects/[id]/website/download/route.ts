import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/lib/security/permissions";
import { latestBuild } from "@/lib/site/build/store";

// Admin-only. Sends the newest version of a customer's website as one
// self-contained .html file, ready to upload to any host.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const build = await latestBuild(params.id);
    if (!build) return NextResponse.json({ error: "This project has no website build yet." }, { status: 404 });

    let name = "website";
    try {
      name = (JSON.parse(build.siteJson) as { businessName?: string }).businessName ?? name;
    } catch {
      /* keep the default file name */
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "website";

    return new NextResponse(build.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-v${build.version}.html"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("website download failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
