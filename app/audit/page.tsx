import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { AuditForm } from "@/components/audit/AuditForm";
import { AUDIT_DEFINITIONS } from "@/lib/audit/growthAudit";
import { INDUSTRIES } from "@/lib/site/industries";

export const metadata: Metadata = {
  title: "Free Business Growth Audit",
  description: "See what Patient Creations could improve in your business. We read your public homepage and what you tell us, and show you what we saw, what we suggest, and what it costs.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 pb-28 pt-32 text-center sm:pt-40">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Free Business Growth Audit</p>
        <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">See what Patient Creations could improve in your business.</h1>
        <p className="mx-auto mt-4 max-w-xl text-ice/60">
          Tell us about your business. We read your public homepage and show you, in plain words, what we saw, what we suggest, and what it would cost. It takes about a minute and it is free.
        </p>
        <dl className="mx-auto mt-6 grid max-w-2xl gap-3 text-left text-sm sm:grid-cols-3">
          {(["observed", "recommended", "estimated"] as const).map((k) => (
            <div key={k} className="rounded-xl border border-white/10 p-3">
              <dt className="text-xs uppercase tracking-[0.2em] text-gold/70">{k}</dt>
              <dd className="mt-1 text-xs text-ice/50">{AUDIT_DEFINITIONS[k]}</dd>
            </div>
          ))}
        </dl>
        <AuditForm industries={INDUSTRIES.map((i) => i.singular)} />
      </main>
      <SiteFooter />
    </>
  );
}
