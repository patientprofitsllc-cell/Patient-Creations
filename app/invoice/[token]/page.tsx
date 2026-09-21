import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { InvoicePayButton } from "@/components/payments/InvoicePayButton";
import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";
import { confirmInvoicePayment } from "@/lib/payments/invoices";
import { INVOICE_TOKEN_RE, invoiceNumber } from "@/lib/payments/invoiceCore";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const date = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// Private: only someone with this exact link can open it. It is both the bill and, once paid, the receipt.
export default async function InvoicePage({ params, searchParams }: { params: { token: string }; searchParams: { session_id?: string } }) {
  if (!INVOICE_TOKEN_RE.test(params.token)) notFound();
  let invoice = await db.invoice.findUnique({ where: { token: params.token }, include: { order: { include: { items: { include: { product: { select: { name: true } } } } } } } });
  if (!invoice) notFound();
  // Back from Stripe: ask Stripe (not the browser) whether it was paid, so this page shows the receipt without waiting for the webhook.
  if (invoice.status === "OPEN" && searchParams.session_id) {
    await confirmInvoicePayment(invoice.id, searchParams.session_id);
    invoice = (await db.invoice.findUnique({ where: { token: params.token }, include: { order: { include: { items: { include: { product: { select: { name: true } } } } } } } })) ?? invoice;
  }
  const number = invoiceNumber(invoice.seq);
  const paid = invoice.status === "PAID";
  const open = invoice.status === "OPEN";
  const pendingConfirm = open && Boolean(searchParams.session_id);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-6 pb-28 pt-32 sm:pt-40">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Invoice {number}</p>
        <h1 className="mt-3 font-display text-3xl text-ice sm:text-4xl">{paid ? "Paid. Thank you." : invoice.status === "VOID" ? "This invoice was cancelled" : `${usd(invoice.amountCents)} due`}</h1>

        {pendingConfirm && (
          <p role="status" className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ice/80">
            We are confirming your payment. If this page does not update in a minute, refresh it.
          </p>
        )}

        <div className="glass-panel mt-8 rounded-2xl p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ice/50">For</dt><dd className="text-right text-ice">{invoice.description}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ice/50">Order</dt><dd className="text-right text-ice/80">{invoice.order.items.map((i) => i.product.name).join(", ")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ice/50">Issued</dt><dd className="text-ice/80">{date(invoice.createdAt)}</dd></div>
            {paid && invoice.paidAt && <div className="flex justify-between gap-4"><dt className="text-ice/50">Paid</dt><dd className="text-ice/80">{date(invoice.paidAt)}</dd></div>}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-display text-xl text-champagne"><dt>Amount</dt><dd>{usd(invoice.amountCents)}</dd></div>
          </dl>
          {open && (
            <div className="mt-6">
              <InvoicePayButton token={params.token} label={`Pay ${usd(invoice.amountCents)} by card`} />
              <p className="mt-3 text-xs text-ice/40">Secure checkout by Stripe. We never see your card number.</p>
            </div>
          )}
          {paid && <p className="mt-6 text-sm text-ice/70">This page is your receipt. You can print it or save it as a PDF from your browser.</p>}
        </div>

        <p className="mt-8 text-xs text-ice/40">
          Patient Profits LLC, doing business as Patient Creations. Questions about this invoice? Email {CONTACT_EMAIL} or call {CONTACT_PHONE_DISPLAY}. All sales are final under our Refund and Cancellation Policy.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
