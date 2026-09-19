import Link from "next/link";
import type { Tracker, TrackerStep } from "@/lib/tracking/tracker";

// The customer's tracking screen: where the order is, what's next, and who the
// ball is with, in the spirit of a package tracker. Pure display: all the logic
// lives in lib/tracking/tracker.ts.

const TIME_ZONE = "America/New_York";

function when(at: Date | null): string | null {
  if (!at) return null;
  return `${at.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE })} ET`;
}

function Dot({ state }: { state: TrackerStep["state"] }) {
  const base = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold";
  if (state === "done")
    return (
      <span className={`${base} bg-gold text-obsidian`} aria-label="Done">
        ✓
      </span>
    );
  if (state === "attention")
    return (
      <span className={`${base} border-2 border-champagne bg-champagne/30 text-sm font-bold text-champagne`} aria-label="Needs you">
        !
      </span>
    );
  if (state === "current")
    return (
      <span className={`${base} animate-pulseGlow border-2 border-gold bg-obsidian text-gold`} aria-label="In progress">
        <span className="h-2 w-2 rounded-full bg-gold" />
      </span>
    );
  return <span className={`${base} border border-white/15 bg-obsidian`} aria-label="Coming up" />;
}

const labelClass = (state: TrackerStep["state"]) => (state === "upcoming" ? "text-ice/40" : "text-ice");

export function TrackingCard({ tracker, intakeHref, previewHref }: { tracker: Tracker; intakeHref?: string | null; previewHref?: string | null }) {
  const { steps, total } = tracker;
  const doneCount = steps.filter((s) => s.state === "done").length;
  const fill = Math.min(100, (Math.min(doneCount, total - 1) / (total - 1)) * 100);
  const href = tracker.action?.kind === "intake" ? intakeHref : tracker.action?.kind === "preview" ? previewHref : null;

  const badge =
    tracker.waitingOn === "you"
      ? { text: "Waiting on you", cls: "border-champagne/50 bg-champagne/15 text-champagne" }
      : tracker.waitingOn === "us"
        ? { text: "We're on it", cls: "border-gold/40 bg-gold/10 text-gold" }
        : { text: "Complete", cls: "border-gold/40 bg-gold/10 text-gold" };

  const targetText = tracker.target
    ? tracker.target.at && tracker.target.text === "Our target"
      ? `Our target: live by ${when(tracker.target.at)}. It's a target, not a guarantee.`
      : tracker.target.text
    : null;

  return (
    <section aria-label="Order tracking" className="glass-panel mt-8 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70">
          Step {tracker.stepNumber} of {total}
        </p>
        <span className={`rounded-full border px-3 py-1 text-xs ${badge.cls}`}>{badge.text}</span>
      </div>

      <h2 className="mt-3 font-display text-3xl text-ice sm:text-4xl">{tracker.headline}</h2>
      <p className="mt-2 text-ice/60">{tracker.detail}</p>

      {tracker.action && href && (
        <Link
          href={href}
          className="mt-5 inline-block rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-3 text-sm font-semibold tracking-wide text-obsidian shadow-gold-glow transition hover:brightness-110"
        >
          {tracker.action.label}
        </Link>
      )}

      {/* Progress bar */}
      <div className="mt-6" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={tracker.percent} aria-label="How close your order is to done">
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold transition-all duration-700" style={{ width: `${tracker.percent}%` }} />
        </div>
        <p className="mt-1 text-right text-xs text-ice/40">{tracker.percent}% of the way there</p>
      </div>

      {/* Steps: horizontal on wider screens */}
      <div className="relative mt-6 hidden sm:block">
        <div aria-hidden className="absolute top-3.5 h-0.5 bg-white/10" style={{ left: `${50 / total}%`, right: `${50 / total}%` }}>
          <div className="h-full bg-gold transition-all duration-700" style={{ width: `${fill}%` }} />
        </div>
        <ol className="relative grid" data-testid="tracker-horizontal" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {steps.map((s) => (
          <li key={s.key} className="relative flex flex-col items-center px-1 text-center">
            <Dot state={s.state} />
            <p className={`mt-3 text-sm ${labelClass(s.state)}`}>{s.label}</p>
            {when(s.at) && <p className="mt-1 text-xs text-ice/40">{when(s.at)}</p>}
            {s.note && s.state !== "done" && <p className="mt-1 text-xs text-gold/80">{s.note}</p>}
            {s.note && s.state === "done" && s.key === "live" && (
              <p className="mt-1 max-w-full break-all text-xs text-gold/80">{s.note}</p>
            )}
          </li>
        ))}
        </ol>
      </div>

      {/* Steps: vertical on phones */}
      <ol className="mt-6 sm:hidden">
        {steps.map((s, i) => (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className={`absolute left-[13px] top-7 h-full w-0.5 ${s.state === "done" ? "bg-gold" : "bg-white/10"}`} />}
            <Dot state={s.state} />
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm ${labelClass(s.state)}`}>{s.label}</p>
              {when(s.at) && <p className="mt-0.5 text-xs text-ice/40">{when(s.at)}</p>}
              {s.note && (s.state !== "done" || s.key === "live") && <p className="mt-0.5 break-all text-xs text-gold/80">{s.note}</p>}
            </div>
          </li>
        ))}
      </ol>

      {targetText && <p className="mt-6 border-t border-white/5 pt-4 text-sm text-ice/60">{targetText}</p>}
    </section>
  );
}
