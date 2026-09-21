import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { UnsubscribeForm } from "@/components/followups/UnsubscribeForm";
import { decodeEmailParam, maskEmail, verifyUnsubscribeToken } from "@/lib/followups/optout";

export const metadata: Metadata = { title: "Stop follow-up emails", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function UnsubscribePage({ searchParams }: { searchParams: { e?: string; t?: string } }) {
  const email = searchParams.e ? decodeEmailParam(searchParams.e) : null;
  const valid = Boolean(email && searchParams.t && verifyUnsubscribeToken(email, searchParams.t));
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-xl px-6 pb-28 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Patient Creations</p>
        <h1 className="mt-3 font-display text-3xl text-ice">Stop follow-up emails</h1>
        {valid && email ? (
          <>
            <p className="mt-4 text-ice/60">
              Stop follow-up emails to <span className="text-ice">{maskEmail(email)}</span>? You will still get messages about an order you have placed, such as receipts and project updates.
            </p>
            <UnsubscribeForm e={searchParams.e!} t={searchParams.t!} />
          </>
        ) : (
          <p className="mt-4 text-ice/60">That link is not valid. Reply to any of our emails and say &ldquo;no thanks&rdquo;, and we will stop them.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
