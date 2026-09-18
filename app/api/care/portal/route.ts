import { NextRequest, NextResponse } from "next/server";
import { NO_STORE, guardCare } from "@/lib/care/access";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";

// Opens Stripe's billing page, where the customer can update their card or
// cancel. If it can't be opened, they're told to message us instead.
export async function POST(req: NextRequest) {
  const guarded = await guardCare(req, "portal", 5);
  if ("response" in guarded) return guarded.response;
  const { project, token } = guarded;

  const sub = project.careSubscriptions.find((s) => s.stripeCustomerId);
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "You don't have a care plan to manage yet." }, { status: 409, headers: NO_STORE });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing management isn't available right now. Message us on this page and we'll help." }, { status: 503, headers: NO_STORE });
  }

  try {
    const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const session = await getStripe().billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: `${base}/status/${token}` });
    return NextResponse.json({ url: session.url }, { headers: NO_STORE });
  } catch (err) {
    console.error("billing portal failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Billing management isn't available yet. Message us on this page and we'll update or cancel your plan for you." }, { status: 502, headers: NO_STORE });
  }
}
