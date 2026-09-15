import { db } from "@/lib/db";
import { paymentMethodLabel } from "@/lib/payments/paymentMethods";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-2 font-display text-2xl text-ice">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [orders, projects, agentRuns, referralCommissions, pendingManualOrders] = await Promise.all([
    db.order.findMany({ where: { status: "PAID" } }),
    db.project.findMany(),
    db.agentRun.findMany(),
    db.commission.findMany(),
    db.order.findMany({
      where: { status: "PENDING", paymentMethod: { not: "stripe" } },
      include: { customer: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const aov = orders.length ? revenue / orders.length : 0;
  const activeProjects = projects.filter((p) => !["COMPLETED", "CANCELLED", "EXCEPTION"].includes(p.state));
  const stuckProjects = projects.filter((p) => p.state === "EXCEPTION");
  const failedRuns = agentRuns.filter((r) => r.status === "FAILED" || r.status === "ESCALATED");
  const commissionOwed = referralCommissions
    .filter((c) => ["PENDING", "APPROVED", "PAYABLE"].includes(c.state))
    .reduce((s, c) => s + c.commissionCents, 0);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-4 text-ice/70">Business</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Revenue" value={money(revenue)} />
          <StatCard label="Orders" value={String(orders.length)} />
          <StatCard label="Avg Order Value" value={money(aov)} />
          <StatCard label="Referral Commission Owed" value={money(commissionOwed)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice/70">Production</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Active Projects" value={String(activeProjects.length)} />
          <StatCard label="Completed Projects" value={String(projects.filter((p) => p.state === "COMPLETED").length)} />
          <StatCard label="Stuck / Exception" value={String(stuckProjects.length)} />
          <StatCard label="Total Projects" value={String(projects.length)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice/70">AI Agent Activity</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Runs" value={String(agentRuns.length)} />
          <StatCard label="Succeeded" value={String(agentRuns.filter((r) => r.status === "SUCCEEDED").length)} />
          <StatCard label="Failed / Escalated" value={String(failedRuns.length)} />
          <StatCard
            label="Avg Duration"
            value={`${Math.round(
              agentRuns.filter((r) => r.durationMs).reduce((s, r) => s + (r.durationMs ?? 0), 0) /
                Math.max(1, agentRuns.filter((r) => r.durationMs).length),
            )}ms`}
          />
        </div>
      </section>

      {pendingManualOrders.length > 0 && (
        <section>
          <h2 className="mb-4 text-gold">Awaiting Manual Payment</h2>
          <p className="mb-4 text-xs text-ice/40">
            These customers chose a payment method that isn&apos;t automatic — reach out with instructions, then mark
            paid once you&apos;ve actually received the money to start production.
          </p>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {pendingManualOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="text-ice">{o.customer.user.name ?? o.customer.user.email}</p>
                  <p className="text-ice/40">
                    {money(o.totalCents)} · pay via <span className="text-gold">{paymentMethodLabel(o.paymentMethod)}</span> ·{" "}
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <MarkPaidButton orderId={o.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {stuckProjects.length > 0 && (
        <section>
          <h2 className="mb-4 text-red-400">Exceptions Requiring Attention</h2>
          <div className="glass-panel divide-y divide-white/5 rounded-2xl">
            {stuckProjects.map((p) => (
              <div key={p.id} className="p-4 text-sm">
                <p className="text-ice">{p.name}</p>
                <p className="text-red-400">{p.exceptionNote}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
