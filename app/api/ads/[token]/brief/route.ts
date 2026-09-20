import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NO_STORE, guardAds } from "@/lib/ads/access";
import { cleanBrief } from "@/lib/ads/plans";

// The customer's monthly brief, saved from their private plan page. Known fields only,
// length-limited, and only for a plan that is live.
export async function PUT(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardAds(req, params.token, "brief", 20);
  if ("response" in guarded) return guarded.response;
  const { sub } = guarded;

  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    return NextResponse.json({ error: "Your plan isn't active yet. Once your payment goes through you can fill this in." }, { status: 409, headers: NO_STORE });
  }
  const brief = cleanBrief(await req.json().catch(() => null));
  if (!brief) return NextResponse.json({ error: "Tell us what this month's ads should promote (a few words is enough)." }, { status: 400, headers: NO_STORE });

  await db.adSubscription.update({ where: { id: sub.id }, data: { briefJson: JSON.stringify(brief), briefUpdatedAt: new Date() } });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
