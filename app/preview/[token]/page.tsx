import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PreviewActions } from "@/components/preview/PreviewActions";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { loadPreview } from "@/lib/site/build/preview";

// A private page: the token is the only credential, so it is never indexed,
// never sent to other sites in a Referer header, and always read fresh.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your website preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PreviewPage({ params }: { params: { token: string } }) {
  const preview = await loadPreview(params.token);
  if (!preview) notFound();
  const { project, build, openRevision, revisionsUsed, revisionLimit } = preview;
  const statusPath = project.statusToken ? `/status/${project.statusToken}` : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Website preview · version {build.version}</p>
        <h1 className="mt-2 font-display text-3xl text-ice sm:text-4xl">{project.name}</h1>

        <div className="mt-6">
          {build.status === "LIVE" ? (
            <div className="glass-panel rounded-2xl p-5 text-center">
              <p className="font-display text-xl text-ice">Your website is live.</p>
              {build.liveUrl && (
                <a href={build.liveUrl} rel="noopener noreferrer" className="mt-1 inline-block break-all py-3 text-gold hover:brightness-110">
                  {build.liveUrl}
                </a>
              )}
            </div>
          ) : build.status === "APPROVED" ? (
            <div className="glass-panel rounded-2xl p-5 text-center">
              <p className="font-display text-xl text-ice">Approved. We&apos;re launching it.</p>
              <p className="mt-1 text-sm text-ice/50">You&apos;ll see it announced on your project page as soon as it&apos;s live.</p>
            </div>
          ) : openRevision ? (
            <div className="glass-panel rounded-2xl p-5 text-center">
              <p className="font-display text-xl text-ice">Your change request is in.</p>
              <p className="mt-1 text-sm text-ice/50">We&apos;ll post your updated preview on your project page and email you the moment it&apos;s ready.</p>
            </div>
          ) : (
            <PreviewActions token={params.token} canRevise={revisionsUsed < revisionLimit} />
          )}
        </div>

        <p className="mt-6 text-xs text-ice/40">
          This is how your page will look. The buttons and links are switched on when it goes live.
          {revisionsUsed >= revisionLimit && build.status === "PREVIEW" && !openRevision
            ? " You've used your included revision; tell us what else you'd like on your project page and we'll quote it."
            : ""}
        </p>
        <iframe
          title={`Preview of ${project.name}`}
          sandbox=""
          srcDoc={build.html}
          className="mt-3 h-[70vh] w-full rounded-xl border border-white/10 bg-white"
        />

        {statusPath && (
          <p className="mt-6 text-center text-sm">
            <Link href={statusPath} className="inline-block py-3 text-gold hover:brightness-110">
              ← Back to my project page
            </Link>
          </p>
        )}
      </main>
    </>
  );
}
