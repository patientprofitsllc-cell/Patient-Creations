import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { db } from "@/lib/db";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams.order ? await db.order.findUnique({ where: { id: searchParams.order }, include: { project: true } }) : null;
  const awaitingManualPayment = order && order.paymentMethod !== "stripe" && order.status !== "PAID";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Order Confirmed</p>
        <h1 className="mt-4 font-display text-4xl text-ice">
          {awaitingManualPayment ? "Your order is in — payment is next." : "Your build has entered the queue."}
        </h1>
        <p className="mt-4 text-ice/50">
          {awaitingManualPayment
            ? `Trenton will reach out shortly with ${paymentMethodLabel(order!.paymentMethod)} instructions. Production starts the moment payment is confirmed.`
            : order?.project
              ? "Production has started. You can watch real progress in your portal."
              : "We're finishing setup on your order."}
        </p>
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
      </main>
      <SiteFooter />
    </>
  );
}
