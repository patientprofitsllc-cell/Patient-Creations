import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { priceOrder, priceCardMix } from "@/lib/payments/pricing";
import { isStripeConfigured, getStripe } from "@/lib/payments/stripe";
import { completeOrderPayment } from "@/lib/payments/completeOrder";
import { ensureReferralForCustomer } from "@/lib/referrals/codes";
import { logEvent } from "@/lib/analytics/events";
import { rateLimit } from "@/lib/security/rateLimit";
import { recordAcceptance } from "@/lib/legal/acceptance";
import { randomBytes } from "crypto";
import { NFC_BUNDLE_SLUG } from "@/lib/payments/nfcAddon";
import { OFFER_SLUG } from "@/lib/site/offer";
import { isVisitorId, offerIsRedeemable, recordCartConverted, recordOfferUsed, RECOVERY_COUPON } from "@/lib/funnel/cartRecovery";
import { notifyOwnerOfOrder } from "@/lib/alerts/ownerAlerts";
import { sendEmail } from "@/lib/email/provider";
import { intakeUrlFor } from "@/lib/intake/url";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";
import { depositLineItems, quoteDeposit } from "@/lib/payments/deposit";
import { usd } from "@/lib/pricing/catalog";

const checkoutSchema = z.object({
  productIds: z.array(z.string()).min(1),
  primaryVariantId: z.string().optional(),
  primaryQuantity: z.number().int().min(1).max(100).default(1),
  // How many cards on the "NFC Card — Your Choice" add-on (a flat price per card).
  nfcAddonQuantity: z.number().int().min(1).max(100).default(1),
  // Mix-and-match card pack: { designSlug: quantity }. When present it replaces productIds pricing.
  cardMix: z.record(z.string(), z.number().int().min(1).max(100)).optional(),
  deliverySpeed: z.enum(["standard", "priority", "express", "immediate"]).default("standard"),
  paymentMethod: z.enum(["stripe", "zelle", "apple_pay"]).default("stripe"),
  // "deposit" starts a big build with part of the price now and the rest invoiced later. The server decides if it is allowed.
  paymentPlan: z.enum(["full", "deposit"]).default("full"),
  couponCode: z.string().optional(),
  // The customer must agree to the legal terms. The literal keeps a request without it from getting any further.
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service, Privacy Policy, and Refund Policy to place an order." }) }),
  campaignSource: z.string().max(80).optional(),
  // Return-visitor offer: the visitor's random id and the signed offer the server issued them.
  visitorId: z.string().regex(/^[a-f0-9]{8,32}$/).optional(),
  recoveryOffer: z.string().max(80).optional(),
  // Business details, required when the order includes a website (see below).
  website: z
    .object({
      businessName: z.string().trim().min(1).max(120),
      businessType: z.string().trim().min(1).max(80),
      phone: z.string().trim().min(7).max(40),
      existingWebsite: z.string().trim().max(200).optional(),
    })
    .optional(),
  referralCode: z.string().optional(),
  account: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const { allowed } = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = checkoutSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const { productIds, primaryVariantId, primaryQuantity, nfcAddonQuantity, cardMix, deliverySpeed, paymentMethod, paymentPlan, couponCode, campaignSource, referralCode, account, website, visitorId, recoveryOffer } = body.data;

  // Website orders need the business basics up front so production can start from them.
  const includesWebsite =
    !cardMix &&
    (await db.product.count({ where: { id: { in: productIds }, slug: { in: [OFFER_SLUG, NFC_BUNDLE_SLUG] } } })) > 0;
  if (includesWebsite && !website) {
    return NextResponse.json({ error: "Tell us your business name, type, and phone so we can build your website." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  let customerId: string;

  if (session?.user?.id) {
    const customer = await db.customer.findUnique({ where: { userId: session.user.id as string } });
    if (!customer) return NextResponse.json({ error: "No customer profile for this account" }, { status: 400 });
    customerId = customer.id;
  } else {
    if (!account) return NextResponse.json({ error: "Account details are required to check out" }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: account.email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });

    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await db.user.create({
      data: { email: account.email, name: account.name, passwordHash, role: "CUSTOMER" },
    });
    const customer = await db.customer.create({
      data: {
        userId: user.id,
        referralCode: "TEMP", // replaced immediately below
        referredByCode: referralCode ?? null,
      },
    });
    const referral = await ensureReferralForCustomer(customer.id);
    await db.customer.update({ where: { id: customer.id }, data: { referralCode: referral.code } });
    customerId = customer.id;
  }

  // The 5% return-visitor offer counts only if the server signed it for this visitor, it has not expired, and it has not been used.
  const offerOk = isVisitorId(visitorId) && (await offerIsRedeemable(recoveryOffer, visitorId));

  let priced;
  try {
    priced = cardMix
      ? await priceCardMix(cardMix, couponCode, { recoveryOffer: offerOk })
      : await priceOrder(productIds, couponCode, primaryVariantId, deliverySpeed, primaryQuantity, nfcAddonQuantity, { recoveryOffer: offerOk });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid order" }, { status: 400 });
  }

  // A deposit is only for big builds that ship nothing. The amounts are always worked out here, never taken from the browser.
  let depositCents = 0;
  let balanceDueCents = 0;
  if (paymentPlan === "deposit") {
    const quote = quoteDeposit(priced.totalCents, { shippingCents: priced.shippingCents });
    if (!quote.eligible) return NextResponse.json({ error: quote.reason ?? "A deposit is not available on this order." }, { status: 400 });
    depositCents = quote.depositCents;
    balanceDueCents = quote.balanceCents;
  }

  const order = await db.order.create({
    data: {
      customerId,
      depositCents,
      balanceDueCents,
      status: "PENDING",
      subtotalCents: priced.subtotalCents,
      discountCents: priced.discountCents,
      deliverySpeed: priced.deliverySpeed,
      rushFeeCents: priced.rushFeeCents,
      shippingCents: priced.shippingCents,
      shippingBoxLabel: priced.shippingBoxLabel,
      totalCents: priced.totalCents,
      couponCode: priced.couponApplied ?? couponCode ?? null,
      campaignSource: campaignSource ?? null,
      paymentMethod,
      items: {
        create: priced.items.map((i) => ({
          productId: i.productId,
          productVariantId: i.productVariantId,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
  });

  if (includesWebsite && website) {
    // One private, unguessable intake link per website order (22 url-safe chars from 128 random bits).
    await db.websiteIntake.create({
      data: {
        orderId: order.id,
        token: randomBytes(16).toString("base64url"),
        businessName: website.businessName,
        businessType: website.businessType,
        phone: website.phone,
        existingWebsite: website.existingWebsite || null,
      },
    });
  }

  await recordAcceptance({ scope: "ORDER", refId: order.id, customerId, req });
  if (visitorId) {
    await recordCartConverted(visitorId, order.id);
    if (priced.couponApplied === RECOVERY_COUPON) await recordOfferUsed(visitorId, order.id);
  }
  await logEvent("order.created", "Order", order.id, { totalCents: order.totalCents, paymentMethod });

  // Only "stripe" is a live, automatic charge. Every other option is a
  // manual-collection method — no charge happens here; the order stays
  // PENDING until an admin confirms payment was actually received (see
  // app/api/admin/orders/[id]/mark-paid/route.ts) and surfaces immediately
  // on the admin dashboard so Trenton knows which method to follow up with.
  if (paymentMethod !== "stripe") {
    await logEvent("order.manual_payment_requested", "Order", order.id, { paymentMethod });
    // Thank the customer now (payment is still to come) and tell the owner there is money to collect.
    const customerEmail = session?.user?.email ?? account?.email;
    if (customerEmail) {
      const names = await db.product.findMany({ where: { id: { in: priced.items.map((i) => i.productId) } }, select: { name: true } });
      const intake = await db.websiteIntake.findUnique({ where: { orderId: order.id }, select: { token: true } });
      await sendEmail(customerEmail, "order_received", {
        summary: names.map((n) => n.name).join(", ") + (balanceDueCents > 0 ? ` (a ${usd(depositCents)} deposit now, and ${usd(balanceDueCents)} due before final delivery)` : ""),
        paymentLabel: paymentMethodLabel(paymentMethod),
        intakeUrl: intake ? intakeUrlFor(intake.token) : undefined,
      });
    }
    await notifyOwnerOfOrder(order.id, "awaiting_payment");
    return NextResponse.json({ redirectUrl: `/checkout/success?order=${order.id}` });
  }

  if (isStripeConfigured()) {
    const products = await db.product.findMany({ where: { id: { in: priced.items.map((i) => i.productId) } } });
    const variants = await db.productVariant.findMany({
      where: { id: { in: priced.items.map((i) => i.productVariantId).filter((id): id is string => Boolean(id)) } },
    });
    const stripe = getStripe();

    // Stripe has no concept of our internal discount — apply it directly to
    // line-item amounts (in order) so the real charge matches priced.totalCents
    // exactly. The rush fee is deliberately excluded from the discount.
    // Discount is taken against each line's TOTAL (unit price x quantity),
    // then converted back to a per-unit amount since Stripe multiplies
    // unit_amount x quantity itself.
    let remainingDiscount = priced.discountCents;
    const discountedItems = priced.items.map((i) => {
      const lineTotal = i.priceCents * i.quantity;
      const take = Math.min(remainingDiscount, lineTotal);
      remainingDiscount -= take;
      const discountedLineTotal = lineTotal - take;
      return { ...i, discountedLineTotal, discountedUnitCents: Math.round(discountedLineTotal / i.quantity) };
    });

    const rushLineItem =
      priced.rushFeeCents > 0
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: { name: `Rush delivery: ${deliverySpeed}` },
                unit_amount: priced.rushFeeCents,
              },
              quantity: 1,
            },
          ]
        : [];
    // Shipping is its own line item, not folded into the product price, so
    // the customer sees exactly what production vs. shipping costs — the
    // same box named on the checkout page is named again on the Stripe receipt.
    const shippingLineItem =
      priced.shippingCents > 0
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: { name: `Shipping (US) — ${priced.shippingBoxLabel}` },
                unit_amount: priced.shippingCents,
              },
              quantity: 1,
            },
          ]
        : [];
    const isDeposit = balanceDueCents > 0;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      // A deposit is one line, so the card is charged exactly the deposit; the rest is invoiced when the build is ready.
      line_items: isDeposit
        ? depositLineItems({ productNames: products.map((p) => p.name), depositCents, balanceCents: balanceDueCents })
        : [
        ...discountedItems
          .filter((i) => i.discountedLineTotal > 0)
          .map((i) => {
            const product = products.find((p) => p.id === i.productId)!;
            const variant = i.productVariantId ? variants.find((v) => v.id === i.productVariantId) : null;
            const name = variant ? `${product.name} · ${variant.name}` : product.name;
            return {
              price_data: { currency: "usd", product_data: { name }, unit_amount: i.discountedUnitCents },
              quantity: i.quantity,
            };
          }),
        ...rushLineItem,
        ...shippingLineItem,
      ],
      success_url: `${process.env.APP_BASE_URL}/checkout/success?order=${order.id}`,
      cancel_url: `${process.env.APP_BASE_URL}/checkout?cancelled=1`,
      metadata: { orderId: order.id },
    });

    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });

    return NextResponse.json({ redirectUrl: checkoutSession.url });
  }

  // Mock mode: complete the order through the exact same server-side path
  // a verified webhook would use, so the pipeline is genuinely exercised.
  await completeOrderPayment(order.id, "MOCK");

  return NextResponse.json({ redirectUrl: `/checkout/success?order=${order.id}` });
}
