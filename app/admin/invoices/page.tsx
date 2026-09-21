import Link from "next/link";
import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";
import { invoiceNumber, invoiceUrl } from "@/lib/payments/invoiceCore";
import { InvoiceAdmin } from "@/components/payments/InvoiceAdmin";

export const dynamic = "force-dynamic";

const date = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminInvoicesPage() {
  const [invoices, orders] = await Promise.all([
    db.invoice.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100, include: { order: { include: { customer: { include: { user: { select: { email: true, name: true } } } } } } } }),
    db.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { customer: { include: { user: { select: { email: true } } } }, items: { include: { product: { select: { name: true } } } } },
    }),
  ]);
  const owing = orders.filter((o) => o.balanceDueCents > 0);
  const open = invoices.filter((i) => i.status === "OPEN");
  const owedTotal = open.reduce((s, i) => s + i.amountCents, 0);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Money owed to you</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Invoices</h1>
        <p className="mt-2 max-w-2xl text-sm text-ice/60">
          Big builds can start with a deposit. When the build is ready, the final payment is invoiced automatically and the customer is emailed a private pay link. Delivery is held until it is paid. You can also bill for extra work here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-ice/40">Open invoices</p><p className="mt-2 font-display text-3xl text-champagne">{open.length}</p></div>
        <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-ice/40">Waiting to be paid</p><p className="mt-2 font-display text-3xl text-champagne">{usd(owedTotal)}</p></div>
        <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-ice/40">Deposit orders still owing</p><p className="mt-2 font-display text-3xl text-champagne">{owing.length}</p></div>
      </div>

      <InvoiceAdmin
        orders={orders.map((o) => ({ id: o.id, label: `${o.customer.user.email} · ${o.items.map((i) => i.product.name).join(", ")} · ${usd(o.totalCents)}` }))}
        invoices={invoices.map((i) => ({
          id: i.id,
          number: invoiceNumber(i.seq),
          kind: i.kind,
          description: i.description,
          amount: usd(i.amountCents),
          status: i.status,
          email: i.order.customer.user.email,
          issued: date(i.createdAt),
          paid: i.paidAt ? date(i.paidAt) : null,
          via: i.paidVia,
          url: invoiceUrl(i.token),
        }))}
      />

      {owing.length > 0 && (
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-ice">Deposit orders that still owe a balance</h2>
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {owing.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-ice/70">{o.customer.user.email} · {o.items.map((i) => i.product.name).join(", ")}</span>
                <span className="text-ice/80">{usd(o.balanceDueCents)} of {usd(o.totalCents)} still owed</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ice/40">The invoice for each of these is created and emailed when its build is ready. See <Link href="/admin/projects" className="text-gold underline">Production</Link>.</p>
        </section>
      )}
    </div>
  );
}
