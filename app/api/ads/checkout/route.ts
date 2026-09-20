import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { recordAcceptance } from "@/lib/legal/acceptance";
import { ensureReferralForCustomer } from "@/lib/referrals/codes";
import { generateStatusToken } from "@/lib/projects/statusToken";
import { AD_PLAN_SLUGS } from "@/lib/ads/plans";
import { LIVE_AD_STATUSES, loadAdPlan } from "@/lib/ads/data";
import { activateAdPlan } from "@/lib/ads/events";

const schema = z.object({
  planSlug: z.enum(AD_PLAN_SLUGS),
  // The customer must agree to the terms, including automatic monthly renewal. The literal keeps a request without it from getting any further.
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please tick the box to agree to the terms, including the monthly renewal, before you continue." }) }),
  businessName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional(),
  account: z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(200) }).optional(),
});

// Starts a Monthly Ads plan. Stripe Checkout collects the card and takes the payment; a
// Stripe webhook then activates the plan. The price is read from the product row, never
// from the browser, and a plan is only ever activated by a paid checkout.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`ads-checkout:${ip}`, 8, 60_000).allowed) return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    const first = body.error.issues[0]?.message ?? "Please check your details and try again.";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const { planSlug, businessName, phone, account } = body.data;

  const plan = await loadAdPlan(planSlug);
  if (!plan) return NextResponse.json({ error: "That plan isn't available right now." }, { status: 503 });

  // Never start a subscription for free: in production Stripe must be set up.
  const stripeReady = isStripeConfigured();
  if (!stripeReady && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Plans can't be started online right now. Please contact us." }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  let customerId: string;
  let email: string;
  if (session?.user?.id) {
    const customer = await db.customer.findUnique({ where: { userId: session.user.id as string }, include: { user: true } });
    if (!customer) return NextResponse.json({ error: "No customer profile for this account." }, { status: 400 });
    customerId = customer.id;
    email = customer.user.email;
  } else {
    if (!account) return NextResponse.json({ error: "Account details are required to start a plan." }, { status: 400 });
    const existing = await db.user.findUnique({ where: { email: account.email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists. Please sign in and start your plan from there." }, { status: 409 });
    const user = await db.user.create({ data: { email: account.email, name: account.name, passwordHash: await bcrypt.hash(account.password, 10), role: "CUSTOMER" } });
    const customer = await db.customer.create({ data: { userId: user.id, referralCode: "TEMP" } });
    const referral = await ensureReferralForCustomer(customer.id);
    await db.customer.update({ where: { id: customer.id }, data: { referralCode: referral.code } });
    customerId = customer.id;
    email = account.email;
  }

  // One live plan per customer. Changing plans is done by us, on request.
  const live = await db.adSubscription.count({ where: { customerId, status: { in: [...LIVE_AD_STATUSES] } } });
  if (live > 0) return NextResponse.json({ error: "You already have a Monthly Ads plan. To change plans, email us and we'll switch it for you." }, { status: 409 });

  const sub = await db.adSubscription.create({
    data: { customerId, planSlug, priceCents: plan.priceCents, businessName, phone: phone || null, manageToken: generateStatusToken() },
  });
  await recordAcceptance({ scope: "AD_PLAN", refId: sub.id, customerId, req });

  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const manageUrl = `${base}/monthly-ads/manage/${sub.manageToken}`;

  if (!stripeReady) {
    // Development only: exercise the same activation path a paid checkout would.
    await activateAdPlan({ adSubscriptionId: sub.id, stripeSubscriptionId: `mock_${sub.id}`, stripeCustomerId: null, periodEnd: null });
    return NextResponse.json({ redirectUrl: `${manageUrl}?started=1` });
  }

  try {
    const meta = { kind: "ads_plan", adSubscriptionId: sub.id, planSlug, customerId };
    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price_data: { currency: "usd", product_data: { name: plan.name }, unit_amount: plan.priceCents, recurring: { interval: "month" } }, quantity: 1 }],
      metadata: meta,
      subscription_data: { metadata: meta },
      success_url: `${manageUrl}?started=1`,
      cancel_url: `${base}/monthly-ads`,
    });
    return NextResponse.json({ redirectUrl: checkout.url });
  } catch (err) {
    console.error("ads plan checkout failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again, or contact us." }, { status: 502 });
  }
}
