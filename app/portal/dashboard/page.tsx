import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  const customer = await db.customer.findUnique({
    where: { userId: session!.user.id as string },
    include: {
      user: true,
      projects: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } },
    },
  });

  if (!customer) return <p className="text-ice/50">No customer profile found.</p>;

  const projectsWithProgress = await Promise.all(
    customer.projects.map(async (p) => ({ project: p, progress: await getProjectProgress(p.id) })),
  );

  return (
    <div className="space-y-14">
      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl text-ice">{customer.user.name ?? customer.user.email}</h1>
      </section>

      <section>
        <h2 className="mb-4 text-ice">Active Projects</h2>
        <div className="space-y-4">
          {projectsWithProgress.length === 0 && <p className="text-ice/40">No projects yet.</p>}
          {projectsWithProgress.map(({ project, progress }) => (
            <Link key={project.id} href={`/portal/projects/${project.id}`} className="glass-panel block rounded-2xl p-6 transition hover:shadow-gold-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ice">{project.name}</p>
                  <p className="text-sm text-ice/40">{progress.currentPhaseLabel}</p>
                </div>
                <span className={`text-sm ${progress.isException ? "text-red-400" : "text-gold"}`}>
                  {progress.isException ? "Needs attention" : `${progress.percent}%`}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${progress.isException ? "bg-red-400" : "bg-gold"}`}
                  style={{ width: `${progress.isException ? 100 : progress.percent}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-ice">Orders</h2>
        <div className="glass-panel divide-y divide-white/5 rounded-2xl">
          {customer.orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="text-ice">{order.items.map((i) => i.product.name).join(", ")}</p>
                <p className="text-ice/40">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-champagne">{(order.totalCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}</p>
                <p className="text-ice/40">{order.status}</p>
              </div>
            </div>
          ))}
          {customer.orders.length === 0 && <p className="p-4 text-ice/40">No orders yet.</p>}
        </div>
      </section>
    </div>
  );
}
