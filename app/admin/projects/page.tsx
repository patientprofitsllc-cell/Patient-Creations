import Link from "next/link";
import { db } from "@/lib/db";
import { getProjectProgress } from "@/lib/workflows/progress";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({ orderBy: { createdAt: "desc" }, include: { customer: { include: { user: true } } } });
  const withProgress = await Promise.all(projects.map(async (p) => ({ p, progress: await getProjectProgress(p.id) })));

  return (
    <div className="glass-panel divide-y divide-white/5 rounded-2xl">
      {withProgress.map(({ p, progress }) => (
        <div key={p.id} className="flex items-center justify-between p-4 text-sm">
          <div>
            <p className="text-ice">{p.name}</p>
            <Link href={`/admin/crm/${p.customerId}`} className="text-ice/40 hover:text-gold">{p.customer.user.email}</Link>
          </div>
          <div className="text-right">
            <p className={progress.isException ? "text-red-400" : "text-gold"}>{p.state}</p>
            <p className="text-ice/40">{progress.isException ? "Exception" : `${progress.percent}%`}</p>
          </div>
          <Link href={`/admin/logs/session/${p.id}`} className="ml-4 whitespace-nowrap text-xs text-ice/40 hover:text-gold">
            View session →
          </Link>
        </div>
      ))}
      {withProgress.length === 0 && <p className="p-4 text-ice/40">No projects yet.</p>}
    </div>
  );
}
