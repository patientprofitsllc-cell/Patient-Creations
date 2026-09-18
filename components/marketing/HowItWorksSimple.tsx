const STEPS = [
  { title: "Order your website", body: "Pay securely, then tell us about your business in a 3 to 5 minute intake. Skip anything you don't have." },
  { title: "We build it", body: "Our team builds your site around your business. Our target is 72 hours once we have your info." },
  { title: "Preview and one revision", body: "You get a private preview. Tell us what you'd like changed and we'll update it." },
  { title: "Launch", body: "Approve it and we put your website live, ready for customers to find." },
];

export function HowItWorksSimple() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">How it works</p>
        <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
          Four steps from <span className="text-gradient-champagne italic">order to live</span>.
        </h2>
      </div>
      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="glass-panel rounded-2xl p-6">
            <span className="font-display text-3xl text-gold">{i + 1}</span>
            <p className="mt-2 font-display text-lg text-ice">{s.title}</p>
            <p className="mt-2 text-sm text-ice/60">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
