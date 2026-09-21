import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";
import { invoiceNumber } from "@/lib/payments/invoiceCore";

const date = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const STATUS: Record<string, string> = { OPEN: "Due", PAID: "Paid", VOID: "Cancelled" };

export default async function PortalInvoicesPage() {
  const session = await getServerSession(authOptions);
  const customer = session?.user?.id ? await db.customer.findUnique({ where: { userId: session.user.id as string } }) : null;
  const orders = customer
    ? await db.order.findMany({
        where: { customerId: customer.id, status: "PAID" },
        orderBy: { createdAt: "desc" },
        include: { invoices: { orderBy: { createdAt: "desc" } }, payments: { orderBy: { createdAt: "desc" } }, items: { include: { product: { select: { name: true } } } } },
      })
    : [];
  const invoices = orders.flatMap((o) => o.invoices.map((i) => ({ ...i, orderName: o.items.map((x) => x.product.name).join(", ") })));
  const due = invoices.filter((i) => i.status === "OPEN");
  const receipts = orders.flatMap((o) => o.payments.filter((p) => p.status === "PAID").map((p) => ({ ...p, orderName: o.items.map((x) => x.product.name).join(", ") })));
  receipts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Billing</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Invoices and receipts</h1>
      </div>

      {due.length > 0 && (
        <section aria-label="Payments due" className="space-y-3">
          {due.map((i) => (
            <div key={i.id} className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/80">Payment due · {invoiceNumber(i.seq)}</p>
              <p className="mt-2 text-ice">{i.description}</p>
              <p className="mt-1 font-display text-2xl text-champagne">{usd(i.amountCents)}</p>
              <Link href={`/invoice/${i.token}`} className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 text-sm font-semibold text-obsidian">
                Pay now
              </Link>
            </div>
          ))}
        </section>
      )}

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-ice">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-ice/50">No invoices yet. If you start a big build with a deposit, the final payment shows up here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {invoices.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <Link href={`/invoice/${i.token}`} className="text-gold underline">{invoiceNumber(i.seq)}</Link>
                  <span className="ml-3 text-ice/60">{i.description}</span>
                </span>
                <span className="text-ice/80">{usd(i.amountCents)} · <span className={i.status === "OPEN" ? "text-gold" : "text-ice/50"}>{STATUS[i.status] ?? i.status}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-ice">Receipts</h2>
        {receipts.length === 0 ? (
          <p className="mt-3 text-sm text-ice/50">Your payments will appear here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {receipts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-ice/70">{p.orderName}</span>
                <span className="text-ice/80">{usd(p.amountCents)} · {date(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
