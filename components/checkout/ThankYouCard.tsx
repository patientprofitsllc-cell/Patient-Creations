import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { deliveryLine } from "@/lib/payments/deliveryWindow";
import { TARGET_HOURS } from "@/lib/tracking/tracker";

export type ThankYouKind = "website" | "cards" | "project";

interface WalkStep {
  /** Whose turn it is on this step, so a customer never has to guess who they're waiting on. */
  who: "you" | "us";
  label: string;
  detail: string;
}

// Honest, in order, and specific. No step here promises anything the rest of the app
// doesn't already do: the 72-hour figure is the same TARGET_HOURS the live status page
// uses, and the delivery window and revision count come from the product that was
// actually bought, never a guess.
function revisionDetail(kind: ThankYouKind, revisionLimit: number): string {
  if (kind === "cards") {
    return revisionLimit > 0
      ? `You get ${revisionLimit} round${revisionLimit === 1 ? "" : "s"} of changes before we produce them.`
      : "Cards are produced from what you enter below, so double-check it. Message us before we start if anything needs to change.";
  }
  return revisionLimit > 0
    ? `You get ${revisionLimit} round${revisionLimit === 1 ? "" : "s"} of revisions included at this price.`
    : "This one doesn't include a revision round. If something isn't right, message us and we'll sort it out.";
}

function buildSteps(kind: ThankYouKind, turnaround: string | null, revisionLimit: number): WalkStep[] {
  const timing = deliveryLine(turnaround) ?? "We'll confirm timing with you.";
  const paid: WalkStep = { who: "us", label: "Payment confirmed", detail: "Done — that's why you're on this page." };

  if (kind === "website") {
    return [
      paid,
      { who: "you", label: "Your business info", detail: "Usually 3 to 5 minutes. Our production target starts counting once we have it, not before." },
      { who: "us", label: "We build your site", detail: `Our target is ${TARGET_HOURS} hours from when we receive your info. Track it live on your project page below.` },
      { who: "us", label: "Your private preview", detail: "We email you the moment it's ready. No need to check back in the meantime." },
      { who: "you", label: "You approve, or ask for a change", detail: revisionDetail(kind, revisionLimit) },
      { who: "us", label: "It goes live", detail: "The same day you approve, once anything still owed is paid in full." },
    ];
  }
  if (kind === "cards") {
    return [
      paid,
      { who: "you", label: "Your card details", detail: "A couple of minutes: what each card should open when it's tapped." },
      { who: "us", label: "We make your cards", detail: timing },
      { who: "us", label: "Your cards ship", detail: "We email you when they're on the way." },
      { who: "you", label: "Tap and test", detail: revisionDetail(kind, revisionLimit) },
      { who: "you", label: "Ready for customers", detail: "Once every card opens the right thing, you're done." },
    ];
  }
  return [
    paid,
    { who: "you", label: "Your kickoff call", detail: "Book a time below. We don't start until we've talked it through with you." },
    { who: "us", label: "We get to work", detail: timing },
    { who: "us", label: "Delivery", detail: "Posted to your private project page. We email you the moment it's ready." },
    { who: "you", label: "Your review", detail: revisionDetail(kind, revisionLimit) },
    { who: "us", label: "Complete", detail: "Handed off once you've approved it and anything still owed is paid in full." },
  ];
}

const DONE: Record<ThankYouKind, string> = {
  website: "Done means your site is live at your address, and you've approved what's on it.",
  cards: "Done means every card works: tap one yourself and confirm it opens the right thing.",
  project: "Done means you have what you ordered, files, access, or your session and plan, and you've confirmed it's right.",
};

const INSIGHT: Record<ThankYouKind, { title: string; body: string }> = {
  website: {
    title: "What makes a local website work",
    body: "A visitor decides in seconds. They want to know what you do, where you are, and how to reach you. The more specific your answers (real services, real prices, your hours, the neighborhoods you serve), the more your page reads like a business people can trust and call.",
  },
  cards: {
    title: "What makes a card work",
    body: "A card works best when it opens one thing. Keep the link short and make the first screen obvious: call, book, or leave a review. One clear action beats five options.",
  },
  project: {
    title: "How to get a great first draft",
    body: "The clearer the brief, the better the first draft. Anything you can add on your project page (colors, examples you like, a line you want said) saves a revision.",
  },
};

/**
 * The appreciation moment right after ordering: a real thank you, then the exact order of
 * what happens next, who does each step (you or us), and real timing for each one — so
 * there's nothing left to wonder about. Pure display; every number it shows is passed in
 * from the real order, not invented here.
 */
export function ThankYouCard({
  kind,
  firstName,
  turnaround = null,
  revisionLimit = 0,
}: {
  kind: ThankYouKind;
  firstName?: string;
  /** The bought product's real turnaround string (e.g. "5-7 business days"), or null. */
  turnaround?: string | null;
  /** The bought product's real included-revisions count. */
  revisionLimit?: number;
}) {
  const insight = INSIGHT[kind];
  const steps = buildSteps(kind, turnaround, revisionLimit);
  return (
    <section className="glass-panel mt-10 rounded-2xl p-6 text-left" aria-labelledby="thank-you-title">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Thank you</p>
      <h2 id="thank-you-title" className="mt-2 font-display text-2xl text-ice">
        {firstName ? `Thank you, ${firstName}.` : "Thank you."} We are glad you chose us.
      </h2>
      <p className="mt-2 text-sm text-ice/60">
        You trusted a small team with your business, and we take that seriously. Here is exactly what happens next, in order, and who it's waiting on.
      </p>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-start gap-3 text-sm">
            <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 text-xs text-gold">
              {i + 1}
            </span>
            <div>
              <p className="text-ice/90">
                {step.label}{" "}
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${step.who === "you" ? "bg-champagne/20 text-champagne" : "bg-white/10 text-ice/50"}`}>
                  {step.who === "you" ? "Your turn" : "We handle this"}
                </span>
              </p>
              <p className="mt-1 text-ice/60">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/70">How you&apos;ll know it&apos;s done</p>
        <p className="mt-2 text-sm text-ice/70">{DONE[kind]}</p>
      </div>

      <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/70">{insight.title}</p>
        <p className="mt-2 text-sm text-ice/70">{insight.body}</p>
      </div>

      <p className="mt-5 text-sm text-ice/50">
        Anything unclear, or need to change something along the way? Call or text{" "}
        <a href={`tel:${CONTACT_PHONE_DISPLAY.replace(/[^\d+]/g, "")}`} className="text-gold hover:brightness-110">
          {CONTACT_PHONE_DISPLAY}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:brightness-110">
          {CONTACT_EMAIL}
        </a>
        . A real person answers.
      </p>
    </section>
  );
}
