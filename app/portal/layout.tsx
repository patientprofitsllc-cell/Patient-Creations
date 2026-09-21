import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";
import { SiteHeader } from "@/components/shared/SiteHeader";

const TABS = [
  { href: "/portal/dashboard", label: "Dashboard" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/referrals", label: "Referrals" },
];

// Every page under here reads live, per-user DB state and requires an
// authenticated session — never eligible for build-time static generation.
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-32">
        <nav className="mb-10 flex gap-6 border-b border-white/10 pb-4 text-sm text-ice/50">
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href} className="hover:text-gold">
              {tab.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </>
  );
}
