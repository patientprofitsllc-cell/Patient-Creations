import { collectedCents } from "@/lib/payments/deposit";
import Link from "next/link";
import { db } from "@/lib/db";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default async function CrmPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim().toLowerCase() ?? "";

  const customers = await db.customer.findMany({
    include: {
      user: true,
      orders: { where: { status: "PAID" } },
      projects: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = customers
    .map((c) => ({
      id: c.id,
      name: c.user.name ?? c.user.email,
      email: c.user.email,
      createdAt: c.createdAt,
      totalSpendCents: c.orders.reduce((s, o) => s + collectedCents(o), 0),
      orderCount: c.orders.length,
      projectCount: c.projects.length,
      activeProjectCount: c.projects.filter((p) => !["COMPLETED", "CANCELLED", "EXCEPTION"].includes(p.state)).length,
    }))
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    .sort((a, b) => b.totalSpendCents - a.totalSpendCents);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-ice/70">Customers</h2>
        <p className="text-sm text-ice/40">Every account, sorted by lifetime spend. Click a row to manage that customer.</p>
      </div>

      <form className="max-w-sm">
        <label htmlFor="crm-search" className="sr-only">Search customers</label>
        <input
          id="crm-search"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-ice placeholder:text-ice/30"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gold/15">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-ice/40">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Lifetime Spend</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Projects</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/crm/${c.id}`} className="block text-ice hover:text-gold">
                    {c.name}
                    <span className="block text-xs text-ice/40">{c.email}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-champagne">{money(c.totalSpendCents)}</td>
                <td className="px-4 py-3 text-ice/70">{c.orderCount}</td>
                <td className="px-4 py-3 text-ice/70">{c.projectCount}</td>
                <td className="px-4 py-3 text-ice/70">{c.activeProjectCount}</td>
                <td className="px-4 py-3 text-ice/40">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ice/40">
                  No customers match "{searchParams.q}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
