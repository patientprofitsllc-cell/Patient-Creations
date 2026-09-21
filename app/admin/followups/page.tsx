import { FollowupRow, SendAllFollowups } from "@/components/followups/FollowupButtons";
import { FOLLOWUP_LABELS, MIN_GAP_DAYS, type FollowupKind } from "@/lib/followups/rules";
import { listFollowups, recentFollowups } from "@/lib/followups/service";

const when = (d: Date) => d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default async function FollowupsPage() {
  const [{ items, hasAddress }, recent] = await Promise.all([listFollowups(), recentFollowups()]);
  const ready = items.filter((i) => !i.blockedReason);
  const cronOn = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 24);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl text-ice">Follow-ups</h2>
        <p className="mt-2 max-w-2xl text-sm text-ice/50">
          People who are due a follow-up, in the order they became due. Nothing is sent until you send it here{cronOn ? ", or the automatic daily trigger runs (it is on)" : ""}. Nobody gets more than one within {MIN_GAP_DAYS} days,
          nobody gets the same one twice, and anyone who opted out is skipped.
        </p>
      </div>

      {!hasAddress && (
        <div role="alert" className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-sm text-amber-100">
          <p className="font-semibold">Add your business mailing address before sending follow-ups.</p>
          <p className="mt-1 text-amber-100/80">
            Marketing email must carry a real postal address by law (CAN-SPAM). Set <code>OUTREACH_MAILING_ADDRESS</code> in your hosting settings, for example &ldquo;123 Main St, Atlanta, GA 30303&rdquo;. Sending is switched off until you do.
          </p>
        </div>
      )}

      <section className="glass-panel rounded-2xl">
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-ice">Due now ({items.length})</p>
          <SendAllFollowups readyCount={hasAddress ? ready.length : 0} />
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ice/40">Nobody is due a follow-up right now.</p>
        ) : (
          <ul>
            {items.map((i) => (
              <FollowupRow key={i.id} id={i.id} label={i.label} email={i.email} why={i.why} subject={i.subject} blockedReason={i.blockedReason} />
            ))}
          </ul>
        )}
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <p className="text-ice">The schedule</p>
        <ul className="mt-3 space-y-1 text-sm text-ice/60">
          {(Object.keys(FOLLOWUP_LABELS) as FollowupKind[]).map((k) => (
            <li key={k}>{FOLLOWUP_LABELS[k]}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ice/40">
          To send them automatically once a day, set <code>CRON_SECRET</code> (at least 24 characters) and point a scheduler at <code>/api/cron/followups</code> with the header <code>Authorization: Bearer your-secret</code>. Until you set it, that address does not exist.
          Automatic trigger: {cronOn ? "on" : "off"}.
        </p>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <p className="text-ice">Recently sent</p>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ice/40">Nothing sent yet.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-ice/60">
            {recent.map((r, i) => (
              <li key={i}>
                {when(r.createdAt)}: {FOLLOWUP_LABELS[r.template as FollowupKind] ?? r.template} to {r.toEmail} {r.status !== "SENT" ? `(${r.status.toLowerCase()})` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
