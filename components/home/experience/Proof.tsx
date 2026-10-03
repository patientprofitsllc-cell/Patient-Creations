import { db } from "@/lib/db";
import { usd } from "@/lib/pricing/catalog";
import { REWARD_CARD_CENTS } from "@/lib/reviews/rewardPrice";
import { Reveal, Stagger } from "@/components/motion/Reveal";

/**
 * What real customers said. Only reviews a customer allowed us to publish, with at least 4 stars, are shown, and the
 * section is absent until one exists. Nothing here is ever written by us.
 */
export async function Proof() {
  let reviews: { id: string; rating: number; testimonial: string | null; text: string | null }[] = [];
  try {
    reviews = await db.review.findMany({
      where: { canPublish: true, rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, rating: true, testimonial: true, text: true },
    });
  } catch {
    return null;
  }
  const shown = reviews.filter((r) => (r.testimonial ?? r.text ?? "").trim());
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="proof-title" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
      <Reveal className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">From our customers</p>
        <h2 id="proof-title" className="mt-3 font-display text-4xl text-ice">
          In their <span className="text-shimmer italic">own words</span>
        </h2>
      </Reveal>
      <Stagger className="mt-10 grid gap-6 md:grid-cols-3" step={120}>
        {shown.map((r) => (
          <figure key={r.id} className="glass-panel h-full rounded-2xl p-6">
            <p aria-label={`${r.rating} out of 5 stars`} className="text-gold">
              {"★".repeat(r.rating)}
              <span className="text-ice/20">{"★".repeat(5 - r.rating)}</span>
            </p>
            <blockquote className="mt-3 text-ice/80">&ldquo;{(r.testimonial ?? r.text ?? "").trim()}&rdquo;</blockquote>
            <figcaption className="mt-3 text-xs text-ice/40">Verified customer</figcaption>
          </figure>
        ))}
      </Stagger>
      {/* FTC disclosure: every reviewer is offered a discounted Business Card, whatever their rating. */}
      <p className="mt-6 text-center text-xs text-ice/40">Customers who leave a review, good or bad, can get one Business Card for {usd(REWARD_CARD_CENTS)} (plus shipping) as a thank-you.</p>
    </section>
  );
}
