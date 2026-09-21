import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";
import { NfcIntakeForm } from "@/components/checkout/NfcIntakeForm";
import { CalendlyBooking } from "@/components/checkout/CalendlyBooking";
import { ThankYouCard, type ThankYouKind } from "@/components/checkout/ThankYouCard";
import { statusUrlFor } from "@/lib/projects/statusToken";
import { NFC_ADDON_SLUG, includedCardCount } from "@/lib/payments/nfcAddon";
import { VoiceCue } from "@/components/voice/VoiceCue";
import { PurchaseJourney } from "@/components/journey/PurchaseJourney";
import { NextStepCards } from "@/components/journey/NextStepCards";
import { nextOffers } from "@/lib/journey/ladder";
import { thanksCueFor } from "@/lib/voice/cues";
import { usd } from "@/lib/pricing/catalog";
import { orderAccessOk } from "@/lib/orders/accessKey";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string; k?: string } }) {
  const found = searchParams.order
    ? await db.order.findUnique({
        where: { id: searchParams.order },
        include: { project: true, items: { include: { product: true } }, nfcIntake: true, websiteIntake: true, customer: { include: { user: true } } },
      })
    : null;
  // The link carries a private key. Without the matching one (or for an order made before keys existed), nothing about the
  // order is shown: not its products, not the buyer's name, not the intake link, not the card details already entered.
  const order = found && orderAccessOk(found.accessToken, searchParams.k) ? found : null;
  // What this customer owns, so the next steps offered are only ones that fit and are not already theirs.
  const owned = order
    ? await db.orderItem.findMany({ where: { order: { customerId: order.customerId, status: "PAID" } }, select: { product: { select: { slug: true } } } })
    : [];
  const [carePlans, adsPlans] = order
    ? await Promise.all([
        db.careSubscription.count({ where: { customerId: order.customerId, status: { not: "CANCELED" } } }),
        db.adSubscription.count({ where: { customerId: order.customerId, status: { in: ["ACTIVE", "PAST_DUE"] } } }),
      ])
    : [0, 0];
  const offers = order
    ? nextOffers({
        justBought: order.items.map((i) => i.product.slug),
        owned: owned.map((o) => o.product.slug),
        hasCarePlan: carePlans > 0,
        hasAdsPlan: adsPlans > 0,
        statusPath: order.project?.statusToken ? `/status/${order.project.statusToken}` : null,
      })
    : [];
  const awaitingManualPayment = order && order.paymentMethod !== "stripe" && order.status !== "PAID";
  const owesBalance = Boolean(order && order.balanceDueCents > 0);
  const isNfcOrder = order?.items[0]?.product.category === "Merch";
  const hasNfcAddon = order?.items.some((i) => i.product.slug === NFC_ADDON_SLUG) ?? false;
  const includedCards = includedCardCount(order?.items[0]?.product.slug);
  const showCardSetup = isNfcOrder || hasNfcAddon || includedCards > 0;
  // How many cards this order covers, so the questionnaire can ask for each one.
  const sumQty = (pred: (i: NonNullable<typeof order>["items"][number]) => boolean) =>
    order?.items.filter(pred).reduce((s, i) => s + i.quantity, 0) ?? 0;
  const cardCount = includedCards > 0
    ? includedCards
    : hasNfcAddon
      ? sumQty((i) => i.product.slug === NFC_ADDON_SLUG)
      : (order?.items.filter((i) => i.product.category === "Merch").length ?? 0) > 1
        ? sumQty((i) => i.product.category === "Merch")
        : 1;
  const hasGoogleReviewCards = order?.items.some((i) => i.product.slug === "nfc-google-review") ?? false;
  // Every non-Merch purchase is a service build — a kickoff call is the
  // next real step, so it's the only category that gets the Calendly prompt.
  // A bundled NFC add-on doesn't change this: it's still a service build.
  const isServiceBuild = order && !isNfcOrder;
  // Website orders start with a short intake instead of a kickoff call.
  const intake = order?.websiteIntake ?? null;
  const intakePending = Boolean(intake && intake.status !== "COMPLETE");
  const thankYouKind: ThankYouKind = intake ? "website" : showCardSetup && isNfcOrder ? "cards" : "project";
  const firstName = order?.customer.user.name?.trim().split(/s+/)[0]?.slice(0, 30);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-6 pb-28 pt-40 text-center">
        {order && !awaitingManualPayment && <VoiceCue id={thanksCueFor(order.items[0]?.product.slug)} />}
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Order Confirmed</p>
        <h1 className="mt-4 font-display text-4xl text-ice">
          {awaitingManualPayment
            ? "Your order is in. Payment is next."
            : intakePending
              ? "Your order is confirmed. One quick step left."
              : "Your build has entered the queue."}
        </h1>
        <p className="mt-4 text-ice/50">
          {awaitingManualPayment
            ? `We'll reach out shortly with ${paymentMethodLabel(order!.paymentMethod)} instructions. Production starts the moment payment is confirmed.`
            : intakePending
              ? "Tell us about your business so we can start building. It takes about 3 to 5 minutes."
              : order?.project
              ? "Production has started. You can watch real progress in your portal."
              : "We're finishing setup on your order."}
        </p>
        {owesBalance && order && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
            {awaitingManualPayment ? "Your deposit is" : "Your deposit was"} {usd(order.totalCents - order.balanceDueCents)}. The remaining {usd(order.balanceDueCents)} is due before your final files are released. We will invoice it when your build is ready.
          </p>
        )}

        {intake && intakePending && (
          <div className="mt-8">
            <Link
              href={`/intake/${intake.token}`}
              className="inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-4 text-base font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
            >
              FINISH YOUR INTAKE
            </Link>
            <p className="mt-3 text-xs text-ice/40">
              We&apos;ve also emailed you this link. Your answers save as you go, so you can come back to it.
              {awaitingManualPayment ? " Building starts once your payment is confirmed." : ""}
            </p>
          </div>
        )}

        {order && <PurchaseJourney kind={thankYouKind} intakePending={intakePending} />}
        {order && <ThankYouCard kind={thankYouKind} firstName={firstName} />}
        {order && !awaitingManualPayment && <NextStepCards offers={offers} source="success" />}

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/portal/dashboard"
            className="rounded-full bg-gold px-8 py-3 text-sm font-medium tracking-wide text-obsidian transition hover:brightness-110"
          >
            Go to Portal
          </Link>
          {order && (
            <Link
              href="/checkout/upsell"
              className="champagne-border rounded-full px-8 py-3 text-sm tracking-wide text-champagne transition hover:bg-champagne/10"
            >
              See a relevant next step
            </Link>
          )}
        </div>

        {order?.project?.statusToken ? (
          <div className="glass-panel mt-10 rounded-2xl p-6 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your Private Project Link</p>
            <p className="mt-2 text-sm text-ice/60">
              Bookmark this. Only someone with this exact link can see your project. Your agent team posts updates
              there as they work, and you can message them from that page. We also email it to you.
            </p>
            <Link
              href={`/status/${order.project.statusToken}`}
              className="mt-3 block break-all rounded-lg bg-black/40 p-3 text-xs text-gold hover:brightness-110"
            >
              {statusUrlFor(order.project.statusToken)}
            </Link>
          </div>
        ) : (
          order && (
            <p className="mt-10 text-sm text-ice/40">
              Your private project link will appear here, and arrive by email, as soon as your order is confirmed.
            </p>
          )
        )}

        {showCardSetup && order && (
          <NfcIntakeForm
            orderId={order.id}
            accessKey={searchParams.k ?? ""}
            showColorChoice={hasGoogleReviewCards}
            cardCount={cardCount}
            existing={
              order.nfcIntake
                ? {
                    socialMediaPage: order.nfcIntake.socialMediaPage,
                    nfcContent: order.nfcIntake.nfcContent,
                    targetLink: order.nfcIntake.targetLink,
                    cardColor: order.nfcIntake.cardColor,
                    phone: order.nfcIntake.phone,
                    email: order.nfcIntake.email,
                  }
                : null
            }
          />
        )}

        {isServiceBuild && order && !intake && (
          <CalendlyBooking name={order.customer.user.name ?? order.customer.user.email} email={order.customer.user.email} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
