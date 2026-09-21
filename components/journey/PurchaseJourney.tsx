import type { ThankYouKind } from "@/components/checkout/ThankYouCard";

// "You just took the first step. Here is what happens next." The six real stages of an order, with the customer's
// place among them, so nobody wonders what comes after paying. Pure display.

const STEPS: Record<ThankYouKind, string[]> = {
  website: ["Payment confirmed", "Your intake form", "Your project begins", "Your private preview", "You approve it", "It goes live"],
  project: ["Payment confirmed", "Your kickoff call", "Your project begins", "Your private preview", "You approve it", "Delivery and launch"],
  cards: ["Payment confirmed", "Your card details", "We make your cards", "Your cards ship", "Tap and test", "Ready for customers"],
};

/** Which step the customer is on right now. The first is always done, because they have paid. */
export function currentStepIndex(kind: ThankYouKind, intakePending: boolean): number {
  if (kind === "website") return intakePending ? 1 : 2;
  return 1;
}

export function PurchaseJourney({ kind, intakePending }: { kind: ThankYouKind; intakePending: boolean }) {
  const steps = STEPS[kind];
  const current = currentStepIndex(kind, intakePending);
  return (
    <section className="glass-panel mt-8 rounded-2xl p-6 text-left" aria-labelledby="journey-title">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">What happens next</p>
      <h2 id="journey-title" className="mt-2 font-display text-2xl text-ice">
        You just took the first step.
      </h2>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((label, i) => {
          const state = i < current ? "done" : i === current ? "current" : "next";
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                state === "current" ? "border-gold bg-gold/10 text-ice" : state === "done" ? "border-white/10 text-ice/70" : "border-white/5 text-ice/40"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  state === "done" ? "bg-gold text-obsidian" : state === "current" ? "border border-gold text-gold" : "border border-white/15 text-ice/40"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span>
                {label}
                {state === "current" && <span className="ml-2 text-xs uppercase tracking-wide text-gold">You are here</span>}
                <span className="sr-only">{state === "done" ? " (done)" : state === "current" ? " (current step)" : " (coming up)"}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
