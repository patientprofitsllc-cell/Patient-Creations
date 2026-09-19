import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyBox } from "@/components/prospects/CopyBox";
import { ProspectControls } from "@/components/prospects/ProspectControls";
import { db } from "@/lib/db";
import type { AuditResult } from "@/lib/prospects/audit";
import { draftOutreach } from "@/lib/prospects/outreach";
import { getOfferProduct } from "@/lib/site/offerData";
import { FALLBACK_OFFER_PRICE_CENTS } from "@/lib/site/offerData";

export default async function ProspectDetailPage({ params }: { params: { id: string } }) {
  const prospect = await db.prospect.findUnique({ where: { id: params.id } });
  if (!prospect) notFound();

  const offer = await getOfferProduct();
  let audit: AuditResult | null = null;
  try {
    audit = prospect.auditJson ? (JSON.parse(prospect.auditJson) as AuditResult) : null;
  } catch {
    audit = null;
  }
  const blocked = prospect.status === "DO_NOT_CONTACT";
  const drafts = blocked
    ? null
    : draftOutreach(
        { businessName: prospect.businessName, industrySlug: prospect.industry, audit },
        { priceCents: offer?.priceCents ?? FALLBACK_OFFER_PRICE_CENTS, mailingAddress: process.env.OUTREACH_MAILING_ADDRESS },
      );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/prospects" className="text-xs text-ice/40 hover:text-gold">
          ← All prospects
        </Link>
        <h2 className="mt-2 font-display text-3xl text-ice">{prospect.businessName}</h2>
        <p className="text-sm text-ice/40">
          {[prospect.industry, prospect.city, prospect.website].filter(Boolean).join(" · ")}
        </p>
      </div>

      <ProspectControls
        id={prospect.id}
        status={prospect.status}
        nextFollowUp={prospect.nextFollowUpAt ? prospect.nextFollowUpAt.toISOString().slice(0, 10) : ""}
        hasWebsite={Boolean(prospect.website)}
        phone={prospect.phone ?? ""}
        email={prospect.email ?? ""}
        website={prospect.website ?? ""}
      />

      <section>
        <h3 className="mb-3 text-ice/70">Website check</h3>
        {!audit ? (
          <p className="text-sm text-ice/40">Not checked yet. Use the button above.</p>
        ) : (
          <div className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-ice/40">
              Checked {prospect.auditedAt?.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              {audit.finalUrl ? ` · ${audit.finalUrl}` : ""}
            </p>
            <ul className="mt-3 space-y-2">
              {audit.findings.map((f) => (
                <li key={f.key} className="flex items-start gap-3 text-sm">
                  <span aria-hidden className={f.ok === true ? "text-gold" : f.ok === false ? "text-red-400" : "text-ice/30"}>
                    {f.ok === true ? "✓" : f.ok === false ? "✕" : "?"}
                  </span>
                  <span className="text-ice/80">
                    {f.label}
                    {f.detail && <span className="block text-xs text-ice/40">{f.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ice/40">
              This only reports what could be seen in the page itself. It doesn&apos;t judge design or say anything about search results or traffic.
            </p>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-ice/70">Message drafts</h3>
        {blocked || !drafts ? (
          <p className="text-sm text-ice/40">This business asked not to be contacted, so no drafts are shown.</p>
        ) : (
          <div className="space-y-4">
            {drafts.warnings.length > 0 && (
              <ul className="list-disc space-y-1 rounded-xl border border-gold/30 bg-gold/5 p-4 pl-8 text-xs text-ice/70">
                {drafts.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <CopyBox label={`Email · subject: ${drafts.emailSubject}`} text={drafts.email} hint="Review it before sending, and send it yourself." />
            <CopyBox label="Short message (for a DM or text-length note)" text={drafts.dm} hint="Only message people who use that channel for business. Texting strangers has legal rules, so email or a direct message is safer." />
            <CopyBox label="Follow-up after 3 days" text={drafts.followUp1} />
            <CopyBox label="Last follow-up after a week" text={drafts.followUp2} />
          </div>
        )}
      </section>

      {prospect.notes && (
        <section>
          <h3 className="mb-3 text-ice/70">Notes</h3>
          <pre className="glass-panel whitespace-pre-wrap rounded-2xl p-5 font-sans text-sm text-ice/70">{prospect.notes}</pre>
        </section>
      )}
    </div>
  );
}
