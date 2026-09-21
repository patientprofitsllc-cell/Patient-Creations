import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { CopyBox } from "@/components/prospects/CopyBox";
import { PartnerLeadForm } from "@/components/partners/PartnerLeadForm";
import { PARTNER, usd } from "@/lib/pricing/catalog";
import { CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { ASSET_RULES, PARTNER_TOKEN_RE } from "@/lib/partners/rules";
import { approveMaturedPartnerCommissions, loadPartnerDashboard } from "@/lib/partners/service";

export const metadata: Metadata = { title: "Partner dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const day = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-xs text-ice/40">{label}</p>
      <p className="mt-1 font-display text-2xl text-ice">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-snug text-ice/40">{note}</p>}
    </div>
  );
}

// Private: only someone with this exact link can open it. It shows one partner's own numbers and nothing else.
export default async function PartnerDashboardPage({ params }: { params: { token: string } }) {
  if (!PARTNER_TOKEN_RE.test(params.token)) notFound();
  await approveMaturedPartnerCommissions().catch(() => undefined);
  const d = await loadPartnerDashboard(params.token);
  if (!d) notFound();
  const active = d.partner.status === "ACTIVE";

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl space-y-10 px-5 pb-28 pt-32 sm:px-6 sm:pt-40">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Partner dashboard</p>
          <h1 className="mt-2 font-display text-3xl text-ice sm:text-4xl">{d.partner.company || d.partner.name}</h1>
          <p className="mt-1 text-sm text-ice/50">
            {d.partner.type} · {d.partner.status === "ACTIVE" ? `earning ${d.partner.percent}%` : d.partner.status === "PAUSED" ? "paused" : "under review"}
          </p>
        </div>

        {d.partner.status === "APPLIED" && (
          <p role="status" className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-sm text-ice/80">
            Your application is being reviewed. We will email you when we have decided, and your link and tools will appear here.
          </p>
        )}
        {d.partner.status === "PAUSED" && (
          <p role="status" className="rounded-2xl border border-red-300/30 bg-red-300/5 p-5 text-sm text-ice/80">
            Your partner account is paused, so new orders are not earning commissions. Commissions you already earned are still handled as described below. Please reply to our email or call us to talk about it.
          </p>
        )}

        {d.link && active && (
          <section aria-label="Your link" className="space-y-3">
            <CopyBox label="Your partner link" text={d.link} hint="Anyone who signs up through this link counts as yours. It is private to you, so do not put it anywhere you would not want a commission tracked." />
          </section>
        )}

        {active || d.partner.status === "PAUSED" ? (
          <>
            <section aria-label="Your numbers">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <Tile label="Link visits" value={String(d.stats.clicks)} />
                <Tile label="Leads you introduced" value={String(d.stats.leads)} />
                <Tile label="Customers who ordered" value={String(d.stats.customers)} note={`${d.stats.signups} signed up in all`} />
                <Tile label="Pending" value={usd(d.totals.pendingCents)} note={`Held ${PARTNER.pendingDays} days, then approved once the whole order is paid.`} />
                <Tile label="Approved" value={usd(d.totals.approvedCents)} note={`Waiting to be paid. We pay by hand and may wait until it reaches ${usd(PARTNER.minPayoutCents)}.`} />
                <Tile label="Paid" value={usd(d.totals.paidCents)} />
              </div>
            </section>

            <section aria-label="Commissions">
              <h2 className="mb-3 text-ice">Commissions</h2>
              {d.commissions.length === 0 ? (
                <p className="text-sm text-ice/40">None yet. When someone you referred pays for an order, it shows up here.</p>
              ) : (
                <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
                  {d.commissions.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                      <span>
                        <span className="text-ice">{c.what}</span>
                        <span className="mt-0.5 block text-xs text-ice/40">{day(c.when)}</span>
                        {c.detail && <span className="mt-0.5 block text-xs text-ice/50">{c.detail}</span>}
                      </span>
                      <span className="text-right">
                        <span className="block text-champagne">{usd(c.commissionCents)}</span>
                        <span className="block text-xs text-ice/50">{c.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-label="Customers and leads" className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-ice">Your customers</h2>
                {d.customers.length === 0 ? (
                  <p className="text-sm text-ice/40">Nobody has signed up through your link yet.</p>
                ) : (
                  <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
                    {d.customers.map((c, i) => (
                      <li key={i} className="flex justify-between gap-3 px-5 py-3">
                        <span className="text-ice">{c.firstName}</span>
                        <span className="text-ice/50">{c.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h2 className="mb-3 text-ice">Your leads</h2>
                {d.leads.length === 0 ? (
                  <p className="text-sm text-ice/40">Businesses you introduce to us show up here.</p>
                ) : (
                  <ul className="glass-panel divide-y divide-white/5 rounded-2xl text-sm">
                    {d.leads.map((l, i) => (
                      <li key={i} className="flex justify-between gap-3 px-5 py-3">
                        <span className="text-ice">{l.name}</span>
                        <span className="text-ice/50">{l.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {active && <PartnerLeadForm token={params.token} />}

            {active && d.assets.length > 0 && (
              <section aria-label="Marketing assets" className="space-y-4">
                <div>
                  <h2 className="text-ice">Ready-made words</h2>
                  <p className="mt-1 text-sm text-ice/50">Each one carries your link and a commission disclosure. Change them to sound like you, but keep the disclosure.</p>
                </div>
                {d.assets.map((a) => (
                  <CopyBox key={a.id} label={a.title} hint={a.where} text={a.text} />
                ))}
                <div className="rounded-2xl border border-white/10 p-5">
                  <p className="text-sm text-ice/80">The rules that keep this honest</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ice/60">
                    {ASSET_RULES.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-ice/40">
                    Full details in the <Link href="/partner-terms" className="text-gold underline">Partner Program Terms</Link>.
                  </p>
                </div>
              </section>
            )}
          </>
        ) : null}

        <p className="text-xs text-ice/40">Questions about anything here? Reply to any email from us, or call {CONTACT_PHONE_DISPLAY}.</p>
      </main>
      <SiteFooter />
    </>
  );
}
