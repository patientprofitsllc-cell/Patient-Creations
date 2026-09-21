import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { recordReferralClick } from "@/lib/referrals/codes";
import { isPartnerCode } from "@/lib/partners/rules";
import { recordPartnerClick } from "@/lib/partners/service";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const userAgent = req.headers.get("user-agent");

  // A partner's code starts with PC and is counted for that partner. Anything else is a customer's referral code, as before.
  if (isPartnerCode(code)) await recordPartnerClick(code, ip, userAgent);
  else await recordReferralClick(code, ipHash, userAgent);

  const dest = new URL("/services", req.url);
  dest.searchParams.set("ref", code);
  return NextResponse.redirect(dest);
}
