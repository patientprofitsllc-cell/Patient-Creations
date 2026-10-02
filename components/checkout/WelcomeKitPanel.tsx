import { ONBOARDING_KIT_URL } from "@/lib/config/onboarding";

// The eight onboarding documents every buyer gets, in the order they happen. Shown on the thank-you page and linked in
// the confirmation email, so a customer always knows what comes next and what we need from them.
const STEPS = [
  "Welcome",
  "Invoice and terms",
  "Agreement",
  "Your intake",
  "Access we need",
  "Kickoff call",
  "Your project page",
  "Handover",
];

export function WelcomeKitPanel({ kitUrl = ONBOARDING_KIT_URL }: { kitUrl?: string }) {
  return (
    <section aria-labelledby="welcome-kit" className="glass-panel mt-10 rounded-2xl p-6 text-left">
      <h2 id="welcome-kit" className="font-display text-2xl text-ice">
        Your welcome kit
      </h2>
      <p className="mt-2 text-sm text-ice/60">
        Everything about working with us in one place: how it works, your terms, what we need from you, and what you
        get at handover. We&apos;ve emailed it to you too.
      </p>
      <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ice/70 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s}>
            <span className="text-gold">{i + 1}.</span> {s}
          </li>
        ))}
      </ol>
      <a
        href={kitUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block rounded-full bg-gold px-6 py-3 text-sm font-medium text-obsidian transition hover:brightness-110"
      >
        Open your welcome kit
      </a>
    </section>
  );
}
