import { NextRequest, NextResponse } from "next/server";
import { NO_STORE, guardAds } from "@/lib/ads/access";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";

// Opens Stripe's billing page, where the customer can update their card or cancel.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const guarded = await guardAds(req, params.token, "portal", 5);
  if ("response" in guarded) return guarded.response;
  const { sub } = guarded;

  if (!sub.stripeCustomerId) return NextResponse.json({ error: "There's no billing to manage yet." }, { status: 409, headers: NO_STORE });
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing management isn't available right now. Email us and we'll help." }, { status: 503, headers: NO_STORE });

  try {
    const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const session = await getStripe().billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: `${base}/monthly-ads/manage/${params.token}` });
    return NextResponse.json({ url: session.url }, { headers: NO_STORE });
  } catch (err) {
    console.error("ads billing portal failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Billing management isn't available yet. Email us and we'll update or cancel your plan for you." }, { status: 502, headers: NO_STORE });
  }
}
