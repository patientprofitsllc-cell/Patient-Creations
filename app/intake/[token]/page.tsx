import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { IntakeWizard, type IntakeValues } from "@/components/intake/IntakeWizard";
import { db } from "@/lib/db";

// A private page: the token is the only credential, so it is never indexed
// and never sent to other sites in a Referer header. Always read fresh.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your website intake",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function IntakePage({ params }: { params: { token: string } }) {
  const intake = await db.websiteIntake.findUnique({
    where: { token: params.token },
    include: { order: { include: { project: { select: { statusToken: true } } } } },
  });
  if (!intake) notFound();

  const statusToken = intake.order.project?.statusToken ?? null;
  const statusPath = statusToken ? `/status/${statusToken}` : null;

  const initial: IntakeValues = {
    businessName: intake.businessName,
    businessType: intake.businessType,
    phone: intake.phone,
    existingWebsite: intake.existingWebsite ?? "",
    description: intake.description ?? "",
    address: intake.address ?? "",
    hours: intake.hours ?? "",
    services: intake.services ?? "",
    pricing: intake.pricing ?? "",
    bookingUrl: intake.bookingUrl ?? "",
    socialUrls: intake.socialUrls ?? "",
    logoUrl: intake.logoUrl ?? "",
    colors: intake.colors ?? "",
    fontStyle: intake.fontStyle ?? "",
    styleNotes: intake.styleNotes ?? "",
    mediaLinks: intake.mediaLinks ?? "",
    goal: intake.goal ?? "",
    goalNotes: intake.goalNotes ?? "",
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Website intake</p>
        <h1 className="mt-2 font-display text-4xl text-ice">Tell us about your business</h1>

        {intake.status === "COMPLETE" ? (
          <div className="glass-panel mt-8 rounded-2xl p-8 text-center">
            <p className="font-display text-2xl text-ice">Your intake is in.</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ice/60">
              Thanks, the team has everything they need. Follow progress on your private project page.
            </p>
            {statusPath && (
              <Link
                href={statusPath}
                className="mt-6 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
              >
                Open my project page
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-ice/50">
              About 3 to 5 minutes. Your answers save as you go, so you can leave and come back to this same link. Skip
              anything you don&apos;t have.
            </p>
            <div className="mt-8">
              <IntakeWizard token={params.token} initial={initial} statusPath={statusPath} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
