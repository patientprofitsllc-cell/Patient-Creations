import { NextRequest, NextResponse } from "next/server";
import { NO_STORE, guardCare } from "@/lib/care/access";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { recordAcceptance } from "@/lib/legal/acceptance";
import { LIVE_CARE_STATUSES, getCarePlanProduct } from "@/lib/site/carePlan";

// Starts the monthly care plan for a customer whose website is live. Stripe
// Checkout collects the card and takes the payment; a Stripe webhook records the
// subscription. The price is read from the product row, never from the browser.
export async function POST(req: NextRequest) {
  const guarded = await guardCare(req, "checkout", 5);
  if ("response" in guarded) return guarded.response;
  const { project, token, build, acceptedTerms } = guarded;

  if (!build || build.status !== "LIVE") {
    return NextResponse.json({ error: "The care plan is available once your website is live." }, { status: 409, headers: NO_STORE });
  }
  if (project.careSubscriptions.some((s) => (LIVE_CARE_STATUSES as readonly string[]).includes(s.status))) {
    return NextResponse.json({ error: "You already have a care plan." }, { status: 409, headers: NO_STORE });
  }

  // A subscription needs its own recorded agreement: the price, monthly renewal, and how to cancel.
  if (!acceptedTerms) {
    return NextResponse.json({ error: "Please tick the box to agree to the terms before you continue." }, { status: 400, headers: NO_STORE });
  }
  await recordAcceptance({ scope: "CARE_PLAN", refId: project.id, customerId: project.customerId, req });

  const product = await getCarePlanProduct();
  if (!isStripeConfigured() || !product) {
    return NextResponse.json({ error: "The care plan isn't available right now. Message us on this page and we'll set it up." }, { status: 503, headers: NO_STORE });
  }

  try {
    const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const meta = { kind: "care_plan", projectId: project.id, customerId: project.customerId };
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: project.customer.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: product.name },
            unit_amount: product.priceCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: meta,
      subscription_data: { metadata: meta },
      success_url: `${base}/status/${token}?care=started`,
      cancel_url: `${base}/status/${token}`,
    });
    return NextResponse.json({ url: session.url }, { headers: NO_STORE });
  } catch (err) {
    console.error("care plan checkout failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again, or message us on this page." }, { status: 502, headers: NO_STORE });
  }
}
