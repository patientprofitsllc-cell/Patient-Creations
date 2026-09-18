import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";
import { getCustomerTimeline } from "@/lib/admin/customerActivity";
import { NoteForm } from "@/components/admin/NoteForm";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";
import { summarizeItems } from "@/lib/orders/summary";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await db.customer.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      orders: { include: { items: { include: { product: true } }, nfcIntake: true }, orderBy: { createdAt: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      reviews: true,
      referral: { include: { clicks: true, commissions: true } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  const [projectsWithProgress, timeline] = await Promise.all([
    Promise.all(customer.projects.map(async (p) => ({ project: p, progress: await getProjectProgress(p.id) }))),
    getCustomerTimeline(customer.id, 60),
  ]);

  const totalSpendCents = customer.orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.totalCents, 0);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/crm" className="text-xs text-ice/40 hover:text-gold">← All customers</Link>
        <h2 className="mt-2 font-display text-3xl text-ice">{customer.user.name ?? customer.user.email}</h2>
        <p className="text-sm text-ice/40">{customer.user.email} · joined {new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-ice/40">Lifetime Spend</p>
          <p className="mt-1 font-display text-2xl text-gold">{money(totalSpendCents)}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-ice/40">Orders</p>
          <p className="mt-1 font-display text-2xl text-ice">{customer.orders.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-ice/40">Projects</p>
          <p className="mt-1 font-display text-2xl text-ice">{customer.projects.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-ice/40">Referral Code</p>
          <p className="mt-1 font-display text-2xl text-ice">{customer.referral?.code ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h3 className="mb-4 text-ice/70">Projects</h3>
          <div className="space-y-3">
            {projectsWithProgress.map(({ project, progress }) => (
              <div key={project.id} className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ice">{project.name}</p>
                  <span className={progress.isException ? "text-red-400" : "text-gold"}>
                    {progress.isException ? "Exception" : `${progress.percent}%`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ice/40">{progress.currentPhaseLabel}</p>
                <Link href={`/admin/logs/session/${project.id}`} className="mt-2 inline-block text-xs text-ice/40 hover:text-gold">
                  Manage session & post update →
                </Link>
              </div>
            ))}
            {projectsWithProgress.length === 0 && <p className="text-sm text-ice/40">No projects yet.</p>}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-ice/70">Orders</h3>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {customer.orders.map((o) => {
              const awaitingManual = o.status === "PENDING" && o.paymentMethod !== "stripe";
              return (
                <div key={o.id} className="p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ice">{summarizeItems(o.items)}</span>
                    <span className="text-champagne">{money(o.totalCents)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ice/40">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                    {o.deliverySpeed !== "standard" && ` · ${o.deliverySpeed} delivery`}
                    {o.paymentMethod !== "stripe" && ` · pay via ${paymentMethodLabel(o.paymentMethod)}`}
                    {o.shippingCents > 0 && ` · shipping ${money(o.shippingCents)} (${o.shippingBoxLabel})`}
                  </p>
                  {o.nfcIntake && (
                    <div className="mt-2 space-y-1 rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs text-ice/70">
                      <p className="text-gold">Card specs</p>
                      {o.nfcIntake.cardColor && <p className="capitalize">Color: {o.nfcIntake.cardColor}</p>}
                      <p>Shows: {o.nfcIntake.nfcContent}</p>
                      <p>Link: {o.nfcIntake.targetLink}</p>
                      {o.nfcIntake.socialMediaPage && <p>Social: {o.nfcIntake.socialMediaPage}</p>}
                      <p>Phone: {o.nfcIntake.phone}</p>
                      <p>Email: {o.nfcIntake.email}</p>
                    </div>
                  )}
                  {awaitingManual && (
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
                      <span className="text-xs text-gold">
                        Awaiting {paymentMethodLabel(o.paymentMethod)}: action needed
                      </span>
                      <MarkPaidButton orderId={o.id} />
                    </div>
                  )}
                </div>
              );
            })}
            {customer.orders.length === 0 && <p className="p-4 text-sm text-ice/40">No orders yet.</p>}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-ice/70">Referral Activity</h3>
          <div className="glass-panel rounded-2xl p-4 text-sm">
            {customer.referral ? (
              <>
                <p className="text-ice/70">{customer.referral.clicks.length} click(s)</p>
                <p className="mt-1 text-ice/70">{customer.referral.commissions.length} referred purchase(s)</p>
                <p className="mt-1 text-champagne">
                  {money(customer.referral.commissions.reduce((s, c) => s + c.commissionCents, 0))} total commission
                </p>
              </>
            ) : (
              <p className="text-ice/40">No referral code generated yet.</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-ice/70">Reviews</h3>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {customer.reviews.map((r) => (
              <div key={r.id} className="p-4 text-sm">
                <p className="text-champagne">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                {r.text && <p className="mt-1 text-ice/70">{r.text}</p>}
              </div>
            ))}
            {customer.reviews.length === 0 && <p className="p-4 text-sm text-ice/40">No reviews yet.</p>}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-4 text-ice/70">Notes</h3>
        <div className="space-y-3">
          <NoteForm customerId={customer.id} />
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {customer.notes.map((n) => (
              <div key={n.id} className="p-4 text-sm">
                <p className="text-ice/80">{n.body}</p>
                <p className="mt-1 text-xs text-ice/30">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {customer.notes.length === 0 && <p className="p-4 text-sm text-ice/40">No notes yet.</p>}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-ice/70">Activity Timeline</h3>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {timeline.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-4 text-sm">
              <span className="text-ice/70">{e.event}</span>
              <span className="text-ice/30">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {timeline.length === 0 && <p className="p-4 text-sm text-ice/40">No activity recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
