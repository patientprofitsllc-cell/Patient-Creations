import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { AutoRefresh } from "@/components/tracking/AutoRefresh";
import { BillingButton, BriefForm } from "@/components/ads/ManagePanels";
import { money } from "@/components/home/specialFrame";
import { db } from "@/lib/db";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { AD_TIMING_NOTE, adTimingNoteFor, BRIEF_FIELDS, getAdPlan, planIncludes, type BriefKey } from "@/lib/ads/plans";
import { TOKEN_SHAPE } from "@/lib/ads/access";
import { deliveryProgress } from "@/lib/ads/data";

// Always current: it shows payment, the brief, and what has been delivered.
export const dynamic = "force-dynamic";

// A private page: never indexed, and the token in the URL is never sent to other sites.
export const metadata: Metadata = { title: "Your Monthly Ads plan", robots: { index: false, follow: false }, referrer: "no-referrer" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Waiting for payment",
  ACTIVE: "Active",
  PAST_DUE: "Payment failed, retrying",
  CANCELED: "Canceled",
};

const dateLabel = (d: Date) => d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" });

export default async function ManageAdPlanPage({ params, searchParams }: { params: { token: string }; searchParams: { started?: string } }) {
  if (!TOKEN_SHAPE.test(params.token)) notFound();
  const sub = await db.adSubscription.findUnique({ where: { manageToken: params.token }, include: { deliveries: { orderBy: { createdAt: "desc" }, take: 50 } } });
  if (!sub) notFound();

  const plan = getAdPlan(sub.planSlug);
  const live = sub.status === "ACTIVE" || sub.status === "PAST_DUE";
  const progress = await deliveryProgress(sub.id, sub.planSlug);
  let brief: Partial<Record<BriefKey, string>> = {};
  try {
    brief = JSON.parse(sub.briefJson) as Partial<Record<BriefKey, string>>;
  } catch {
    /* an unreadable brief just shows empty */
  }
  const briefDone = Boolean(brief.offer);

  return (
    <>
      <SiteHeader />
      <AutoRefresh active={sub.status === "PENDING"} />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Your Monthly Ads plan</p>
        <h1 className="mt-2 font-display text-3xl text-ice sm:text-4xl">{sub.businessName}</h1>
        <p className="mt-2 text-sm text-ice/60">
          {plan?.name ?? sub.planSlug} · {money(sub.priceCents)} a month ·{" "}
          <span className={sub.status === "ACTIVE" ? "text-champagne" : sub.status === "PAST_DUE" ? "text-red-300" : "text-ice/70"}>{STATUS_LABEL[sub.status] ?? sub.status}</span>
        </p>

        {sub.status === "PENDING" && (
          <div role="status" className="glass-panel mt-6 rounded-2xl p-5">
            <p className="font-display text-xl text-ice">{searchParams.started ? "Thank you. We are confirming your payment." : "Your plan is waiting for payment."}</p>
            <p className="mt-1 text-sm text-ice/60">This page updates by itself as soon as the payment is confirmed, usually within a minute. If it does not, email {CONTACT_EMAIL}.</p>
          </div>
        )}

        {sub.status === "PAST_DUE" && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/5 p-5 text-sm text-ice/80">
            The latest payment did not go through. Stripe will retry, and you can update your card with the billing button below.
          </div>
        )}

        {sub.cancelAtPeriodEnd && sub.currentPeriodEnd && (
          <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-ice/70">Your plan is set to end on {dateLabel(sub.currentPeriodEnd)} and will not renew.</p>
        )}

        {live && (
          <>
            <section className="glass-panel mt-8 rounded-2xl p-6" aria-labelledby="month-title">
              <h2 id="month-title" className="font-display text-xl text-ice">
                This month
              </h2>
              <p className="mt-1 text-sm text-ice/60">
                {progress.delivered} of {progress.included} items delivered so far this month.
                {sub.currentPeriodEnd && !sub.cancelAtPeriodEnd ? ` Next renewal: ${dateLabel(sub.currentPeriodEnd)}.` : ""}
              </p>
              {plan && (
                <ul className="mt-4 space-y-1.5">
                  {planIncludes(plan).map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ice/80">
                      <span aria-hidden className="mt-0.5 text-gold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-ice/40">{plan ? adTimingNoteFor(plan) : AD_TIMING_NOTE} Unused ads and revisions do not carry over to the next month.</p>
            </section>

            <section className="mt-8" aria-labelledby="brief-title">
              <h2 id="brief-title" className="font-display text-xl text-ice">
                This month&apos;s brief
              </h2>
              <p className="mt-1 text-sm text-ice/60">
                {briefDone ? "Thank you, we have your brief. You can update it any time before we start on the month's ads." : "Fill this in so we can start. A few words is enough for most questions."} Send photos and logos by email to {CONTACT_EMAIL}, or book a video call.
              </p>
              <div className="glass-panel mt-4 rounded-2xl p-6">
                <BriefForm token={params.token} initial={brief} disabled={!live} />
              </div>
            </section>

            <section className="mt-8" aria-labelledby="delivered-title">
              <h2 id="delivered-title" className="font-display text-xl text-ice">
                Delivered to you
              </h2>
              {sub.deliveries.length === 0 ? (
                <p className="mt-2 text-sm text-ice/50">Nothing has been delivered yet. When we finish a batch it will appear here with a download link.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {sub.deliveries.map((d) => (
                    <li key={d.id} className="glass-panel rounded-xl p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
                        {d.period} · {d.itemsCount} {d.itemsCount === 1 ? "item" : "items"}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-ice/80">{d.note}</p>
                      {d.url && /^https:\/\//i.test(d.url) && (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-gold underline">
                          Download or view
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <section className="glass-panel mt-10 rounded-2xl p-6" aria-labelledby="billing-title">
          <h2 id="billing-title" className="font-display text-xl text-ice">
            Billing
          </h2>
          <p className="mt-1 text-sm text-ice/60">Update your card or cancel any time. Cancelling takes effect at the end of the month you have paid for, and we do not refund the current month.</p>
          <div className="mt-4">{sub.stripeCustomerId && !sub.stripeCustomerId.startsWith("mock_") ? <BillingButton token={params.token} /> : <p className="text-sm text-ice/50">To change or cancel your plan, email {CONTACT_EMAIL}.</p>}</div>
        </section>

        <p className="mt-8 text-center text-xs text-ice/40">
          Questions? Email {CONTACT_EMAIL} or call {CONTACT_PHONE_DISPLAY}. Keep this link private: anyone who has it can see your plan.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
