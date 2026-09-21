import Link from "next/link";
import { VisionEditor } from "@/components/founder/FounderSettingsForm";
import { loadFounder } from "@/lib/founder/service";

export const dynamic = "force-dynamic";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Card({ id, title, sub, children }: { id: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="glass-panel space-y-3 rounded-2xl p-5">
      <div>
        <h2 id={id} className="text-xs uppercase tracking-[0.3em] text-gold/70">{title}</h2>
        <p className="mt-1 text-xs text-ice/40">{sub}</p>
      </div>
      {children}
    </section>
  );
}

const Row = ({ label, value, tone }: { label: string; value: string; tone?: "warn" | "ok" }) => (
  <li className="flex justify-between gap-3 text-sm">
    <span className="text-ice/60">{label}</span>
    <span className={tone === "warn" ? "text-red-300" : tone === "ok" ? "text-champagne" : "text-ice"}>{value}</span>
  </li>
);

export default async function FounderPage() {
  const f = await loadFounder();
  const b = f.bottleneck;
  const dateLabel = f.now.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric" });
  const off = f.systems.configured.filter((c) => !c.on);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Founder operating dashboard</p>
          <h1 className="mt-2 font-display text-3xl text-ice">{dateLabel}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ice/50">Everything here comes from your real orders, leads, and systems. Priorities are worked out from that data. Nothing is predicted.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/admin/founder/ideas" className="rounded-full border border-white/15 px-4 py-2 text-ice/70 hover:border-gold/40 hover:text-gold">Idea parking lot</Link>
          <Link href="/admin/founder/profit" className="rounded-full border border-white/15 px-4 py-2 text-ice/70 hover:border-gold/40 hover:text-gold">Product profitability</Link>
          <Link href="/admin/revenue" className="rounded-full border border-white/15 px-4 py-2 text-ice/70 hover:border-gold/40 hover:text-gold">Revenue</Link>
        </div>
      </div>

      <section aria-labelledby="bottleneck" className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
        <h2 id="bottleneck" className="text-xs uppercase tracking-[0.3em] text-gold/80">The bottleneck</h2>
        {b.primary ? (
          <>
            <p className="mt-2 font-display text-2xl text-ice">{b.primary.title}</p>
            <p className="mt-2 text-sm text-ice/80">{b.primary.measure}.</p>
            <p className="mt-1 text-xs text-ice/50">Measured against: {b.primary.line}.</p>
            <p className="mt-3 text-sm text-ice">{b.primary.action}</p>
          </>
        ) : (
          <p className="mt-2 text-ice/80">{b.note}</p>
        )}
        {b.primary && <p className="mt-3 text-xs text-ice/50">{b.note}</p>}
        <details className="mt-4">
          <summary className="min-h-[44px] cursor-pointer text-sm text-gold">How this was decided</summary>
          <p className="mt-2 text-xs text-ice/50">The path is checked from the top, and the first stage that is broken is the constraint. Fixing something lower down first only sends more people into the same leak.</p>
          <ul className="mt-3 space-y-2">
            {b.signals.map((s) => (
              <li key={s.key} className="rounded-lg border border-white/10 p-3 text-sm">
                <p className="text-ice">{s.triggered ? "Broken: " : s.judged ? "Fine: " : "Not enough data: "}{s.title}</p>
                <p className="text-xs text-ice/50">{s.measure}. Line: {s.line}.</p>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-labelledby="brief" className="space-y-4">
        <div>
          <h2 id="brief" className="font-display text-2xl text-ice">Founder Operating Brief</h2>
          <p className="mt-1 text-sm text-ice/50">The eight questions, answered from your data. If you set CRON_SECRET, this can also arrive by email each morning.</p>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/80">Today&apos;s highest-leverage task</p>
          <p className="mt-2 text-ice">{f.brief.task.title}</p>
          <p className="mt-1 text-sm text-ice/60">{f.brief.task.reason}</p>
        </div>
        <ol className="grid gap-3 md:grid-cols-2">
          {f.brief.items.slice(0, 7).map((i) => (
            <li key={i.n} className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-ice">{i.n}. {i.question}</p>
              <ul className="mt-2 space-y-1 text-sm text-ice/60">
                {i.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card id="vision" title="Vision" sub="Long-term goals.">
          <ul className="space-y-1">
            <Row label="Monthly target" value={money(f.vision.targetCents)} />
            <Row label="This month so far" value={money(f.vision.monthToDateCents)} />
          </ul>
          <VisionEditor initial={f.vision.text} />
        </Card>

        <Card id="sales" title="Sales" sub="Today's sales activity.">
          <ul className="space-y-1">
            <Row label="Cash collected today" value={money(f.sales.todayCents)} />
            <Row label="Follow-ups overdue or cold" value={String(f.sales.leadsDue)} tone={f.sales.leadsDue > 0 ? "warn" : "ok"} />
            <Row label="Open deals in the pipeline" value={money(f.sales.pipelineOpenCents)} />
            <Row label="New leads, 30 days" value={String(f.sales.newLeads30)} />
            <Row label="Calls booked, 30 days" value={String(f.sales.calls30)} />
          </ul>
          <Link href="/admin/crm" className="text-xs text-gold underline">Open the sales pipeline</Link>
        </Card>

        <Card id="relationships" title="Relationships" sub="Partners and referrals.">
          <ul className="space-y-1">
            <Row label="Active partners" value={String(f.relationships.activePartners)} />
            <Row label="Applications waiting" value={String(f.relationships.waiting)} tone={f.relationships.waiting > 0 ? "warn" : "ok"} />
            <Row label="Approved, ready to pay partners" value={money(f.relationships.partnerPayableCents)} tone={f.relationships.partnerPayableCents > 0 ? "warn" : "ok"} />
            <Row label="Customer referral commissions open" value={money(f.relationships.customerCommissionsCents)} />
          </ul>
          <Link href="/admin/partners" className="text-xs text-gold underline">Open partners</Link>
        </Card>

        <Card id="systems" title="Systems" sub="Automation health.">
          <ul className="space-y-1">
            <Row label="Stuck builds" value={String(f.systems.stuckProjects)} tone={f.systems.stuckProjects > 0 ? "warn" : "ok"} />
            <Row label="Production agent runs failed, 24 hours" value={String(f.systems.failedAgentRuns24h)} tone={f.systems.failedAgentRuns24h > 0 ? "warn" : "ok"} />
            <Row label="Quality checks failed, 24 hours" value={String(f.systems.qaFailed24h)} tone={f.systems.qaFailed24h > 0 ? "warn" : "ok"} />
            <Row label="Emails that failed, 24 hours" value={String(f.systems.emailFailures24h)} tone={f.systems.emailFailures24h > 0 ? "warn" : "ok"} />
          </ul>
          <ul className="space-y-1 border-t border-white/10 pt-3">
            {f.systems.configured.map((c) => (
              <li key={c.label} className="flex justify-between gap-3 text-sm">
                <span className="text-ice/60">{c.label}</span>
                <span className={c.on ? "text-champagne" : "text-ice/40"}>{c.on ? "On" : "Off"}</span>
              </li>
            ))}
          </ul>
          {off.length > 0 && <p className="text-xs text-ice/40">Off: {off.map((c) => `${c.label} (${c.fix})`).join(" ")}</p>}
        </Card>

        <Card id="experience" title="Customer experience" sub="Satisfaction and support.">
          <ul className="space-y-1">
            <Row label="Average review, 90 days" value={f.experience.avgRating === null ? "No reviews yet" : `${f.experience.avgRating.toFixed(1)} of 5 (${f.experience.reviews})`} />
            <Row label="Customer messages waiting for you" value={String(f.experience.messagesNeedingYou)} tone={f.experience.messagesNeedingYou > 0 ? "warn" : "ok"} />
            <Row label="Builds stuck" value={String(f.experience.stuckProjects)} tone={f.experience.stuckProjects > 0 ? "warn" : "ok"} />
          </ul>
        </Card>

        <Card id="financials" title="Financials" sub="Revenue and recurring revenue.">
          <ul className="space-y-1">
            <Row label="Cash this month" value={money(f.financials.monthToDateCashCents)} />
            <Row label="Cash, last 30 days" value={money(f.financials.last30Cents)} />
            <Row label="Monthly plans (MRR)" value={money(f.financials.mrrCents)} />
          </ul>
          <Link href="/admin/revenue" className="text-xs text-gold underline">Open revenue and the planning scenario</Link>
        </Card>
      </div>
    </div>
  );
}
