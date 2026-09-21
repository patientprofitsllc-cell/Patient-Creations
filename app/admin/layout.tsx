import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";

const TABS = [
  { href: "/admin/dashboard", label: "Business" },
  { href: "/admin/growth", label: "Growth" },
  { href: "/admin/prospects", label: "Prospects" },
  { href: "/admin/audits", label: "Audits" },
  { href: "/admin/followups", label: "Follow-ups" },
  { href: "/admin/ads", label: "Monthly Ads" },
  { href: "/admin/crm", label: "CRM" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/projects", label: "Production" },
  { href: "/admin/logs", label: "Sessions & Logs" },
  { href: "/admin/system", label: "System Health" },
];

// Every page under here reads live business/production data and requires
// an authenticated admin session — never eligible for build-time static
// generation (it would otherwise freeze the dashboard at whatever data
// existed the moment `next build` ran).
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-obsidian text-ice">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Admin Command Center · The Digital Master</p>
        <h1 className="mt-2 font-display text-3xl text-ice">Patient Creations</h1>
        <nav className="mt-8 flex gap-6 overflow-x-auto whitespace-nowrap border-b border-white/10 pb-4 text-sm text-ice/50">
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href} className="shrink-0 hover:text-gold">
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
