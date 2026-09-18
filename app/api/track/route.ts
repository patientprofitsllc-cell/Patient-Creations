import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { isFunnelEvent, trackFunnel } from "@/lib/analytics/funnel";
import { recordReferralClick } from "@/lib/referrals/codes";
import { rateLimit } from "@/lib/security/rateLimit";

const short = z.string().max(80).optional();

const trackSchema = z.object({
  event: z.string(),
  path: z.string().max(200).optional(),
  visitorId: z.string().regex(/^[a-f0-9]{8,32}$/).optional(),
  ref: z.string().regex(/^[A-Za-z0-9_-]{3,40}$/).optional(),
  source: short,
  medium: short,
  campaign: short,
  data: z.record(z.string().max(80), z.string().max(120)).optional(),
});

// Browser-reported funnel events. Only whitelisted event names are stored, all
// fields are length-limited, and an IP can send a bounded number per minute.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`track:${ip}`, 60, 60_000).allowed) return new NextResponse(null, { status: 204 });

  const body = trackSchema.safeParse(await req.json().catch(() => null));
  if (!body.success || !isFunnelEvent(body.data.event)) return new NextResponse(null, { status: 204 });

  const { event, path, visitorId, ref, source, medium, campaign, data } = body.data;
  await trackFunnel(event, { path, visitorId, ref, source, medium, campaign, ...data });

  // A visit that arrives with a referral code counts as one referral click per visitor.
  if (event === "landing_page_view" && ref && visitorId) {
    const already = await db.analyticsEvent.findFirst({
      where: { name: "referral_clicked", payloadJson: { contains: `"visitorId":"${visitorId}"` } },
      select: { id: true },
    });
    if (!already) {
      const ipHash = createHash("sha256").update(ip).digest("hex");
      await recordReferralClick(ref, ipHash, req.headers.get("user-agent"));
      await trackFunnel("referral_clicked", { visitorId, ref });
    }
  }

  return new NextResponse(null, { status: 204 });
}
