import { PROBLEMS } from "@/lib/site/offer";

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Sound familiar?</p>
        <h2 className="mt-4 font-display text-3xl text-ice sm:text-4xl">
          Get your business online <span className="text-gradient-champagne italic">without the agency headache.</span>
        </h2>
      </div>
      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROBLEMS.map((p) => (
          <li key={p} className="glass-panel flex items-start gap-3 rounded-xl px-5 py-4 text-sm text-ice/80">
            <span aria-hidden className="mt-0.5 text-red-400/80">
              ✕
            </span>
            {p}
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-10 max-w-2xl text-center text-lg text-ice/70">
        Your customers are already looking for you. Make sure they find something worth trusting.
      </p>
    </section>
  );
}
