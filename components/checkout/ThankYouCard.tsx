export type ThankYouKind = "website" | "cards" | "project";

const NEXT_STEPS: Record<ThankYouKind, string[]> = {
  website: [
    "Tell us about your business. It takes 3 to 5 minutes, and it is what your website is built from.",
    "We build your one-page site from your own words and facts. Our 72-hour target starts once we have your info.",
    "You get a private preview to approve, or to ask for a change.",
  ],
  cards: [
    "Fill in your card details below so we make each card right.",
    "We design and produce your cards from your answers.",
    "We ship them and post updates on your private project page.",
  ],
  project: [
    "We start production and post real progress on your private project page.",
    "You can message us on that page any time.",
    "You review the result and ask for changes within your included revisions.",
  ],
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

/** The appreciation moment right after ordering: a real thank you, what happens next, and one useful idea. */
export function ThankYouCard({ kind, firstName }: { kind: ThankYouKind; firstName?: string }) {
  const insight = INSIGHT[kind];
  return (
    <section className="glass-panel mt-10 rounded-2xl p-6 text-left" aria-labelledby="thank-you-title">
      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Thank you</p>
      <h2 id="thank-you-title" className="mt-2 font-display text-2xl text-ice">
        {firstName ? `Thank you, ${firstName}.` : "Thank you."} We are glad you chose us.
      </h2>
      <p className="mt-2 text-sm text-ice/60">
        You trusted a small team with your business, and we take that seriously. Here is what happens next.
      </p>
      <ol className="mt-4 space-y-3">
        {NEXT_STEPS[kind].map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-sm text-ice/80">
            <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 text-xs text-gold">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/70">{insight.title}</p>
        <p className="mt-2 text-sm text-ice/70">{insight.body}</p>
      </div>
    </section>
  );
}
